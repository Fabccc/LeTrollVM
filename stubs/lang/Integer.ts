import NotImplemented from "@base/errors/NotImplemented"
import { Arguments, ObjectRef } from "@base/Type"
import { ensureArgumentI } from "@base/Utils"
import { StubClass } from "@stub/StubClass"

export default class Integer extends StubClass {
	constructor() {
		super("java/lang/Integer", "java/lang/Number")
	}

	public __valueOf__(...args: Arguments[]): ObjectRef {
		ensureArgumentI(args, 0, "descriptor")
		const methodDescriptor = args[0].value
		if (methodDescriptor == "(I)Ljava/lang/Integer;") {
			// Integer.valueOf(int i)
			ensureArgumentI(args, 1, "int")
			const objectref: ObjectRef = {
				type: "ObjectRef",
				className: "java/lang/Integer",
				fields: {
					value: args[1].value,
				},
			}
			return objectref
		} else {
			throw new NotImplemented(
				"Integer#valueOf not implemented with descriptor " + methodDescriptor,
			)
		}
	}
}