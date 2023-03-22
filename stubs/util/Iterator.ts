import NotImplemented from "@base/errors/NotImplemented"
import {
    Arguments,
    ArrayRef,
    isObjectRef,
    ObjectRef,
    StubObjectRef,
} from "@base/Type"
import { ensureArgument, ensureArgumentI } from "@base/Utils"
import { StubClass } from "@stub/StubClass"

export default class Iterator extends StubClass {
    constructor() {
        super("java/util/Iterator", "java/lang/Object")
    }

    public __init__(...args: Arguments[]) {
        throw new NotImplemented("__init__ not implemented");
    }

    public __new__(...args: Arguments[]) {
        throw new NotImplemented("__new__ not implemented");
    }

    public __toString__(...args: Arguments[]) {
        throw new NotImplemented("__toString__ not implemented");
    }

    public hasNext(...args: Arguments[]): boolean {
        ensureArgumentI(args, 1, "objectref")
        const [md, arrayRefArg] = args
        const arrayRef = arrayRefArg.value as ArrayRef
        return (arrayRef.fields["cursor"] as number) < (arrayRef.fields["array"] as any[]).length
    }

    public next(...args: Arguments[]): ObjectRef {
        ensureArgumentI(args, 1, "objectref")
        const [md, arrayRefArg] = args
        const arrayRef = arrayRefArg.value as ArrayRef
        let cursor = arrayRef.fields["cursor"] as number
        const array = arrayRef.fields["array"] as any[]
        const objectRef = array[cursor]
        arrayRef.fields["cursor"]++
        return objectRef
    }

    public remove(...args: Arguments[]) {
        throw new NotImplemented("remove not implemented");
    }

}