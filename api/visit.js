import { redis } from '../lib/redis.js

// 从环境变量读取 Redis 连接地址
const redis = createClient({
    url: process.env.REDIS_URL,
});

// 连接 Redis（在函数外部连接，复用连接）
await redis.connect();

export default async function handler(req, res) {
    // 允许跨域（本地开发需要）
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        // 使用原子操作 incr 增加计数并返回新值
        const count = await redis.incr('visit_count');
        res.status(200).json({ count });
    } catch (error) {
        console.error('访客计数失败:', error);
        // 出错时返回 0，不阻塞页面
        res.status(200).json({ count: 0 });
    }
}
