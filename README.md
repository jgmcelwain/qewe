# qewe

[![npm version](https://badge.fury.io/js/qewe.svg)](https://npmjs.com/package/qewe) [![tests status](https://github.com/jgmcelwain/qewe/actions/workflows/tests.yml/badge.svg)](https://github.com/jgmcelwain/qewe/actions/workflows/tests.yml) [![bundle size](https://img.shields.io/bundlephobia/min/qewe)](https://bundlephobia.com/package/qewe)

qewe is a type-safe, zero-dependency max/min priority queue manager for JavaScript and TypeScript projects.

## Installation

Add qewe to your project using your favorite package manager:

```bash
$ yarn add qewe
```

You can also import qewe with a script tag via [unpkg](https://unpkg.com):

```html
<script src="//unpkg.com/qewe" type="text/javascript"></script>
```

## Basic Usage

```ts
import { Qewe } from 'qewe';

const queue = new Qewe();
queue.enqueue('hello', 1);
queue.enqueue('world', 2);

console.log(queue.values); // [ 'world', 'hello' ]
console.log(queue.size); // 2

const value = queue.pop();
console.log(value); // 'world'
console.log(queue.size); // 1
```

## API

### Types

```ts
interface QeweOptions<T> {
  inferValuePriority?: (value: T) => number;
  isMinQueue?: boolean;
}

interface QeweEntry<T> {
  value: T;
  priority: number;
}
```

### Options

You can customize a qewe instance by passing an `options` object to the constructor.

```ts
const queue: new Qewe<{ x: number; y: number; mass: number }>({
  inferValuePriority: (value) => value.mass,
  isMinQueue: true,
});
```

#### `inferValuePriority: (value: T) => number;`

Define a function that will be used to infer the priority of a value when it is added to the queue. This can be useful when the priority is something that can be derived from the value itself.

`inferValuePriority` is `undefined` by default, which means you always have to provide the priority when adding a value to the queue.

#### `isMinQueue: boolean`

Indicate that the instance should be a min-priority queue.

`isMinQueue` is `false` by default, resulting in a max-priority queue.

### Instance Properties

```ts
// see the next entry in the queue without removing it
Qewe.prototype.peek: T | null;

// see the final entry in the queue without removing it
Qewe.prototype.peekEnd: T | null;

// list all values in the queue
Qewe.prototype.values: T[];

// list all entries in the queue
Qewe.prototype.entries: QeweEntry<T>[];

// get the amount of entries of the queue
Qewe.prototype.size: number;

// check if the queue is empty
Qewe.prototype.isEmpty: boolean;
```

### Instance Methods

```ts
// add a new value to the queue
Qewe.prototype.enqueue(value: T, priority: number): QeweEntry<T>;

// add a new value to the queue, inferring its priority
// NOTE: this is only available when `options.inferValuePriority` is defined
Qewe.prototype.enqueue(value: T): QeweEntry<T>;

// get the first entry in the queue and remove it from the queue
Qewe.prototype.dequeue(): T | null;

// get the last entry in the queue and remove it from the queue
Qewe.prototype.dequeueEnd(): T | null;

// remove all entries from the queue and return them
Qewe.prototype.clear(): QeweEntry<T>[];
```
