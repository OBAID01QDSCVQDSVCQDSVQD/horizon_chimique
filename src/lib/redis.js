import Redis from 'ioredis';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return 'redis://localhost:6379';
};

let redis = null;

if (typeof window === 'undefined') {
  if (!global.redis) {
    global.redis = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: 3,
    });
  }
  redis = global.redis;
}

export default redis;
