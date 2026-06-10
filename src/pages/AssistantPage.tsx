import React, { useState, useRef, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { api } from '../services/api';
import { ChatMessage } from '../components/ChatMessage';

interface AssistantPageProps {
  userProfile: any;
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({ userProfile, onBack }) => {
  const { showAlert, hapticFeedback } = useTelegram();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я ИИ-ассистент по музыкальной литературе. Задавай любые вопросы по композиторам, произведениям, экзамену. Я помогу подготовиться!',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    { text: 'Объясни тему простыми словами', context: 'Объясни тему русской музыкальной литературы простыми словами для ученика' },
    { text: 'Помоги подготовить билет', context: 'Помоги подготовиться к экзаменационному билету по русской музыкальной литературе' },
    { text: 'Проверь мой ответ', context: 'Проверь мой ответ на вопрос по музыкальной литературе. Я напишу свой ответ.' },
    { text: 'Сделай краткий конспект', context: 'Сделай краткий конспект по теме русской музыкальной литературы' },
    { text: 'Спроси меня как на экзамене', context: 'Задай мне вопросы по музыкальной литературе как на экзамене. Я попробую ответить.' },
  ];

  const sendMessage = async (content: string, isQuickAction = false) => {
    if (!content.trim() && !isQuickAction) return;

    const userMessage: Message = {
      role: 'user',
      content: isQuickAction ? content : content.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    hapticFeedback.light();

    try {
      const context = {
        program: userProfile?.program,
        program_ru: userProfile?.program_ru,
        grade: userProfile?.grade,
        specialization: userProfile?.specialization,
        mode: 'assistant',
      };

      const history = messages.concat(userMessage).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.sendMessageToAssistant(history, context);
      
      if (response.success && response.data) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.response || 'Извините, не удалось получить ответ.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Ошибка API');
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте позже.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question, true);
  };

  return (
    <div className="assistant-page">
      <button className="back-button" onClick={onBack}>← Назад</button>
      <h1>🤖 ИИ-ассистент</h1>

      <div className="chat-container">
        <div className="messages-list">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
          {isLoading && (
            <div className="message message-assistant loading-message">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-buttons">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              className="quick-btn"
              onClick={() => handleQuickQuestion(q.text)}
              disabled={isLoading}
            >
              {q.text}
            </button>
          ))}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Задайте вопрос..."
            disabled={isLoading}
          />
          <button className="send-btn" onClick={handleSend} disabled={isLoading}>
            {isLoading ? '✍️' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
};
