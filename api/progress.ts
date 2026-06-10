import type { VercelRequest, VercelResponse } from '@vercel/node';
import { progressCollection } from './_lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { telegramId } = req.query;

  // GET /api/progress/:telegramId
  if (req.method === 'GET' && telegramId) {
    const doc = await progressCollection.doc(String(telegramId)).get();
    if (!doc.exists) {
      return res.status(200).json({ success: true, data: null });
    }
    return res.status(200).json({ success: true, data: doc.data() });
  }

  // PUT /api/progress/:telegramId
  if (req.method === 'PUT' && telegramId) {
    const progressData = req.body;
    await progressCollection.doc(String(telegramId)).set(progressData, { merge: true });
    return res.status(200).json({ success: true });
  }

  // POST /api/progress/:telegramId - обновление прогресса (добавление выученного)
  if (req.method === 'POST' && telegramId) {
    const { learnedComposer, learnedTicket } = req.body;
    const docRef = progressCollection.doc(String(telegramId));
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      const updates: any = { updated_at: new Date() };
      
      if (learnedComposer && !data?.learned_composers?.includes(learnedComposer)) {
        updates.learned_composers = [...(data?.learned_composers || []), learnedComposer];
      }
      
      if (learnedTicket && !data?.learned_tickets?.includes(learnedTicket)) {
        updates.learned_tickets = [...(data?.learned_tickets || []), learnedTicket];
      }
      
      await docRef.update(updates);
    }
    
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
