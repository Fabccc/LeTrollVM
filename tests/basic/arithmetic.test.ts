import ClassManager from "@base/ClassLoader"
import { createNewTestClasses } from "@base/Stubs"
import TestSystem from "@stub/tests/TestSystem"
import { expect, test } from "bun:test"

test("arithmetic", () => {
	const className = "tests/basic/ArithmeticTest"
	const stubClasses = createNewTestClasses()

	const classManager = new ClassManager(stubClasses)
	const system = stubClasses.getStubClass("java.lang.System") as TestSystem
	const consoleOutput = system.out

	const main = classManager.get(className)
	main.executeMethod("main", classManager)

	expect(consoleOutput.printlnLines[0]).toBe("69")
	expect(consoleOutput.printlnLines[1]).toBe("1000000035")
	expect(consoleOutput.printlnLines[2]).toBe("2000000000")
	expect(consoleOutput.printlnLines[3]).toBe("1.0000012345678E9")
	// expect(consoleOutput.printlnLines[4]).toBe("47.34") <= TO FIX
	expect(consoleOutput.printlnLines[5]).toBe("1246.907800152588")
	expect(consoleOutput.printlnLines[6]).toBe("1")
	expect(consoleOutput.printlnLines[7]).toBe("-999999965")
	expect(consoleOutput.printlnLines[8]).toBe("0")
	expect(consoleOutput.printlnLines[9]).toBe("-9.999987654322E8")
	// expect(consoleOutput.printlnLines[10]).toBe("-22.66") <= TO FIX
	expect(consoleOutput.printlnLines[11]).toBe("-1222.2277998474121")
	expect(consoleOutput.printlnLines[12]).toBe("1190")
	expect(consoleOutput.printlnLines[13]).toBe("35000000000")
	expect(consoleOutput.printlnLines[14]).toBe("1000000000000000000")
	expect(consoleOutput.printlnLines[15]).toBe("1.2345678E12")
	// expect(consoleOutput.printlnLines[16]).toBe("431.9") <= TO FIX
	expect(consoleOutput.printlnLines[17]).toBe("15234.566840380097")
	// expect(consoleOutput.printlnLines[18]).toBe("1") <= TO FIX
	expect(consoleOutput.printlnLines[19]).toBe("0")
	expect(consoleOutput.printlnLines[20]).toBe("1")
	expect(consoleOutput.printlnLines[21]).toBe("1.2345678E-6")
	// expect(consoleOutput.printlnLines[22]).toBe("0.35257143") <= TO FIX
	expect(consoleOutput.printlnLines[23]).toBe("0.009995400943219069")
	expect(consoleOutput.printlnLines[24]).toBe("1")
	expect(consoleOutput.printlnLines[25]).toBe("35")
	expect(consoleOutput.printlnLines[26]).toBe("0")
	expect(consoleOutput.printlnLines[27]).toBe("1234.5678")
	// expect(consoleOutput.printlnLines[28]).toBe("12.34") <= TO FIX
	expect(consoleOutput.printlnLines[29]).toBe("12.34000015258789")
	expect(consoleOutput.printlnLines[30]).toBe("1")
	expect(consoleOutput.printlnLines[31]).toBe("243")
	expect(consoleOutput.printlnLines[32]).toBe("280")
	expect(consoleOutput.printlnLines[33]).toBe("4")
})
