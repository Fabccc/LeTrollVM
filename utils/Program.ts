import { CodeAttribute } from "./Type"

export default class Program {

	private static debug: boolean = false

	private instruction: Uint8Array
	public programCounter: number = 0
	public readonly endOfProgram: number
	public localVariableCount: number

	// Instructions offsets
	public instructionOffset: number
	public instructionsOffsets: number[]

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

	public readValue(): number {
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

	public get instructionSize(): number {
		return this.instruction.length
	}

	public get stackSize(): number {
		return this.stack.length
	}

	public push(variable: any) {
		if (this.stack.length >= this.maxStackSize) {
			throw new Error("Stack overflow")
		}
		if (Program.debug) {
			// console.error(`(=>) Pushing ${variable}`)
		}
		this.stack.push(variable)
	}
	public offset(cursor: number) {
		const finalValue = cursor + (this.programCounter % this.instruction.length)
		if (finalValue >= this.instruction.length) {
			throw new Error(
				`Program counter overflow (cursor=${finalValue}, instruction_length=${this.instruction.length})`,
			)
		}
		this.programCounter = finalValue
	}

	public cursor(cursor: number) {
		const finalValue = cursor % this.instruction.length
		if (finalValue >= this.instruction.length) {
			throw new Error(
				`Program counter overflow (cursor=${finalValue}, instruction_length=${this.instruction.length})`,
			)
		}
		this.programCounter = finalValue
	}

	public pop(): any {
		if (this.stack.length == 0) {
			throw new Error("Stack empty")
		}
		if (Program.debug) {
			// console.error(`(<=) Poping ${this.stack[this.stack.length - 1]}`)
		}
		return this.stack.pop()
	}

	public log(val: string) {
		if (Program.debug) console.log(val)
	}
}
