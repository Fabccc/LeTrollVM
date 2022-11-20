import NotImplemented from "@base/errors/NotImplemented"
import { Arguments } from "@base/Type"
import { ensureArgument } from "@base/Utils"
import { StubClass } from "./StubClass"

export class Stringz extends StubClass {
	constructor() {
		super("java.lang.String")
	}

	public __init_value__() {
		return null
	}

	public hashCode(arg: Arguments): number {
		ensureArgument(arg, "string")
		const s = arg.value
		var h = 0,
			l = s.length,
			i = 0
		if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0
		return h
	}

	public hashCode_IgnoreType(arg: Arguments): number {
		const s = arg.value
		var h = 0,
			l = s.length,
			i = 0
		if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0
		return h
	}

	public equals(...argList: Arguments[]): boolean {
		return (
			this.hashCode_IgnoreType(argList[0]) ==
			this.hashCode_IgnoreType(argList[1])
		)
	}
}
