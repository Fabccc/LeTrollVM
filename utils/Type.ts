
export interface Fieldref {
	klass: string,
	field: string,
	fieldType: string
}

export interface NameAndType{
	name: string,
	desc: string
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
