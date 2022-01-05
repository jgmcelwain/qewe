type QueueType = 'min' | 'max';

type QeweOptions<T> = { queueType?: QueueType } & (
  | QeweOptionsWithInfer<T>
  | QeweOptionsNoInfer<T>
);
interface QeweOptionsNoInfer<T> {
  inferValuePriority?: never;
  initialValues?: QeweEntry<T>[];
}
interface QeweOptionsWithInfer<T> {
  inferValuePriority: (value: T) => number;
  initialValues?: T[] | QeweEntry<T>[];
}

interface QeweEntry<T> {
  value: T;
  priority: number;
}

function isQeweEntry<T>(entry: T | QeweEntry<T>): entry is QeweEntry<T> {
  const { value, priority } = entry as QeweEntry<T>;

  return value !== undefined && priority !== undefined;
}

class Qewe<T> {
  protected queue: QeweEntry<T>[] = [];
  protected inferValuePriority: ((value: T) => number) | null;

  /** maximum or minimum queue */
  public queueType: QueueType;

  constructor(options?: QeweOptions<T>) {
    this.inferValuePriority = options?.inferValuePriority ?? null;
    this.queueType = options?.queueType ?? 'max';

    if (options?.initialValues !== undefined) {
      for (const initialValue of options.initialValues) {
        if (isQeweEntry(initialValue)) {
          this.enqueue(initialValue.value, initialValue.priority);
        } else {
          this.enqueue(initialValue);
        }
      }
    }
  }

  /** see the next entry in the queue without removing it */
  get peek(): T | undefined {
    return this.queue[0]?.value;
  }

  /** see the final entry in the queue without removing it */
  get peekEnd(): T | undefined {
    return this.queue[this.queue.length - 1]?.value;
  }

  /** list all values in the queue */
  get values(): T[] {
    return this.queue.map((entry) => entry.value);
  }

  /** list all entries in the queue (values with their priorities) */
  get entries(): QeweEntry<T>[] {
    return this.queue;
  }

  /** get the amount of entries of the queue */
  get size(): number {
    return this.queue.length;
  }

  /** check if the queue is empty */
  get isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /** add a new value to the queue */
  enqueue(value: T): QeweEntry<T>;
  enqueue(value: T, priority: number): QeweEntry<T>;
  enqueue(value: T, priority?: number): QeweEntry<T> {
    const entryPriority = priority ?? this.inferValuePriority?.(value);

    if (entryPriority === undefined) {
      throw new Error(
        "No priority value, or function to infer an entry's priority value, was provided.",
      );
    } else {
      const newEntry: QeweEntry<T> = {
        priority: entryPriority,
        value,
      };

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
  }

  /** get the first entry in the queue and remove it from the queue */
  dequeue(): T {
    const entry = this.queue.shift();

    if (entry !== undefined) {
      return entry.value;
    } else {
      throw new Error('Dequeue failed - the queue is empty.');
    }
  }

  /** get the last entry in the queue and remove it from the queue */
  dequeueEnd(): T {
    const entry = this.queue.pop();

    if (entry !== undefined) {
      return entry.value;
    } else {
      throw new Error('Dequeue failed - the queue is empty.');
    }
  }

  /** remove all entries from the queue and return them */
  clear(): QeweEntry<T>[] {
    return this.queue.splice(0, this.queue.length);
  }
}

export { Qewe, QeweEntry, QeweOptions };
