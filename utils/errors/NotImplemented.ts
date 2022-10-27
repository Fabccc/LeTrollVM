class NotImplemented extends Error {
	constructor(message: string) {
		super(message)
		this.name = "NotImplemented"
	}
}

export default NotImplemented
