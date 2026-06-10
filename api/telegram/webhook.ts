import type { VercelRequest, VercelResponse } from '@vercel/node';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const APP_URL = process.env.VITE_APP_URL || 'https://your-app.vercel.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Проверка секрета вебхука
  const secret = req.headers['x-telegram-bot-api-secret-token'];
  if (secret !== WEBHOOK_SECRET) {
    return res.status(403).json({ error: 'Invalid secret' });
  }

  const update = req.body;
  
  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text || '';
    
    if (text === '/start') {
      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: `🎵 Добро пожаловать в Музлит-Репетитор!\n\nЯ помогу тебе подготовиться к экзамену по русской музыкальной литературе.\n\nНажми на кнопку ниже, чтобы открыть приложение:`,
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Открыть Mini App', web_app: { url: APP_URL } }
          ]]
        }
      };
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
    } else if (text === '/help') {
      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: `📚 Как пользоваться приложением:\n\n1. Выбери программу обучения (ДООП или ФГТ)\n2. Укажи специализацию и класс\n3. Изучай композиторов, проходи тесты и аудиовикторину\n4. Готовься по экзаменационным билетам\n5. Задавай вопросы ИИ-ассистенту\n\nУдачи на экзамене! 🎵`,
      };
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
    } else {
      // Ответ на любое другое сообщение
      const response = {
        method: 'sendMessage',
        chat_id: chatId,
        text: `📖 Открой приложение, чтобы начать подготовку к экзамену по музыкальной литературе!\n\nНажми на кнопку ниже:`,
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Открыть Mini App', web_app: { url: APP_URL } }
          ]]
        }
      };
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
    }
  }
  
  return res.status(200).json({ ok: true });
}
