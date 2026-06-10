import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callGroqAPI, SYSTEM_PROMPT } from './_lib/groq.js';

// Импортируем базу знаний (упрощённая версия для API)
const MUSIC_LIT_KB = {
  composers: {
    glinka: {
      name: 'Михаил Иванович Глинка',
      years: '1804-1857',
      info: 'Основоположник русской классической музыки. Создал оперы "Иван Сусанин", "Руслан и Людмила", симфоническую фантазию "Камаринская".'
    },
    borodin: {
      name: 'Александр Порфирьевич Бородин',
      years: '1833-1887',
      info: 'Композитор и учёный-химик, член "Могучей кучки". Автор оперы "Князь Игорь", "Богатырской" симфонии.'
    },
    mussorgsky: {
      name: 'Модест Петрович Мусоргский',
      years: '1839-1881',
      info: 'Русский композитор, член "Могучей кучки". Автор опер "Борис Годунов", "Хованщина", цикла "Картинки с выставки".'
    },
    tchaikovsky: {
      name: 'Пётр Ильич Чайковский',
      years: '1840-1893',
      info: 'Великий русский композитор. Автор опер "Евгений Онегин", "Пиковая дама", балетов "Лебединое озеро", "Щелкунчик".'
    },
    rachmaninov: {
      name: 'Сергей Васильевич Рахманинов',
      years: '1873-1943',
      info: 'Русский композитор, пианист, дирижёр. Автор Второго концерта для фортепиано с оркестром, "Вокализа".'
    }
  },
  opera_works: {
    'Иван Сусанин': 'Опера М.И. Глинки о подвиге крестьянина в Смутное время. Завершается хором "Славься".',
    'Князь Игорь': 'Опера А.П. Бородина по "Слову о полку Игореве". Известна арией Игоря и половецкими плясками.',
    'Борис Годунов': 'Опера М.П. Мусоргского о царе Борисе. Народная музыкальная драма.',
    'Евгений Онегин': 'Опера П.И. Чайковского по роману Пушкина. "Лирические сцены".'
  },
  symphonic_works: {
    'Камаринская': 'Фантазия Глинки на две русские народные темы. Основа русского симфонизма.',
    'Богатырская симфония': 'Симфония №2 Бородина. Воплощение эпической мощи Руси.',
    'Картинки с выставки': 'Фортепианный цикл Мусоргского, посвящённый памяти художника Гартмана.'
  },
  terms: {
    опера: 'Музыкально-театральное произведение, где действующие лица поют в сопровождении оркестра.',
    симфония: 'Крупное оркестровое произведение, обычно из 4 частей.',
    романс: 'Вокальное произведение для голоса с инструментальным сопровождением.',
    балет: 'Музыкально-театральное произведение, где содержание раскрывается через танец и пантомиму.'
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Формируем контекст из профиля пользователя
    let contextPrompt = '';
    if (context) {
      contextPrompt = `\n\nИНФОРМАЦИЯ ОБ УЧЕНИКЕ:
- Программа: ${context.program_ru || 'не указана'}
- Класс: ${context.grade || 'не указан'}
- Специализация: ${context.specialization || 'не указана'}

Вся информация выше важна для персонализации ответа. Учитывай программу и класс ученика при ответе.`;

      if (context.program === 'DOOP') {
        contextPrompt += '\n\nИспользуй ТОЛЬКО материалы программы ДООП (общеразвивающей). Не углубляйся в профессиональные детали.';
      } else if (context.program === 'FGT') {
        contextPrompt += '\n\nИспользуй материалы программы ФГТ (предпрофессиональной). Можно давать более глубокий анализ.';
      }
    }

    // Добавляем релевантные данные из базы знаний
    const kbContext = '\n\nБАЗА ЗНАНИЙ (используй эти факты):\n' + JSON.stringify(MUSIC_LIT_KB, null, 2);

    const fullMessages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + contextPrompt + kbContext,
      },
      ...messages,
    ];

    const response = await callGroqAPI(fullMessages);

    return res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Assistant API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
