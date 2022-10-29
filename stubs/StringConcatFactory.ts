import NotImplemented from "../utils/errors/NotImplemented"
import { StubClass } from "./StubClass"

// LETROLL
export class StringConcatFactory extends StubClass {
	constructor() {
		super("java.lang.invoke.StringConcatFactory")
	}

	public makeConcatWithConstants(...args) {
		return args.join("")
	}
}
