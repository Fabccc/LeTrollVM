import { StubClass } from "@stub/StubClass"
import { existsSync, openSync } from "fs"
import {
	listClassAccesors,
	listFieldAccessors,
	listMethodAccesors,
} from "./Accessors"
import { readAttributeInfo } from "./Attributes"
import BufferedReader from "./BufferedReader"
import Class from "./Class"
import {
	readClassInfo,
	readConstantPool,
	readNameIndex,
	readUtf8,
} from "./ConstantPool"
import { betterDescriptor, betterMethodDescriptor } from "./Descriptors"
import NotFound from "./errors/NotFound"
import NotImplemented from "./errors/NotImplemented"
import { hex } from "./Methods"
import { defaultStubClasses, StubClasses } from "./Stubs"
import { Method, MethodHandle } from "./Type"

export default class ClassManager {
	private classes: { [className: string]: Class } = {}
	public stubs: StubClasses

	constructor(stub?: StubClasses) {
		this.stubs = stub || defaultStubClasses
		this.stubs.setClassLoader(this)
	}

	getSuperMethod(
		klassName: string,
		method: string,
	): [Class | StubClass, Method | Function] {
		let lookupClass = klassName
		let klass: StubClass | Class = this.get(lookupClass)
		while (lookupClass !== undefined) {
			if (this.stubs.existsMethodHandle(lookupClass, method)) {
				return [
					this.stubs.getStubClass(lookupClass),
					this.stubs.getMethodHandle(lookupClass, method),
				]
			} else if (this.existsMethodHandle(lookupClass, method)) {
				return [
					this.classes[lookupClass],
					this.classes[lookupClass].getMethod(method),
				]
			} else {
				if (klass instanceof StubClass) {
					lookupClass = (klass as StubClass).superClassName
				} else {
					lookupClass = (klass as Class).superClass
				}
				if (
					lookupClass == undefined ||
					lookupClass == "java/lang/Object" ||
					lookupClass == "java.lang.Object"
				) {
					break
				}
				if (this.exist(lookupClass)) {
					klass = this.get(lookupClass)
				} else {
					klass = this.stubs.getStubClass(lookupClass)
				}
			}
		}
		throw new Error(
			`Unable to found method|supermethod ${method} for class ${klassName}`,
		)
	}

	private existsMethodHandle(className: string, methodName: string): boolean {
		if (!this.exist(className)) return false
		let klass = this.get(className)
		if (klass instanceof Class) {
			return klass.existsMethod(methodName)
		}
		// if (klass instanceof StubClass) {
		// 	return this.stubs.existsMethodHandle(klass.javaClassName, methodName)
		// }
		throw new Error("Expect type Class|StubClass but got " + klass)
	}

	private load(className: string): Class {
		const fileName = className + ".class"
		const exists = existsSync(fileName)
		if (!exists) {
			throw new NotFound(`Class ${className} not found`)
		}
		if (this.classes[className] !== undefined) {
			throw new Error("Class already loaded")
		}
		const file = openSync(fileName, "r")
		const reader: BufferedReader = new BufferedReader(file)

		// u4             magic;
		const magik = reader.readU4()
		if (magik != 0xcafebabe) {
			throw new NotFound(`Class ${className} has wrong file header`)
		}
		// u2             minor_version;
		// u2             major_version;
		const minor = reader.readU2()
		const major = reader.readU2()

		const constantPool = readConstantPool(reader)

		// u2             access_flags;
		const accessFlags = reader.readU2()
		const accessorsFlag = listClassAccesors(accessFlags)

		// u2             this_class;
		const thisClass = reader.readU2()
		const klass = new Class(
			readClassInfo(constantPool, thisClass - 1),
			minor,
			major,
			[],
			constantPool,
		)

		// u2             super_class;
		const thisSuperClass = reader.readU2()

		// u2             interfaces_count;
		const interfacesCount = reader.readU2()
		const interfaces = []
		// u2             interfaces[interfaces_count];
		for (let i = 0; i < interfacesCount; i++) {
			throw new NotImplemented("Interface not implemented yet")
		}
		// u2             fields_count;
		const fieldsCount = reader.readU2()
		const fields = []
		// field_info     fields[fields_count];
		for (let i = 0; i < fieldsCount; i++) {
			// u2             access_flags;
			// u2             name_index;
			// u2             descriptor_index;
			// u2             attributes_count;
			// attribute_info attributes[attributes_count];
			const accessFlagsMask = reader.readU2()
			const fieldFlags = listFieldAccessors(accessFlagsMask)
			const nameIndex = reader.readU2()
			const fieldName = readNameIndex(constantPool, nameIndex - 1)
			const descriptorIndex = reader.readU2()
			const fieldDescriptor = readUtf8(constantPool, descriptorIndex - 1)
			const attributeCount = reader.readU2()
			const attributeInfo = readAttributeInfo(
				reader,
				attributeCount,
				constantPool,
			)
			if (fieldFlags.includes("STATIC")) {
				klass.fieldData[fieldName] = {
					attributes: attributeInfo,
					descriptor: fieldDescriptor,
					flags: fieldFlags,
					name: fieldName,
					type: betterDescriptor(fieldDescriptor),
				}
				klass.staticFields[fieldName] = 0
			} else if (fieldFlags.length == 0) {
				klass.fieldData[fieldName] = {
					attributes: attributeInfo,
					descriptor: fieldDescriptor,
					flags: fieldFlags,
					name: fieldName,
					type: betterDescriptor(fieldDescriptor),
				}
			} else {
				klass.fieldData[fieldName] = {
					attributes: attributeInfo,
					descriptor: fieldDescriptor,
					flags: fieldFlags,
					name: fieldName,
					type: betterDescriptor(fieldDescriptor),
				}
				// throw new NotImplemented("Only static fields implemented yet")
			}
		}
		// u2             methods_count;
		const methodsCount = reader.readU2()
		const methods = []
		// method_info    methods[methods_count];
		for (let i = 0; i < methodsCount; i++) {
			// 	method_info {
			//     u2             access_flags;
			//     u2             name_index;
			//     u2             descriptor_index;
			//     u2             attributes_count;
			//     attribute_info attributes[attributes_count];
			// }
			const accessFlags = reader.readU2()
			const accessorsFlags = listMethodAccesors(accessFlags)
			const methodName = readNameIndex(constantPool, reader.readU2() - 1)
			const methodDescriptor = readNameIndex(constantPool, reader.readU2() - 1)
			const methodSignature = betterMethodDescriptor(methodDescriptor)
			const attributeCount = reader.readU2()
			const attributes = readAttributeInfo(reader, attributeCount, constantPool)
			methods.push({
				methodName,
				accessorsFlags,
				methodSignature,
				methodDescriptor,
				attributes,
			})
		}
		// u2             attributes_count;
		const attributesCount = reader.readU2()
		klass.attributes = readAttributeInfo(reader, attributesCount, constantPool)
		klass.methods = methods

		const superclass = readClassInfo(constantPool, thisSuperClass - 1)

		this.classes[className] = klass
		klass.superClass = superclass
		klass.enum = klass.superClass == "java/lang/Enum"
		klass.resolve(this)
		return klass
	}

	get loadedClasses(): Class[] {
		return Object.values(this.classes)
	}

	public exist(className: string): boolean {
		if (this.classes[className] != undefined) return true
		const fileName = className + ".class"
		return existsSync(fileName)
	}

	public get(className: string): Class {
		// if (this.stubs.exist(className)) {
		// 	return this.stubs.getStubClass(className)
		// }
		if (!(className in this.classes)) {
			this.load(className)
		}
		return this.classes[className]
	}
}
