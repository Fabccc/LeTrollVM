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
