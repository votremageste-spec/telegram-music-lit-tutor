import React, { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { DOOPTickets, FGTickets, AudioFragmentsList } from '../data/data';
import { api } from '../services/api';

interface TicketDetailPageProps {
  ticketId: string;
  userProfile: any;
  onBack: () => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({
  ticketId,
  userProfile,
  onBack,
}) => {
  const { showAlert, hapticFeedback, showConfirm } = useTelegram();
  const [ticket, setTicket] = useState<any>(null);
  const [showAnswer1, setShowAnswer1] = useState(false);
  const [showAnswer2, setShowAnswer2] = useState(false);
  const [audioAnswer, setAudioAnswer] = useState('');
  const [audioChecked, setAudioChecked] = useState(false);
  const [audioResult, setAudioResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [isLearned, setIsLearned] = useState(false);

  useEffect(() => {
    const allTickets = userProfile?.program === 'FGT' ? FGTickets : DOOPTickets;
    const found = allTickets.find(t => t.id === ticketId);
    setTicket(found);
    
    const checkLearned = async () => {
      const response = await api.getProgress(userProfile?.telegram_id);
      if (response.success && response.data?.learnedTickets?.includes(ticketId)) {
        setIsLearned(true);
      }
    };
    checkLearned();
  }, [ticketId, userProfile]);

  const handleCheckAudio = () => {
    if (!ticket.audioFragmentId) return;
    
    const fragment = AudioFragmentsList.find(f => f.id === ticket.audioFragmentId);
    if (!fragment) return;

    const isCorrect = audioAnswer.toLowerCase().includes(fragment.title.toLowerCase()) ||
                      audioAnswer.toLowerCase().includes(fragment.composer.toLowerCase());
    
    setAudioResult({
      correct: isCorrect,
      explanation: `Правильный ответ: "${fragment.title}", композитор ${fragment.composer}`
    });
    setAudioChecked(true);
    hapticFeedback[isCorrect ? 'success' : 'error']();
  };

  const handleMarkLearned = async () => {
    const confirmed = await showConfirm('Отметить билет как выученный?');
    if (!confirmed) return;

    const response = await api.markTicketLearned(userProfile?.telegram_id, ticketId);
    if (response.success) {
      setIsLearned(true);
      hapticFeedback.success();
      showAlert('Билет отмечен как выученный!');
    } else {
      showAlert('Ошибка при сохранении');
    }
  };

  if (!ticket) {
    return <div className="loading-container">Загрузка билета...</div>;
  }

  const audioFragment = ticket.audioFragmentId 
    ? AudioFragmentsList.find(f => f.id === ticket.audioFragmentId)
    : null;

  return (
    <div className="ticket-detail-page">
      <button className="back-button" onClick={onBack}>← Назад</button>

      <h1>Экзаменационный билет №{ticket.number}</h1>

      <div className="ticket-section">
        <h3>Вопрос 1</h3>
        <div className="question-text">{ticket.question1}</div>
        <button className="show-answer-btn" onClick={() => setShowAnswer1(!showAnswer1)}>
          {showAnswer1 ? 'Скрыть ответ' : 'Показать ответ'}
        </button>
        {showAnswer1 && (
          <div className="answer-content">
            <p>{ticket.answer1}</p>
          </div>
        )}
      </div>

      <div className="ticket-section">
        <h3>Вопрос 2</h3>
        <div className="question-text">{ticket.question2}</div>
        <button className="show-answer-btn" onClick={() => setShowAnswer2(!showAnswer2)}>
          {showAnswer2 ? 'Скрыть ответ' : 'Показать ответ'}
        </button>
        {showAnswer2 && (
          <div className="answer-content">
            <p>{ticket.answer2}</p>
          </div>
        )}
      </div>

      {audioFragment && (
        <div className="ticket-section">
          <h3>Вопрос 3 (Аудиовикторина)</h3>
          <div className="audio-quiz">
            <audio controls src={audioFragment.path} className="audio-controls" />
            <p className="audio-hint">Узнайте произведение и композитора</p>
            <input
              type="text"
              className="audio-answer-input"
              placeholder="Ваш ответ..."
              value={audioAnswer}
              onChange={(e) => setAudioAnswer(e.target.value)}
              disabled={audioChecked}
            />
            <button 
              className="check-audio-btn" 
              onClick={handleCheckAudio}
              disabled={audioChecked}
            >
              Проверить
            </button>
            {audioResult && (
              <div className={`audio-result ${audioResult.correct ? 'correct' : 'incorrect'}`}>
                <strong>{audioResult.correct ? '✅ Верно!' : '❌ Неверно!'}</strong>
                <p>{audioResult.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <button 
        className={`mark-learned-btn ${isLearned ? 'learned' : ''}`}
        onClick={handleMarkLearned}
        disabled={isLearned}
      >
        {isLearned ? '✅ Билет выучен' : '📖 Отметить билет как выученный'}
      </button>
    </div>
  );
};
