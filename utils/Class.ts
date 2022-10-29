import { ConstantPool } from "./ConstantPool"
import NotImplemented from "./errors/NotImplemented"
import { executeMethod } from "./Methods"
import { Attribute, Field, Method } from "./Type"

export default class Class {
	public name: string
	public attributes: Attribute[] = []
	public constantPool: ConstantPool
	public methods: Method[] = []
	public readonly minor: number
	public readonly major: number
	public fields: Field[] = []
	public staticFields: any = {}

	// fields, methods and all that stuff

	constructor(
		name: string,
		minor: number,
		major: number,
		attributes: Attribute[],
		constantPool: ConstantPool,
	) {
		this.name = name
		this.attributes = attributes
		this.constantPool = constantPool
		this.minor = minor
		this.major = major
	}

	resolve() {
		this.executeMethod("<init>")
		this.executeMethod("<clinit>")
	}

	executeMethod(methodName: string, ...arg: any): any {
		for (const method of this.methods) {
			if (method.methodName == methodName) {
				return executeMethod(method, this, ...arg)
			}
		}
		if(methodName == "<clinit>"){
			// we can skip
		}else{
			throw new NotImplemented(methodName + " not implemented on " + this.name)
		}
	}
}
