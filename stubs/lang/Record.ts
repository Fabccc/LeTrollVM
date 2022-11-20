import Class from "@base/Class"
import NotImplemented from "@base/errors/NotImplemented"
import { Arguments, ObjectRef } from "@base/Type"
import { ensureArgumentI } from "@base/Utils"
import { StubClass } from "@stub/StubClass"

export default class Record extends StubClass {
	constructor() {
		super("java/lang/Record", "java/lang/Object")
	}

  public __init__(...args: Arguments[]){
    const [classArg, objectRefArg] = args
    const klass: Class = classArg.value
    const objectref: ObjectRef = objectRefArg.value
    // does nothing (bytecode from java says:)
    // protected java.lang.Record();
    // descriptor: ()V
    // flags: (0x0004) ACC_PROTECTED
    // Code:
    //   stack=1, locals=1, args_size=1
    //      0: aload_0
    //      1: invokespecial #1                  // Method java/lang/Object."<init>":()V
    //      4: return
    //   LineNumberTable:
    //     line 89: 0
    //   LocalVariableTable:
    //     Start  Length  Slot  Name   Signature
    //         0       5     0  this   Ljava/lang/Record;
  }
	
}
