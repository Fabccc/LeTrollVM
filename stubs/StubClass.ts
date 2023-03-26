import ClassManager from "@base/ClassLoader"

export abstract class StubClass {
	public readonly javaClassName: string
	public readonly superClassName: string
	public classLoader: ClassManager
	public nonStatic: string[] = []
	
	constructor(javaClassName: string, superClassName?: string) {
		this.javaClassName = javaClassName.replaceAll(".", "/")
		this.superClassName = superClassName || "java/lang/Object"
		this.superClassName = this.superClassName.replaceAll(".", "/")
	}
}
