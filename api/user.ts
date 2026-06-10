import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, usersCollection } from './_lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { telegramId } = req.query;

  try {
    // GET /api/user/:telegramId
    if (req.method === 'GET' && telegramId) {
      const userDoc = await usersCollection.doc(String(telegramId)).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(200).json({ success: true, data: userDoc.data() });
    }

    // POST /api/user - создание пользователя
    if (req.method === 'POST') {
      const userData = req.body;
      
      if (!userData.telegram_id) {
        return res.status(400).json({ error: 'telegram_id is required' });
      }

      const userRef = usersCollection.doc(String(userData.telegram_id));
      const userDoc = await userRef.get();

      const now = new Date();
      const userToSave = {
        ...userData,
        created_at: userDoc.exists ? userDoc.data()?.created_at : now,
        updated_at: now,
      };

      await userRef.set(userToSave, { merge: true });

      // Создаём запись прогресса
      const progressRef = db.collection('progress').doc(String(userData.telegram_id));
      const progressDoc = await progressRef.get();
      
      if (!progressDoc.exists) {
        await progressRef.set({
          user_id: userData.telegram_id,
          learned_composers: [],
          learned_tickets: [],
          audio_quiz_results: [],
          test_results: [],
          overall_progress: 0,
          updated_at: now,
        });
      }

      return res.status(200).json({ success: true, data: userToSave });
    }

    // PUT /api/user/:telegramId - обновление пользователя
    if (req.method === 'PUT' && telegramId) {
      const userData = req.body;
      const userRef = usersCollection.doc(String(telegramId));
      
      await userRef.update({
        ...userData,
        updated_at: new Date(),
      });

      const updatedDoc = await userRef.get();
      return res.status(200).json({ success: true, data: updatedDoc.data() });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('User API Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
