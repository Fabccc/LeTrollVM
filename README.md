# LeTrollVM

Java Virtual Machine written in Typescript and executed with BunJS.

## What can I do with it ? I mean you can look at it

- Print string with System.out.println
- Print byte with System.out.println
- Print integer with System.out.println
- Print double with System.out.println
- Print float with System.out.println
- Print long with System.out.println

## Roadmap
- [ ] Printing
  - [x] Constants
    - [x] byte, short, char
    - [x] boolean
    - [x] 4 bytes-value (integer, float) 
    - [x] 8 bytes-value (double, long)
    - [x] String
  - [ ] Dynamic
    - [ ] byte, short, char
    - [ ] boolean
    - [ ] 4 bytes-value (integer, float) 
    - [ ] 8 bytes-value (double, long)
    - [ ] String 
- [ ] Methods call
  - [ ] return void method call
  - [ ] return something method calls
    - [ ] return byte, short and char
    - [ ] return 4 constant bytes-value (integer, float) 
    - [ ] return 8 constant bytes-value (double, long)
    - [ ] return String
  - [ ] Passing arguments
  - [ ] Recursive method call

# JSE 19 docs

https://docs.oracle.com/javase/specs/jvms/se19/html/jvms-4.html

# Java Tools

```shell
javap -c -verbose Main
```

# Installation

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v0.1.13. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
