import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DOOPTickets, FGTickets } from '../src/data/data.js';
import { progressCollection } from './_lib/firebase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /api/tickets?program=DOOP - получить билеты по программе
  if (req.method === 'GET') {
    const { program, ticketId } = req.query;
    
    if (ticketId) {
      // Получить конкретный билет
      const allTickets = program === 'FGT' ? FGTickets : DOOPTickets;
      const ticket = allTickets.find(t => t.id === ticketId);
      return res.status(200).json({ success: true, data: ticket || null });
    }
    
    const tickets = program === 'FGT' ? FGTickets : DOOPTickets;
    return res.status(200).json({ success: true, data: tickets });
  }

  // POST /api/tickets/learned - отметить билет как выученный
  if (req.method === 'POST') {
    const { telegramId, ticketId } = req.body;
    
    if (!telegramId || !ticketId) {
      return res.status(400).json({ error: 'telegramId and ticketId are required' });
    }
    
    const progressRef = progressCollection.doc(String(telegramId));
    const doc = await progressRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      const learnedTickets = data?.learned_tickets || [];
      
      if (!learnedTickets.includes(ticketId)) {
        const updatedTickets = [...learnedTickets, ticketId];
        await progressRef.update({
          learned_tickets: updatedTickets,
          updated_at: new Date(),
        });
      }
    } else {
      await progressRef.set({
        user_id: telegramId,
        learned_composers: [],
        learned_tickets: [ticketId],
        audio_quiz_results: [],
        test_results: [],
        overall_progress: 0,
        updated_at: new Date(),
      });
    }
    
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
