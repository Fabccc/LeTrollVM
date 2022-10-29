export interface Fieldref {
	klass: string
	field: string
	fieldType: string
}

export interface MethodData {
	argCount: number
	/**
	 * Last element of list = return type
	 */
	argType: MethodArgument[]
	asString: string
}

export interface MethodArgument {
	index: number,
	type: string
}

export interface Methodref {
	klass: string
	methodName: string
	methodDescriptor: string
}

export interface NameAndType {
	name: string
	desc: string
}

export interface InvokeDynamic{
	name: "InvokeDynamic",
	methodHandleClass: string,
	methodHandleDescriptor: string,
	methodHandleName: string,
	dynamicName: string,
	dynamicDescriptor: string,
	dynamicArgs: any[]
}

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

export interface BootstrapMethodsAttribute extends Attribute{
	name: "BootstrapMethods"
	bootstrapMethods: BootstrapMethods[]
}

export interface BootstrapMethods extends Attribute{
	bootstrapMethodRef: number,
	bootstrapArguments: number[]
}

export interface InnerClassesAttribute extends Attribute {
	name: "InnerClasses"
	classes: InnerClasses[]
}

export interface InnerClasses {
	innerClassInfoIndex: number
	outerClassInfoIndex: number
	innerNameIndex: number
	innerClassAccessFlags: number
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


export interface MethodHandle{
	name: string,
	klass: string,
	methodName: string,
	methodDescriptor: string,
	referenceKind: number,
	referenceKindName: string
}