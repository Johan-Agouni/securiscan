import { Queue } from 'bullmq';
import { redis } from './redis';

export const scanQueue = new Queue('security-scans', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 1000,
      age: 24 * 3600,
    },
    removeOnFail: {
      count: 500,
    },
  },
});
