# LeTrollVM

Java Virtual Machine written in Typescript and executed with BunJS.

### Roadmap

- [x] Printing
- [x] Arithmetic
- [x] Polymorphism
- [ ] JDK base classes (auto-Boxing)
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

# Requirements

- JDK >= 19.0.2
  - `javac`
  - `javap`

# Installation

```bash
bun install
./build_class.sh
```

Tests:

```bash
bun test
```

```bash
bun run index.ts <ClassName>
```

# Resources

## Java doc

https://docs.oracle.com/en/java/javase/19/docs/api/index.html

## Java specs (for bytecode interpretation)

https://docs.oracle.com/javase/specs/jvms/se19/html/jvms-4.html
https://docs.oracle.com/javase/specs/jvms/se19/html/jvms-5.html
https://docs.oracle.com/javase/specs/jvms/se19/html/jvms-6.html