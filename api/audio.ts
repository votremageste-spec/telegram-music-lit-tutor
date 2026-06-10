import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AudioFragmentsList } from '../src/data/data.js';
import { audioResultsCollection } from './_lib/firebase.js';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /api/audio?program=DOOP&grade=7 - получить список аудиофрагментов
  if (req.method === 'GET') {
    const { program, grade } = req.query;
    
    // Фильтруем аудиофрагменты по программе и классу (упрощённо)
    let filtered = AudioFragmentsList;
    
    // Для демонстрации возвращаем все фрагменты
    return res.status(200).json({ success: true, data: filtered });
  }

  // POST /api/audio/stream - стриминг аудиофайла
  if (req.method === 'POST' && req.url === '/api/audio/stream') {
    const { filePath } = req.body;
    const publicPath = path.join(process.cwd(), 'public', filePath);
    
    try {
      const stat = fs.statSync(publicPath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(publicPath, { start, end });
        
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        });
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        });
        fs.createReadStream(publicPath).pipe(res);
      }
    } catch (error) {
      res.status(404).json({ error: 'Audio file not found' });
    }
    return;
  }

  // POST /api/audio-result - сохранение результата аудиовикторины
  if (req.method === 'POST') {
    const { telegramId, mode, program, grade, score, total, mistakes, percentage } = req.body;
    
    const result = {
      mode,
      program,
      grade,
      score,
      total,
      mistakes,
      percentage,
      created_at: new Date(),
    };
    
    await audioResultsCollection.add({
      user_id: telegramId,
      ...result,
    });
    
    return res.status(200).json({ success: true, data: result });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
