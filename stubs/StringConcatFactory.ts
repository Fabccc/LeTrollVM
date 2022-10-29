import NotImplemented from "../utils/errors/NotImplemented"
import { StubClass } from "./StubClass"

// LETROLL
export class StringConcatFactory extends StubClass {
	constructor() {
		super("java.lang.invoke.StringConcatFactory")
	}

	public makeConcatWithConstants(...args) {
		const [lookup, methodName, type, pattern] = args
		return function(...argument){
			let word: string  = pattern
			for(const arg of argument){
				word = word.replace("\u0001", arg)
			}
			return word
		}
	}
}
