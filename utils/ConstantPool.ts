import { findAttributeByName } from "./Attributes"
import BufferedReader from "./BufferedReader"
import Class from "./Class"
import { descriptorInfo } from "./Descriptors"
import NotImplemented from "./errors/NotImplemented"
import { stringify } from "./Print"
import {
	Attribute,
	BootstrapMethodsAttribute,
	Fieldref,
	InvokeDynamic,
	MethodHandle,
	Methodref,
	NameAndType,
} from "./Type"

const CONSTANTS_POOL = {
	7: "Class",
	9: "Fieldref",
	10: "Methodref",
	11: "InterfaceMethodref",
	8: "String",
	3: "Integer",
	4: "Float",
	5: "Long",
	6: "Double",
	12: "NameAndType",
	1: "Utf8",
	15: "MethodHandle",
	16: "MethodType",
	17: "Dynamic",
	18: "InvokeDynamic",
	19: "Module",
	20: "Package",
}
const REF_Map = {
	1: "REF_getField",
	2: "REF_getStatic",
	3: "REF_putField",
	4: "REF_putStatic",
	5: "REF_invokeVirtual",
	8: "REF_newInvokeSpecial",
	6: "REF_invokeStatic",
	7: "REF_invokeSpecial",
	9: "REF_invokeInterface",
}

function printClassInfo(constantPool: ConstantPool) {
	// for (let index = 0; index < constantPool.size; index++) {
	// 	const element = constantPool.at(index)
	// 	console.log(`#${index + 1} ${JSON.stringify(element, null, 0)}`)
	// }
	let index = 1
	for (const element of constantPool.pool) {
		console.log(`#${index} ${stringify(element, 0)}`)
		if (element.name == "Long" || element.name == "Double") {
			index++
		}
		index++
	}
}

function readMethodrefInfo(
	constantPool: ConstantPool,
	indexInfo: number,
): Methodref {
	const nameInfo = constantPool.at(indexInfo)
	const klass = readClassInfo(constantPool, nameInfo.classIndex - 1)
	const nameAndType = readNameAndTypeInfo(
		constantPool,
		nameInfo.nameAndTypeIndex - 1,
	)
	return {
		klass: klass,
		methodName: nameAndType.name,
		methodDescriptor: nameAndType.desc,
	}
}

function readFieldrefInfo(
	constantPool: ConstantPool,
	indexInfo: number,
): Fieldref {
	const nameInfo = constantPool.at(indexInfo)
	const klass = readClassInfo(constantPool, nameInfo.classIndex - 1)
	const nameAndType = readNameAndTypeInfo(
		constantPool,
		nameInfo.nameAndTypeIndex - 1,
	)
	return {
		klass: klass,
		field: nameAndType.name,
		fieldType: nameAndType.desc,
	}
}

function readInteger(constantPool: ConstantPool, indexInfo: number): number {
	const { value } = constantPool.at(indexInfo)
	return value
}

function readFloat(constantPool: ConstantPool, indexInfo: number): number {
	const { value } = constantPool.at(indexInfo)
	return value
}

function readString(constantPool: ConstantPool, indexInfo: number): string {
	const cstValue = constantPool.at(indexInfo)
	const { value } = constantPool.at(cstValue.stringIndex - 1)
	return value
}

export function readMethodHandleInfo(
	klass: Class,
	indexInfo: number,
): MethodHandle {
	const { major, constantPool } = klass
	const cstValue = constantPool.at(indexInfo)
	if (cstValue.referenceKind == 6 || cstValue.referenceKind == 7) {
		const { referenceIndex } = cstValue
		if (major < 52) {
			console.error(cstValue)
			throw new NotImplemented(
				"readMethodHandleInfo not implemented (referenceKind 6|7, major < 52)",
			)
		} else {
			// CONSTANT_Methodref_info
			//{ klass: "java/lang/invoke/StringConcatFactory",
			// methodName: "makeConcatWithConstants",
			// methodDescriptor: "(Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/invoke/CallSite;" }
			const methodRef = readMethodrefInfo(constantPool, referenceIndex - 1)
			return {
				name: "MethodHandle",
				klass: methodRef.klass,
				methodDescriptor: methodRef.methodDescriptor,
				methodName: methodRef.methodName,
				referenceKind: cstValue.referenceKind,
				referenceKindName: cstValue.referenceKindName,
			}
		}
	} else {
		throw new NotImplemented(
			"readMethodHandleInfo not implemented for referenceKind " +
				stringify(cstValue),
		)
	}
}

