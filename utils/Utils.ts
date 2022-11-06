export function scientificNotation(num: number): [number, number] {
	return num
		.toExponential()
		.split("e")
		.map((item) => Number(item)) as [number, number]
}

export function unsignedByte(byte: number): number{
	return byte << 24 >> 24;
}

export function unsignedShort(short: number): number{
	return short << 16 >> 16;
}
