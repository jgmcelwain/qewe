interface QeweOptions<T> {
  inferValuePriority?: (value: T) => number;
  isMinQueue?: boolean;
}

interface QeweEntry<T> {
  value: T;
  priority: number;
}

class Qewe<T> {
  protected queue: QeweEntry<T>[] = [];
  protected inferValuePriority: ((value: T) => number) | null;
  protected isMinQueue: boolean;

  constructor(options?: QeweOptions<T>) {
    this.inferValuePriority = options?.inferValuePriority ?? null;
    this.isMinQueue = !!options?.isMinQueue;
  }

  /** see the next entry in the queue without removing it */
  get peek(): T | null {
    return this.queue[0]?.value ?? null;
  }

  /** see the final entry in the queue without removing it */
  get peekEnd(): T | null {
    return this.queue[this.queue.length - 1]?.value ?? null;
  }

  /** list all values in the queue */
  get values(): T[] {
    return this.queue.map((entry) => entry.value);
  }

  /** list all entries in the queue */
  get entries(): QeweEntry<T>[] {
    return this.queue;
  }

  /** get the amount of entries of the queue */
  get size(): number {
    return this.queue.length;
  }

  /** get the first entry in the queue and remove it from the queue */
  pop(): T | null {
    const entry = this.queue.shift();

    if (entry !== undefined) {
      return entry.value;
    } else {
      return null;
    }
  }

  /** get the last entry in the queue and remove it from the queue */
  popEnd(): T | null {
    const entry = this.queue.pop();

    if (entry !== undefined) {
      return entry.value;
    } else {
      return null;
    }
  }

  /** remove all entries from the queue and return them */
  clear(): QeweEntry<T>[] {
    return this.queue.splice(0, this.queue.length);
  }

  /** add a new value to the queue */
  enqueue(value: T, priority?: number): QeweEntry<T> {
    const entryPriority = priority ?? this.inferValuePriority?.(value) ?? null;

    if (entryPriority === null) {
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
        if (this.isMinQueue) {
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
}

export { Qewe };
