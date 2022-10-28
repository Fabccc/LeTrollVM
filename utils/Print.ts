export function stringify(obj:any, line: number = 2) {
	return JSON.stringify(
		obj,
		(key, value) => (typeof value === "bigint" ? value.toString() : value), // return everything else unchanged
		line,
	)
}
