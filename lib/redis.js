import { createClient } from 'redis';

const redis = createClient({
    url: process.env.REDIS_URL,
});

redis.on('error', (err) => console.error('Redis Client Error', err));

// 顶层 await 连接（需要 Node.js ≥ 14.8）
await redis.connect();

export { redis };
