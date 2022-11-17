import { CodeAttribute } from "./Type"

export default class Program {
	public static debug: boolean = true

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

	public readInstructionAt(index: number): number{
		return this.instruction[index]
	}

	public readValue(): number {
		if (!this.hasInstruction()) {
			throw new Error("Program counter overflow")
		}
		return this.instruction[this.programCounter++]
	}

	public read32BitsAt(index: number): number{
		// defaultbyte1
		const defaultbyte1 = this.readInstructionAt(index)
		// defaultbyte2
		const defaultbyte2 = this.readInstructionAt(index+1)
		// defaultbyte3
		const defaultbyte3 = this.readInstructionAt(index+2)
		// defaultbyte4
		const defaultbyte4 = this.readInstructionAt(index+3)
		return (
			(defaultbyte1 << 24) |
			(defaultbyte2 << 16) |
			(defaultbyte3 << 8) |
			defaultbyte4
		)
	}

	public read32Bits(): number {
		// defaultbyte1
		const defaultbyte1 = this.readValue()
		// defaultbyte2
		const defaultbyte2 = this.readValue()
		// defaultbyte3
		const defaultbyte3 = this.readValue()
		// defaultbyte4
		const defaultbyte4 = this.readValue()
		return (
			(defaultbyte1 << 24) |
			(defaultbyte2 << 16) |
			(defaultbyte3 << 8) |
			defaultbyte4
		)
	}

	public padZero() {
		const zero = this.readInstruction()
		if (zero != 0) {
			throw new Error("Padding with zero failed")
		}
	}

	public skipUntilMultiple4(){
		while(this.programCounter%4!=0){
			this.padZero()
		}
		return this.instruction[this.programCounter++]
	}

	public padZeroMax(max: number): number {
		let n = 0
		let val = this.readValue()
		while (n < max) {
			if (val != 0x00) return val
			val = this.readValue()
			n++
		}
		return val
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
			console.log(this.stack)
			throw new Error(`Stack overflow (maxStackSize=${this.maxStackSize})`)
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
