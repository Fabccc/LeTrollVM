import { readSync } from "fs"

class BufferedReader {
	private fileSocket: number = 0
	private cursor: number = 0

	constructor(fileSocket: number) {
		this.fileSocket = fileSocket
	}

  private readu(count: number): Buffer{
    const buffer = Buffer.alloc(count)
    readSync(this.fileSocket, buffer, 0, count, this.cursor)
    return buffer;
  }

  public readU1(): number{
    let res = this.readu(1)
    return res.readUint8();
  }
  public readU2(): number{
    let res = this.readu(2)
    return res.readUint16BE();
  }

  public readU4(): number{
    let res = this.readu(4)
    return res.readUInt32BE();
  }

}

export default BufferedReader
