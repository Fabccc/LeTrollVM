import ClassManager from "@base/ClassLoader";
import { createNewTestClasses } from "@base/Stubs";
import TestSystem from "@stub/tests/TestSystem";
import { expect, test } from "bun:test";

test("integer printing", () => {

  const className = "tests/print/integer/IntTest"
  const stubClasses = createNewTestClasses()  

  const classManager = new ClassManager(stubClasses)
  const system = stubClasses.getStubClass("java.lang.System") as TestSystem
  const consoleOutput = system.out

  const main = classManager.get(className)
  main.executeMethod("main", classManager)

  expect(consoleOutput.printlnLines[0]).toBe("69")
  expect(consoleOutput.printlnLines[1]).toBe("69")
  expect(consoleOutput.printlnLines[2]).toBe("42069")
})