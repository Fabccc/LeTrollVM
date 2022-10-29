import { ConstantPool } from "./ConstantPool"
import { Attribute } from "./Type"

export default class Class {
	public attributes: Attribute[]
	public constantPool: ConstantPool
  public readonly minor:number
  public readonly major:number
	// fields, methods and all that stuff

	constructor(minor: number, major: number,attributes: Attribute[], constantPool: ConstantPool) {
		this.attributes = attributes
		this.constantPool = constantPool
    this.minor = minor
    this.major = major
	}
}
