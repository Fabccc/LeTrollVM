import { StubClass } from "../StubClass"
import TestConsole from "./TestConsole"

class TestSystem extends StubClass {
	public out = new TestConsole()

	constructor() {
		super("java.lang.System")
	}
}

export default TestSystem