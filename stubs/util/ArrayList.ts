import NotImplemented from "@base/errors/NotImplemented"
import {
	Arguments,
	ArrayRef,
	isObjectRef,
	ObjectRef,
	StubObjectRef,
} from "@base/Type"
import { ensureArgument, ensureArgumentI } from "@base/Utils"
import { StubClass } from "@stub/StubClass"

export default class ArrayList extends StubClass {
	constructor() {
		super("java/util/ArrayList", "java/util/List")
	}

	public __init__(...arg: Arguments[]) {
		const [callerArg, objectrefArg] = arg

		const caller = callerArg.value
		const objectref = objectrefArg.value

		if (arg.length == 2) {
			if (isObjectRef(objectref)) {
			} else {
				console.log(Object.keys(objectref))
				throw new Error("Passing argument that is not objectref")
			}
		} else {
			throw new NotImplemented(
				"__init__ not implemented with " + arg.length + " arguments",
			)
		}
	}

	public __new__(...arg: Arguments[]): StubObjectRef {
		return {
			className: this.javaClassName,
			fields: {
				array: [],
			},
			stubClass: this,
			type: "ObjectRef",
		}
	}

	public __toString__(...args: Arguments[]): string {
		const { type, value } = args[0]
		const arrayField = (value as ObjectRef).fields["array"] as ObjectRef[]
		let str = "["
		for (let i = 0; i < arrayField.length; i++) {
			str += arrayField[i].fields["value"]
			if (i < arrayField.length - 1) str += ", "
		}
		str += "]"
		return str
	}

	public remove(...args: Arguments[]) {
		const methodDescriptor = args[0].value
		if (methodDescriptor == "(I)Ljava/lang/Object;") {
			const [mh, arrayRefArg, indexRefArg] = args
			ensureArgument(indexRefArg, "int")
			const arrayRef = arrayRefArg.value as ArrayRef
			const indexRef = indexRefArg.value as number
			const array = arrayRef.fields["array"] as any[]
			const element = array[indexRef]
			array.splice(indexRef, 1)
			return { type: "int", value: element }
		} else {
			throw new NotImplemented(
				"ArrayList#remove not implemented with descriptor " + methodDescriptor,
			)
		}
	}

	public add(...args: Arguments[]): boolean {
		const methodDescriptor = args[0].value
		console.log(methodDescriptor)
		if (methodDescriptor == "(Ljava/lang/Object;)Z") {
			// List#add(E): boolean
			ensureArgumentI(args, 1, "objectref")
			const [md, arrayRefArg, integerRefArg] = args
			const arrayRef = arrayRefArg.value as ArrayRef
			const integerRef = integerRefArg.value as ObjectRef
			;(arrayRef.fields["array"] as any[]).push(integerRef)
			return true
		} else {
			throw new NotImplemented(
				"ArrayList#add not implemented with descriptor " + methodDescriptor,
			)
		}
	}

	public size(...arg: Arguments[]): number {
		const [methodDescriptor, objectRefArg] = arg
		const { type, value } = objectRefArg
		if (!isObjectRef(value)) {
			console.log(value)
			throw new Error("size arraylist: object ref not provided")
		}
		const objectref = value as ObjectRef
		return (objectref.fields["array"] as any[]).length
	}
}
