import { closeSync, readSync } from "fs"

class BufferedReader {
	private fileSocket: number = 0
	private cursor: number = 0
	private isClosed: boolean = false

	constructor(fileSocket: number) {
		this.fileSocket = fileSocket
	}

	private readu(count: number): Buffer {
		if(this.isClosed){
			throw new Error("Buffer is closed")
		}
		const buffer = Buffer.alloc(count)
		readSync(this.fileSocket, buffer, 0, count, this.cursor)
		this.cursor += count
		return buffer
	}

	public readU1Array(count: number){
		const buffer = this.readu(count)
		let array = []
		for (let i = 0; i < buffer.length; i++) {
			array[i] = buffer[i]
		}
		return array
	}

  public readUTF(count: number){
    return this.readu(count).toString("utf-8")
  }

	public readU1(): number {
		return this.readu(1).readUint8()
	}
	public readU2(): number {
		return this.readu(2).readUint16BE()
	}

	public readU4(): number {
		return this.readu(4).readUInt32BE()
	}

	public close(){
		closeSync(this.fileSocket)
		this.isClosed = true
	}
}

export default BufferedReader
