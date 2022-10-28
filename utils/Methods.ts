import {
	ConstantPool,
	readFieldrefInfo,
	readFloat,
	readInteger,
	readMethodrefInfo,
	readString,
} from "./ConstantPool"
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

export function executeMethod(method: Method, constantPool: ConstantPool): any {
	console.log("Executing " + method.methodName + " | " + method.methodSignature)
	console.log("---------- LeTroll VM -------------")
	const codeAttribute = getCodeAttribute(method)
	const program = new Program(codeAttribute)
	program.debug = false
	while (program.hasInstruction()) {
		const instruction = program.readInstruction()
		const programIndex = program.programCounter - 1
		if (instruction == 0xb1) {
			// return :)
			return
		} else if (instruction == 0x10) {
			// bipush
			const value = program.readInstruction()
			program.push(value)
		} else if (instruction == 0xb2) {
			// getstatic
			const index1 = program.readInstruction()
			const index2 = program.readInstruction()
			const constantPoolIndex = (index1 << 8) | index2
			const ref = readFieldrefInfo(constantPool, constantPoolIndex - 1)
			program.log(
				`#${programIndex} getstatic ${ref.klass}.${
					ref.field
				} => ${betterDescriptor(ref.fieldType)}`,
			)
			program.push(ref)
		} else if (instruction == 0x12) {
			// ldc
			const index = program.readInstruction() // ref to a value on the constant pool
			const cstValue = constantPool.at(index - 1)
			if (cstValue.name == "String") {
				const stringValue = readString(constantPool, index - 1)
				program.log(`#${programIndex} ldc "${stringValue}"`)
				program.push(stringValue)
			} else if (cstValue.name == "Integer") {
				const intValue = readInteger(constantPool, index - 1)
				program.log(`#${programIndex} ldc "${intValue}"`)
				program.push(intValue)
			} else if (cstValue.name == "Float") {
				const floatValue = readFloat(constantPool, index - 1)
				program.log(`#${programIndex} ldc "${floatValue}"`)
				program.push(floatValue)
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

			program.log(
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
					methodHandle(methodRef.methodDescriptor, value)
				} else {
					throw new NotImplemented(
						"invokevirtual Not implemented with " + value + " / " + fieldref,
					)
				}
			} else {
				throw new Error("Wrong parameter size")
			}
		} else if (instruction == 0x14) {
			// ldc2_w
			// indexbyte1
			const indexbyte1 = program.readInstruction() // ref to a value on the constant pool
			// indexbyte2
			const indexbyte2 = program.readInstruction() // ref to a value on the constant pool
			const index = (indexbyte1 << 8) | indexbyte2
			const cstValue = constantPool.at(index - 1)
			if (cstValue.name == "Long") {
				program.push(cstValue.value)
			} else if (cstValue.name == "Double") {
				program.push(cstValue.value)
			} else {
				throw new NotImplemented(
					cstValue.name + " Not implemented for instruction ldc2_w AKA 0x14",
				)
			}
		} else if (instruction == 0x3) {
			// iconst_0
			program.push(0)
		} else if (instruction == 0x4) {
			//iconst_1
			program.push(1)
		} else if (instruction == 0x5) {
			//iconst_2
			program.push(2)
		} else if (instruction == 0x36) {
			//istore
			const index = program.readInstruction()
			const value = program.pop()
			program.variables[index] = value
		} else if (instruction == 0x3c) {
			//istore_1
			const intValue = program.pop()
			program.variables[1] = intValue
		} else if (instruction == 0x3d) {
			//istore_2
			const intValue = program.pop()
			program.variables[2] = intValue
		} else if (instruction == 0x3e) {
			//istore_3
			const intValue = program.pop()
			program.variables[3] = intValue
		} else if (instruction == 0x15) {
			//iload
			const index = program.readInstruction()
			const intValue = program.variables[index]
			program.push(intValue)
		} else if (instruction == 0x1b) {
			//iload_1
			const intValue = program.variables[1]
			program.push(intValue)
		} else if (instruction == 0x1c) {
			//iload_2
			const intValue = program.variables[2]
			program.push(intValue)
		} else if (instruction == 0x1d) {
			//iload_3
			const intValue = program.variables[3]
			program.push(intValue)
		} else if (instruction == 0x11) {
			// sipush
			// byte1
			// byte2
			const byte1 = program.readInstruction()
			const byte2 = program.readInstruction()
			const value = (byte1 << 8) | byte2
			program.push(value)
		} else if (instruction == 0x17) {
			// fload
			// index
			const index = program.readInstruction()
			const value = program.variables[index]
			program.push(value)
		} else if (instruction == 0x23) {
			// fload_1
			const value = program.variables[1]
			program.push(value)
		} else if (instruction == 0x24) {
			// fload_2
			const value = program.variables[2]
			program.push(value)
		} else if (instruction == 0x38) {
			// fstore
			// index
			const index = program.readInstruction()
			program.variables[index] = program.pop()
		} else if (instruction == 0x44) {
			// fstore1
			program.variables[1] = program.pop()
		} else if (instruction == 0x45) {
			// fstore2
			program.variables[2] = program.pop()
		} else if (instruction == 0x37) {
			// lstore
			// index
			const index = program.readInstruction()
			program.variables[index] = program.pop()
		} else if (instruction == 0x16) {
			// lload
			// index
			const index = program.readInstruction()
			const value = program.variables[index]
			program.push(value)
		} else if (instruction == 0x39) {
			// dstore
			// index
			const index = program.readInstruction()
			program.variables[index] = program.pop()
		} else if (instruction == 0x18) {
			// dload
			// index
			const index = program.readInstruction()
			const value = program.variables[index]
			program.push(value)
		} else if (instruction == 0x60) {
			// iadd
			const value1 = program.pop()
			const value2 = program.pop()
			const value = value1 + value2
			program.push(value)
		} else if (instruction == 0x64) {
			// isub
			const value1 = program.pop()
			const value2 = program.pop()
			const value = value1 - value2
			program.push(value)
		} else if (instruction == 0x68) {
			// imul
			const value1 = program.pop()
			const value2 = program.pop()
			const value = value1 * value2
			program.push(value)
		} else if (instruction == 0x6c) {
			// idiv
			const value1 = program.pop()
			const value2 = program.pop()
			const value = value1 / value2
			program.push(value)
		} else if (instruction == 0x70) {
			// irem
			const value1 = program.pop()
			const value2 = program.pop()
			const value = value1 % value2
			program.push(value)
		} else if (instruction == 0x62) {
			// fadd
			const value1 = program.pop()
			const value2 = program.pop()
			const value = value1 + value2
			program.push(value)
		} else if (instruction == 0x66) {
			// fsub
			const value1 = program.pop()
			const value2 = program.pop()
			const value = value1 - value2
			program.push(value)
		} else if (instruction == 0x6a) {
			// fmul
			const value1 = program.pop()
			const value2 = program.pop()
			const value = value1 * value2
			program.push(value)
		} else if (instruction == 0x6e) {
			// fdiv
			const value1 = program.pop()
			const value2 = program.pop()
			const value = value1 / value2
			program.push(value)
		} else if(instruction == 0x72){
			// frem
			const value1 = program.pop()
			const value2 = program.pop()
			const value = value1 % value2
			program.push(value)
		}else {
			throw new NotImplemented(hex(instruction) + " not implemented")
		}
	}
}
