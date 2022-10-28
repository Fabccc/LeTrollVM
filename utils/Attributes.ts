import BufferedReader from "./BufferedReader"
import { ConstantPool, readNameIndex } from "./ConstantPool"
import NotImplemented from "./errors/NotImplemented"

export function readAttributeInfo(
	reader: BufferedReader,
	attributeCount: number,
	constantPool: ConstantPool,
): any[] {
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
		} else {
			throw new NotImplemented("Attribute reading undefined for " + name)
		}
		// for (let j = 0; j < length; j++) {
		//   throw
		// }
	}
	return attributes
}
