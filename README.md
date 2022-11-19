# LeTrollVM

Java Virtual Machine written in Typescript and executed with BunJS.

## What can I do with it ? I mean you can look at it
### Roadmap

- [x] Printing
- [x] Arithmetic
- [x] Polymorphism
- [ ] JDK base classes
  - [ ] Number
    - [x] Integer
    - [ ] Float
    - [ ] Long
    - [ ] Double
  - [ ] Collections
    - [ ] ArrayList
    - [ ] HashMap
    - [ ] HashSet
    - [ ] LinkedList
  - [ ] String manipulation
    - [ ] StringBuilder
    - [ ] StringBuffer
- [ ] Multithreading
  - [ ] Thread
  - [ ] Atomics
    - [ ] AtomicInteger

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

Tests:

```bash
bun wiptest
```

```bash
bun run index.ts <ClassName>
```

This project was created using `bun init` in bun v0.1.13. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.