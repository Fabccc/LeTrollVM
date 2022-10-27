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
	let sParam = -1
	let eParam = -1
	let args = []
	let arrayLevel = 0
	let setArrayLevel = false
	for (let i = 0; i < desc.length; i++) {
		const charAt = desc[i]
		if (charAt == "(") {
			sParam = i
		} else if (charAt == ")") {
			eParam = i
		} else if (charAt == "I") {
			args.push("int")
		} else if (charAt == "V") {
			args.push("void")
		} else if (charAt == "[") {
			arrayLevel++
			setArrayLevel = true
		} else if (charAt == "L") {
			// Java className
			let findIn = desc.substring(i)
			let endClassName = findIn.indexOf(";")
			args.push(findIn.substring(1, endClassName).replaceAll("/", "."))
			i += endClassName
		} else {
			throw new NotImplemented("Descriptor for " + charAt + " not implemetend")
		}
		if (setArrayLevel) {
			setArrayLevel = false
		} else {
			arrayLevel = 0
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
	return result + ")"
}