export function readInvokeDynamic(
	klass: Class,
	indexInfo: number,
): InvokeDynamic {
	const { attributes, constantPool } = klass
	const cstValue = constantPool.at(indexInfo)
	const boostrapMethodAttributeIndex = cstValue.boostrapMethodAttributeIndex
	const nameAndType = readNameAndTypeInfo(
		constantPool,
		cstValue.nameAndTypeIndex - 1,
	)
	const bootstrapMethods = findAttributeByName(
		attributes,
		"BootstrapMethods",
	) as BootstrapMethodsAttribute
	const bsMethod =
		bootstrapMethods.bootstrapMethods[boostrapMethodAttributeIndex]
	const methodHandle = readMethodHandleInfo(
		klass,
		bsMethod.bootstrapMethodRef - 1,
	)
	const argsType = descriptorInfo(nameAndType.desc).argType
	const args = []
	for (let i = 0; i < bsMethod.bootstrapArguments.length; i++) {
		const cpIndexRef = bsMethod.bootstrapArguments[i]
		const argType = argsType[i]
		if (argType == undefined) {
			throw new Error("logic error argtype undefined")
		} else {
			const type = argType.type
			if (type == "java/lang/String") {
				const value = readString(constantPool, cpIndexRef - 1)
				args.push(value)
			} else {
				throw new NotImplemented(
					`readInvokeDynamic doesn't support argument type ${type}`,
				)
			}
		}
	}
	// This should contains a function that has X dynamic parameter and concat them in a certains way
	// How is that even possible JAVA !!!!!!!!!

	//  Here, we must call a function with the desired parameters 
	// to create another function (callable) by the program

	console.error(stringify(nameAndType))
	console.error(stringify(bsMethod))
	console.error(stringify(methodHandle))
	throw new NotImplemented(
		"readInvokeDynamic not implemented, missing return a function",
	)
	return {
		name: "InvokeDynamic",
		dynamicDescriptor: nameAndType.desc,
		dynamicName: nameAndType.name,
		dynamicArgs: args,
		dynamicArgCount: descriptorInfo(nameAndType.desc).argCount,
		methodHandleClass: methodHandle.klass,
		methodHandleDescriptor: methodHandle.methodDescriptor,
		methodHandleName: methodHandle.methodName,
	}
}

function readNameAndTypeInfo(
	constantPool: ConstantPool,
	indexInfo: number,
): NameAndType {
	const nameAndTypeInfo = constantPool.at(indexInfo)
	const name: string = readNameIndex(
		constantPool,
		nameAndTypeInfo.nameIndex - 1,
	)
	const desc: string = readNameIndex(
		constantPool,
		nameAndTypeInfo.descriptorIndex - 1,
	)
	return { name, desc }
}

function readNameIndex(
	constantPool: ConstantPool,
	nameIndexInfo: number,
): string {
	const nameInfo = constantPool.at(nameIndexInfo)
	return nameInfo.value
}

function readClassInfo(
	constantPool: ConstantPool,
	classInfoIndex: number,
): string {
	const classInfo = constantPool.at(classInfoIndex)
	const { nameIndex } = classInfo
	const nameInfo = constantPool.at(nameIndex - 1)
	return nameInfo.value
}

