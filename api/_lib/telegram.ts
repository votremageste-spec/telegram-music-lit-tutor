export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup,
    }),
  });
  return response.json();
}
