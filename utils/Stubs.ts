import { Enum } from "@stub/Enum"
import { Stringz } from "@stub/String"
import { replacePackage, STUB_PACKAGE } from "@stub/StubPackage"
import { StringConcatFactory } from "../stubs/StringConcatFactory"
import { StubClass } from "../stubs/StubClass"
import TestConsole from "../stubs/tests/TestConsole"
import TestSystem from "../stubs/tests/TestSystem"
import Class from "./Class"
import ClassManager from "./ClassLoader"
import NotImplemented from "./errors/NotImplemented"

export interface JavaClasses {
	stubClasses: StubClass[]
	name: string
}

export class StubClasses {
	private static specialMapping = {
		toString: "__toString__",
		valueOf: "__valueOf__"
	}

	private stubClasses: { [key: string]: StubClass } = {}

	public static from(...javaClasses: JavaClasses[]): StubClasses {
		const stubClasses = javaClasses.flatMap((j) => j.stubClasses)
		return new StubClasses(...stubClasses)
	}

	constructor(...stubClasses: StubClass[]) {
		for (const klass of stubClasses) {
			this.stubClasses[klass.javaClassName] = klass
		}
	}

	get get(): StubClass[] {
		return Object.values(this.stubClasses)
	}

	private map(str: string): string {
		if (StubClasses.specialMapping[str]) {
			return StubClasses.specialMapping[str]
		}
		return str
	}

	public setClassLoader(classManager: ClassManager) {
		for (const key in this.stubClasses) {
			this.setClassLoaderNested(this.stubClasses[key], classManager)
		}
	}

	private setClassLoaderNested(object: StubClass, classManager: ClassManager) {
		for (const key in object) {
			if (object[key] instanceof StubClass) {
				this.setClassLoaderNested(object[key], classManager)
			}
		}
		object.classLoader = classManager
	}

	exist(klassName: string): boolean {
		const javaClassName = klassName.replaceAll(".", "/")
		if (this.stubClasses[javaClassName] !== undefined) return true
		for (const stubClass of Object.values(this.stubClasses)) {
			if (stubClass.superClassName == javaClassName) return true
		}
		return false
	}

	getStubClass(klassName: string): StubClass {
		const javaClassName = klassName.replaceAll(".", "/")
		const klass = this.stubClasses[javaClassName]
		if (klass !== undefined) {
			return klass
		}
		for (const stubClass of Object.values(this.stubClasses)) {
			if (stubClass.superClassName == javaClassName) return stubClass
		}
		throw new NotImplemented(`Stub for ${klassName} not implemented`)
	}

	getMethodHandle(klassName: string, javaMethod: string): Function {
		const javaClassName = klassName.replaceAll(".", "/")
		const klass = this.getStubClass(klassName)
		javaMethod = this.map(javaMethod)
		if (klass[javaMethod] !== undefined) {
			return klass[javaMethod]
		}
		throw new NotImplemented(
			`Method ${javaMethod} of stub class ${javaClassName} is not implemented`,
		)
	}

	existsMethodHandle(klassName: string, javaMethod: string): boolean {
		const javaClassName = klassName.replaceAll(".", "/")
		javaMethod = this.map(javaMethod)
		if (!this.exist(javaClassName)) return false
		const klass = this.getStubClass(javaClassName)
		return klass[javaMethod] !== undefined
	}

	getMethodHandleSuper(
		classManager: ClassManager,
		klass: Class,
		klassName: string,
		javaClassField: string,
	) {
		let lookupClass = klassName.replaceAll(".", "/")
		while (lookupClass !== undefined) {
			if (this.existsMethodHandle(lookupClass, javaClassField)) {
				return this.getMethodHandle(lookupClass, javaClassField)
			} else {
				lookupClass = klass.superClass
				if (lookupClass == undefined || lookupClass == "java/lang/Object") {
					break
				}
				const temp = classManager.get(lookupClass)
				if(temp instanceof Class){
					klass = temp
				}
			}
		}
		throw new Error(
			`Unable to found method|supermethod ${javaClassField} for class ${klassName}`,
		)
	}

	existsFieldHandle(klassName: string, javaClassField: string): boolean {
		const javaClassName = klassName.replaceAll(".", "/")
		const klass = this.getStubClass(klassName)
		return klass[javaClassField] !== undefined
	}

	getFieldHandle(klassName: string, javaClassField: string) {
		const javaClassName = klassName.replaceAll(".", "/")
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
	return StubClasses.from(
		...replacePackage(STUB_PACKAGE, "base", {
			name: "base",
			stubClasses: [
				new TestSystem(),
				new TestConsole(),
				new StringConcatFactory(),
				new Stringz(),
				new Enum(),
			],
		}),
	)
}

export const defaultStubClasses = StubClasses.from(...STUB_PACKAGE)
