
import ClassManager from "@base/ClassLoader"
import Program from "@base/Program"
import { createNewTestClasses } from "@base/Stubs"
import TestSystem from "@stub/tests/TestSystem"
import { expect, test } from "bun:test"

test("statement: switch", () => {
	const className = "tests/basic/statements/SwitchTest"
	const stubClasses = createNewTestClasses()

	const classManager = new ClassManager(stubClasses)
	const system = stubClasses.getStubClass("java.lang.System") as TestSystem
	const consoleOutput = system.out

	const main = classManager.get(className)
	main.executeMethod("main", classManager)

	// Program.debug = true
  expect(consoleOutput.printlnLines[0]).toBe("Salut!")
  expect(consoleOutput.printlnLines[1]).toBe("Foo")
  expect(consoleOutput.printlnLines[2]).toBe("Bar")
  expect(consoleOutput.printlnLines[3]).toBe("John")
  expect(consoleOutput.printlnLines[4]).toBe("Doe")
  expect(consoleOutput.printlnLines[5]).toBe("420")
	// Program.debug = false
})
