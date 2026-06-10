import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DOOPComposers, FGTComposers } from '../src/data/data.js';
import { progressCollection } from './_lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /api/composers?program=DOOP&grade=7 - получить композиторов по программе и классу
  if (req.method === 'GET') {
    const { program, grade, composerId } = req.query;
    
    if (composerId) {
      // Получить конкретного композитора
      const allComposers = program === 'FGT' ? FGTComposers : DOOPComposers;
      const composer = allComposers.find(c => c.id === composerId);
      return res.status(200).json({ success: true, data: composer || null });
    }
    
    const allComposers = program === 'FGT' ? FGTComposers : DOOPComposers;
    let filtered = allComposers;
    
    if (grade) {
      filtered = allComposers.filter(c => c.grades.includes(Number(grade)));
    }
    
    return res.status(200).json({ success: true, data: filtered });
  }

  // POST /api/composer-test - сохранение результата теста по композитору
  if (req.method === 'POST') {
    const { telegramId, composerId, score, total, percentage } = req.body;
    
    const progressRef = progressCollection.doc(String(telegramId));
    const doc = await progressRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      const learnedComposers = data?.learned_composers || [];
      
      // Если результат >= 70%, считаем композитора изученным
      if (percentage >= 70 && !learnedComposers.includes(composerId)) {
        const updatedComposers = [...learnedComposers, composerId];
        await progressRef.update({
          learned_composers: updatedComposers,
          updated_at: new Date(),
        });
      }
      
      // Сохраняем результат теста
      const testResults = data?.test_results || [];
      await progressRef.update({
        test_results: [...testResults, {
          test_id: composerId,
          score,
          total,
          percentage,
          created_at: new Date(),
        }],
      });
    }
    
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
