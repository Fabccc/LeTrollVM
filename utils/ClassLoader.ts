import { existsSync, openSync } from "fs"
import {
  listClassAccesors,
  listFieldAccessors,
  listMethodAccesors
} from "./Accessors"
import { readAttributeInfo } from "./Attributes"
import BufferedReader from "./BufferedReader"
import Class from "./Class"
import {
  readClassInfo,
  readConstantPool,
  readNameIndex,
  readUtf8
} from "./ConstantPool"
import { betterDescriptor, betterMethodDescriptor } from "./Descriptors"
import NotFound from "./errors/NotFound"
import NotImplemented from "./errors/NotImplemented"

export default class ClassManager {
	private classes: { [className: string]: Class } = {}

	constructor() {}

	private load(className: string): Class {
		const fileName = className + ".class"
		const exists = existsSync(fileName)
		if (!exists) {
			throw new NotFound(`Class ${className} not found`)
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
				klass.fields.push({
					attributes: attributeInfo,
					descriptor: fieldDescriptor,
					flags: fieldFlags,
					name: fieldName,
					type: betterDescriptor(fieldDescriptor),
				})
				klass.staticFields[fieldName] = 0
			} else {
				throw new NotImplemented("Only static fields implemented yet")
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
			const descriptors = readNameIndex(constantPool, reader.readU2() - 1)
			const methodSignature = betterMethodDescriptor(descriptors)
			const attributeCount = reader.readU2()
			const attributes = readAttributeInfo(reader, attributeCount, constantPool)
			methods.push({
				methodName,
				accessorsFlags,
				methodSignature,
				attributes,
			})
		}
		// u2             attributes_count;
		const attributesCount = reader.readU2()
		klass.attributes = readAttributeInfo(reader, attributesCount, constantPool)
		klass.methods = methods

		klass.resolve(this)
		return klass
	}

	public get(className: string): Class {
		if (!(className in this.classes)) {
			this.classes[className] = this.load(className)
		}
		return this.classes[className]
	}
}
