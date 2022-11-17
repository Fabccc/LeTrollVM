class IllegalType extends Error {
	constructor(message: string) {
		super(message)
		this.name = "IllegalType"
	}
}

export default IllegalType
