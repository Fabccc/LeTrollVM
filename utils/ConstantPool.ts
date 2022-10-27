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

function readClassInfo(constantPool: any[], classInfoIndex: number): string {
	const classInfo = constantPool[classInfoIndex]
	const { nameIndex } = classInfo
	const nameInfo = constantPool[nameIndex - 1]
	return nameInfo.value
}

export { CONSTANTS_POOL, readClassInfo, printClassInfo }
