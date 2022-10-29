import { CodeAttribute } from "./Type"

export default class Program {
	private instruction: Uint8Array
	public programCounter: number = 0
	public readonly endOfProgram: number
	public localVariableCount: number
	public debug: boolean = true

	// Virtual Invokes
	public virtualInvokes: any = {}

	// Stacks
	public stack: any[] = []
	public maxStackSize: number

	// Variables
	public variables: any[] = []

	/**
	 *
	 */
	constructor(code: CodeAttribute) {
		this.maxStackSize = code.maxStacks
		this.localVariableCount = code.maxLocalVariables
		this.variables = Array(this.localVariableCount)
		this.instruction = code.code
		this.endOfProgram = code.code.length
	}

	public readInstruction(): number {
		if (!this.hasInstruction()) {
			throw new Error("Program counter overflow")
		}
		return this.instruction[this.programCounter++]
	}

	public padZero() {
		const zero = this.readInstruction()
		if (zero != 0) {
			throw new Error("Padding with zero failed")
		}
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
		if(this.debug){
			console.error(`(=>) Pushing ${variable}`)
		}
		this.stack.push(variable)
	}

	public cursor(cursor: number){
		if(cursor >= this.instruction.length){
			throw new Error("Program counter overflow")
		}
		this.programCounter = cursor
	}

	public pop(): any {
		if (this.stack.length == 0) {
			throw new Error("Stack empty")
		}
		if(this.debug){
			console.error(`(<=) Poping ${this.stack[this.stack.length-1]}`)
		}
		return this.stack.pop()
	}

	public log(val: string) {
		if (this.debug) console.log(val)
	}
}