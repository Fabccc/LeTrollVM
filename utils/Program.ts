import { CodeAttribute } from "./Type"

class Program {
	private instruction: Uint8Array
	public programCounter: number = 0
	public readonly endOfProgram: number
	public localVariableCount: number

	// Stacks
	public stack: any[] = []
	public maxStackSize: number

	/**
	 *
	 */
	constructor(code: CodeAttribute) {
		this.maxStackSize = code.maxStacks
		this.localVariableCount = code.maxLocalVariables
		this.instruction = code.code
		this.endOfProgram = code.code.length
	}

	public readInstruction(): number {
		if (!this.hasInstruction()) {
			throw new Error("Program counter overflow")
		}
		return this.instruction[this.programCounter++]
	}

	public hasInstruction(): boolean {
		return this.programCounter < this.endOfProgram
	}

	public get stackSize(): number {
		return this.stack.length
	}

	public push(variable: any) {
		if (this.stack.length >= this.maxStackSize) {
			throw new Error("Stack overflow")
		}
		this.stack.push(variable)
	}

	public pop(): any {
		if (this.stack.length == 0) {
			throw new Error("Stack empty")
		}
		return this.stack.pop()
	}
}
export default Program
