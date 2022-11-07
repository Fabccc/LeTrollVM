import { Stringz } from "@stub/String"
import ConsolePrintStream from "../stubs/ConsolePrintStream"
import { StringConcatFactory } from "../stubs/StringConcatFactory"
import { StubClass } from "../stubs/StubClass"
import System from "../stubs/System"
import TestConsole from "../stubs/tests/TestConsole"
import TestSystem from "../stubs/tests/TestSystem"
import NotImplemented from "./errors/NotImplemented"

export class StubClasses {
	private stubClasses: { [key: string]: StubClass } = {}

	constructor(...stubClasses: StubClass[]) {
		for (const klass of stubClasses) {
			this.stubClasses[klass.javaClassName] = klass
		}
	}

	getStubClass(klassName: string): StubClass {
		const javaClassName = klassName.replaceAll("/", ".")
		const klass = this.stubClasses[javaClassName]
		if (klass !== undefined) {
			return klass
		} else {
			throw new NotImplemented(`Stub for ${klassName} not implemented`)
		}
	}

	getMethodHandle(klassName: string, javaMethod: string): Function {
		const javaClassName = klassName.replaceAll("/", ".")
		const klass = this.getStubClass(klassName)
		if (klass[javaMethod] !== undefined) {
			return klass[javaMethod]
		}
		throw new NotImplemented(
			`Method ${javaMethod} of klass ${javaClassName} is not implemented`,
		)
	}

	getFieldHandle(klassName: string, javaClassField: string) {
		const javaClassName = klassName.replaceAll("/", ".")
		const klass = this.getStubClass(klassName)
		if (klass[javaClassField] !== undefined) {
			return klass[javaClassField]
		}
		throw new NotImplemented(
			`Field of klass ${javaClassName} is not implemented`,
		)
	}
}

export function createNewTestClasses() {
	return new StubClasses(
		new TestSystem(),
		new TestConsole(),
		new StringConcatFactory(),
		new Stringz(),
	)
}

export const defaultStubClasses = new StubClasses(
	new System(),
	new ConsolePrintStream(),
	new StringConcatFactory(),
	new Stringz(),
)
