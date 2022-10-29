import ConsolePrintStream from "../stubs/ConsolePrintStream"
import { StringConcatFactory } from "../stubs/StringConcatFactory"
import { StubClass } from "../stubs/StubClass"
import System from "../stubs/System"
import NotImplemented from "./errors/NotImplemented"

const init = [new System(), new ConsolePrintStream(), new StringConcatFactory()]

const stubClasses = {}
for (const klass of init) {
	stubClasses[klass.javaClassName] = klass
}

export function getMethodHandle(klassName: string, javaClassField: string): Function {
	const javaClassName = klassName.replaceAll("/", ".")
	const klass = getStubClass(klassName)
	if (klass[javaClassField] !== undefined) {
		return klass[javaClassField]
	}
	throw new NotImplemented(`Field of klass ${javaClassName} is not implemented`)
}

export function getFieldHandle(klassName: string, javaClassField: string) {
	const javaClassName = klassName.replaceAll("/", ".")
	const klass = getStubClass(klassName)
	if (klass[javaClassField] !== undefined) {
		return klass[javaClassField]
	}
	throw new NotImplemented(`Field of klass ${javaClassName} is not implemented`)
}

export function getStubClass(klassName: string): StubClass {
	const javaClassName = klassName.replaceAll("/", ".")
	const klass = stubClasses[javaClassName]
	if (klass !== undefined) {
		return klass
	} else {
		throw new NotImplemented(`Stub for ${klassName} not implemented`)
	}
}
