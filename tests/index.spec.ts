import { Qewe } from '../src/index';

describe('queue functionality', () => {
  const queue = new Qewe<string>();

  it('should be empty', () => {
    expect(queue.isEmpty).toBe(true);
  });

  it('has "a" in the first position', () => {
    queue.enqueue('a', 1);

    expect(queue.peek).toBe('a');
  });

  it('puts a higher priority entry in the first position', () => {
    queue.enqueue('b', 2);

    expect(queue.peek).toBe('b');
    expect(queue.peekEnd).toBe('a');
  });

  it('removes an entry from the queue when popped', () => {
    const popped = queue.dequeue();

    expect(queue.size).toBe(1);
    expect(queue.peek).toBe('a');
    expect(popped).toBe('b');
  });

  it('removes and returns all queue entries when cleared', () => {
    const entries = queue.clear();

    expect(queue.isEmpty).toBe(true);
    expect(entries).toStrictEqual([{ priority: 1, value: 'a' }]);
  });

  it('throws an error if the queue is empty and a dequeue is attempted', () => {
    expect(() => queue.dequeue()).toThrowError(
      'Dequeue failed - the queue is empty.',
    );
  });

  it('throws an error if no priority is provided', () => {
    expect(() => queue.enqueue('d')).toThrowError(
      "No priority value, or function to infer an entry's priority value, was provided.",
    );
  });
});

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
    expect(queue.peek).toStrictEqual({ x: 3, y: 4, mass: 7 });
    expect(queue.peekEnd).toStrictEqual({ x: -3, y: 9, mass: 0.5 });
  });
});

describe('initialize with entries', () => {
  it('initializes with stated priority', () => {
    const queue = new Qewe<{ x: number; y: number }>({
      initialValues: [
        { value: { x: 1, y: 1 }, priority: 1 },
        { value: { x: 1, y: 1 }, priority: 3 },
      ],
    });

    expect(queue.size).toBe(2);
    expect(queue.peek).toStrictEqual({ x: 1, y: 1 });
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
