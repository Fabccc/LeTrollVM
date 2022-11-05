import Class from "./Class"
import ClassManager from "./ClassLoader"
import {
	ConstantPool,
	readFieldrefInfo,
	readFloat,
	readInteger,
	readInvokeDynamic,
	readMethodrefInfo,
	readString,
} from "./ConstantPool"
import {
	betterDescriptor,
	betterMethodDescriptor,
	descriptorInfo,
} from "./Descriptors"
import NotImplemented from "./errors/NotImplemented"
import { stringify } from "./Print"
import Program from "./Program"
import { Arguments, Attribute, CodeAttribute, Fieldref, Method } from "./Type"

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

export function executeMethod(
	method: Method,
	klass: Class,
	classManager: ClassManager,
	...arg: Arguments[]
): any {
	const { stubs } = classManager
	const { constantPool, attributes } = klass
	const codeAttribute = getCodeAttribute(method)
	const program = new Program(codeAttribute)
	program.debug = false

	// init local variables
	for (let i = 0; i < arg.length; i++) {
		const { type, value } = arg[i]
		if (type == "int") {
			program.variables[i] = value
		} else {
			throw new NotImplemented(
				`Argument ${type} transfert into local variable not implemented`,
			)
		}
	}

	while (program.hasInstruction()) {
		const instruction = program.readInstruction()
		const programIndex = program.programCounter - 1
		if (instruction == 0xb1) {
			// return :)
			program.log(`#${programIndex} return `)
			return
		} else if (instruction == 0x10) {
			// bipush
			const value = program.readInstruction()
			program.log(`#${programIndex} bipush ${value}`)
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
			if (ref.klass == klass.name) {
				program.push(klass.staticFields[ref.field])
			} else {
				program.push(ref)
			}
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
					const instance = stubs.getFieldHandle(
						fieldref.klass,
						fieldref.field,
					)
					if (instance == undefined) {
						throw new NotImplemented(
							"Stub instance for " +
								JSON.stringify(fieldref, null, 1) +
								" not found",
						)
					}
					const methodHandle: Function = instance[methodRef.methodName]
					if (methodHandle == undefined) {
						throw new NotImplemented(
							"Stub method " +
								methodRef.methodName +
								" for " +
								JSON.stringify(fieldref, null, 1) +
								" not found",
						)
					}
					// On invoke virtual, an instance of object must be added to arg for javascript to work
					// properly, as like Java, require an instance of object to make this function work
					// e.g.: it's not static :))))
					methodHandle.call(instance, methodRef.methodDescriptor, value)
				} else {
					throw new NotImplemented(
						"invokevirtual Not implemented with " + value + " / " + fieldref,
					)
				}
			} else {
				console.error(program.stack)
				console.error(program.stackSize)
				console.error(descriptor)
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
			program.log(`#${programIndex} ldc2_w ${stringify(cstValue, 0)}`)
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
			program.log(`#${programIndex} iconst_0`)
			// iconst_0
			program.push(0)
		} else if (instruction == 0x4) {
			program.log(`#${programIndex} iconst_1`)
			//iconst_1
			program.push(1)
		} else if (instruction == 0x5) {
			program.log(`#${programIndex} iconst_2`)
			//iconst_2
			program.push(2)
		} else if (instruction == 0x8) {
			program.log(`#${programIndex} iconst_5`)
			//iconst_5
			program.push(5)
		} else if (instruction == 0x36) {
			//istore
			const index = program.readInstruction()
			const value = program.pop()
			program.log(`#${programIndex} istore ${value}`)
			program.variables[index] = value
		} else if (instruction == 0x3c) {
			//istore_1
			program.log(`#${programIndex} istore_1`)
			const intValue = program.pop()
			program.variables[1] = intValue
		} else if (instruction == 0x3d) {
			//istore_2
			program.log(`#${programIndex} istore_2`)
			const intValue = program.pop()
			program.variables[2] = intValue
		} else if (instruction == 0x3e) {
			//istore_3
			program.log(`#${programIndex} istore_3`)
			const intValue = program.pop()
			program.variables[3] = intValue
		} else if (instruction == 0x15) {
			//iload
			program.log(`#${programIndex} iload`)
			const index = program.readInstruction()
			const intValue = program.variables[index]
			program.push(intValue)
		} else if (instruction == 0x1a) {
			//iload_0
			program.log(`#${programIndex} iload_0`)
			const intValue = program.variables[0]
			program.push(intValue)
		} else if (instruction == 0x1b) {
			//iload_1
			program.log(`#${programIndex} iload_1`)
			const intValue = program.variables[1]
			program.push(intValue)
		} else if (instruction == 0x1c) {
			//iload_2
			program.log(`#${programIndex} iload_2`)
			const intValue = program.variables[2]
			program.push(intValue)
		} else if (instruction == 0x1d) {
			//iload_3
			program.log(`#${programIndex} iload_3`)
			const intValue = program.variables[3]
			program.push(intValue)
		} else if (instruction == 0x11) {
			// sipush
			// byte1
			// byte2
			program.log(`#${programIndex} sipush`)
			const byte1 = program.readInstruction()
			const byte2 = program.readInstruction()
			const value = (byte1 << 8) | byte2
			program.push(value)
		} else if (instruction == 0x17) {
			// fload
			// index
			program.log(`#${programIndex} fload`)
			const index = program.readInstruction()
			const value = program.variables[index]
			program.push(value)
		} else if (instruction == 0x23) {
			// fload_1
			program.log(`#${programIndex} fload_1`)
			const value = program.variables[1]
			program.push(value)
		} else if (instruction == 0x24) {
			// fload_2
			program.log(`#${programIndex} fload_2`)
			const value = program.variables[2]
			program.push(value)
		} else if (instruction == 0x38) {
			// fstore
			// index
			program.log(`#${programIndex} fstore `)
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
		} else if (instruction == 0x40) {
			//lstore_1
			program.variables[1] = program.pop()
			program.variables[2] = program.variables[1]
		} else if (instruction == 0x42) {
			// lstore_3
			program.variables[3] = program.pop()
			program.variables[4] = program.variables[3]
		} else if (instruction == 0x16) {
			// lload
			// index
			const index = program.readInstruction()
			const value = program.variables[index]
			program.push(value)
		} else if (instruction == 0x1f) {
			// lload_1
			const value = program.variables[1]
			program.push(value)
		} else if (instruction == 0x21) {
			// lload_3
			const value = program.variables[3]
			program.push(value)
		} else if (instruction == 0x39) {
			// dstore
			// index
			const index = program.readInstruction()
			program.variables[index] = program.pop()
		} else if (instruction == 0x48) {
			// dstore_1
			const value = program.pop()
			program.variables[1] = value
			program.variables[2] = value
		} else if (instruction == 0x4a) {
			// dstore_3
			const value = program.pop()
			program.variables[3] = value
			program.variables[4] = value
		} else if (instruction == 0x18) {
			// dload
			// index
			const index = program.readInstruction()
			const value = program.variables[index]
			program.push(value)
		} else if (instruction == 0x27) {
			// dload_1
			const value = program.variables[1]
			program.push(value)
		} else if (instruction == 0x29) {
			// dload_3
			const value = program.variables[3]
			program.push(value)
		} else if (instruction == 0x60) {
			// iadd
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 + value2
			program.push(value)
		} else if (instruction == 0x64) {
			// isub
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 - value2
			program.push(value)
		} else if (instruction == 0x68) {
			// imul
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 * value2
			program.push(value)
		} else if (instruction == 0x6c) {
			// idiv
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 / value2
			program.push(value)
		} else if (instruction == 0x70) {
			// irem
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 % value2
			program.push(value)
		} else if (instruction == 0x62) {
			// fadd
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 + value2
			program.push(value)
		} else if (instruction == 0x66) {
			// fsub
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 - value2
			program.push(value)
		} else if (instruction == 0x6a) {
			// fmul
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 * value2
			program.push(value)
		} else if (instruction == 0x6e) {
			// fdiv
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 / value2
			program.push(value)
		} else if (instruction == 0x72) {
			// frem
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 % value2
			program.push(value)
		} else if (instruction == 0x61) {
			// ladd
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 + value2
			program.push(value)
		} else if (instruction == 0x65) {
			// lsub
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 - value2
			program.push(value)
		} else if (instruction == 0x69) {
			// lmut
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 * value2
			program.push(value)
		} else if (instruction == 0x6d) {
			// ldiv
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 / value2
			program.push(value)
		} else if (instruction == 0x71) {
			// lrem
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 - (value1 / value2) * value2
			program.push(value)
		} else if (instruction == 0x63) {
			// dadd
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 + value2
			program.push(value)
		} else if (instruction == 0x67) {
			// dsub
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 - value2
			program.push(value)
		} else if (instruction == 0x6b) {
			// dmul
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 * value2
			program.push(value)
		} else if (instruction == 0x6f) {
			// ddiv
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 / value2
			program.push(value)
		} else if (instruction == 0x73) {
			// drem
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 % value2
			program.push(value)
		} else if (instruction == 0x4c) {
			// astore_1
			const objectref = program.pop()
			program.variables[1] = objectref
		} else if (instruction == 0x2a) {
			// aload_0
			const objectref = program.variables[0]
			program.push(objectref)
		} else if (instruction == 0x2b) {
			// aload_1
			const objectref = program.variables[1]
			program.push(objectref)
		} else if (instruction == 0xba) {
			// invokedynamic
			// indexbyte1
			const indexbyte1 = program.readInstruction() // ref to a value on the constant pool
			// indexbyte2
			const indexbyte2 = program.readInstruction() // ref to a value on the constant pool
			// 0
			program.padZero()
			// 0
			program.padZero()
			const index = (indexbyte1 << 8) | indexbyte2
			const invokeDynamic = readInvokeDynamic(klass, index - 1)
			// fast lookup
			const lookupName =
				invokeDynamic.dynamicName + "|" + invokeDynamic.dynamicDescriptor
			if (program.virtualInvokes[lookupName]) {
				const dynamicMethod = program.virtualInvokes[lookupName]
				const dynamicArgs = []
				for (let i = 0; i < invokeDynamic.dynamicParametersCount; i++)
					dynamicArgs.push(program.pop())
				const value = dynamicMethod(...dynamicArgs.reverse())
				program.push(value)
			} else {
				const method = stubs.getMethodHandle(
					invokeDynamic.bootstrapMethodClass,
					invokeDynamic.bootstrapMethodName,
				)
				// Invoke the method
				// "type": "java/lang/invoke/MethodHandles$Lookup","index": 0
				// "type": "java/lang/String","index": 1
				// "type": "java/lang/invoke/MethodType","index": 2
				const lookup = undefined
				const methodName = invokeDynamic.dynamicName
				const type = undefined
				const dynamicMethod = method(
					lookup,
					methodName,
					type,
					...invokeDynamic.bootstrapMethodArguments,
				)
				// Remind this dynamic method for future invokation
				program.virtualInvokes[lookupName] = dynamicMethod
				const dynamicArgs = []
				for (let i = 0; i < invokeDynamic.dynamicParametersCount; i++)
					dynamicArgs.push(program.pop())
				const value = dynamicMethod(...dynamicArgs.reverse())
				program.push(value)
			}
		} else if (instruction == 0x3a) {
			// astore
			const index = program.readInstruction()
			program.variables[index] = program.pop()
		} else if (instruction == 0x4e) {
			// astore_3
			const value = program.pop()
			program.variables[3] = value
		} else if (instruction == 0x19) {
			// aload
			const index = program.readInstruction()
			const value = program.variables[index]
			program.push(value)
		} else if (instruction == 0x2d) {
			// aload_3
			const value = program.variables[3]
			program.push(value)
		} else if (instruction == 0x1) {
			// aconst_null
			program.push(null)
		} else if (instruction == 0xb8) {
			// invokestatic
			// indexbyte1
			const indexbyte1 = program.readInstruction() // ref to a value on the constant pool
			// indexbyte2
			const indexbyte2 = program.readInstruction() // ref to a value on the constant pool
			const constantPoolIndex = (indexbyte1 << 8) | indexbyte2
			const methodRef = readMethodrefInfo(constantPool, constantPoolIndex - 1)
			const methodDesc = descriptorInfo(methodRef.methodDescriptor)
			const classRef = classManager.get(methodRef.klass)
			if (program.stackSize >= methodDesc.argCount) {
				let args: Arguments[] = []
				for (let i = 0; i < methodDesc.argCount; i++) {
					const { type } = methodDesc.argType[i]
					args.push({
						type: type,
						value: program.pop(),
					})
				}
				const result = classRef.executeMethod(
					methodRef.methodName,
					classManager,
					...args.reverse(),
				)
				program.push(result)
			} else {
				throw new NotImplemented(
					`Invalid stack size (stacksize=${program.stackSize}, methodArgCount=${methodDesc.argCount})`,
				)
			}
		} else if (instruction == 0xac) {
			// ireturn
			program.log(`#${programIndex} ireturn `)
			return program.pop()
		} else if (instruction == 0x9e) {
			// ifle
			program.log(`#${programIndex} ifle `)
			//branchbyte1
			const branchbyte1 = program.readInstruction()
			//branchbyte2
			const branchbyte2 = program.readInstruction()
			const branchbyte = (branchbyte1 << 8) | branchbyte2
			// if less or equal
			const value = program.pop()
			if (value <= 0) {
				program.cursor(branchbyte)
			}
		} else if (instruction == 0xa2) {
			//if_icmpge
			//branchbyte1
			const branchbyte1 = program.readInstruction()
			//branchbyte2
			const branchbyte2 = program.readInstruction()
			const branchbyte = (branchbyte1 << 8) | branchbyte2
			const value2 = program.pop()
			const value1 = program.pop()
			//if_icmpge succeeds if and only if value1 ≥ value2
			const instructionIndex =
				(branchbyte + programIndex) % program.instructionSize
			program.log(
				`#${programIndex} if_icmpge ${instructionIndex} : ${value1} >= ${value2}`,
			)
			if (value1 >= value2) {
				program.cursor(instructionIndex)
			}
		} else if (instruction == 0xb3) {
			// put static
			program.log(`#${programIndex} putstatic `)
			//indexbyte1
			const indexbyte1 = program.readInstruction()
			//indexbyte2
			const indexbyte2 = program.readInstruction()
			const constantPoolIndex = (indexbyte1 << 8) | indexbyte2
			const ref = readFieldrefInfo(constantPool, constantPoolIndex - 1)
			program.log(`#${programIndex} putstatic ${stringify(ref, 0)}`)
			if (ref.klass == klass.name) {
				const value = program.pop()
				klass.staticFields[ref.field] = value
			} else {
				throw new NotImplemented(
					hex(instruction) + " not implemented for foreign static field klass",
				)
			}
		} else if (instruction == 0xb7) {
			// invokespecial
			//indexbyte1
			const indexbyte1 = program.readInstruction()
			//indexbyte2
			const indexbyte2 = program.readInstruction()
			const constantPoolIndex = (indexbyte1 << 8) | indexbyte2
			const ref = readMethodrefInfo(constantPool, constantPoolIndex - 1)
			program.log(`#${programIndex} invokespecial ${stringify(ref, 0)}`)
			if (ref.klass == "java/lang/Object" && ref.methodName == "<init>") {
			} else {
				throw new NotImplemented(
					hex(instruction) +
						" not implemented for special " +
						stringify(ref, 0),
				)
			}
		} else if (instruction == 0x84) {
			// iinc
			// index
			const index = program.readInstruction()
			// const
			const value = program.readInstruction()
			program.variables[index] += value
		} else if (instruction == 0xa7) {
			// goto
			//branchbyte 1
			const branchbyte1 = program.readInstruction()
			//branchbyte2
			const branchbyte2 = program.readInstruction()
			const branchbyte = (branchbyte1 << 8) | branchbyte2
			const instructionIndex = branchbyte % program.instructionSize
			program.log(`#${programIndex} goto ${instructionIndex}`)
			console.log(branchbyte)
			console.log(program.instructionSize)
			throw new NotImplemented(hex(instruction) + " not implemented")
			program.cursor(branchbyte)
		} else if (instruction == 0x0) {
			// noop
		} else {
			throw new NotImplemented(hex(instruction) + " not implemented")
		}
	}
}
