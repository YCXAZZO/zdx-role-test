import { redis } from '../lib/redis.js';

// Redis 键名（建议统一前缀）
const ROADMAP_KEY = 'role_test:roadmap';

export default async function handler(req, res) {
    // 允许跨域（本地调试）
    res.setHeader('Access-Control-Allow-Origin', '*');

    // GET：返回 roadmap 数据
    if (req.method === 'GET') {
        try {
            const data = await redis.get(ROADMAP_KEY);
            // 如果不存在，返回空数组（或默认数据）
            const roadmap = data ? JSON.parse(data) : [];
            res.status(200).json(roadmap);
        } catch (error) {
            console.error('读取迭代路线失败:', error);
            res.status(500).json({ error: '读取失败' });
        }
        return;
    }

    // PUT：更新 roadmap 数据（需要密码验证）
    if (req.method === 'PUT') {
        try {
            const { password, roadmap } = req.body;

            // 验证密码（从环境变量读取）
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            if (password !== adminPassword) {
                return res.status(401).json({ error: '密码错误' });
            }

            // 保存到 Redis
            await redis.set(ROADMAP_KEY, JSON.stringify(roadmap));
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('保存迭代路线失败:', error);
            res.status(500).json({ error: '保存失败' });
        }
        return;
    }

    // 其他方法返回 405
    res.status(405).json({ error: 'Method Not Allowed' });
}
