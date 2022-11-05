import ClassManager from "@base/ClassLoader"
import { createNewTestClasses } from "@base/Stubs"
import TestSystem from "@stub/tests/TestSystem"
import { expect, test } from "bun:test"

test("double printing", () => {
	const className = "tests/print/double_/DoubleTest"
	const stubClasses = createNewTestClasses()

	const classManager = new ClassManager(stubClasses)
	const system = stubClasses.getStubClass("java.lang.System") as TestSystem
	const consoleOutput = system.out

	const main = classManager.get(className)
	main.executeMethod("main", classManager)

	expect(consoleOutput.printlnLines[0]).toBe("3.14")
	expect(consoleOutput.printlnLines[1]).toBe("3.1499")
	expect(consoleOutput.printlnLines[2]).toBe("420069.0")
})
