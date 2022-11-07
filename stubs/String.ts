import NotImplemented from "@base/errors/NotImplemented"
import { StubClass } from "./StubClass"

export class Stringz extends StubClass {
	constructor() {
		super("java.lang.String")
	}

	public hashCode(s: string): number {
		var h = 0,
			l = s.length,
			i = 0
		if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0
		return h
	}

	public equals(...argList: any[]): boolean {
		return this.hashCode(argList[0]) == this.hashCode(argList[1])
	}
}
