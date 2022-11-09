import ClassManager from "@base/ClassLoader"
import { createNewTestClasses } from "@base/Stubs"
import TestSystem from "@stub/tests/TestSystem"
import { expect, test } from "bun:test"

test("enum lookup and methods", () => {
	const className = "tests/basic/EnumTest"
	const stubClasses = createNewTestClasses()

	const classManager = new ClassManager(stubClasses)
	const system = stubClasses.getStubClass("java.lang.System") as TestSystem
	const consoleOutput = system.out

	const main = classManager.get(className)
	main.executeMethod("main", classManager)

  expect(consoleOutput.printlnLines[0]).toBe("Salut!")
  expect(consoleOutput.printlnLines[1]).toBe("1")
  expect(consoleOutput.printlnLines[2]).toBe("3.14")
  expect(consoleOutput.printlnLines[3]).toBe("0")
  expect(consoleOutput.printlnLines[4]).toBe("VERSION1")
  expect(consoleOutput.printlnLines[5]).toBe("VERSION1")
  expect(consoleOutput.printlnLines[6]).toBe("Hello!")
  expect(consoleOutput.printlnLines[7]).toBe("-1")
  expect(consoleOutput.printlnLines[8]).toBe("420.69")
  expect(consoleOutput.printlnLines[9]).toBe("1")
  expect(consoleOutput.printlnLines[10]).toBe("VERSION2")
  expect(consoleOutput.printlnLines[11]).toBe("VERSION2")
})
