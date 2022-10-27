import { readFieldrefInfo, readMethodrefInfo, readString } from "./ConstantPool"
import {
	betterDescriptor,
	betterMethodDescriptor,
	descriptorInfo,
} from "./Descriptors"
import NotImplemented from "./errors/NotImplemented"
import Program from "./Program"
import { getFieldHandle } from "./Stubs"
import { Attribute, CodeAttribute, Fieldref, Method } from "./Type"

export function hex(instruction: number) {
	return "0x" + instruction.toString(16)
}

export function betterCodeDump(code: Uint8Array): string[] {
	let res = []
	for (let i = 0; i < code.length; i++) {
		res.push("0x" + code[i].toString(16))
	}
	return res
}

export function getCodeAttribute(method: Method): CodeAttribute {
	for (const attribute of method.attributes) {
		if (attribute.name == "Code") {
			return attribute as CodeAttribute
		}
	}
	return undefined
}

export function executeMethod(method: Method, constantPool: any[]): any {
	console.log("Executing " + method.methodName + " | " + method.methodSignature)
	const codeAttribute = getCodeAttribute(method)
	console.log(JSON.stringify(codeAttribute, null, 1))
	console.log(JSON.stringify(betterCodeDump(codeAttribute.code), null, 1))
	const program = new Program(codeAttribute)
	while (program.hasInstruction()) {
		const instruction = program.readInstruction()
		const programIndex = program.programCounter - 1
		if(instruction == 0xb1){
			// return :)
			return 
		}else if(instruction == 0x10){
			// bipush
			const value = program.readInstruction()
			program.push(value)
		}else if (instruction == 0xb2) {
			// getstatic
			const index1 = program.readInstruction()
			const index2 = program.readInstruction()
			const constantPoolIndex = (index1 << 8) | index2
			const ref = readFieldrefInfo(constantPool, constantPoolIndex - 1)
			console.log(
				`#${programIndex} getstatic ${ref.klass}.${
					ref.field
				} => ${betterDescriptor(ref.fieldType)}`,
			)
			program.push(ref)
		} else if (instruction == 0x12) {
			// ldc
			const index = program.readInstruction() // ref to a value on the constant pool
			const cstValue = constantPool[index - 1]
			if (cstValue.name == "String") {
				const stringValue = readString(constantPool, index - 1)
				console.log(`#${programIndex} ldc "${stringValue}"`)
				program.push(stringValue)
			} else {
				throw new NotImplemented(
					cstValue.name + " not implemented for instruction 0x12",
				)
			}
		} else if (instruction == 0xb6) {
			// invokevirtual
			//NoSuchMethodError
			const index1 = program.readInstruction()
			const index2 = program.readInstruction()
			const constantPoolIndex = (index1 << 8) | index2
			const methodRef = readMethodrefInfo(constantPool, constantPoolIndex - 1)
			const descriptor = descriptorInfo(methodRef.methodDescriptor)

			console.log(
				`#${programIndex} invokevirtual "${methodRef.klass}#${methodRef.methodName}${methodRef.methodDescriptor}"`,
			)
			// Argument count + the required instance object to execute
			if (program.stackSize == descriptor.argCount + 1) {
				const value = program.pop()
				const fieldref = program.pop() as Fieldref
				if (betterDescriptor(fieldref.fieldType) == methodRef.klass) {
					const instance = getFieldHandle(fieldref.klass, fieldref.field)
					if (instance == undefined) {
						throw new NotImplemented(
							"Stub for " + JSON.stringify(fieldref, null, 1) + " not found",
						)
					}
					const methodHandle = instance[methodRef.methodName]
					methodHandle(value)
				} else {
					throw new NotImplemented(
						"invokevirtual Not implemented with " + value + " / " + fieldref,
					)
				}
			} else {
				throw new Error("Wrong parameter size")
			}
		} else {
			throw new NotImplemented(hex(instruction) + " not implemented")
		}
	}
}
