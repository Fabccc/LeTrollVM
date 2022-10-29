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

- [x] Printing lvl1!
  - [x] Constants
    - [x] byte, short, char
    - [x] boolean
    - [x] 4 bytes-value (integer, float)
    - [x] 8 bytes-value (double, long)
    - [x] String
  - [x] Dynamic
    - [x] byte, short, char
    - [x] boolean
    - [x] 4 bytes-value (integer, float)
    - [x] 8 bytes-value (double, long)
    - [x] String
- [ ] Arithmetic
  - [x] int
    - [x] addition
    - [x] substract
    - [x] multiplication
    - [x] division
    - [x] modulo
  - [x] float
    - [x] addition
    - [x] substract
    - [x] multiplication
    - [x] division
    - [x] modulo
  - [x] long
    - [x] addition
    - [x] substract
    - [x] multiplication
    - [x] division
    - [x] modulo
  - [x] double
    - [x] addition
    - [x] substract
    - [x] multiplication
    - [x] division
    - [x] modulo
  - [x] string
    - [x] concatenation
    - [ ] substring ??? (im crazy)
  - [x] string & others
    - [x] concat string and string
    - [x] concat string and boolean
    - [x] concat string and byte
    - [x] concat string and short
    - [x] concat string and int
    - [x] concat string and float
    - [x] concat string and double
    - [x] concat string and long
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
