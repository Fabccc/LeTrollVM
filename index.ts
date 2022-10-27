import * as assert from "assert"
import { existsSync, openSync } from "fs"
import { exit } from "process"
import BufferedReader from "./utils/BufferedReader"
import { CONSTANTS_POOL } from "./utils/ConstantPool"
import NotImplemented from "./utils/errors/NotImplemented"

const FILE_NAME = "Main.class"

console.log("---------- LeTroll VM -------------")
console.log("By Fabcc [Fabien CAYRE]")

const exists = existsSync(FILE_NAME)
if (!exists) {
	console.log(`File '${FILE_NAME} 'doesn't exist`)
	exit(0)
}
const file = openSync(FILE_NAME, "r")
const reader: BufferedReader = new BufferedReader(file)
const magik = reader.readU4()
if (magik != 0xcafebabe) {
	console.log("Cafe babe not found, not a correct file :LeTroll:")
	exit(1)
}
console.log("CAFEBABE found ! Now ... this is epic")
const minor = reader.readU2()
const major = reader.readU2()
console.log(`${FILE_NAME} version ${major}:${minor}`)

const constantPool = []
const constantPoolSize = reader.readU2()

console.log(`${FILE_NAME} has a cst pool size of ${constantPoolSize}`)

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
	} else {
		if (name === undefined) {
			throw new Error(`Tag ${tag} not found in the constant pool static lookup`)
		} else {
			throw new NotImplemented(`${name} [${tag}] read is not implemetend yet`)
		}
	}
}

console.log(JSON.stringify(constantPool, null, 4))
