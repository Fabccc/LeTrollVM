import NotImplemented from "./errors/NotImplemented"
import { Fieldref, NameAndType } from "./Type"

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

export {
	CONSTANTS_POOL,
	readClassInfo,
	printClassInfo,
	readNameIndex,
	readFieldrefInfo,
	readString,
}
