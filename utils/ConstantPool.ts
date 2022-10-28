import BufferedReader from "./BufferedReader"
import NotImplemented from "./errors/NotImplemented"
import { stringify } from "./Print"
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
		} else {
			throw new NotImplemented(`${name} [${tag}] read is not implemetend yet`)
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
		for (const unsuable of this.unusableIndeces) if (index > unsuable) count++
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
