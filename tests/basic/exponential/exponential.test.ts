import ClassManager from "@base/ClassLoader"
import { createNewTestClasses } from "@base/Stubs"
import TestSystem from "@stub/tests/TestSystem"
import { expect, test } from "bun:test"

test("double printing", () => {
	const className = "tests/basic/exponential/ExponentialTest"
	const stubClasses = createNewTestClasses()

	const classManager = new ClassManager(stubClasses)
	const system = stubClasses.getStubClass("java.lang.System") as TestSystem
	const consoleOutput = system.out

	const main = classManager.get(className)
	main.executeMethod("main", classManager)
  expect(consoleOutput.printlnLines[0]).toBe("12.34")
  expect(consoleOutput.printlnLines[1]).toBe("1234.0")
  expect(consoleOutput.printlnLines[2]).toBe("12340.0")
  expect(consoleOutput.printlnLines[3]).toBe("123400.0")
  expect(consoleOutput.printlnLines[4]).toBe("1234000.0")
  expect(consoleOutput.printlnLines[5]).toBe("1.234E7")
  expect(consoleOutput.printlnLines[6]).toBe("1.234E8")
  expect(consoleOutput.printlnLines[7]).toBe("1.234E9")

  expect(consoleOutput.printlnLines[8]).toBe("1.234")
  expect(consoleOutput.printlnLines[9]).toBe("0.1234")
  expect(consoleOutput.printlnLines[10]).toBe("0.01234")
  expect(consoleOutput.printlnLines[11]).toBe("0.001234")
  expect(consoleOutput.printlnLines[12]).toBe("1.234E-4")
  expect(consoleOutput.printlnLines[13]).toBe("1.234E-5")
  expect(consoleOutput.printlnLines[14]).toBe("1.234E-6")
  expect(consoleOutput.printlnLines[15]).toBe("1.234E-7")
})
