const { Worker } = require("worker_threads");

class WorkerPool {
  queue = [];
  workersById = {};
  activeWorkersById = {};
  numberOfThreads = 0;

  constructor(workerPath, numberOfThreads) {
    //init worker pool
    this.numberOfThreads = numberOfThreads;
    if (this.numberOfThreads < 1) {
      return null;
    }
    for (let i = 0; i < this.numberOfThreads; i += 1) {
      const worker = new Worker(workerPath);
      this.workersById[i] = worker;
      this.activeWorkersById[i] = false;
    }
  }

  run(getData) {
    return new Promise((resolve, reject) => {
      const availableWorkerId = this.getInactiveWorkerId();
      const queueItem = {
        getData,

        callback: (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        },
      };
      if (availableWorkerId === -1) {
        this.queue.push(queueItem);
        return null;
      }

      this.runWorker(availableWorkerId, queueItem);
    });
  }

  getInactiveWorkerId() {
    //find worker for job
    for (let i = 0; i < this.numberOfThreads; i++) {
      if (!this.activeWorkersById[i]) {
        return i;
      }
    }
    return -1;
  }

  async runWorker(workerId, queueItem) {
    //start worker
    const worker = this.workersById[workerId];
    this.activeWorkersById[workerId] = true;
    const messageCallback = (result) => {
      queueItem.callback(null, result);
      cleanUp();
    };
    const errorCallback = (error) => {
      queueItem.callback(error);
      cleanUp();
    };
    const cleanUp = () => {
      worker.removeAllListeners("message");
      worker.removeAllListeners("error");
      this.activeWorkersById[workerId] = false;
      if (!this.queue.length) {
        return null;
      }
      this.runWorker(workerId, this.queue.shift());
    };
    worker.once("message", messageCallback);
    worker.once("error", errorCallback);
    worker.postMessage(await queueItem.getData());
  }
}

module.exports = WorkerPool;
