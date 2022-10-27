import ConsolePrintStream from "../stubs/ConsolePrintStream"
import StubClass from "../stubs/StubClass"
import System from "../stubs/System"

const stubClasses = [new System(), new ConsolePrintStream()]

export function getFieldHandle(javaClassName: string, javaClassField: string) {
	for (const klass of stubClasses) {
		if (klass.javaClassName == javaClassName) {
			if (klass[javaClassField] !== undefined) {
				return klass[javaClassField]
			}
		}
	}
	return undefined
}

export function getStubClass(javaClassName: string): StubClass {
	for (const klass of stubClasses) {
		if (klass.javaClassName == javaClassName) {
			return klass
		}
	}
	return undefined
}
