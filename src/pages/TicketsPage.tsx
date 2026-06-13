import React, { useEffect, useMemo, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { DOOPTickets, FGTickets, type TicketProgram } from '../data/tickets';
import { api } from '../services/api';

interface TicketsPageProps {
  onNavigate: (page: string, params?: any) => void;
  userProfile: any;
}

export const TicketsPage: React.FC<TicketsPageProps> = ({
  onNavigate,
  userProfile,
}) => {
  const { hapticFeedback } = useTelegram();

  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Определяем программу ученика.
  // Если в профиле указано FGT — показываем ФГТ.
  // Во всех остальных случаях показываем ДООП.
  const program: TicketProgram = userProfile?.program === 'FGT' ? 'FGT' : 'DOOP';

  // Выбираем нужный набор билетов.
  const tickets = useMemo(() => {
    return program === 'FGT' ? FGTickets : DOOPTickets;
  }, [program]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);

        const response = await api.getProgress(userProfile?.telegram_id);

        if (response.success && response.data) {
          setProgress(response.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки прогресса:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [userProfile?.telegram_id]);

  const getTicketStatus = (ticketId: number) => {
    const ticketIdAsString = String(ticketId);

    if (progress?.learnedTickets?.includes(ticketIdAsString)) {
      return {
        status: 'learned',
        label: '✅ Выучен',
        className: 'status-learned',
      };
    }

    return {
      status: 'not_started',
      label: '📖 Не начат',
      className: 'status-not_started',
    };
  };

  const handleTicketClick = (ticketId: number) => {
    hapticFeedback.light();

    onNavigate('ticket-detail', {
      selectedTicketId: ticketId,
    });
  };

  if (loading) {
    return <div className="loading-container">Загрузка билетов...</div>;
  }

  return (
    <div className="tickets-page">
      <h1>📝 Экзаменационные билеты</h1>

      <p className="subtitle">
        {userProfile?.program_ru}, {userProfile?.grade} класс
      </p>

      <p className="subtitle">
        Найдено билетов: {tickets.length}
      </p>

      <div className="tickets-list">
        {tickets.map((ticket) => {
          const { label, className } = getTicketStatus(ticket.id);

          const firstQuestion = ticket.questions[0]?.text ?? 'Вопрос не указан';
          const secondQuestion = ticket.questions[1]?.text ?? 'Вопрос не указан';

          const hasAudioQuestion = ticket.questions.some(
            (question) => question.isAudio
          );

          return (
            <div
              key={`${ticket.program}-${ticket.id}`}
              className="ticket-card"
              onClick={() => handleTicketClick(ticket.id)}
            >
              <div className="ticket-header">
                <span className="ticket-number">{ticket.title}</span>
                <span className={`ticket-status ${className}`}>
                  {label}
                </span>
              </div>

              <div className="ticket-questions">
                <p>
                  Вопрос 1: {firstQuestion.substring(0, 60)}...
                </p>

                <p>
                  Вопрос 2: {secondQuestion.substring(0, 60)}...
                </p>

                {hasAudioQuestion && <p>🎧 Аудиовикторина</p>}
              </div>
            </div>
          );
        })}
      </div>

      {tickets.length === 0 && (
        <div className="empty-state">
          <p>Нет билетов для выбранной программы</p>
        </div>
      )}
    </div>
  );
};
