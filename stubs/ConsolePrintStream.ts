import { ObjectRef } from "@base/Type"
import { stdout } from "bun"
import NotImplemented from "../utils/errors/NotImplemented"
import { stringify } from "../utils/Print"
import { StubClass } from "./StubClass"

class ConsolePrintStream extends StubClass {
	constructor() {
		super("java.io.PrintStream")
	}

	// What I want in the future
	// BunJS doesn't implement decorator YET :YEPP:
	//@jvm("(Ljava/lang/String;)V")
	public println(methodDescriptor: string, ...args) {
		// ugly bullshit
		if (methodDescriptor == "(Ljava/lang/String;)V") {
			console.log(...args)
		} else if (methodDescriptor == "(I)V") {
			console.log(args[0].toString())
		} else if (methodDescriptor == "(C)V") {
			const char = args[0]
			console.log(String.fromCharCode(char))
		} else if (methodDescriptor == "(Z)V") {
			const boolean = args[0]
			console.log(boolean ? "true" : "false")
		} else if (methodDescriptor == "(F)V") {
			console.log(args[0].toString())
		} else if (methodDescriptor == "(J)V") {
			console.log(args[0].toString())
		} else if (methodDescriptor == "(D)V") {
			console.log(args[0].toString())
		} else if (methodDescriptor == "(Ljava/lang/Object;)V") {
			const [objectarg] = args
			const objectref = objectarg as ObjectRef
			const [klass, method] = this.classLoader.getSuperMethod(
				objectref.className,
				"toString",
			)
			if (klass instanceof StubClass) {
				const stubClass = klass as StubClass
				const result = (method as Function).call(stubClass, objectref)
				console.log(result.toString())
			} else {
				throw new NotImplemented(
					"Console test log with descriptor " +
						methodDescriptor +
						" is not implemented",
				)
			}
		} else {
			throw new NotImplemented(
				"Console log with descriptor " +
					methodDescriptor +
					" is not implemented",
			)
		}
	}

	public print(methodDescriptor: string, ...args) {
		if (methodDescriptor == "(Ljava/lang/String;)V") {
			Bun.write(Bun.stdout, args.join(""))
		} else {
			throw new NotImplemented(
				"Console log (no new line) with descriptor " +
					methodDescriptor +
					" is not implemented",
			)
		}
	}
}

export default ConsolePrintStream
