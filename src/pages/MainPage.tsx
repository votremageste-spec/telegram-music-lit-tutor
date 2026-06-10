import React from 'react';
import { useTelegram } from '../hooks/useTelegram';

interface MainPageProps {
  onNavigate: (page: string) => void;
  userProfile: any;
}

export const MainPage: React.FC<MainPageProps> = ({ onNavigate, userProfile }) => {
  const { user } = useTelegram();

  const getTheme = () => {
    if (userProfile?.program === 'FGT') {
      if (userProfile?.grade === 6) return 'Русская музыка I половины XIX века';
      if (userProfile?.grade === 7) return 'Русская музыка II половины XIX века';
      if (userProfile?.grade === 8) return 'Русская музыка рубежа XIX-XX веков';
    } else {
      if (userProfile?.grade === 7) return 'Русская музыка I половины XIX века';
      if (userProfile?.grade === 8) return 'Русская музыка II половины XIX века';
    }
    return 'Русская музыкальная литература';
  };

  const menuCards = [
    { id: 'composers', title: '📚 Композиторы', description: 'Изучай биографии, произведения и слушай музыку' },
    { id: 'audio', title: '🎧 Аудиовикторина', description: 'Узнавай произведения на слух' },
    { id: 'tickets', title: '📝 Экзаменационные билеты', description: 'Готовься по реальным билетам' },
    { id: 'tests', title: '✍️ Тесты', description: 'Проверяй свои знания' },
    ...(userProfile?.program === 'FGT' ? [{ id: 'project', title: '🎯 Реферат / проект', description: 'Темы рефератов', action: () => alert('Темы рефератов: И.С. Бах, Венская классическая школа и др.') }] : []),
    { id: 'assistant', title: '🤖 ИИ-ассистент', description: 'Задавай вопросы' },
    { id: 'progress', title: '📊 Прогресс', description: 'Следи за успехами' },
  ];

  const overallProgress = 35;

  return (
    <div className="main-page">
      <div className="welcome-section">
        <h1>Привет, {user?.first_name || userProfile?.first_name}!</h1>
        <div className="user-info-card">
          <p>📖 {userProfile?.program_ru}</p>
          <p>🎵 {userProfile?.specialization === 'instrumentalist' ? 'Инструменталист' : 
                    userProfile?.specialization === 'vocalist' ? 'Вокалист/Хоровик' : 'Фольклор'}</p>
          <p>📚 {userProfile?.grade} класс</p>
        </div>
        <div style={{ marginTop: '12px' }}>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}>📖 Тема полугодия:</p>
          <p style={{ fontSize: '14px', fontWeight: '500' }}>{getTheme()}</p>
        </div>
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '14px', marginBottom: '8px' }}>📊 Общий прогресс:</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
          </div>
          <p style={{ fontSize: '12px', textAlign: 'right' }}>{overallProgress}%</p>
        </div>
      </div>

      <div className="menu-grid">
        {menuCards.map((card) => (
          <button
            key={card.id}
            className="menu-card"
            onClick={() => card.action ? card.action() : onNavigate(card.id)}
          >
            <div className="card-content">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
