import { readFieldrefInfo, readString } from "./ConstantPool"
import { betterDescriptor } from "./Descriptors"
import NotImplemented from "./errors/NotImplemented"
import Program from "./Program"
import { Attribute, CodeAttribute, Method } from "./Type"

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

export function executeMethod(method: Method, constantPool: any[]) {
	console.log("Executing " + method.methodName + " | " + method.methodSignature)
	const codeAttribute = getCodeAttribute(method)
	console.log(JSON.stringify(codeAttribute, null, 1))
	console.log(JSON.stringify(betterCodeDump(codeAttribute.code), null, 1))
	const program = new Program(codeAttribute)
	while (program.hasInstruction()) {
		const instruction = program.readInstruction()
		const programIndex = program.programCounter
		if (instruction == 0xb2) {
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
		} else {
			throw new NotImplemented(hex(instruction) + " not implemented")
		}
	}
}
