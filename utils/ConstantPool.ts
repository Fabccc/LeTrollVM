import BufferedReader from "./BufferedReader"
import NotImplemented from "./errors/NotImplemented"
import { Fieldref, Methodref, NameAndType } from "./Type"

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

function printClassInfo(constantPool: any[]) {
	for (let index = 0; index < constantPool.length; index++) {
		const element = constantPool[index]
		console.log(`#${index + 1} ${JSON.stringify(element, null, 0)}`)
	}
}

function readMethodrefInfo(constantPool: any[], indexInfo: number): Methodref {
	const nameInfo = constantPool[indexInfo]
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

function readFieldrefInfo(constantPool: any[], indexInfo: number): Fieldref {
	const nameInfo = constantPool[indexInfo]
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

function readInteger(constantPool: any[], indexInfo: number): number {
	const { value } = constantPool[indexInfo]
	return value
}

function readFloat(constantPool: any[], indexInfo: number): number {
	const { value } = constantPool[indexInfo]
	return value
}

function readString(constantPool: any[], indexInfo: number): string {
	const cstValue = constantPool[indexInfo]
	const { value } = constantPool[cstValue.stringIndex - 1]
	return value
}

function readNameAndTypeInfo(
	constantPool: any[],
	indexInfo: number,
): NameAndType {
	const nameAndTypeInfo = constantPool[indexInfo]
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

function readNameIndex(constantPool: any[], nameIndexInfo: number): string {
	const nameInfo = constantPool[nameIndexInfo]
	return nameInfo.value
}

function readClassInfo(constantPool: any[], classInfoIndex: number): string {
	const classInfo = constantPool[classInfoIndex]
	const { nameIndex } = classInfo
	const nameInfo = constantPool[nameIndex - 1]
	return nameInfo.value
}

interface ConstantPoolData {
	constantPoolSize: number
	constantPool: any[]
}
function readConstantPool(reader: BufferedReader): ConstantPoolData {
	// cp_info        constant_pool[constant_pool_count-1];
	// u2             constant_pool_count;
	const constantPool = []
	const constantPoolSize = reader.readU2()
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
		} else {
			throw new NotImplemented(`${name} [${tag}] read is not implemetend yet`)
		}
	}
	return { constantPoolSize, constantPool }
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
