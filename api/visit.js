import { redis } from '../lib/redis.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const count = await redis.incr('visit_count');
        res.status(200).json({ count });
    } catch (error) {
        console.error('访客计数失败:', error);
        // 即使出错也返回 0，避免前端报错
        res.status(200).json({ count: 0 });
    }
}
