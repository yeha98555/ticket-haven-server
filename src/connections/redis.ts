import { Redis } from 'ioredis';

export const redis = new Redis(process.env.REDIS_CONNECT_STRING);
