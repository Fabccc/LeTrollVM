import { Attribute, CodeAttribute, Method } from "./Type"

export function betterCodeDump(code: CodeAttribute): string[]{
  let res = []
  for(let i = 0; i < code.code.length; i++){
    res.push("0x"+code.code[i].toString(16))
  }
  return res
}

export function getCodeAttribute(method: Method): CodeAttribute {
	for (const attribute of method.attributes) {
		if (attribute.name == "Code") {
			return attribute as CodeAttribute
		}
	}
	return undefined
}

export function executeMethod(method: Method) {
	console.log("Executing " + method.methodName + " | " + method.methodSignature)
	const codeAttribute = getCodeAttribute(method)
	console.log(JSON.stringify(codeAttribute, null, 1))
  console.log(JSON.stringify(betterCodeDump(codeAttribute), null, 1))
}
