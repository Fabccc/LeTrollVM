import { JavaClasses } from "@base/Stubs"
import { Enum } from "@stub/Enum"
import { Stringz } from "@stub/String"
import ConsolePrintStream from "../stubs/ConsolePrintStream"
import { StringConcatFactory } from "../stubs/StringConcatFactory"
import System from "../stubs/System"
import Integer from "./lang/Integer"
import Record from "./lang/Record"
import ArrayList from "./util/ArrayList"
import Iterator from "./util/Iterator"
import UUID from "./util/UUID"

export const STUB_PACKAGE: JavaClasses[] = [
	{
		name: "base",
		stubClasses: [new System(), new ConsolePrintStream()],
	},
	{
		name: "lang",
		stubClasses: [
			new StringConcatFactory(),
			new Stringz(),
			new Enum(),
			new Integer(),
			new Record(),
		],
	},
	{
		name: "jdk",
		stubClasses: [new ArrayList(), new UUID(), new Iterator()],
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
