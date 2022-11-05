export function scientificNotation(num: number): [number, number] {
	return num
		.toExponential()
		.split("e")
		.map((item) => Number(item)) as [number, number]
}
