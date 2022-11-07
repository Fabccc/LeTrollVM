import * as AdmZip from "adm-zip"
import NotImplemented from "./errors/NotImplemented"

export class Jar {
	private fileName: string
	private read: boolean = false

	constructor(fileName: string) {
		this.fileName = fileName
	}

	public readJar() {
		if (this.read)
			throw new Error(
				"IllegalState: trying to read a jar that has been already read",
			)
		const zip = new AdmZip(this.fileName)
		if (zip.getEntry("/META-INF") == null)
			throw new Error("IllegalState: jar doesn't contains META-INF folder")

		const metaInfFolder = zip.getEntry("/META-INF") // META-INF folder

		throw new NotImplemented("readJar not implemented yet")
	}

	public executeMain(...args: string[]) {
		if (!this.read)
			throw new Error(
				"IllegalState: trying to read a jar that hasn't been read yet",
			)
		throw new NotImplemented("execute a jar is not available yet")
	}
}
