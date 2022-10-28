// FieldType  term 	  Type 	Interpretation
// B 	        byte 	        signed byte
// C 	        char 	        Unicode character code point in the Basic Multilingual Plane, encoded with UTF-16
// D 	        double 	      double-precision floating-point value
// F 	        float 	      single-precision floating-point value
// I 	        int 	        integer
// J 	        long 	        long integer
// L          ClassName ;   reference 	an instance of class ClassName
// S 	        short 	      signed short
// Z 	        boolean 	    true or false
// [ 	        reference 	  one array dimension

import NotImplemented from "./errors/NotImplemented"
import { MethodData } from "./Type"

export function betterDescriptor(desc: string): string {
	const firstChar = desc[0]
	if (firstChar == "I") {
		return "int"
	} else if (firstChar == "V") {
		return "void"
	} else if (firstChar == "[") {
		return betterDescriptor(desc.substring(1)) + "[]"
	} else if (firstChar == "L") {
		let endClassName = desc.indexOf(";")
		return desc.substring(1, endClassName)
	} else {
		throw new NotImplemented(firstChar + " not implemented")
	}
}

export function descriptorInfo(desc: string): MethodData {
	let args = []
	let arrayLevel = 0
	let setArrayLevel = false
	for (let i = 0; i < desc.length; i++) {
		const charAt = desc[i]
		if (charAt == "(" || charAt == ")") continue
		let arg = ""
		if (charAt == "I") {
			arg += "int"
		} else if (charAt == "V") {
			arg += "void"
		} else if (charAt == "[") {
			arrayLevel++
			setArrayLevel = true
		} else if (charAt == "L") {
			let findIn = desc.substring(i)
			let endClassName = findIn.indexOf(";")
			arg += findIn.substring(1, endClassName)
			i += endClassName
		} else if (charAt == "F") {
			arg += "float"
		} else if (charAt == "J") {
			arg += "long"
		} else if (charAt == "D") {
			arg += "double"
		} else {
			throw new NotImplemented("Descriptor for " + charAt + " not implemetend")
		}
		if (setArrayLevel) {
			setArrayLevel = false
		} else {
			for (let jj = 0; jj < arrayLevel; jj++) {
				arg += "[]"
			}
			arrayLevel = 0
		}
		if (arg != "") {
			args.push(arg)
		}
	}
	const returnType = args[args.length - 1]
	let result = returnType + " ("
	for (let i = 0; i < args.length - 1; i++) {
		const element = args[i]
		result += element + " arg" + (i + 1) + ", "
	}
	if (args.length > 1) {
		result = result.substring(0, result.length - 2)
	}
	const toString = result + ")"
	return {
		argCount: args.length - 1,
		argType: desc,
		asString: toString,
	}
}

/**
 * Example
 * input:
 * (IDLjava/lang/Thread;)Ljava/lang/Object;
 *
 * output:
 * Object m(int i, double d, Thread t) {...}
 *
 *
 * @param desc
 */
export function betterMethodDescriptor(desc: string): string {
	return descriptorInfo(desc).asString
}
