import StubClass from "./StubClass"

class ConsolePrintStream extends StubClass {
	constructor() {
		super("java.io.PrintStream")
	}

	out(args) {
		console.log(args)
	}
}


export default ConsolePrintStream