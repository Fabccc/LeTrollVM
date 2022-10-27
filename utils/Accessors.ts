const CLASS = [
	[0x0001, "PUBLIC"],
	[0x0010, "FINAL"],
	[0x0020, "SUPER"], // backward compatibility
	[0x0200, "INTERFACE"],
	[0x0400, "ABSTRACT"],
	[0x1000, "SYNTHETIC"],
	[0x2000, "ANNOTATION"],
	[0x4000, "ENUM"],
	[0x8000, "MODULE"],
]

const FIELD = [
	[0x0001, "PUBLIC"],
	[0x0002, "PRIVATE"],
	[0x0004, "PROTECTED"],
	[0x0008, "STATIC"],
	[0x0010, "FINAL"],
	[0x0040, "VOLATILE"],
	[0x0080, "TRANSIENT"],
	[0x1000, "SYNTHETIC"],
	[0x4000, "ENUM"],
]

const METHOD = [
	[0x0001, "PUBLIC"],
	[0x0002, "PRIVATE"],
	[0x0004, "PROTECTED"],
	[0x0008, "STATIC"],
	[0x0010, "FINAL"],
	[0x0020, "SYNCHRONIZED"],
	[0x0040, "BRIDGE"],
	[0x0080, "VARARGS"],
	[0x0100, "NATIVE"],
	[0x0400, "ABSTRACT"],
	[0x0800, "STRICT"],
	[0x1000, "SYNTHETIC"],
]

const listAccesors = (acc: any[][]) =>
	function (tag: number): string[] {
		const accessors = []
		for (const [mask, name] of acc) {
			if ((tag & (mask as number)) != 0) {
				accessors.push(name as string)
			}
		}
		return accessors
	}

const listFieldAccessors = listAccesors(FIELD)
const listClassAccesors = listAccesors(CLASS)
const listMethodAccesors = listAccesors(METHOD)

export { listClassAccesors, listMethodAccesors, listFieldAccessors }
