type QueueType = 'min' | 'max';

type QeweOptions<T> = {
  queueType?: QueueType;
  maxSize?: number;
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
  /** get the function used to infer the priority of a value to be enqueued */
  public inferValuePriority: ((value: T) => number) | null = null;

  /** get the maximum amount of entries that the queue can hold. */
  public maxSize = Infinity;

  /** get the current queue state. */
  public queue: QeweEntry<T>[] = [];

  /** get the type (minimum or maximum) of the queue. */
  public queueType: QueueType = 'max';

  constructor(options?: QeweOptions<T>) {
    if (options?.inferValuePriority !== undefined) {
      this.inferValuePriority = options.inferValuePriority;
    }

    if (options?.queueType !== undefined) {
      this.queueType = options.queueType;
    }

    if (options?.maxSize !== undefined) {
      this.maxSize = options.maxSize;
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

  /** get the amount of entries of the queue. */
  get size(): number {
    return this.queue.length;
  }

  [Symbol.iterator]() {
    return this.values();
  }

  /** removes all entries from the queue and returns them. */
  clear(): QeweEntry<T>[] {
    return this.queue.splice(0, this.queue.length);
  }

  /** check to see if a certain value exists in the queue. */
  contains(value: T): boolean {
    return this.queue.some((entry) => Object.is(entry.value, value));
  }

  /** create a new entry which can be passed to `enqueue`. returns the entry. */
  createEntry(value: T, priority?: number): QeweEntry<T> {
    const entryPriority = priority ?? this.inferValuePriority?.(value);

    if (entryPriority === undefined) {
      throw new Error(QeweErrors.NoPriorityValue);
    }

    return new QeweEntry(value, entryPriority);
  }

  /** removes the first entry from the queue and returns its value. */
  dequeue(): T {
    const entry = this.queue.shift();

    if (entry === undefined) {
      throw new Error(QeweErrors.EmptyQueue);
    }

    return entry.value;
  }

  /** removes the last entry from the queue and returns its value. */
  dequeueEnd(): T {
    const entry = this.queue.pop();

    if (entry === undefined) {
      throw new Error(QeweErrors.EmptyQueue);
    }

    return entry.value;
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
    if (this.size === this.maxSize) {
      throw new Error(QeweErrors.MaxQueueSizeReached);
    }

    let newEntry: QeweEntry<T>;
    if (value instanceof QeweEntry) {
      newEntry = value;
    } else {
      newEntry = this.createEntry(value, priority);
    }

    const priorityIndex = this.queue.findIndex((entry) => {
      // if this is a min queue we want to find the first entry in the queue
      // that has a priority higher than our new entry. if this is a max queue
      // then we want the opposite.
      if (this.queueType === 'min') {
        return entry.priority > newEntry.priority;
      } else {
        return entry.priority < newEntry.priority;
      }
    });

    if (priorityIndex > -1) {
      this.queue.splice(priorityIndex, 0, newEntry);
    } else {
      this.queue.push(newEntry);
    }

    return newEntry;
  }

  /** returns whether or not the queue is empty. */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /** returns the first value in the queue. */
  peek(): T | undefined {
    return this.queue[0]?.value;
  }

  /** returns the last value in the queue. */
  peekEnd(): T | undefined {
    return this.queue[this.queue.length - 1]?.value;
  }

  /** removes a specified value from the queue and returns it. */
  remove(value: T): QeweEntry<T> {
    const index = this.queue.findIndex((entry) =>
      Object.is(entry.value, value),
    );

    if (index === -1) {
      throw new Error(QeweErrors.NotFound);
    }

    return this.queue.splice(index, 1)[0];
  }

  /** returns a generator that yields the queue's values */
  *values(): Generator<T> {
    const queueValues: T[] = this.queue.map((entry) => entry.value);

    for (const value of queueValues) {
      yield value;
    }
  }
}

export { Qewe, QeweEntry, QeweOptions, QeweErrors };
