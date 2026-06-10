import React, { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { api } from '../services/api';
import { DOOPComposers, FGTComposers, DOOPTickets, FGTickets } from '../data/data';

interface ProgressPageProps {
  userProfile: any;
  onBack: () => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ userProfile, onBack }) => {
  const { hapticFeedback } = useTelegram();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);

  useEffect(() => {
    const loadProgress = async () => {
      const response = await api.getProgress(userProfile?.telegram_id);
      if (response.success && response.data) {
        setProgress(response.data);
        
        // Анализ слабых мест на основе результатов тестов
        const testResults = response.data.test_results || [];
        const lowScores = testResults.filter((r: any) => r.percentage < 60);
        if (lowScores.length > 0) {
          setWeakTopics(['Рекомендуется повторить темы, где результат ниже 60%']);
        } else {
          setWeakTopics(['Хорошие результаты! Продолжайте в том же духе']);
        }
      }
      setLoading(false);
    };
    loadProgress();
  }, [userProfile]);

  const allComposers = userProfile?.program === 'FGT' ? FGTComposers : DOOPComposers;
  const allTickets = userProfile?.program === 'FGT' ? FGTickets : DOOPTickets;
  
  const learnedComposers = progress?.learned_composers || [];
  const learnedTickets = progress?.learned_tickets || [];
  
  const composersProgress = Math.round((learnedComposers.length / allComposers.length) * 100) || 0;
  const ticketsProgress = Math.round((learnedTickets.length / allTickets.length) * 100) || 0;
  const overallProgress = Math.round((composersProgress + ticketsProgress) / 2);

  const handleRefresh = () => {
    hapticFeedback.light();
    window.location.reload();
  };

  if (loading) {
    return <div className="loading-container">Загрузка прогресса...</div>;
  }

  return (
    <div className="progress-page">
      <button className="back-button" onClick={onBack}>← Назад</button>
      <h1>📊 Мой прогресс</h1>

      <div className="progress-overview">
        <div className="overall-progress">
          <div className="progress-circle">
            <span className="progress-number">{overallProgress}%</span>
          </div>
          <p>Общий прогресс</p>
        </div>

        <div className="progress-stats">
          <div className="stat-card">
            <h3>📚 Композиторы</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${composersProgress}%` }}></div>
            </div>
            <p>{learnedComposers.length} из {allComposers.length} изучено</p>
          </div>

          <div className="stat-card">
            <h3>📝 Экзаменационные билеты</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${ticketsProgress}%` }}></div>
            </div>
            <p>{learnedTickets.length} из {allTickets.length} выучено</p>
          </div>
        </div>
      </div>

      <div className="recent-results">
        <h2>Последние результаты</h2>
        
        {progress?.test_results && progress.test_results.length > 0 && (
          <div className="results-section">
            <h3>✍️ Тесты</h3>
            {progress.test_results.slice(-5).reverse().map((result: any, idx: number) => (
              <div key={idx} className="result-item">
                <span className="result-title">{result.test_id}</span>
                <span className={`result-score ${result.percentage >= 70 ? 'high' : result.percentage >= 50 ? 'medium' : 'low'}`}>
                  {result.score}/{result.total} ({result.percentage}%)
                </span>
              </div>
            ))}
          </div>
        )}

        {progress?.audio_quiz_results && progress.audio_quiz_results.length > 0 && (
          <div className="results-section">
            <h3>🎧 Аудиовикторины</h3>
            {progress.audio_quiz_results.slice(-5).reverse().map((result: any, idx: number) => (
              <div key={idx} className="result-item">
                <span className="result-title">{result.mode === 'training' ? 'Тренировка' : 'Экзамен'}</span>
                <span className={`result-score ${result.percentage >= 70 ? 'high' : result.percentage >= 50 ? 'medium' : 'low'}`}>
                  {result.score}/{result.total} ({result.percentage}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="weak-topics">
        <h2>💡 Рекомендации</h2>
        <ul>
          {weakTopics.map((topic, idx) => (
            <li key={idx}>{topic}</li>
          ))}
          {learnedComposers.length < allComposers.length && (
            <li>📖 Изучите оставшихся композиторов</li>
          )}
          {learnedTickets.length < allTickets.length && (
            <li>📝 Повторите экзаменационные билеты</li>
          )}
        </ul>
      </div>

      <button className="refresh-btn" onClick={handleRefresh}>
        🔄 Обновить
      </button>
    </div>
  );
};
