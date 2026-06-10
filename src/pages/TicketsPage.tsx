import React, { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { DOOPTickets, FGTickets } from '../data/data';
import { api } from '../services/api';

interface TicketsPageProps {
  onNavigate: (page: string, params?: any) => void;
  userProfile: any;
}

export const TicketsPage: React.FC<TicketsPageProps> = ({ onNavigate, userProfile }) => {
  const { hapticFeedback } = useTelegram();
  const [tickets, setTickets] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allTickets = userProfile?.program === 'FGT' ? FGTickets : DOOPTickets;
    setTickets(allTickets);
    
    const loadProgress = async () => {
      const response = await api.getProgress(userProfile?.telegram_id);
      if (response.success && response.data) {
        setProgress(response.data);
      }
      setLoading(false);
    };
    loadProgress();
  }, [userProfile]);

  const getTicketStatus = (ticketId: string) => {
    if (progress?.learnedTickets?.includes(ticketId)) {
      return { status: 'learned', label: '✅ Выучен', className: 'status-learned' };
    }
    return { status: 'not_started', label: '📖 Не начат', className: 'status-not_started' };
  };

  const handleTicketClick = (ticketId: string) => {
    hapticFeedback.light();
    onNavigate('ticket-detail', { selectedTicketId: ticketId });
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

      <div className="tickets-list">
        {tickets.map((ticket) => {
          const { label, className } = getTicketStatus(ticket.id);
          return (
            <div
              key={ticket.id}
              className="ticket-card"
              onClick={() => handleTicketClick(ticket.id)}
            >
              <div className="ticket-header">
                <span className="ticket-number">Билет №{ticket.number}</span>
                <span className={`ticket-status ${className}`}>{label}</span>
              </div>
              <div className="ticket-questions">
                <p>Вопрос 1: {ticket.question1.substring(0, 60)}...</p>
                <p>Вопрос 2: {ticket.question2.substring(0, 60)}...</p>
                {ticket.audioFragmentId && <p>🎧 Аудиовикторина</p>}
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
