import React from 'react';
import { useTelegram } from '../hooks/useTelegram';

interface TestResultPageProps {
  result: any;
  onNavigate: (page: string, params?: any) => void;
}

export const TestResultPage: React.FC<TestResultPageProps> = ({ result, onNavigate }) => {
  const { hapticFeedback } = useTelegram();

  const handleRetry = () => {
    hapticFeedback.light();
    onNavigate('tests');
  };

  const handleNextTest = () => {
    hapticFeedback.light();
    onNavigate('tests');
  };

  const handleMainMenu = () => {
    hapticFeedback.light();
    onNavigate('main');
  };

  return (
    <div className="test-result-page">
      <h1>📊 Результаты теста</h1>
      
      <div className="result-header">
        <h2>{result.title}</h2>
        <div className="result-score">
          {result.score} из {result.total}
        </div>
        <div className="result-percentage">
          {result.percentage}%
        </div>
      </div>

      <div className="result-details">
        <h3>Разбор вопросов:</h3>
        {result.questions.map((q: any, idx: number) => (
          <div key={idx} className={`result-question ${q.isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="question-text">
              <strong>Вопрос {idx + 1}:</strong> {q.text}
            </div>
            <div className="user-answer">
              Ваш ответ: {q.userAnswer !== undefined ? String.fromCharCode(65 + q.userAnswer) : '—'} ({q.options[q.userAnswer] || 'нет ответа'})
            </div>
            <div className="correct-answer">
              Правильный ответ: {String.fromCharCode(65 + q.correctAnswer)} ({q.options[q.correctAnswer]})
            </div>
            {q.explanation && (
              <div className="explanation">
                <strong>Пояснение:</strong> {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="result-actions">
        <button className="result-btn" onClick={handleRetry}>
          🔄 Пройти заново
        </button>
        <button className="result-btn" onClick={handleNextTest}>
          📚 Следующий тест
        </button>
        <button className="result-btn" onClick={handleMainMenu}>
          🏠 В главное меню
        </button>
      </div>
    </div>
  );
};
