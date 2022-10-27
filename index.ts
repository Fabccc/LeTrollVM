import { existsSync, openSync } from "fs"
import { exit } from "process"
import BufferedReader from "./utils/BufferedReader"

const FILE_NAME = "./Main.class"

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
