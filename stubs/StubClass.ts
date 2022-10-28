

export abstract class StubClass {
	public readonly javaClassName: string
	constructor(javaClassName: string) {
		this.javaClassName = javaClassName
	}
}
// export function jvmFunction(jvmFuncSignature: string){
// 	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//     descriptor.jvmFuncSignature = jvmFuncSignature;
//   };
// }

// export function deprecated(deprecationReason: string) {
//   return (target: any, memberName: string, propertyDescriptor: PropertyDescriptor) => {
//     return {
//       get() {
//         const wrapperFn = (...args: any[]) => {
//           console.log(`Method ${memberName} is deprecated with reason: ${deprecationReason}`);
//           propertyDescriptor.value.apply(this, args)
//         }

//         Object.defineProperty(this, memberName, {
//             value: wrapperFn,
//             configurable: true,
//             writable: true
//         });
//         return wrapperFn;
//       }
//     }
//   }
// }
