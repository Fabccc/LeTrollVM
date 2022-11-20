import ClassManager from "./ClassLoader"
import { ConstantPool } from "./ConstantPool"
import NotFound from "./errors/NotFound"
import NotImplemented from "./errors/NotImplemented"
import { executeMethod } from "./Methods"
import { Arguments, Attribute, Field, Method } from "./Type"

export default class Class {
	public name: string
	public attributes: Attribute[] = []
	public constantPool: ConstantPool
	public methods: Method[] = []
	public readonly minor: number
	public readonly major: number
	public fieldData: { [key: string]: Field } = {}
	public enum: boolean
	public superClass: string
	public interfaces: string[]
	public staticFields: { [key: string]: any } = {}

	// fields, methods and all that stuff

	constructor(
		name: string,
		minor: number,
		major: number,
		attributes: Attribute[],
		constantPool: ConstantPool,
	) {
		this.enum = false
		this.name = name
		this.attributes = attributes
		this.constantPool = constantPool
		this.minor = minor
		this.major = major
	}

	resolve(classManager: ClassManager) {
		this.executeMethod("<clinit>", classManager)
		// this.executeMethod("<init>", classManager)
	}

	getStaticField(field: string): any {
		if (this.fieldData[field] !== undefined) {
			return this.staticFields[field]
		} else {
			throw new Error("This field doesn't exist")
		}
	}

	existsMethod(methodName: string): boolean {
		return this.methods.filter((m) => m.methodName == methodName).length != 0
	}

	getMethod(methodName: string): Method {
		for (const method of this.methods) {
			if (method.methodName == methodName) {
				return method
			}
		}
		throw new NotFound(`${methodName} on ${this.name} not found`)
	}

	executeMethod(
		methodName: string,
		classManager: ClassManager,
		...arg: Arguments[]
	): any {
		for (const method of this.methods) {
			if (method.methodName == methodName) {
				return executeMethod(method, this, classManager, ...arg)
			}
		}
		if (methodName == "<clinit>") {
			// we can skip
		} else {
			throw new NotImplemented(methodName + " not implemented on " + this.name)
		}
	}
}
