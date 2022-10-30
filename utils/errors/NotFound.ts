class NotFound extends Error {
	constructor(message: string) {
		super(message)
		this.name = "NotFound"
	}
}

export default NotFound
