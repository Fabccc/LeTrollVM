
function decycle(obj, stack = []) {
    if (!obj || typeof obj !== 'object')
        return obj;
    
    if (stack.includes(obj))
        return null;

    let s = stack.concat([obj]);

    return Array.isArray(obj)
        ? obj.map(x => decycle(x, s))
        : Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, decycle(v, s)]));
}

export function stringify(obj:any, line: number = 2) {
	return JSON.stringify(
		decycle(obj),
		(key, value) => (typeof value === "bigint" ? value.toString() : value), // return everything else unchanged
		line,
	)
}
