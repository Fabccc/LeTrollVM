const ACCESSORS = [
	[0x0001, "PUBLIC"],
	[0x0010, "FINAL"],
	[0x0020, "SUPER"],
	[0x0200, "INTERFACE"],
	[0x0400, "ABSTRACT"],
	[0x1000, "SYNTHETIC"],
	[0x2000, "ANNOTATION"],
	[0x4000, "ENUM"],
	[0x8000, "MODULE"],
]

function listAccesors(tag: number): string[] {
	const accessors = []
	for (const [mask, name] of ACCESSORS) {
		if ((tag & (mask as number)) != 0) {
			accessors.push(name)
		}
	}
	return accessors
}

export { listAccesors }
export default ACCESSORS
