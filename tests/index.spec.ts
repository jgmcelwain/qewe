import { Qewe, QeweEntry, QeweErrors } from '../src/index';

describe('QeweEntry', () => {
  it('should create an entry', () => {
    const entry = new QeweEntry('test', 1);

    expect(entry).toBeInstanceOf(QeweEntry);
    expect(entry.priority).toBe(1);
    expect(entry.value).toBe('test');
  });
});

describe('Qewe', () => {
  describe('configuration', () => {
    describe('min queue', () => {
      const queue = new Qewe<string>({ queueType: 'min' });

      it('adds values in reverse priority order', () => {
        queue.enqueue('a', 1);
        queue.enqueue('b', 2);

        expect(queue.size).toBe(2);
        expect(queue.peek).toBe('a');
        expect(queue.peekEnd).toBe('b');
      });

      it('removes values in reverse priority order', () => {
        const popped = queue.dequeue();

        expect(queue.size).toBe(1);
        expect(queue.peek).toBe('b');
        expect(popped).toBe('a');
      });
    });

    describe('inferred priority', () => {
      const queue = new Qewe<{ x: number; y: number; mass: number }>({
        inferValuePriority: (value) => value.mass,
      });

      it('infers the priority of a value based on a provided function', () => {
        queue.enqueue({ x: 1, y: 1, mass: 1 });
        queue.enqueue({ x: 2, y: -3, mass: 4 });
        queue.enqueue({ x: 3, y: 4, mass: 7 });
        queue.enqueue({ x: -3, y: 9, mass: 0.5 });

        expect(queue.size).toBe(4);
        expect(queue.peek).toEqual({ x: 3, y: 4, mass: 7 });
        expect(queue.peekEnd).toEqual({ x: -3, y: 9, mass: 0.5 });
      });
    });

    describe('max queue size', () => {
      const queue = new Qewe<string>({ maximumQueueSize: 3 });

      it('prevents entries from being queued when the maximum size is reached', () => {
        queue.enqueue('a', 3);
        queue.enqueue('b', 1);
        queue.enqueue('c', 2);

        expect(() => queue.enqueue('d', 4)).toThrowError(
          QeweErrors.MaxQueueSizeReached,
        );
      });
    });

    describe('initialize with entries', () => {
      it('initializes with stated priority', () => {
        const queue = new Qewe<{ x: number; y: number }>({
          initialEntries: [
            new QeweEntry({ x: 1, y: 1 }, 1),
            new QeweEntry({ x: 1, y: 1 }, 3),
          ],
        });

        expect(queue.size).toBe(2);
        expect(queue.peek).toEqual({ x: 1, y: 1 });
      });

      it('initializes with inferred priority', () => {
        const queue = new Qewe<string>({
          inferValuePriority: (value) => value.length,
          initialValues: ['hello', 'world', 'initializing', 'test'],
        });

        expect(queue.size).toBe(4);
        expect(queue.peek).toBe('initializing');
      });
    });
  });

  describe('queue functionality', () => {
    const queue = new Qewe<string>({ queueType: 'max', maximumQueueSize: 10 });

    describe('initialized queue', () => {
      it('returns its configuration parameters', () => {
        expect(queue.queueType).toBe('max');
        expect(queue.maxSize).toBe(10);
      });

      it('should be empty', () => {
        expect(queue.isEmpty).toBe(true);
        expect(queue.peek).toBe(undefined);
        expect(queue.peekEnd).toBe(undefined);
      });
    });

    describe('enqueue', () => {
      it('inserts a value', () => {
        queue.enqueue(new QeweEntry('a', 1));

        expect(queue.peek).toBe('a');
        expect(queue.entries[0]).toBeInstanceOf(QeweEntry);
      });

      it('inserts a higher priority entry in the first position', () => {
        queue.enqueue('b', 2);

        expect(queue.peek).toBe('b');
        expect(queue.peekEnd).toBe('a');
      });
    });

    describe('queue state', () => {
      it('has an iterator', () => {
        const values = [...queue];

        expect(values).toEqual(['b', 'a']);
      });

      it('can list its values', () => {
        expect(queue.values).toEqual(['b', 'a']);
      });

      it('can list its entries', () => {
        expect(queue.entries).toEqual([
          { value: 'b', priority: 2 },
          { value: 'a', priority: 1 },
        ]);
      });

      it('can check for the existence of a value', () => {
        expect(queue.contains('a')).toBe(true);
        expect(queue.contains('b')).toBe(true);
        expect(queue.contains('c')).toBe(false);
      });
    });

    describe('dequeue/removal', () => {
      it('can remove a given value', () => {
        queue.enqueue('c', 3);
        expect(queue.size).toBe(3);

        const removed = queue.remove('c');
        expect(removed).toEqual({ value: 'c', priority: 3 });
        expect(queue.size).toBe(2);
      });

      it('dequeues the next value', () => {
        const dequeued = queue.dequeue();

        expect(queue.size).toBe(1);
        expect(queue.peek).toBe('a');
        expect(dequeued).toBe('b');
      });

      it('dequeues the final value', () => {
        queue.enqueue('d', 0);

        const dequeued = queue.dequeueEnd();

        expect(queue.size).toBe(1);
        expect(queue.peek).toBe('a');
        expect(dequeued).toBe('d');
      });

      it('removes and returns all entries when cleared', () => {
        const entries = queue.clear();

        expect(queue.isEmpty).toBe(true);
        expect(entries).toEqual([{ priority: 1, value: 'a' }]);
      });
    });

    describe('errors', () => {
      it('throws an error if a dequeue is attempted when there are no entries', () => {
        expect(() => queue.dequeue()).toThrowError(QeweErrors.EmptyQueue);
        expect(() => queue.dequeueEnd()).toThrowError(QeweErrors.EmptyQueue);
      });

      it('throws an error if no priority is provided', () => {
        expect(() => queue.enqueue('d')).toThrowError(
          QeweErrors.NoPriorityValue,
        );
      });

      it('throws an error if the value to be removed does not exist', () => {
        expect(() => queue.remove('e')).toThrowError(QeweErrors.NotFound);
      });
    });
  });
});
