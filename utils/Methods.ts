import { StubClass } from "@stub/StubClass"
import Class from "./Class"
import ClassManager from "./ClassLoader"
import {
	ConstantPool,
	readClassInfo,
	readFieldrefInfo,
	readFloat,
	readInteger,
	readInterfaceMethodrefInfo,
	readInvokeDynamic,
	readMethodrefInfo,
	readString,
	readUtf8,
} from "./ConstantPool"
import {
	betterDescriptor,
	betterMethodDescriptor,
	descriptorInfo,
	type,
} from "./Descriptors"
import NotImplemented from "./errors/NotImplemented"
import { stringify } from "./Print"
import Program from "./Program"
import {
	Arguments,
	ArrayRef,
	Attribute,
	CodeAttribute,
	Fieldref,
	isObjectRef,
	Method,
	MethodData,
	ObjectEnumRef,
	ObjectRef,
	StubObjectRef,
} from "./Type"
import { unsignedByte, unsignedShort } from "./Utils"

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
	if (program.localVariableCount < arg.length) {
		throw new Error("Passed more argument than programLocalVariablesCount")
	}

	// init local variables
	for (let i = 0; i < arg.length; i++) {
		const { type, value } = arg[i]
		program.variables[i] = value
	}

	while (program.hasInstruction()) {
		const instruction = program.readInstruction()
		const programIndex = program.programCounter - 1
		// program.log(`#${programIndex} stackSize=${program.stackSize}`)
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
			const fType = type(ref.fieldType)
			program.log(
				`#${programIndex} getstatic ${ref.klass}.${
					ref.field
				} => ${betterDescriptor(ref.fieldType)}`,
			)
			if (classManager.exist(ref.klass)) {
				const klass = classManager.get(ref.klass)
				program.push(klass.staticFields[ref.field])
			} else {
				// program.push(ref)
				const fieldHandle = classManager.stubs.getFieldHandle(
					ref.klass,
					ref.field,
				)
				if (fType == "object") {
					const stubClass = fieldHandle as StubClass
					const stubClassRef = new StubObjectRef(
						stubClass.javaClassName,
						{},
						stubClass,
					)
					program.push(stubClassRef)
				} else {
					throw new NotImplemented(`Stub class field (${fType})`)
				}
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
			if (program.stackSize >= descriptor.argCount - 1) {
				const argumentList: Arguments[] = []
				for (let i = 0; i < descriptor.argCount; i++) {
					argumentList.push({
						type: descriptor.argType[i].type,
						value: program.pop(),
					})
				}
				const objectref = program.pop() as ObjectRef
				if (objectref == null) {
					throw new Error("NullPointerException")
				}
				if (typeof objectref == "object") {
					if (stubs.exist(objectref.className)) {
						const instance = (objectref as StubObjectRef).stubClass
						if (instance == undefined) {
							throw new NotImplemented(
								"Stub instance for " +
									JSON.stringify(objectref, null, 1) +
									" not found",
							)
						}
						const methodHandle: Function = instance[methodRef.methodName]
						if (methodHandle == undefined) {
							throw new NotImplemented(
								"Stub method " +
									methodRef.methodName +
									" for " +
									JSON.stringify(instance.javaClassName, null, 1) +
									" not found",
							)
						}
						// On invoke virtual, an instance of object must be added to arg for javascript to work
						// properly, as like Java, require an instance of object to make this function work
						// e.g.: it's not static :))))
						// methodHandle.call(instance, methodRef.methodDescriptor, value)
						argumentList.unshift({
							type: "descriptor",
							value: methodRef.methodDescriptor,
						})
						const result = methodHandle.call(instance, ...argumentList)
						if (result != undefined) {
							program.push(result)
						}
					} else {
						const [klass, method] = classManager.getSuperMethod(
							methodRef.klass,
							methodRef.methodName,
						)
						if (klass instanceof Class) {
							const [runtimeClass, methodRef] = [
								klass as Class,
								method as Method,
							]
							argumentList.unshift({
								type: "objectref",
								value: objectref,
							})
							const value = runtimeClass.executeMethod(
								methodRef.methodName,
								classManager,
								...argumentList,
							)
							if (value != undefined) {
								program.push(value)
							}
						} else {
							// Typescript implementation
							const [stubClass, methodHandle] = [
								klass as StubClass,
								method as Function,
							]
							argumentList.unshift({ type: "objectref", value: objectref })
							const result = methodHandle.call(stubClass, ...argumentList)
							if (result != undefined) {
								program.push(result)
							}
						}
					}
				} else if (typeof objectref == "string") {
					const instance = stubs.getStubClass("java/lang/String")
					const methodHandle = stubs.getMethodHandle(
						"java/lang/String",
						methodRef.methodName,
					)
					argumentList.push({ type: "string", value: objectref })
					const result = methodHandle.call(instance, ...argumentList)
					if (result != undefined) {
						program.push(result)
					}
				} else {
					throw new NotImplemented(
						"invokevirtual Not implemented with " +
							argumentList +
							" / " +
							objectref,
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
		} else if (instruction == 0x2) {
			program.log(`#${programIndex} iconst_m1`)
			// iconst_m1
			program.push(-1)
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
		} else if (instruction == 0x6) {
			program.log(`#${programIndex} iconst_3`)
			//iconst_3
			program.push(3)
		} else if (instruction == 0x7) {
			program.log(`#${programIndex} iconst_4`)
			//iconst_4
			program.push(4)
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
			const objectref = program.pop() as ObjectRef
			program.log(`#${programIndex} astore_1 `)
			program.variables[1] = objectref
		} else if (instruction == 0x4d) {
			// astore_2
			const objectref = program.pop() as ObjectRef
			program.log(`#${programIndex} astore_2 `)
			program.variables[2] = objectref
		} else if (instruction == 0x2a) {
			// aload_0
			program.log(`#${programIndex} aload_0 `)
			const objectref = program.variables[0] as ObjectRef
			program.push(objectref)
		} else if (instruction == 0x2b) {
			// aload_1
			program.log(`#${programIndex} aload_1 `)
			const objectref = program.variables[1] as ObjectRef
			program.push(objectref)
		} else if (instruction == 0x2c) {
			// aload_1
			program.log(`#${programIndex} aload_2 `)
			const objectref = program.variables[2] as ObjectRef
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
			program.log(`#${programIndex} invokedynamic ${lookupName}`)
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
				if (value != undefined) {
					program.push(value)
				}
			}
		} else if (instruction == 0xb8) {
			// invokestatic
			// indexbyte1
			const indexbyte1 = program.readInstruction() // ref to a value on the constant pool
			// indexbyte2
			const indexbyte2 = program.readInstruction() // ref to a value on the constant pool
			const constantPoolIndex = (indexbyte1 << 8) | indexbyte2
			const methodRef = readMethodrefInfo(constantPool, constantPoolIndex - 1)
			const methodDesc = descriptorInfo(methodRef.methodDescriptor)

			if (program.stackSize < methodDesc.argCount) {
				throw new NotImplemented(
					`Invalid stack size (stacksize=${program.stackSize}, methodArgCount=${methodDesc.argCount})`,
				)
			}
			program.log(
				`#${programIndex} invokedyanmic ${methodRef.methodName}#${methodDesc.asString}`,
			)
			if (stubs.exist(methodRef.klass)) {
				const stubClass = stubs.getStubClass(methodRef.klass)
				const methodHandle = stubs.getMethodHandle(
					methodRef.klass,
					methodRef.methodName,
				)
				let args: Arguments[] = []
				for (let i = 0; i < methodDesc.argCount; i++) {
					const { type } = methodDesc.argType[i]
					args.push({
						type: type,
						value: program.pop(),
					})
				}
				args.push({
					type: "descriptor",
					value: methodRef.methodDescriptor,
				})
				const result = methodHandle.call(stubClass, ...args.reverse())
				if (result != undefined) {
					program.push(result)
				}
			} else {
				const classRef = classManager.get(methodRef.klass)

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
				if (result != undefined) {
					program.push(result)
				}
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
				program.pop()
			} else if (classManager.stubs.exist(ref.klass)) {
				// Class has a stub class inside
				let lookupName = ref.methodName
				if (lookupName == "<init>") {
					lookupName = "__init__"
				} else if (lookupName == "<clinit>") {
					lookupName = "__clinit__"
				}
				const lookupClass = classManager.stubs.getStubClass(ref.klass)
				const methodHandle = classManager.stubs.getMethodHandle(
					ref.klass,
					lookupName,
				)
				const methodData = descriptorInfo(ref.methodDescriptor)
				const argumentList = popArguments(program, methodData)
				argumentList.unshift({ type: "objectref", value: program.pop() })
				argumentList.unshift({ type: "class", value: klass })
				methodHandle.call(lookupClass, ...argumentList)
			} else {
				const klass = classManager.get(ref.klass)
				const method = klass.getMethod(ref.methodName)
				const methodData = descriptorInfo(method.methodDescriptor)
				const argumentList = popArguments(program, methodData)

				// let objectref: ObjectRef = {
				// 	className: ref.klass,
				// 	fields: {},
				// }
				const objectref = program.pop()
				argumentList.unshift({ type: "objectref", value: objectref })
				klass.executeMethod(ref.methodName, classManager, ...argumentList)
			}
		} else if (instruction == 0xb9) {
			// invokeinterface
			// invokedynamic
			// indexbyte1
			const indexbyte1 = program.readInstruction() // ref to a value on the constant pool
			// indexbyte2
			const indexbyte2 = program.readInstruction() // ref to a value on the constant pool
			// count
			const count = program.readInstruction()
			if (count == 0) {
				throw new Error("invokeinterface  count is 0")
			}
			// 0
			program.padZero()
			const index = (indexbyte1 << 8) | indexbyte2
			const invokeInterface = readInterfaceMethodrefInfo(
				constantPool,
				index - 1,
			)
			// fast lookup

			const interfaceClass = invokeInterface.klass
			const { methodDescriptor, methodName } = invokeInterface

			program.log(
				`#${programIndex} invokeinterface ${methodName}#${methodDescriptor}`,
			)

			if (stubs.exist(interfaceClass)) {
				const stubClass = stubs.getStubClass(interfaceClass)
				const method = stubs.getMethodHandle(interfaceClass, methodName)
				const methodDescriptorData = descriptorInfo(methodDescriptor)
				const dynamicArgs: Arguments[] = []
				for (let i = 0; i < methodDescriptorData.argCount; i++)
					dynamicArgs.push({
						type: methodDescriptorData.argType[i].type,
						value: program.pop(),
					})
				dynamicArgs.push({
					type: "objectref",
					value: program.pop(),
				}) //objectref
				dynamicArgs.push({
					type: "descriptor",
					value: methodDescriptor,
				})
				const value = method.call(stubClass, ...dynamicArgs.reverse())
				if (value != undefined) {
					program.push(value)
				}
			} else {
				throw new NotImplemented(
					"invokeinterface not implemented for runtime classes",
				)
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
		} else if (instruction == 0xac) {
			// ireturn
			program.log(`#${programIndex} ireturn `)
			return program.pop()
		} else if (instruction == 0x99) {
			// ifeq
			const instructionIndex = buildBranchByte12(program, programIndex)
			program.log(`#${programIndex} ifeq ${instructionIndex}`)
			// if less or equal
			const value = program.pop()
			if (value == 0) {
				program.cursor(instructionIndex)
			}
		} else if (instruction == 0x9d) {
			// ifgt
			const instructionIndex = buildBranchByte12(program, programIndex)

			program.log(`#${programIndex} ifgt ${instructionIndex}`)
			// if less or equal
			const value = program.pop()
			if (value > 0) {
				program.cursor(instructionIndex)
			}
		} else if (instruction == 0x9c) {
			// ifge
			const instructionIndex = buildBranchByte12(program, programIndex)

			program.log(`#${programIndex} ifge ${instructionIndex}`)
			// if less or equal
			const value = program.pop()
			if (value >= 0) {
				program.cursor(instructionIndex)
			}
		} else if (instruction == 0x9e) {
			// ifle
			const instructionIndex = buildBranchByte12(program, programIndex)

			program.log(`#${programIndex} ifle ${instructionIndex}`)
			// if less or equal
			const value = program.pop()
			if (value <= 0) {
				program.cursor(instructionIndex)
			}
		} else if (instruction == 0xa0) {
			//if_icmpne
			const instructionIndex = buildBranchByte12(program, programIndex)
			const value2 = program.pop()
			const value1 = program.pop()
			//if_icmpge succeeds if and only if value1 ≥ value2
			program.log(
				`#${programIndex} if_icmpge ${instructionIndex} : ${value1} >= ${value2}`,
			)
			if (value1 != value2) {
				program.cursor(instructionIndex)
			}
		} else if (instruction == 0xa2) {
			//if_icmpge
			const instructionIndex = buildBranchByte12(program, programIndex)
			const value2 = program.pop()
			const value1 = program.pop()
			//if_icmpge succeeds if and only if value1 ≥ value2
			program.log(
				`#${programIndex} if_icmpge ${instructionIndex} : ${value1} >= ${value2}`,
			)
			if (value1 >= value2) {
				program.cursor(instructionIndex)
			}
		} else if (instruction == 0xa3) {
			//if_icmpgt
			const instructionIndex = buildBranchByte12(program, programIndex)
			const value2 = program.pop()
			const value1 = program.pop()
			//if_icmpge succeeds if and only if value1 ≥ value2
			program.log(
				`#${programIndex} if_icmpge ${instructionIndex} : ${value1} >= ${value2}`,
			)
			if (value1 > value2) {
				program.cursor(instructionIndex)
			}
		} else if (instruction == 0xa4) {
			//if_icmple
			const instructionIndex = buildBranchByte12(program, programIndex)
			const value2 = program.pop()
			const value1 = program.pop()
			//if_icmpge succeeds if and only if value1 ≥ value2
			program.log(
				`#${programIndex} if_icmpge ${instructionIndex} : ${value1} >= ${value2}`,
			)
			if (value1 <= value2) {
				program.cursor(instructionIndex)
			}
		} else if (instruction == 0xb3) {
			// put static
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
		} else if (instruction == 0x84) {
			// iinc
			// index
			const index = program.readInstruction()
			// const
			const value = unsignedByte(program.readInstruction())
			program.log(`#${programIndex} iinc ${index},${value}`)
			program.variables[index] += value
		} else if (instruction == 0xa7) {
			// goto
			const instructionIndex = buildBranchByte12(program, programIndex)
			program.log(`#${programIndex} goto ${instructionIndex}`)
			program.cursor(instructionIndex)
		} else if (instruction == 0x0) {
			// noop
		} else if (instruction == 0x85) {
			// i2l int to long
			program.push(BigInt(program.pop()))
		} else if (instruction == 0x8a) {
			// l2d long to double
			const value = program.pop() as BigInt
			program.push(Number(value))
		} else if (instruction == 0x86) {
			// i2f int to float
			program.push(program.pop())
		} else if (instruction == 0x8d) {
			// f2d float to double
			program.push(program.pop())
		} else if (instruction == 0x7e) {
			// iand int and
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 & value2
			program.push(value)
		} else if (instruction == 0x80) {
			// ior int or
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 | value2
			program.push(value)
		} else if (instruction == 0x78) {
			// ishl int shift left
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 << value2
			program.push(value)
		} else if (instruction == 0x7a) {
			// ishr int shift right
			const value2 = program.pop()
			const value1 = program.pop()
			const value = value1 >> value2
			program.push(value)
		} else if (instruction == 0xaa) {
			// tableswitch (The Amogus instruction of the JVM)
			// <0-3 byte pad\>
			// defaultbyte1
			const defaultbyte1 = program.skipUntilMultiple4()
			// defaultbyte2
			const defaultbyte2 = program.readValue()
			// defaultbyte3
			const defaultbyte3 = program.readValue()
			// defaultbyte4
			const defaultbyte4 = program.readValue()
			const defaultbyte =
				(defaultbyte1 << 24) |
				(defaultbyte2 << 16) |
				(defaultbyte3 << 8) |
				defaultbyte4
			// jump offsets...
			const lowbyte = program.read32Bits()
			const highbyte = program.read32Bits()
			const index = program.pop()
			if (index < lowbyte || index > highbyte) {
				const newInstructionProgram = programIndex + defaultbyte
				program.cursor(newInstructionProgram)
			} else {
				const offset = index - lowbyte
				const startAt = program.programCounter + 4 * offset
				const newInstructionProgram =
					program.read32BitsAt(startAt) + programIndex
				program.cursor(newInstructionProgram)
			}
			// throw new NotImplemented(hex(instruction) + " not implemented")
		} else if (instruction == 0xb4) {
			// getfield
			//indexbyte1
			const indexbyte1 = program.readInstruction()
			//indexbyte2
			const indexbyte2 = program.readInstruction()
			const constantPoolIndex = (indexbyte1 << 8) | indexbyte2
			const fieldRef = readFieldrefInfo(constantPool, constantPoolIndex - 1)
			const classRef = classManager.get(fieldRef.klass)
			const objectref = program.pop() as ObjectRef
			program.log(
				`#${programIndex} getfield ${fieldRef.field}:${fieldRef.fieldType}`,
			)

			if (classRef.enum) {
				const enumCtxRef = objectref as any
				const enumRef = classRef.staticFields[enumCtxRef.field] as ObjectEnumRef
				program.push(objectref.fields[fieldRef.field])
			} else {
				program.push(objectref.fields[fieldRef.field])
				// throw new NotImplemented(
				// 	hex(instruction) +
				// 		" (getfield) not implemented (#" +
				// 		programIndex +
				// 		")",
				// )
			}
		} else if (instruction == 0xbb) {
			// new
			//indexbyte1
			const indexbyte1 = program.readInstruction()
			//indexbyte2
			const indexbyte2 = program.readInstruction()
			const constantPoolIndex = (indexbyte1 << 8) | indexbyte2
			const className = readUtf8(constantPool, constantPoolIndex)
			program.log(`#${programIndex} new ${className}`)
			// search on local and stubClasses
			if (stubs.exist(className)) {
				const stubClass = stubs.getStubClass(className)
				const mh = stubs.getMethodHandle(className, "__new__")
				const result = mh.call(stubClass)
				if (isObjectRef(result)) {
					program.push(result)
				} else {
					throw new Error(
						`Result of stubClass call ${className}#__new__ is not ObjectRef`,
					)
				}
			} else {
				const instanceFields = Object.values(
					classManager.get(className).fieldData,
				).filter((f) => !f.flags.includes("STATIC"))
				const fieldsValues: { [key: string]: any } = {}
				for (const field of instanceFields) {
					if (stubs.exist(field.type)) {
						const fieldStubClass = stubs.getStubClass(field.type)
						const mh = stubs.getMethodHandle(field.type, "__init_value__")
						fieldsValues[field.name] = mh.call(fieldStubClass)
					} else if (field.type == "java/lang/String") {
						fieldsValues[field.name] = null
					} else if (field.type == "int") {
						fieldsValues[field.name] = 0
					} else if (field.type == "double") {
						fieldsValues[field.name] = 0.0
					} else {
						throw new NotImplemented(
							`Field initializion not implemented for field of type ${field.type}`,
						)
					}
				}
				const objectref: ObjectRef = {
					className: className,
					fields: fieldsValues,
					type: "ObjectRef",
				}
				program.push(objectref)
			}
		} else if (instruction == 0x59) {
			// dup
			const val = program.pop()
			program.log(`#${programIndex} dup `)
			program.push(val)
			program.push(val)
		} else if (instruction == 0xb5) {
			// putfield
			//indexbyte1
			const indexbyte1 = program.readInstruction()
			//indexbyte2
			const indexbyte2 = program.readInstruction()
			const constantPoolIndex = (indexbyte1 << 8) | indexbyte2
			const value = program.pop()
			const objectref = program.pop() as ObjectRef
			const fieldRef = readFieldrefInfo(constantPool, constantPoolIndex - 1)
			checkRef(classManager, objectref, fieldRef)
			objectref.fields[fieldRef.field] = value
		} else if (instruction == 0xbd) {
			// anewarray
			//indexbyte1
			const indexbyte1 = program.readInstruction()
			//indexbyte2
			const indexbyte2 = program.readInstruction()
			const constantPoolIndex = (indexbyte1 << 8) | indexbyte2
			const classInfo = readClassInfo(constantPool, constantPoolIndex - 1)
			classManager.get(classInfo) // load class
			const count = program.pop()
			const arrayRef = new ArrayRef(classInfo, count, [])
			program.push(arrayRef)
		} else if (instruction == 0x53) {
			// aastore
			const value = program.pop()
			const index = program.pop()
			const arrayRef = program.pop() as ArrayRef
			arrayRef.data[index] = value
		} else if (instruction == 0xb0) {
			// areturn
			const ref = program.pop()
			return ref
		} else if (instruction == 0x9) {
			// lconst_0
			program.push(0n)
		} else if (instruction == 0xa) {
			// lconst_1
			program.push(1n)
		} else if (instruction == 0x41) {
			// lstore_2
			// Both <n> and <n>+1 must be indices into the local variable array of the current frame (§2.6).
			// The value on the top of the operand stack must be of type long.
			// It is popped from the operand stack,
			// and the local variables at <n> and <n>+1 are set to value.
			const value = program.pop()
			program.variables[2] = value
			program.variables[3] = value
		} else if (instruction == 0x20) {
			// lload_2
			program.push(program.variables[2])
		} else if (instruction == 0x94) {
			// lcmp
			const value2 = program.pop()
			const value1 = program.pop()
			if (value1 > value2) {
				program.push(1)
			} else if (value1 < value2) {
				program.push(-1)
			} else {
				program.push(0)
			}
		} else if (instruction == 0x57) {
			// pop
			program.pop()
		} else if (instruction == 0xac) {
			// ireturn
			const val = program.pop()
			return val
		} else {
			throw new NotImplemented(
				hex(instruction) + " not implemented (#" + programIndex + ")",
			)
		}
	}
}

function checkRef(
	classManager: ClassManager,
	objectref: ObjectRef,
	fieldref: Fieldref,
) {
	const fieldName = fieldref.field
	const fieldKlass = fieldref.klass
	const fieldData = classManager.get(fieldKlass).fieldData[fieldName]
	if (fieldData.name != fieldName) {
		throw new Error("Field name validation failed")
	}
	if (fieldData.descriptor != fieldref.fieldType) {
		throw new Error("Field type validation failed")
	}
}

function popArguments(program: Program, methodData: MethodData): Arguments[] {
	const argumentList: Arguments[] = []
	for (let i = 0; i < methodData.argCount; i++) {
		argumentList.push({
			type: methodData.argType[methodData.argCount - 1 - i].type,
			value: program.pop(),
		})
	}
	argumentList.reverse()
	return argumentList
}

function buildBranchByte12(program: Program, programIndex: number): number {
	//branchbyte1
	const branchbyte1 = program.readInstruction()
	//branchbyte2
	const branchbyte2 = program.readInstruction()
	const branchbyte = (branchbyte1 << 8) | branchbyte2
	const offset = unsignedShort(branchbyte)
	const instructionIndex = programIndex + offset
	return instructionIndex
}
