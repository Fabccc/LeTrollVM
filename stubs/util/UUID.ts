import NotImplemented from "@base/errors/NotImplemented"
import {
	Arguments,
	ArrayRef,
	isObjectRef,
	ObjectRef,
	StubObjectRef,
} from "@base/Type"
import { ensureArgument, ensureArgumentI, parseLongHexa } from "@base/Utils"
import { StubClass } from "@stub/StubClass"

export default class UUID extends StubClass {
	private static NIBBLES: number[]

	private static initStatic() {
		let ns: number[] = new Array(256)
		ns.fill(-1)
		ns["0"] = 0
		ns["1"] = 1
		ns["2"] = 2
		ns["3"] = 3
		ns["4"] = 4
		ns["5"] = 5
		ns["6"] = 6
		ns["7"] = 7
		ns["8"] = 8
		ns["9"] = 9
		ns["A"] = 10
		ns["B"] = 11
		ns["C"] = 12
		ns["D"] = 13
		ns["E"] = 14
		ns["F"] = 15
		ns["a"] = 10
		ns["b"] = 11
		ns["c"] = 12
		ns["d"] = 13
		ns["e"] = 14
		ns["f"] = 15
		UUID.NIBBLES = ns
	}

	private static parse4Nibbles(name: string, pos: number): number {
		const ns = UUID.NIBBLES
		const ch1 = name.charCodeAt(pos)
		const ch2 = name.charCodeAt(pos + 1)
		const ch3 = name.charCodeAt(pos + 2)
		const ch4 = name.charCodeAt(pos + 3)
		return (ch1 | ch2 | ch3 | ch4) > 0xff
			? -1
			: (ns[ch1] << 12) | (ns[ch2] << 8) | (ns[ch3] << 4) | ns[ch4]
	}

	private static toObjectRef(msb: bigint, lsb: bigint): ObjectRef {
		return {
			className: "java/util/UUID",
			fields: {
				msb,
				lsb,
			},
			type: "ObjectRef",
		}
	}

	private static fromString1(name: string): ObjectRef {
		const len = name.length
		if (len > 36) {
			throw new Error("UUID string too large")
		}

		const dash1 = name.indexOf("-", 0)
		const dash2 = name.indexOf("-", dash1 + 1)
		const dash3 = name.indexOf("-", dash2 + 1)
		const dash4 = name.indexOf("-", dash3 + 1)
		const dash5 = name.indexOf("-", dash4 + 1)

		// For any valid input, dash1 through dash4 will be positive and dash5
		// negative, but it's enough to check dash4 and dash5:
		// - if dash1 is -1, dash4 will be -1
		// - if dash1 is positive but dash2 is -1, dash4 will be -1
		// - if dash1 and dash2 is positive, dash3 will be -1, dash4 will be
		//   positive, but so will dash5
		if (dash4 < 0 || dash5 >= 0) {
			throw new Error("Invalid UUID string: " + name)
		}

		let mostSigBits = parseLongHexa(name, 0, dash1) & 0xffffffffn
		mostSigBits <<= 16n
		mostSigBits |= parseLongHexa(name, dash1 + 1, dash2) & 0xffffn
		mostSigBits <<= 16n
		mostSigBits |= parseLongHexa(name, dash2 + 1, dash3) & 0xffffn
		let leastSigBits = parseLongHexa(name, dash3 + 1, dash4) & 0xffffn
		leastSigBits <<= 48n
		leastSigBits |= parseLongHexa(name, dash4 + 1, len) & 0xffffffffffffn

		return this.toObjectRef(leastSigBits, mostSigBits)
	}

	constructor() {
		super("java/util/UUID", "java/lang/Object")
		if (UUID.NIBBLES === undefined) {
			UUID.initStatic()
		}
	}

	public __init_value__() {
		return null
	}

	public __new__(...args) {
		throw new NotImplemented("UUID#__new__ not implemented")
	}

	public __init__(...args) {
		throw new NotImplemented("UUID#__init__ not implemented")
	}

	public __toString__(...args) {
		throw new NotImplemented("UUID#__toString__ not implemented")
	}

	public fromString(...args: Arguments[]): ObjectRef {
		const [methodDescArg, stringRefArg] = args
		const descriptor = methodDescArg.value
		const name = stringRefArg.value as string
		if (name.length == 36) {
			const ch1 = name.charAt(8)
			const ch2 = name.charAt(13)
			const ch3 = name.charAt(18)
			const ch4 = name.charAt(23)
			if (ch1 == "-" && ch2 == "-" && ch3 == "-" && ch4 == "-") {
				const msb1 = BigInt(UUID.parse4Nibbles(name, 0))
				const msb2 = BigInt(UUID.parse4Nibbles(name, 4))
				const msb3 = BigInt(UUID.parse4Nibbles(name, 9))
				const msb4 = BigInt(UUID.parse4Nibbles(name, 14))
				const lsb1 = BigInt(UUID.parse4Nibbles(name, 19))
				const lsb2 = BigInt(UUID.parse4Nibbles(name, 24))
				const lsb3 = BigInt(UUID.parse4Nibbles(name, 28))
				const lsb4 = BigInt(UUID.parse4Nibbles(name, 32))
				if ((msb1 | msb2 | msb3 | msb4 | lsb1 | lsb2 | lsb3 | lsb4) >= 0) {
					const msb = (msb1 << 48n) | (msb2 << 32n) | (msb3 << 16n) | msb4
					const lsb = (lsb1 << 48n) | (lsb2 << 32n) | (lsb3 << 16n) | lsb4
					return UUID.toObjectRef(msb, lsb)
				}
			}
		}
		return UUID.fromString1(name)
	}

	public randomUUID(...args: Arguments[]): ObjectRef {
		const uuid = crypto.randomUUID()
		console.log(uuid)
		console.log(args)
		const uuidref = this.fromString(
			{
				type: "descriptor",
				value: "(Ljava/lang/String;)Ljava/util/UUID;",
			},
			{
				type: "string",
				value: uuid,
			},
		)
		return uuidref
	}
	// export function toUuidString(lsb: bigint, msb: bigint): string {
	// 	return `${digits(msb >> 32n, 8n)}-${digits(msb >> 16n, 4n)}-${digits(
	// 		msb,
	// 		4n
	// 	)}-${digits(lsb >> 48n, 4n)}-${digits(lsb, 12n)}`;
	// }

	// function digits(val: bigint, ds: bigint): string {
	// 	const hi = 1n << (ds * 4n);
	// 	return (hi | (val & (hi - 1n))).toString(16).substring(1);
	// }
}
