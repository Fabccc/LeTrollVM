
import ClassManager from "@base/ClassLoader"
import { createNewTestClasses } from "@base/Stubs"
import TestSystem from "@stub/tests/TestSystem"
import { expect, test } from "bun:test"

test("enum lookup and methods", () => {
	const className = "tests/basic/ObjectTest"
	const stubClasses = createNewTestClasses()

	const classManager = new ClassManager(stubClasses)
	const system = stubClasses.getStubClass("java.lang.System") as TestSystem
	const consoleOutput = system.out

	const main = classManager.get(className)
	main.executeMethod("main", classManager)

  expect(consoleOutput.printlnLines[0]).toBe("Hi ! I'm Walter White and I'm 69 years old.")
  expect(consoleOutput.printlnLines[1]).toBe("{Class A:Walter White}")
})
