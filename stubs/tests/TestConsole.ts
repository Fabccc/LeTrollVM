import Class from "@base/Class"
import Program from "@base/Program"
import { Arguments, Method, ObjectRef } from "@base/Type"
import { scientificNotation } from "@base/Utils"
import NotImplemented from "../../utils/errors/NotImplemented"
import { StubClass } from "../StubClass"

class TestConsole extends StubClass {
	public printlnLines: string[]

	constructor() {
		super("java.io.PrintStream")
		this.printlnLines = []
	}

	// What I want in the future
	// BunJS doesn't implement decorator YET :YEPP:
	//@jvm("(Ljava/lang/String;)V")
	public println(methodDescriptorArg: Arguments, ...args: Arguments[]) {
		// ugly bullshit
		const methodDescriptor = methodDescriptorArg.value
		const firstArg = args[0].value
		if (methodDescriptor == "(Ljava/lang/String;)V") {
			this.printlnLines.push(firstArg)
		} else if (methodDescriptor == "(I)V") {
			this.printlnLines.push((firstArg as number).toString())
		} else if (methodDescriptor == "(D)V" || methodDescriptor == "(F)V") {
			// if number has no decimal, add a ".0"
			const num = firstArg as number
			const dec = num.toString().split(".")[1]
			const len = dec && dec.length > 1 ? dec.length : 1
			// print
			const [mantisa, exp] = scientificNotation(num)
			if (exp >= 7 || exp <= -4) {
				this.printlnLines.push(mantisa + "E" + exp)
			} else {
				this.printlnLines.push(num.toFixed(len))
			}
		} else if (methodDescriptor == "(J)V") {
			this.printlnLines.push((firstArg as number).toString())
		} else if (methodDescriptor == "(Ljava/lang/Object;)V") {
			const objectref = firstArg as ObjectRef
			const [klass, method] = this.classLoader.getSuperMethod(
				objectref.className,
				"toString",
			)
			if (klass instanceof StubClass) {
				const stubClass = klass as StubClass
				const result = (method as Function).call(stubClass, objectref)
				this.printlnLines.push(result.toString())
			} else {
				const [runtimeClass, methodref] = [klass as Class, method as Method]
				if (Program.debug) {
					console.log("invoke toString() of " + runtimeClass.name)
				}
				const value = runtimeClass.executeMethod(
					methodref.methodName,
					this.classLoader,
					...args,
				)
				this.printlnLines.push(value)
			}
		} else {
			throw new NotImplemented(
				"Console test log with descriptor " +
					methodDescriptor +
					" is not implemented",
			)
		}
	}

	public print(methodDescriptor: string, ...args) {
		throw new NotImplemented(
			"Console test log (no new line) with descriptor " +
				methodDescriptor +
				" is not implemented",
		)
	}
}

export default TestConsole
