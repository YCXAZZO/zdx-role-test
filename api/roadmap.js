// api/roadmap.js
import { redis } from '../lib/redis.js';
import fs from 'fs';
import path from 'path';

const ROADMAP_KEY = 'role_test:roadmap';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // GET：返回 roadmap 数据（若 Redis 为空，则从静态文件初始化）
    if (req.method === 'GET') {
        try {
            let data = await redis.get(ROADMAP_KEY);

            if (data === null) {
                // Redis 中没有数据，尝试从本地 roadmap.json 读取并初始化
                try {
                    const filePath = path.join(process.cwd(), 'roadmap.json');
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    const defaultRoadmap = JSON.parse(fileContent);
                    await redis.set(ROADMAP_KEY, JSON.stringify(defaultRoadmap));
                    data = JSON.stringify(defaultRoadmap);
                } catch (readError) {
                    // 如果文件不存在或解析失败，则用空数组
                    await redis.set(ROADMAP_KEY, JSON.stringify([]));
                    data = JSON.stringify([]);
                }
            }

            const roadmap = JSON.parse(data);
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
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            if (password !== adminPassword) {
                return res.status(401).json({ error: '密码错误' });
            }
            await redis.set(ROADMAP_KEY, JSON.stringify(roadmap));
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('保存迭代路线失败:', error);
            res.status(500).json({ error: '保存失败' });
        }
        return;
    }

    res.status(405).json({ error: 'Method Not Allowed' });
}
