import { ConstantPool } from "./ConstantPool"
import { executeMethod } from "./Methods"
import { Attribute, Method } from "./Type"

export default class Class {
	public name: string
	public attributes: Attribute[]
	public constantPool: ConstantPool
  public methods: Method[]
	public readonly minor:number
  public readonly major:number

	// fields, methods and all that stuff

	constructor(name: string, minor: number, major: number,attributes: Attribute[], constantPool: ConstantPool) {
		this.name = name
		this.attributes = attributes
		this.constantPool = constantPool
    this.minor = minor
    this.major = major
	}

	executeMethod(methodName: string, ...arg: any): any{
		for (const method of this.methods) {
			if (method.methodName == methodName) {
				return executeMethod(method, this, ...arg)
			}
		}
	}

}
