import { stdin } from "bun"
import { existsSync, openSync } from "fs"
import { exit } from "process"
import {
	listClassAccesors,
	listFieldAccessors,
	listMethodAccesors
} from "./utils/Accessors"
import { readAttributeInfo } from "./utils/Attributes"
import BufferedReader from "./utils/BufferedReader"
import Class from "./utils/Class"
import ClassManager from "./utils/ClassLoader"
import {
	readClassInfo,
	readConstantPool,
	readNameIndex,
	readUtf8
} from "./utils/ConstantPool"
import { betterDescriptor, betterMethodDescriptor } from "./utils/Descriptors"
import NotImplemented from "./utils/errors/NotImplemented"

// const FILE_NAME = "Fibonnaci.class"
// gets agrs

const [executable, tsFile, ...args] = process.argv
if(args.length == 0){
	console.error("Please, provide a main class name to execute")
	exit(0)
}
const className = args[0]
const classManager = new ClassManager()
const main = classManager.get(className)
main.executeMethod("main", classManager)