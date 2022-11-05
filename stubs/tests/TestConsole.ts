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
	public println(methodDescriptor: string, ...args) {
		// ugly bullshit
		if(methodDescriptor == "(Ljava/lang/String;)V"){
			this.printlnLines.push(args[0])
		}else if(methodDescriptor == "(I)V"){
			this.printlnLines.push((args[0] as number).toString())
		}else{
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
