import ConsolePrintStream from "../stubs/ConsolePrintStream"
import StubClass from "../stubs/StubClass"
import System from "../stubs/System"
import NotImplemented from "./errors/NotImplemented"

const stubClasses = [new System(), new ConsolePrintStream()]

export function getFieldHandle(klassName: string, javaClassField: string) {
	const javaClassName = klassName.replaceAll("/", ".")
	for (const klass of stubClasses) {
		if (klass.javaClassName == javaClassName) {
			if (klass[javaClassField] !== undefined) {
				return klass[javaClassField]
			}
		}
	}
	throw new NotImplemented(
		"Stub for " + javaClassName + "#" + javaClassField + " not found"
	)
}

export function getStubClass(javaClassName: string): StubClass {
	for (const klass of stubClasses) {
		if (klass.javaClassName == javaClassName) {
			return klass
		}
	}
	return undefined
}
