import { StubClass } from "@stub/StubClass"

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
	index: number
	type: string
}

export interface MethodType {
	name: string
	descriptor: string
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

export interface InvokeDynamic {
	name: "InvokeDynamic"
	bootstrapMethodClass: string
	bootstrapMethodDescriptor: string
	bootstrapMethodName: string
	bootstrapMethodArguments: any[]
	dynamicName: string
	dynamicDescriptor: string
	dynamicParametersCount: number
}

export function isObjectRef(val: any): val is ObjectRef {
	return val != undefined && val.type === "ObjectRef"
}

export interface ObjectRef {
	type: "ObjectRef"
	className: string
	fields: { [key: string]: any }
}

export class StubObjectRef implements ObjectRef {
	type: "ObjectRef"
	className: string
	fields: { [key: string]: any }
	stubClass: StubClass

	constructor(
		className: string,
		fields: { [key: string]: any },
		stubClass: StubClass,
	) {
		this.className = className
		this.fields = fields
		this.stubClass = stubClass
	}
}

export class ArrayRef implements ObjectRef {
	type: "ObjectRef"
	className: string
	data: any[]
	fields: { [key: string]: any }

	constructor(className: string, size: number, data: any[]) {
		this.className = className
		this.fields = {}
		this.data = data
		this.fields["length"] = size
	}
}

export interface ObjectEnumRef extends ObjectRef {
	type: "ObjectRef"
	name: string
	ordinal: number
}

export interface Method {
	methodName: string
	accessorsFlags: string[]
	methodSignature: string
	methodDescriptor: string
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

export interface BootstrapMethodsAttribute extends Attribute {
	name: "BootstrapMethods"
	bootstrapMethods: BootstrapMethods[]
}

export interface BootstrapMethods extends Attribute {
	bootstrapMethodRef: number
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

export interface StackMapTable extends Attribute {
	name: "StackMapTable"
	entries: StackMapEntries[]
}

export interface StackMapEntries {
	offsetDelta: number
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

export interface MethodHandle {
	name: string
	klass: string
	methodName: string
	methodDescriptor: string
	referenceKind: number
	referenceKindName: string
}

export interface Field {
	name: string
	flags: string[]
	type: string
	descriptor: string
	attributes: Attribute[]
}

export interface Arguments {
	value: any
	type: string
}
