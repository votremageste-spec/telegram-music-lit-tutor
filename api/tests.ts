import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DOOPTests, FGTTests } from '../src/data/data.js';
import { testResultsCollection } from './_lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /api/tests?program=DOOP&grade=7
  if (req.method === 'GET') {
    const { program, grade } = req.query;
    const tests = program === 'FGT' ? FGTTests : DOOPTests;
    
    let filtered = tests;
    if (grade) {
      filtered = tests.filter(t => t.grade === Number(grade));
    }
    
    return res.status(200).json({ success: true, data: filtered });
  }

  // POST /api/test-result - сохранение результата теста
  if (req.method === 'POST') {
    const { telegramId, testId, title, score, total, answers, percentage } = req.body;
    
    const result = {
      test_id: testId,
      title,
      score,
      total,
      answers,
      percentage,
      created_at: new Date(),
    };
    
    await testResultsCollection.add({
      user_id: telegramId,
      ...result,
    });
    
    // Обновляем общий прогресс
    const progressRef = testResultsCollection.parent?.collection('progress').doc(String(telegramId));
    if (progressRef) {
      const progressDoc = await progressRef.get();
      const existingResults = progressDoc.data()?.test_results || [];
      await progressRef.update({
        test_results: [...existingResults, result],
        overall_progress: calculateOverallProgress(progressDoc.data()),
        updated_at: new Date(),
      });
    }
    
    return res.status(200).json({ success: true, data: result });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function calculateOverallProgress(progressData: any): number {
  // Упрощённый расчёт общего прогресса
  let total = 0;
  let count = 0;
  
  if (progressData?.learned_composers) {
    total += (progressData.learned_composers.length / 10) * 100;
    count++;
  }
  if (progressData?.learned_tickets) {
    total += (progressData.learned_tickets.length / 15) * 100;
    count++;
  }
  if (progressData?.test_results?.length) {
    const avgScore = progressData.test_results.reduce((sum: number, t: any) => sum + t.percentage, 0) / progressData.test_results.length;
    total += avgScore;
    count++;
  }
  
  return count > 0 ? Math.round(total / count) : 0;
}
