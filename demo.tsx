class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.currentlyRunning = 0;
    this.queue = [];
  }

  async acquire() {
    if (this.currentlyRunning >= this.maxConcurrency) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.currentlyRunning++;
  }

  release() {
    this.currentlyRunning--;
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    }
  }

  async execute(task) {
    await this.acquire();
    try {
      const result = await task();
      return result;
    } finally {
      this.release();
    }
  }
}

// 示例异步任务
async function asyncTask(id) {
  console.log(`Task ${id} started`);
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
  console.log(`Task ${id} completed`);
}

// 使用 Semaphore 控制并发
async function runTasksConcurrently(tasks, maxConcurrency) {
  const semaphore = new Semaphore(maxConcurrency);
  const results = await Promise.all(
    tasks.map(task => semaphore.execute(task))
  );
  return results;
}


function semaphoreAll(max) {
  let total = 0, queue = []

  async function acquire() {
    if (total >= max) {
      await new Promise(resolve => queue.push(resolve));
    }
    total++
  }

  function release() {
    total--
    if (queue.length > 0) {
      const resolve = queue.shift()
      resolve()
    }
  }

  async function execute(task) {
    await acquire()
  
    try {
      const result = await task()
      return result
    } catch (err) {
      return err
    } finally {
      release()
    }
  }

  return execute
}

async function runTasks(tasks, maxConcurrency) {
  const execute = semaphoreAll(maxConcurrency);

  const results = await Promise.all(tasks.map(task => execute(task)));
  return results;
}

// setTimeout => onmessage
const workerTask = (id: number, delay = 1) => new Promise((resolve, reject) => {
  console.log(`Task ${id} started`)

  let state = 'pending'
  const worker = new Worker("./worker.js")

  worker.postMessage(id)
  worker.onmessage = event => {
    if (state !== 'pending') {
      return false
    }
    state = 'fulfilled'
    console.log(id, state)

    resolve(event.data)

    console.log(`Task ${event.data} completed`)
  }

  typeof delay === 'number' && setTimeout(() => {
    if (state !== 'pending') {
      return false
    }
    state = 'rejected'
    console.log(id, state)

    worker.terminate();

    reject('terminate')

    console.log(`Task ${id} terminate`)
  }, delay * 1000)
})

// 创建一组异步任务
const tasks = Array.from({ length: 10 }, (_, i) => () => workerTask(i + 1));
// const tasks = (cb) => Array.from({ length: 10 }, (_, i) => workerTask(i + 1).then(res => { cb(res); return res }));

const res = await runTasks(tasks, 3)
console.log('All tasks completed', res.toString())










import { useAsync } from 'react-use'


export function semaphore(max: number, delay?: number) {
  let limit = 0
  const queue: ((value: unknown) => void)[] = []
  const isTimeout = new Promise(resolve => delay && setTimeout(() => resolve(true), delay * 1000))

  async function acquire() {
    limit++
    if (limit > max) {
      await new Promise(resolve => queue.push(resolve))
    }
  }

  function release() {
    limit--
    if (queue.length) {
      const resolve = queue.shift() as () => void
      resolve()
    }
  }

  return async (task: () => Promise<unknown>) => {
    await acquire()

    try {
      const result = await Promise.race([task, isTimeout])
      return result
    } catch (err) {
      return err
    } finally {
      release()
    }
  }
}

export default function useSemaphore(tasks: (() => Promise<unknown>)[], max: number) {
  const state = useAsync(async () => {
    const execute = semaphore(max)

    const result = await Promise.all(tasks.map(task => execute(task)))
    return result
  }, [tasks, max])

  return state
}















// prevents TS errors
declare var self: Worker;

self.onmessage = (event) => {

  setTimeout(() => {
    postMessage(event.data)

    process.exit()
  }, Math.random() * 2000)
}
















import { useEffect } from 'react'
import useSemaphore from '../test/useSemaphore'

async function asyncTask(id: number) {
  console.log(`Task ${id} started`)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000))
  console.log(`Task ${id} completed`)
  return id
}

const tasks = Array.from({ length: 10 }, (_, i) => () => asyncTask(i + 1))

export default function TestTask() {
  const state = useSemaphore(tasks, 3)

  useEffect(() => {
    console.log(state.value)
  }, [state])

  return <div />
}
