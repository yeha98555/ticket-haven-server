import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_CONNECT_STRING);
const sub = new Redis(redis.options);

export { redis, sub };
