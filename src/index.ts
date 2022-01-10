type QueueType = 'min' | 'max';

type QeweOptions<T> = {
  queueType?: QueueType;
  maximumQueueSize?: number;
  initialEntries?: QeweEntry<T>[];
} & (QeweOptionsWithInfer<T> | QeweOptionsNoInfer);
interface QeweOptionsNoInfer {
  inferValuePriority?: never;
  initialValues?: never;
}
interface QeweOptionsWithInfer<T> {
  inferValuePriority: (value: T) => number;
  initialValues?: T[];
}

enum QeweErrors {
  NoPriorityValue = "Cannot enqueue - no priority value, or function to infer an entry's priority value, was provided.",
  MaxQueueSizeReached = 'Cannot enqueue - the queue is already at its max size.',
  EmptyQueue = 'Cannot dequeue - the queue is empty.',
  NotFound = 'Cannot remove - the value was not found in the queue.',
}

class QeweEntry<T> {
  public value: T;
  public priority: number;

  constructor(value: T, priority: number) {
    this.value = value;
    this.priority = priority;
  }
}

class Qewe<T> {
  protected _queue: QeweEntry<T>[] = [];
  protected _inferValuePriority: ((value: T) => number) | null = null;
  protected _queueType: QueueType = 'max';
  protected _maxSize = Infinity;

  constructor(options?: QeweOptions<T>) {
    if (options?.inferValuePriority !== undefined) {
      this._inferValuePriority = options.inferValuePriority;
    }

    if (options?.queueType !== undefined) {
      this._queueType = options.queueType;
    }

    if (options?.maximumQueueSize !== undefined) {
      this._maxSize = options.maximumQueueSize;
    }

    if (options?.initialEntries !== undefined) {
      for (const initialEntry of options.initialEntries) {
        this.enqueue(initialEntry);
      }
    }

    if (options?.initialValues !== undefined) {
      for (const initialValue of options.initialValues) {
        this.enqueue(initialValue);
      }
    }
  }

  /** returns the maximum amount of entries that the queue can hold. */
  get maxSize(): number {
    return this._maxSize;
  }

  /** returns the queue in its current state */
  get queue(): QeweEntry<T>[] {
    return this._queue;
  }

  /** returns the type (minimum or maximum) of the queue. */
  get queueType(): QueueType {
    return this._queueType;
  }

  /** returns the amount of entries of the queue. */
  get size(): number {
    return this._queue.length;
  }

  [Symbol.iterator]() {
    return this.values();
  }

  /** removes all entries from the queue and returns them. */
  clear(): QeweEntry<T>[] {
    return this._queue.splice(0, this._queue.length);
  }

  /** check to see if a certain value exists in the queue. */
  contains(value: T): boolean {
    return this._queue.some((entry) => Object.is(entry.value, value));
  }

  /** create a new entry which can be passed to `enqueue`. returns the entry. */
  createEntry(value: T, priority?: number): QeweEntry<T> {
    const entryPriority = priority ?? this._inferValuePriority?.(value);

    if (entryPriority === undefined) {
      throw new Error(QeweErrors.NoPriorityValue);
    }

    return new QeweEntry(value, entryPriority);
  }

  /** removes the first entry from the queue and returns it. */
  dequeue(): T {
    const entry = this._queue.shift();

    if (entry !== undefined) {
      return entry.value;
    } else {
      throw new Error(QeweErrors.EmptyQueue);
    }
  }

  /** removes the last entry from the queue and returns it. */
  dequeueEnd(): T {
    const entry = this._queue.pop();

    if (entry !== undefined) {
      return entry.value;
    } else {
      throw new Error(QeweErrors.EmptyQueue);
    }
  }

  /** returns a generator that yields the queue's entries */
  *entries(): Generator<QeweEntry<T>> {
    const queueEntries = this.queue;

    for (const entry of queueEntries) {
      yield entry;
    }
  }

  /** add a new entry to the queue. returns the new queue entry. */
  enqueue(entry: QeweEntry<T>): QeweEntry<T>;
  enqueue(value: T, priority?: number): QeweEntry<T>;
  enqueue(value: T | QeweEntry<T>, priority?: number): QeweEntry<T> {
    if (this.size === this._maxSize) {
      throw new Error(QeweErrors.MaxQueueSizeReached);
    }

    let newEntry: QeweEntry<T>;
    if (value instanceof QeweEntry) {
      newEntry = value;
    } else {
      newEntry = this.createEntry(value, priority);
    }

    const priorityIndex = this._queue.findIndex((entry) => {
      // if this is a min queue we want to find the first entry in the queue
      // that has a priority higher than our new entry. if this is a max queue
      // then we want the opposite.
      if (this._queueType === 'min') {
        return entry.priority > newEntry.priority;
      } else {
        return entry.priority < newEntry.priority;
      }
    });

    if (priorityIndex > -1) {
      this._queue.splice(priorityIndex, 0, newEntry);
    } else {
      this._queue.push(newEntry);
    }

    return newEntry;
  }

  /** returns whether or not the queue is empty. */
  isEmpty(): boolean {
    return this._queue.length === 0;
  }

  /** returns the next entry in the queue. */
  peek(): T | undefined {
    return this._queue[0]?.value;
  }

  /** returns the last entry in the queue. */
  peekEnd(): T | undefined {
    return this._queue[this._queue.length - 1]?.value;
  }

  /** removes a specified value from the queue and returns it. */
  remove(value: T): QeweEntry<T> {
    const index = this._queue.findIndex((entry) =>
      Object.is(entry.value, value),
    );

    if (index > -1) {
      return this._queue.splice(index, 1)[0];
    } else {
      throw new Error(QeweErrors.NotFound);
    }
  }

  /** returns a generator that yields the queue's values */
  *values() {
    const queueValues: T[] = this._queue.map((entry) => entry.value);

    for (const value of queueValues) {
      yield value;
    }
  }
}

export { Qewe, QeweEntry, QeweOptions, QeweErrors };

const queue = new Qewe();
queue.enqueue('hello', 1);
console.log(queue.queue);
