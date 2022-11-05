import ClassManager from "@base/ClassLoader";
import { createNewTestClasses } from "@base/Stubs";
import TestSystem from "@stub/tests/TestSystem";
import { expect, test } from "bun:test";

test("string printing", () => {

  const className = "tests/print/string/StringTest"
  const stubClasses = createNewTestClasses()  

  const classManager = new ClassManager(stubClasses)
  const system = stubClasses.getStubClass("java.lang.System") as TestSystem
  const consoleOutput = system.out

  const main = classManager.get(className)
  main.executeMethod("main", classManager)

  expect(consoleOutput.printlnLines[0]).toBe("Salut!")
  expect(consoleOutput.printlnLines[1]).toBe("Salut les bogoss")
  expect(consoleOutput.printlnLines[2]).toBe("Salut les bogoss")
})