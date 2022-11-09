import BufferedReader from "./BufferedReader"
import {
	ConstantPool,
	readClassInfo,
	readNameIndex,
	readUtf8,
} from "./ConstantPool"
import NotImplemented from "./errors/NotImplemented"
import { Attribute } from "./Type"

export function readAttributeInfo(
	reader: BufferedReader,
	attributeCount: number,
	constantPool: ConstantPool,
): Attribute[] {
	const attributes = []
	// attribute_info attributes[attributes_count];
	// attribute_info {
	//   u2 attribute_name_index;
	//   u4 attribute_length;
	//   u1 info[attribute_length];
	// }
	for (let i = 0; i < attributeCount; i++) {
		const name = readNameIndex(constantPool, reader.readU2() - 1)
		const length = reader.readU4()
		if (name == "Code") {
			// Code attribute
			// u2 max_stack;
			const maxStacks = reader.readU2()
			// u2 max_locals;
			const maxLocalVariables = reader.readU2()
			// u4 code_length;
			const codeLength = reader.readU4()
			// u1 code[code_length];
			const code = reader.readU1Array(codeLength)
			// u2 exception_table_length;
			const exceptionTableLength = reader.readU2()
			// } exception_table[exception_table_length];
			const exceptionTable = []
			for (let i = 0; i < exceptionTableLength; i++) {
				//   u2 start_pc;
				const startPointerCode = reader.readU2()
				// 		u2 end_pc;
				const endPointerCode = reader.readU2()
				// 		u2 handler_pc;
				const handlerPointerCode = reader.readU2()
				// 		u2 catch_type;
				const catchType = reader.readU2()
				exceptionTable.push({
					startPointerCode,
					endPointerCode,
					handlerPointerCode,
					catchType,
				})
			}
			// u2 attributes_count;
			const attributeCount = reader.readU2()
			const codeAttributes = readAttributeInfo(
				reader,
				attributeCount,
				constantPool,
			)
			// attribute_info attributes[attributes_count];
			attributes.push({
				name,
				maxStacks,
				maxLocalVariables,
				code,
				exceptionTable,
				codeAttributes,
			})
		} else if (name == "LineNumberTable") {
			// 	u2 line_number_table_length;
			const lineNumberTableLength = reader.readU2()
			// } line_number_table[line_number_table_length];
			const lineNumberTable = []
			for (let i = 0; i < lineNumberTableLength; i++) {
				//   u2 start_pc;
				const startPointerCode = reader.readU2()
				//   u2 line_number;
				const lineNumber = reader.readU2()
				lineNumberTable.push({ startPointerCode, lineNumber })
			}
			attributes.push({ name, lineNumberTable })
		} else if (name == "SourceFile") {
			// u2 sourcefile_index;
			const sourceFileIndex = reader.readU2()
			const sourceName = readNameIndex(constantPool, sourceFileIndex - 1)
			attributes.push({ name, sourceName })
		} else if (name == "InnerClasses") {
			// InnerClasses_attribute {
			// 	u2 number_of_classes;
			// 	{   u2 inner_class_info_index;
			// 			u2 outer_class_info_index;
			// 			u2 inner_name_index;
			// 			u2 inner_class_access_flags;
			// 	} classes[number_of_classes];
			// }
			const numberOfClasses = reader.readU2()
			const classes = []
			for (let i = 0; i < numberOfClasses; i++) {
				const innerClassInfoIndex = reader.readU2()
				const outerClassInfoIndex = reader.readU2()
				const innerNameIndex = reader.readU2()
				const innerClassAccessFlags = reader.readU2()
				classes.push({
					innerClassInfoIndex,
					outerClassInfoIndex,
					innerNameIndex,
					innerClassAccessFlags,
				})
			}
			attributes.push({ name, classes })
		} else if (name == "BootstrapMethods") {
			const bootstrapMethodsCount = reader.readU2()
			const bootstrapMethods = []
			for (let i = 0; i < bootstrapMethodsCount; i++) {
				const bootstrapMethodRef = reader.readU2()
				const bootstrapArgumentCount = reader.readU2()
				const bootstrapArguments = []
				for (let j = 0; j < bootstrapArgumentCount; j++) {
					const bootstrapArgument = reader.readU2()
					bootstrapArguments.push(bootstrapArgument)
				}
				bootstrapMethods.push({ bootstrapMethodRef, bootstrapArguments })
			}
			attributes.push({ name, bootstrapMethods })
		} else if (name == "StackMapTable") {
			// 	u2              number_of_entries;
			// stack_map_frame entries[number_of_entries];
			const entriesCount = reader.readU2()
			const entries = []
			/*union stack_map_frame {
				same_frame;
				same_locals_1_stack_item_frame;
				same_locals_1_stack_item_frame_extended;
				chop_frame;
				same_frame_extended;
				append_frame;
				full_frame;
			}*/
			for (let i = 0; i < entriesCount; i++) {
				const frameType = reader.readU1()
				if (frameType >= 0 && frameType <= 63) {
					const offsetDelta = frameType
					entries.push({ frameType, offsetDelta })
				} else if (frameType == 255) {
					// 	full_frame {
					// 		u2 offset_delta;
					const offsetDelta = reader.readU2()
					// 		u2 number_of_locals;
					const numberOfLocals = reader.readU2()
					const localsVerifications = readVerifications(
						numberOfLocals,
						constantPool,
						reader,
					)
					// 		verification_type_info locals[number_of_locals];
					// }

					// 		u2 number_of_stack_items;
					const numberOfStackItems = reader.readU2()
					// 		verification_type_info stack[number_of_stack_items];
					const stacksVerifications = readVerifications(
						numberOfStackItems,
						constantPool,
						reader,
					)

					entries.push({
						frameType,
						offsetDelta,
						localsVerifications,
						stacksVerifications,
					})
				} else if (frameType == 253 || frameType == 252 || frameType == 254) {
					// 	u2 offset_delta;
					const offsetDelta = reader.readU2()
					const numberOfVerifs = frameType - 251
					// 	verification_type_info locals[frame_type - 251];
					const verifs = readVerifications(numberOfVerifs, constantPool, reader)
					entries.push({
						frameType,
						offsetDelta,
						verifs,
					})
				} else if (frameType == 248 || frameType == 250) {
					const offsetDelta = reader.readU2()
					entries.push({
						frameType,
						offsetDelta,
					})
				} else {
					throw new NotImplemented(
						`Attribute: StackMapTable ${frameType} value is not implemented`,
					)
				}
			}
			attributes.push({ name, entries })
		} else if (name == "NestMembers") {
			//u2 number_of_classes;
			const numberOfClasses = reader.readU2()
			const classes = []
			// u2 classes[number_of_classes];
			for (let i = 0; i < numberOfClasses; i++) {
				const nestClassInfoIndex = reader.readU2()
				const nestClassInfo = readClassInfo(
					constantPool,
					nestClassInfoIndex - 1,
				)
				classes.push({ nestClassInfoIndex, nestClassInfo })
			}
			attributes.push({ name, classes })
		} else if (name == "Signature") {
			// u2 signature_index;
			const signatureIndex = reader.readU2()
			const signatureValue = readUtf8(constantPool, signatureIndex - 1)
			attributes.push({ name, signatureIndex, signatureValue })
		} else if (name == "NestHost") {
			// u2 host_class_index;
			const nestHostInfoIndex = reader.readU2()
			const nestHostInfo = readClassInfo(constantPool, nestHostInfoIndex - 1)
			attributes.push({ name, nestHostInfoIndex, nestHostInfo })
		} else {
			throw new NotImplemented("Attribute: reading undefined for " + name)
		}
	}
	return attributes
}

