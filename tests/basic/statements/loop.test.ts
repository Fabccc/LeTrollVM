import ClassManager from "@base/ClassLoader"
import { createNewTestClasses } from "@base/Stubs"
import TestSystem from "@stub/tests/TestSystem"
import { expect, test } from "bun:test"

test("statement: loop (for, while, dowhile)", () => {
	const className = "tests/basic/statements/LoopTest"
	const stubClasses = createNewTestClasses()

	const classManager = new ClassManager(stubClasses)
	const system = stubClasses.getStubClass("java.lang.System") as TestSystem
	const consoleOutput = system.out

	const main = classManager.get(className)
	main.executeMethod("main", classManager)

	expect(consoleOutput.printlnLines[0]).toBe("0")
	expect(consoleOutput.printlnLines[1]).toBe("1")
	expect(consoleOutput.printlnLines[2]).toBe("2")
	expect(consoleOutput.printlnLines[3]).toBe("3")
	expect(consoleOutput.printlnLines[4]).toBe("4")
	expect(consoleOutput.printlnLines[5]).toBe("5")
	expect(consoleOutput.printlnLines[6]).toBe("6")
	expect(consoleOutput.printlnLines[7]).toBe("7")
	expect(consoleOutput.printlnLines[8]).toBe("8")
	expect(consoleOutput.printlnLines[9]).toBe("9")
	expect(consoleOutput.printlnLines[10]).toBe("0")
	expect(consoleOutput.printlnLines[11]).toBe("1")
	expect(consoleOutput.printlnLines[12]).toBe("1")
	expect(consoleOutput.printlnLines[13]).toBe("2")
	expect(consoleOutput.printlnLines[14]).toBe("9")
	expect(consoleOutput.printlnLines[15]).toBe("8")
	expect(consoleOutput.printlnLines[16]).toBe("7")
	expect(consoleOutput.printlnLines[17]).toBe("6")
	expect(consoleOutput.printlnLines[18]).toBe("5")
	expect(consoleOutput.printlnLines[19]).toBe("4")
	expect(consoleOutput.printlnLines[20]).toBe("3")
	expect(consoleOutput.printlnLines[21]).toBe("2")
	expect(consoleOutput.printlnLines[22]).toBe("1")
	expect(consoleOutput.printlnLines[23]).toBe("0")
	expect(consoleOutput.printlnLines[24]).toBe("9")
	expect(consoleOutput.printlnLines[25]).toBe("8")
	expect(consoleOutput.printlnLines[26]).toBe("7")
	expect(consoleOutput.printlnLines[27]).toBe("6")
	expect(consoleOutput.printlnLines[28]).toBe("5")
	expect(consoleOutput.printlnLines[29]).toBe("4")
	expect(consoleOutput.printlnLines[30]).toBe("3")
	expect(consoleOutput.printlnLines[31]).toBe("2")
	expect(consoleOutput.printlnLines[32]).toBe("1")
	expect(consoleOutput.printlnLines[33]).toBe("0")
})
