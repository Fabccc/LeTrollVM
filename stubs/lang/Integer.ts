import ClassManager from "@base/ClassLoader"
import { Flags, PUBLIC } from "@base/Decorators"
import NotImplemented from "@base/errors/NotImplemented"
import { Arguments, ObjectRef, StubObjectRef } from "@base/Type"
import { ensureArgumentI } from "@base/Utils"
import { StubClass } from "@stub/StubClass"

export default class Integer extends StubClass {
	constructor() {
		super("java/lang/Integer", "java/lang/Number")
		this.nonStatic.push("intValue")
	}

	public __valueOf__(...args: Arguments[]): ObjectRef {
		ensureArgumentI(args, 0, "descriptor")
		const methodDescriptor = args[0].value
		if (methodDescriptor == "(I)Ljava/lang/Integer;") {
			ensureArgumentI(args, 1, "int")

			const objectref: StubObjectRef = new StubObjectRef("java/lang/Integer", {
				value: args[1].value,
			}, ClassManager.getInstance().stubs.getStubClass("java/lang/Integer"))
			return objectref
		} else {
			throw new NotImplemented(
				"Integer#valueOf not implemented with descriptor " + methodDescriptor,
			)
		}
	}

	@Flags(PUBLIC)
	public intValue(...args: Arguments[]): number {
		const methodDescriptor = args[0].value
		if (methodDescriptor == "()I") {
			ensureArgumentI(args, 1, "objectref")
			const stubObjectRef = args[1].value as StubObjectRef
			const value = stubObjectRef.fields["value"]
			return value
		} else {
			throw new NotImplemented("intValue not implemented");

		}
	}
}
