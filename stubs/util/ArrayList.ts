import NotImplemented from "@base/errors/NotImplemented"
import { Arguments, isObjectRef, StubObjectRef } from "@base/Type"
import { StubClass } from "@stub/StubClass"

export default class ArrayList extends StubClass {
	constructor() {
		super("java/util/ArrayList")
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
}