export function findAttributeByName(
	attribs: Attribute[],
	name: string,
): Attribute {
	for (const attrib of attribs) {
		if (attrib.name == name) return attrib
	}
	throw new NotImplemented(`Could not find attribute with name ${name}`)
}

export function readVerifications(
	numberOfVerifs: number,
	constantPool: ConstantPool,
	reader: BufferedReader,
): any[] {
	const localsVerifications = []
	for (let j = 0; j < numberOfVerifs; j++) {
		const tag = reader.readU1()
		if (tag == 7) {
			// Object_variable_info {
			// 	u1 tag = ITEM_Object; /* 7 */
			// 	u2 cpool_index;
			// }
			const constantPoolIndex = reader.readU2()
			const classInfo = readClassInfo(constantPool, constantPoolIndex - 1)
			localsVerifications.push(classInfo)
		} else if (tag == 1) {
			// Integer_variable_info {
			// 	u1 tag = ITEM_Integer; /* 1 */
			// }
			localsVerifications.push("int")
		} else if (tag == 0) {
			// 	Top_variable_info {
			// 		u1 tag = ITEM_Top; /* 0 */
			// }
			localsVerifications.push("top")
		} else {
			throw new NotImplemented(
				`Attribute: vertification type locals ${tag} is not implemented`,
			)
		}
	}
	return localsVerifications
}