function readConstantPool(reader: BufferedReader): ConstantPool {
	// cp_info        constant_pool[constant_pool_count-1];
	// u2             constant_pool_count;
	const constantPoolSize = reader.readU2()
	const constantPool = new ConstantPool([], constantPoolSize, [])
	for (let i = 0; i < constantPoolSize - 1; i++) {
		// ctx pool init
		const tag = reader.readU1()
		const name = CONSTANTS_POOL[tag]
		if (name == "Methodref") {
			const classIndex = reader.readU2()
			const nameAndTypeIndex = reader.readU2()
			constantPool.push({ name, classIndex, nameAndTypeIndex })
		} else if (name == "Fieldref") {
			const classIndex = reader.readU2()
			const nameAndTypeIndex = reader.readU2()
			constantPool.push({ name, classIndex, nameAndTypeIndex })
		} else if (name == "InterfaceMethodref") {
			const classIndex = reader.readU2()
			const nameAndTypeIndex = reader.readU2()
			constantPool.push({ name, classIndex, nameAndTypeIndex })
		} else if (name == "String") {
			const stringIndex = reader.readU2()
			constantPool.push({ name, stringIndex })
		} else if (name == "Class") {
			const nameIndex = reader.readU2()
			constantPool.push({ name, nameIndex })
		} else if (name == "Utf8") {
			const strLength = reader.readU2()
			const value = reader.readUTF(strLength)
			constantPool.push({ name, strLength, value })
		} else if (name == "NameAndType") {
			const nameIndex = reader.readU2()
			const descriptorIndex = reader.readU2()
			constantPool.push({ name, nameIndex, descriptorIndex })
		} else if (name == "Integer") {
			const value = reader.readU4()
			constantPool.push({ name, value })
		} else if (name == "Float") {
			const bits = reader.readU4()

			// IEEE 754
			const s = bits >> 31 == 0 ? 1 : -1
			const e = (bits >> 23) & 0xff
			const m = e == 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000
			const value = s * m * Math.pow(2, e - 150)

			constantPool.push({ name, value })
		} else if (name == "Long") {
			// All 8-byte constants take up two entries in the constant_pool
			// table of the class file. If a CONSTANT_Long_info or CONSTANT_Double_info
			// structure is the entry at index n in the constant_pool table,
			// then the next usable entry in the table is located at index n+2.
			// The constant_pool index n+1 must be valid but is considered unusable.

			const high_bytes = BigInt(reader.readU4())
			const low_bytes = BigInt(reader.readU4())
			const value = (high_bytes << 32n) + low_bytes
			constantPool.push({ name, value })
			constantPool.addUnsuableIndex(i)
			i++
		} else if (name == "Double") {
			const high_bytes = BigInt(reader.readU4())
			const low_bytes = BigInt(reader.readU4())
			const bits = (high_bytes << 32n) + low_bytes

			const s = bits >> 63n == 0n ? 1n : -1n
			const e = (bits >> 52n) & 0x7ffn
			const m =
				e == 0n
					? (bits & 0xfffffffffffffn) << 1n
					: (bits & 0xfffffffffffffn) | 0x10000000000000n

			const value = Number(s) * Number(m) * Math.pow(2, Number(e) - 1075)
			constantPool.push({ name, value })
			constantPool.addUnsuableIndex(i)
			i++
		} else if (name == "InvokeDynamic") {
			// 	CONSTANT_InvokeDynamic_info {
			// 		u1 tag;
			// 		u2 bootstrap_method_attr_index;
			// 		u2 name_and_type_index;
			// }
			const boostrapMethodAttributeIndex = reader.readU2()
			const nameAndTypeIndex = reader.readU2()
			constantPool.push({
				name,
				boostrapMethodAttributeIndex,
				nameAndTypeIndex,
			})
		} else if (name == "MethodHandle") {
			// 	CONSTANT_MethodHandle_info {
			// 		u1 tag;
			// 		u1 reference_kind;
			// 		u2 reference_index;
			// }
			const referenceKind = reader.readU1()
			const referenceIndex = reader.readU2()
			//  1 (REF_getField), 2 (REF_getStatic), 3 (REF_putField), or 4 (REF_putStatic),
			//  5 (REF_invokeVirtual) or 8 (REF_newInvokeSpecial),
			//  6 (REF_invokeStatic) or 7 (REF_invokeSpecial),
			//  9 (REF_invokeInterface)

			const referenceKindName = REF_Map[referenceKind]
			constantPool.push({
				name,
				referenceKind,
				referenceIndex,
				referenceKindName,
			})
		} else {
			throw new NotImplemented(
				`CONSTANTPOOL: ${name} [${tag}] read is not implemetend yet`,
			)
		}
	}
	return constantPool
}
export class ConstantPool {
	private constantPool: any[]
	private constantPoolSize: number
	private unusableIndeces: number[]

	constructor(
		constantPool: any[],
		constantPoolSize: number,
		unusableIndeces: number[],
	) {
		this.constantPool = constantPool
		this.constantPoolSize = constantPoolSize
		this.unusableIndeces = unusableIndeces
	}

	push(value: any) {
		return this.constantPool.push(value)
	}

	at(index: number) {
		return this.constantPool[index - this.unusableCount(index)]
	}

	unusableCount(index: number) {
		let count = 0
		for (const unusable of this.unusableIndeces) if (index > unusable) count++
		return count
	}

	addUnsuableIndex(index: number) {
		this.unusableIndeces.push(index)
	}

	get pool() {
		return this.constantPool
	}

	get size() {
		return this.constantPoolSize - this.unusableIndeces.length - 1
	}
}

export {
	CONSTANTS_POOL,
	readClassInfo,
	printClassInfo,
	readNameIndex,
	readFieldrefInfo,
	readMethodrefInfo,
	readString,
	readInteger,
	readConstantPool,
	readFloat,
}
