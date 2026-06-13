import React, { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { DOOPTickets, FGTickets, type Ticket } from '../data/tickets';
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

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [openedAnswers, setOpenedAnswers] = useState<number[]>([]);
  const [isLearned, setIsLearned] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);

      const allTickets = userProfile?.program === 'FGT' ? FGTickets : DOOPTickets;

      // ticketId может прийти строкой, а ticket.id у нас число.
      // Поэтому сравниваем их как строки.
      const foundTicket = allTickets.find((item) => {
        return String(item.id) === String(ticketId);
      });

      setTicket(foundTicket ?? null);

      try {
        const response = await api.getProgress(userProfile?.telegram_id);

        if (
          response.success &&
          response.data?.learnedTickets?.includes(String(ticketId))
        ) {
          setIsLearned(true);
        }
      } catch (error) {
        console.error('Ошибка загрузки прогресса билета:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId, userProfile?.program, userProfile?.telegram_id]);

  const toggleAnswer = (questionId: number) => {
    setOpenedAnswers((currentOpenedAnswers) => {
      if (currentOpenedAnswers.includes(questionId)) {
        return currentOpenedAnswers.filter((id) => id !== questionId);
      }

      return [...currentOpenedAnswers, questionId];
    });
  };

  const handleMarkLearned = async () => {
    const confirmed = await showConfirm('Отметить билет как выученный?');

    if (!confirmed) {
      return;
    }

    const response = await api.markTicketLearned(
      userProfile?.telegram_id,
      String(ticketId)
    );

    if (response.success) {
      setIsLearned(true);
      hapticFeedback.success();
      showAlert('Билет отмечен как выученный!');
    } else {
      showAlert('Ошибка при сохранении');
    }
  };

  if (loading) {
    return <div className="loading-container">Загрузка билета...</div>;
  }

  if (!ticket) {
    return (
      <div className="ticket-detail-page">
        <button className="back-button" onClick={onBack}>
          ← Назад
        </button>

        <h1>Билет не найден</h1>

        <p>
          Возможно, билет пока не добавлен для выбранной программы.
        </p>
      </div>
    );
  }

  return (
    <div className="ticket-detail-page">
      <button className="back-button" onClick={onBack}>
        ← Назад
      </button>

      <h1>{ticket.title}</h1>

      {ticket.questions.map((question) => {
        const isAnswerOpened = openedAnswers.includes(question.id);

        return (
          <div className="ticket-section" key={question.id}>
            <h3>
              {question.isAudio
                ? 'Вопрос 3 (Аудиовикторина)'
                : `Вопрос ${question.id}`}
            </h3>

            <div className="question-text">
              {question.text}
            </div>

            <button
              className="show-answer-btn"
              onClick={() => toggleAnswer(question.id)}
            >
              {isAnswerOpened ? 'Скрыть ответ' : 'Показать ответ'}
            </button>

            {isAnswerOpened && (
              <div className="answer-content">
                <p style={{ whiteSpace: 'pre-line' }}>
                  {question.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}

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
