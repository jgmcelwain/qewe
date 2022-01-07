# qewe

[![npm version](https://badge.fury.io/js/qewe.svg)](https://npmjs.com/package/qewe) [![ci status](https://github.com/jgmcelwain/qewe/actions/workflows/ci.yml/badge.svg)](https://github.com/jgmcelwain/qewe/actions/workflows/ci.yml) [![bundle size](https://img.shields.io/bundlephobia/min/qewe)](https://bundlephobia.com/package/qewe)

qewe is an opinionated, type-safe, zero-dependency max/min priority queue for JavaScript and TypeScript projects.

```ts
import { Qewe } from 'qewe';

const queue = new Qewe();
queue.enqueue('hello', 1);
queue.enqueue('world', 2);

console.log(queue.values); // [ 'world', 'hello' ]
console.log(queue.size); // 2

const value = queue.dequeue();
console.log(value); // 'world'
console.log(queue.size); // 1
```

## Installation

Add qewe to your project using your favorite package manager:

```bash
$ yarn add qewe
```

You can also import qewe with a script tag via [unpkg](https://unpkg.com):

```html
<script src="//unpkg.com/qewe" type="text/javascript"></script>
```

## Usage

### Types

```ts
type QueueType = 'min' | 'max';

interface QeweOptions<T> {
  queueType?: QueueType;
  maximumQueueSize?: number;
  inferValuePriority?: (value: T) => number;
  initialValues?: T[] | QeweEntry<T>[];
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
  queueType: 'min',
  maximumQueueSize: 4,
  inferValuePriority: (value) => value.mass,
  initialValues: [
    { x: 1, y: 2, mass: 4 },
    { x: 3, y: -3, mass: 1.5 }
  ]
});
```

- #### `queueType: QueueType`

  Indicate whether the queue should be a minimum or maximum priority queue.

  `queueType` is `max` by default.

- #### `maximumQueueSize: number`

  Specify a maximum number of entries that can exist in the instance's priority queue.

  `maximumQueueSize` is `Infinity` by default.

- #### `inferValuePriority: (value: T) => number`

  Define a function that will be used to infer the priority of a value when it is added to the queue. This can be useful when the priority is something that can be derived from the value itself.

  `inferValuePriority` is `undefined` by default, which means you always have to provide the priority when adding a value to the queue.

- #### `initialValues: T[] | QeweEntry<T>[]`

  Provide an array of values or an array of values or `QeweEntry` objects to initialize the queue with. This uses `Qewe.prototype.enqueue` to add each value.

  Note: if you provide an array of values you _must_ also have an `inferValuePriority` option so that the instance can infer the priority of each value.

  `initialValues` is `undefined` by default.

### Queue Behavior

Instances which have an empty queue will throw an error when `dequeue` or `dequeueEnd` are called. It is recommended that you expect this error and handle it accordingly:

```ts
const queue = new Qewe();

try {
  const value = queue.dequeue();
} catch {
  // queue is empty - do something else
}
```

Alternatively, you can check if the queue is empty _before_ you attempt to dequeue:

```ts
const queue = new Qewe();

if (!queue.isEmpty) {
  const value = queue.dequeue();
} else {
  // queue is empty - do something else
}
```

The `peek` and `peekEnd` properties of an instance do _not_ throw an error when the queue is empty. Instead, they return `undefined`.

## API

### Instance Properties

```ts
// returns the next entry in the queue (without removing it, like dequeue does).
Qewe.prototype.peek: T | undefined;

// returns the final entry in the queue (without removing it, like dequeueEnd does).
Qewe.prototype.peekEnd: T | undefined;

// returns a list all values in the queue.
Qewe.prototype.values: T[];

// returns a list all entries in the queue.
Qewe.prototype.entries: QeweEntry<T>[];

// returns the amount of entries of the queue.
Qewe.prototype.size: number;

// returns the maximum amount of entries that the queue can hold.
Qewe.prototype.maxSize: number;

// returns whether or not the queue is empty.
Qewe.prototype.isEmpty: boolean;

// returns the type (minimum or maximum) of the queue.
Qewe.prototype.queueType: QueueType;
```

### Instance Methods

```ts
// iterator that yields all values in the queue.
Qewe.prototype[Symbol.Iterator](): T[];

// returns whether or not the queue contains a given value.
Qewe.prototype.contains(value: T): boolean;

// add a new value to the queue. returns the new queue entry.
Qewe.prototype.enqueue(value: T, priority: number): QeweEntry<T>;

// add a new value to the queue, inferring its priority. returns the new queue entry.
// NOTE: this is only available when `options.inferValuePriority` is defined.
Qewe.prototype.enqueue(value: T): QeweEntry<T>;

// removes the first entry from the queue and returns it.
Qewe.prototype.dequeue(): T;

// removes the last entry from the queue and returns it.
Qewe.prototype.dequeueEnd(): T;

// removes a specified value from the queue and returns it.
Qewe.prototype.remove(value: T): QeweEntry<T>;

// removes all entries from the queue and returns them.
Qewe.prototype.clear(): QeweEntry<T>[];
```

### Errors

All errors thrown by a Qewe instance are members of the `QeweError` enum, which can be imported from the package.

| Error                           | Description                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `QeweError.NoPriorityValue`     | Cannot enqueue - no priority value, or function to infer an entry's priority value, was provided. |
| `QeweError.MaxQueueSizeReached` | Cannot enqueue - the queue is already at its max size.                                            |
| `QeweError.EmptyQueue`          | Cannot dequeue - the queue is empty.                                                              |
| `QeweError.NotFound`            | Cannot remove - the value was not found in the queue.                                             |
