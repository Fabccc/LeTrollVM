
import { expect, test } from "bun:test"

test("double printing", () => {
  expect(typeof "s").toBe("string")
  expect(typeof 1).toBe("number")
  expect(typeof {}).toBe("object")
})
