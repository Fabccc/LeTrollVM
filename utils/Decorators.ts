import "reflect-metadata"

export const PUBLIC = 0x0001
export const PRIVATE = 0x0002
export const PROTECTED = 0x0004
export const STATIC = 0x0008
export const FINAL = 0x0010
export const SUPER = 0x0020
export const INTERFACE = 0x0200
export const ABSTRACT = 0x0400
export const SYNTHETIC = 0x1000
export const ANNOTATION = 0x2000
export const ENUM = 0x4000
export const MODULE = 0x8000

export function isStatic(flags: number) {
    return (flags & STATIC) != 0
}

export function isPublic(flags: number) {
    return (flags & PUBLIC) != 0
}


export function Flags(flags: number = PUBLIC | STATIC) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(
            // this here is to reference the data later when we retrieve it.
            propertyKey,
            {
                // we put this spread operator in case you have decorated already, so
                // we dont want to lose the old data
                ...Reflect.getMetadata(propertyKey, target),
                // then we append whatever else we need
                Flags: flags,
            },
            target,
        );
        return descriptor;
    };

}