# qewe

[![npm version](https://badge.fury.io/js/qewe.svg)](https://npmjs.com/package/qewe) [![ci status](https://github.com/jgmcelwain/qewe/actions/workflows/ci.yml/badge.svg)](https://github.com/jgmcelwain/qewe/actions/workflows/ci.yml) [![bundle size](https://img.shields.io/bundlephobia/min/qewe)](https://bundlephobia.com/package/qewe)

qewe is an opinionated, type-safe, zero-dependency max/min priority queue for JavaScript and TypeScript projects.

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

```ts
import { Qewe } from 'qewe';

const queue = new Qewe();
const entry = new QeweEntry('world', 2);

queue.enqueue('hello', 1);
queue.enqueue(entry);

console.log(...queue); // [ 'world', 'hello' ]
console.log(queue.size); // 2

const dequeued = queue.dequeue();
console.log(dequeued); // 'world'
console.log(queue.size); // 1
```

### `QeweEntry<T>` & Enqueueing

A Qewe instance's queue is a list of `QeweEntry` instances. Each entry has a `value` and a `priority`:

```ts
const myQueue = new Qewe();

const entry = new QeweEntry('my-value', 1);
console.log(entry); // QeweEntry { value: 'my-value', priority: 1 }

myQueue.enqueue(entry);
console.log(myQueue.queue); // [ QeweEntry { value: 'my-value', priority: 1 } ]
```

The `enqueue` method of a Qewe instance also takes `value` and `priority` arguments, which will create a new `QeweEntry` instance and add it to the queue.

```ts
const myQueue = new Qewe();

myQueue.enqueue('my-value', 1);
console.log(myQueue.queue); // [ QeweEntry { value: 'my-value', priority: 1 } ]
```

If the priority of an entry can be inferred when enqueue is called then you can omit the `priority` argument and instead pass an `inferValuePriority` function to the constructor:

```ts
const myQueue = new Qewe<string>({
  inferValuePriority: (value) => value.length,
});

myQueue.enqueue('hello');
myQueue.enqueue('qewe');
console.log(myQueue.queue); // [ QeweEntry { value: 'hello', priority: 5 }, QeweEntry { value: 'qewe', priority: 4 } ]
```

### Queue Behavior

Instances which have an empty queue will throw an error when a `dequeue` or `dequeueEnd` is attempted. It is recommended that you expect this error and handle it accordingly:

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

if (!queue.isEmpty()) {
  const value = queue.dequeue();
} else {
  // queue is empty - do something else
}
```

The `peek` and `peekEnd` properties of an instance do _not_ throw an error when the queue is empty. Instead, they return `undefined`.

## API

### Constructor Options

You can customize a Qewe instance by passing a `QeweOptions` object to the constructor:

```ts
type QueueType = 'min' | 'max';
interface QeweOptions<T> {
  queueType?: QueueType;
  maxSize?: number;
  inferValuePriority?: (value: T) => number;
  initialEntries?: QeweEntry<T>[];
  initialValues?: T[];
}

const queue: new Qewe<{ x: number; y: number; mass: number }>({
  queueType: 'min',
  maxSize: 4,
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

- #### `maxSize: number`

  Specify a maximum number of entries that can exist in the instance's priority queue.

  `maxSize` is `Infinity` by default.

- #### `inferValuePriority: (value: T) => number`

  Define a function that will be used to infer the priority of a value when it is added to the queue. This can be useful when the priority is something that can be derived from the value itself.

  This function is only used by `enqueue` if a `priority` argument is not provided and the `value` argument is not an instance of `QeweEntry`.

  `inferValuePriority` is `undefined` by default, which means you always have to provide the priority when adding a value to the queue.

- #### `initialEntries: QeweEntry<T>`

  Specify an array of `QeweEntry` instances to initialize the instance's priority queue. This uses `Qewe.prototype.enqueue` to add each entry.

- #### `initialValues: T[] | QeweEntry<T>[]`

  Provide an array of values to initialize the queue with. This uses `Qewe.prototype.enqueue` to add each value.

  Note: The instance must also have an `inferValuePriority` function so that it can infer the priority of each value. If you cannot provide an `inferValuePriority` function you should instead use the `initialEntries` option to initialize the queue.

### Instance Properties

```ts
// get the amount of entries of the queue.
Qewe.prototype.size: number;

// get the maximum amount of entries that the queue can hold.
Qewe.prototype.maxSize: number;

// get the current queue state.
Qewe.prototype.queue: QeweEntry<T>[];

// get the type (minimum or maximum) of the queue.
Qewe.prototype.queueType: QueueType;

// get the function used to infer the priority of a value to be enqueued
Qewe.prototype.inferValuePriority: ((value: T) => number) | null;
```

### Instance Methods

```ts
// returns a generator that yields the values in the queue. synonymous with Qewe.prototype.values.
Qewe.prototype[Symbol.Iterator](): T[];

// returns a generator that yields the queue's values.
Qewe.prototype.values(): Generator<T>;

// returns a generator that yields the queue's entries.
Qewe.prototype.entries(): Generator<QeweEntry<T>>;

// returns whether or not the queue contains a given value.
Qewe.prototype.contains(value: T): boolean;

// returns whether or not the queue is empty.
Qewe.prototype.isEmpty(): boolean;

// create a new entry which can be passed to `enqueue`. returns the entry.
Qewe.prototype.createEntry(value: T, priority?: number): QeweEntry<T>;

// add a new value to the queue. returns the new queue entry.
// NOTE: if you are using the value/priority signature then the priority argument
// is only optional when when `options.inferValuePriority` is defined for the instance.
Qewe.prototype.enqueue(entry: QeweEntry<T>): QeweEntry<T>;
Qewe.prototype.enqueue(value: T, priority?: number): QeweEntry<T>;

// returns the first value in the queue (without removing its entry, like dequeue does).
Qewe.prototype.peek(): T | undefined;

// returns the last value in the queue (without removing its entry, like dequeueEnd does).
Qewe.prototype.peekEnd(): T | undefined;

// removes the first entry from the queue and returns its value.
Qewe.prototype.dequeue(): T;

// removes the last entry from the queue and returns its value.
Qewe.prototype.dequeueEnd(): T;

// removes a specified value from the queue and returns its entry.
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
