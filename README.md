# qewe

[![npm version](https://badge.fury.io/js/qewe.svg)](https://npmjs.com/package/qewe) [![tests status](https://github.com/jgmcelwain/qewe/actions/workflows/tests.yml/badge.svg)](https://github.com/jgmcelwain/qewe/actions/workflows/tests.yml)

qewe is a type-safe, zero-dependency max/min priority queue manager for JavaScript and TypeScript projects.

## Installation

```bash
$ yarn add qewe
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

## `Qewe` instance properties

| Property  | Type                               | Description                                              |
| --------- | ---------------------------------- | -------------------------------------------------------- |
| `size`    | `number`                           | The number of values in the queue.                       |
| `isEmpty` | `boolean`                          | See if the queue is empty.                               |
| `values`  | `T[]`                              | All values in the queue.                                 |
| `entries` | `{ value: T; priority: number }[]` | All entries in the queue (values with their priorities). |
| `peek`    | `T \| null`                        | See the next entry in the queue without removing it.     |
| `peekEnd` | `T \| null`                        | See the final entry in the queue without removing it.    |

## `Qewe` instance methods

| Method    | Arguments                       | Return Type                        | Description                       |
| --------- | ------------------------------- | ---------------------------------- | --------------------------------- |
| `pop`     | -                               | `T \| null`                        | Get the first entry in the queue. |
| `popEnd`  | -                               | `T \| null`                        | Get the last entry in the queue.  |
| `clear`   | -                               | `{ value: T; priority: number }[]` | Remove all values from the queue. |
| `enqueue` | `(value: T, priority?: number)` | `{ value: T; priority: number }`   | Add a value to the queue.         |

## Customizing instance behavior

The behavior of a `Qewe` instance can be configured by passing an `options` object to the constructor:

| Key                  | Type                   | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isMinQueue`         | `boolean`              | `false`     | If `true`, the instance will be a min-priority queue (smallest priority first).                                                                                                                                                                                                                                                                                                                  |
| `inferValuePriority` | `(value: T) => number` | `undefined` | If the values you are queueing have a property that means their priority can be inferred then you can provide a function to extract it. If this function is provided then the second argument of `queue.enqueue` does not need to be supplied. You may choose to supply this argument anyway - it will then precedence over the result of `inferValuePriority`, so can be used as an "override". |
