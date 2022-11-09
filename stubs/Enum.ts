import Class from "@base/Class"
import NotImplemented from "@base/errors/NotImplemented"
import { Arguments, ObjectEnumRef } from "@base/Type"
import { StubClass } from "./StubClass"

export class Enum extends StubClass {
	constructor() {
		super("java.lang.Enum")
	}

	__init__(...arg: Arguments[]) {
		if (arg.length != 4) {
			throw new Error(
				"Calling enum constructor with a different amount of arguments",
			)
		}
		const [classArg, objectRefArg, enumName, enumOrdinal] = arg
		const klass = classArg.value as Class
		const name = enumName.value as string
		const ordinal = enumOrdinal.value as number
		const objectRef = objectRefArg.value as any
		objectRef.name = name
		objectRef.ordinal = ordinal
	}

	__clinit__(...arg: Arguments[]) {
		throw new NotImplemented(
			"<clinit> not implemented for " + this.javaClassName,
		)
	}

	__toString__(...arg: Arguments[]) {
		return this.name(...arg)
	}

	ordinal(...arg: Arguments[]): number {
		const [instance] = arg
		return (instance as unknown as ObjectEnumRef).ordinal
	}

  name(...arg: Arguments[]): string {
		const [instance] = arg
		return (instance as unknown as ObjectEnumRef).name
  }
}
