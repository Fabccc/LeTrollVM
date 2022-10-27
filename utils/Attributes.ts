import BufferedReader from "./BufferedReader"
import { readNameIndex } from "./ConstantPool"
import NotImplemented from "./errors/NotImplemented"

export function readAttributeInfo(
	reader: BufferedReader,
	attributeCount: number,
	constantPool: any[],
) {
	const attributes = []
	// attribute_info attributes[attributes_count];
	// attribute_info {
	//   u2 attribute_name_index;
	//   u4 attribute_length;
	//   u1 info[attribute_length];
	// }
	for (let i = 0; i < attributeCount; i++) {
		const name = readNameIndex(constantPool, reader.readU2() - 1)
		const length = reader.readU4()
    if(name == "Code"){

    }else{
      throw new NotImplemented("Attribute reading undefined for " + name)
    }
		// for (let j = 0; j < length; j++) {
		//   throw
		// }
	}
}
