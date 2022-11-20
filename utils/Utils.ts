import IllegalType from "./errors/IllegalType"
import { Arguments } from "./Type"

export function scientificNotation(num: number): [number, number] {
	return num
		.toExponential()
		.split("e")
		.map((item) => Number(item)) as [number, number]
}

export function unsignedByte(byte: number): number {
	return (byte << 24) >> 24
}

export function ensureArgument(arg: Arguments, type: string) {
	if (arg.type != type)
		throw new IllegalType(
			`Invalid type of argument (expected ${type} but got ${arg.type})`,
		)
}

export function parseLongHexa(
	s: string,
	beginIndex: number,
	endIndex: number,
): bigint {
	const newStr = s.substring(beginIndex, endIndex)
	return BigInt("0x" + newStr)
}

// export function parseIntExtended(s: string, beginIndex: number, endIndex: number, radix: number){
// 	//CharSequence s, int beginIndex, int endIndex, int radix
// 	parse

// }

export function ensureArgumentI(
	args: Arguments[],
	index: number,
	type: string,
) {
	if (args[index].type != type)
		throw new IllegalType(
			`Invalid type of argument at ${index} (expected ${type} but got ${args[index].type})`,
		)
}

export function unsignedShort(short: number): number {
	return (short << 16) >> 16
}
