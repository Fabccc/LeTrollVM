import ConsolePrintStream from "./ConsolePrintStream"
import StubClass from "./StubClass"

class System extends StubClass {
	public out = new ConsolePrintStream()

	constructor() {
		super("java.lang.System")
	}
}

export default System