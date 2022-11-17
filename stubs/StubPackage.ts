import { JavaClasses } from "@base/Stubs"
import { Enum } from "@stub/Enum"
import { Stringz } from "@stub/String"
import ConsolePrintStream from "../stubs/ConsolePrintStream"
import { StringConcatFactory } from "../stubs/StringConcatFactory"
import System from "../stubs/System"
import ArrayList from "./util/ArrayList"

export const STUB_PACKAGE: JavaClasses[] = [
	{
		name: "base",
		stubClasses: [
			new System(),
			new ConsolePrintStream(),
			new StringConcatFactory(),
			new Stringz(),
			new Enum(),
		],
	},
	{
		name: "jdk",
		stubClasses: [new ArrayList()],
	},
]

export function replacePackage(
	classes: JavaClasses[],
	packageName: string,
	javaClass: JavaClasses,
): JavaClasses[] {
	const newJavaClasses: JavaClasses[] = Array(classes.length)
	for (let i = 0; i < classes.length; i++)
		newJavaClasses[i] = classes[i].name == packageName ? javaClass : classes[i]
	return newJavaClasses
}
