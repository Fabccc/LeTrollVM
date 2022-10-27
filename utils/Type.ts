// // 	method_info {
// 	//     u2             access_flags;
// 	//     u2             name_index;
// 	//     u2             descriptor_index;
// 	//     u2             attributes_count;
// 	//     attribute_info attributes[attributes_count];
// 	// }
// 	const accessFlags = reader.readU2()
// 	const accessorsFlags = listMethodAccesors(accessFlags)
// 	const methodName = readNameIndex(constantPool, reader.readU2() - 1)
// 	const descriptors = readNameIndex(constantPool, reader.readU2() - 1)
// 	const methodSignature = betterMethodDescriptor(descriptors)
// 	const attributeCount = reader.readU2()
// 	const attributes = readAttributeInfo(reader, attributeCount, constantPool)
// 	methods.push({
// 		methodName,
// 		accessorsFlags,
// 		methodSignature,
// 		attributes,
// 	})
export interface Method {
	methodName: string
	accessorsFlags: string[]
	methodSignature: string
	attributes: Attribute[]
}

export interface Attribute {
	name: string
}

export interface CodeAttribute extends Attribute {
	name: "Code"
	maxStacks: number
	maxLocalVariables: number
	code: Uint8Array
	exceptionTable: Exception[]
	codeAttributes: Attribute[]
}

export interface LineNumberTableAttribute extends Attribute {
	name: "LineNumberTable"
	lineNumberTable: LineNumberTableLine[]
}
export interface LineNumberTableLine {
	startPointerCode: number
	lineNumber: number
}

export interface Exception {
	startPointerCode: number
	endPointerCode: number
	handlerPointerCode: number
	catchType: number
}
