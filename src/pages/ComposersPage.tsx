import React, { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { DOOPComposers, FGTComposers } from '../data/data';
import { Composer } from '../types';

interface ComposersPageProps {
  onNavigate: (page: string, params?: any) => void;
  userProfile: any;
}

export const ComposersPage: React.FC<ComposersPageProps> = ({ onNavigate, userProfile }) => {
  const { hapticFeedback } = useTelegram();
  const [composers, setComposers] = useState<Composer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allComposers = userProfile?.program === 'FGT' ? FGTComposers : DOOPComposers;
    const filtered = allComposers.filter(c => c.grades.includes(userProfile?.grade));
    setComposers(filtered);
    setLoading(false);
  }, [userProfile]);

  const handleComposerClick = (composerId: string) => {
    hapticFeedback.light();
    onNavigate('composer-detail', { selectedComposerId: composerId });
  };

  if (loading) {
    return <div className="loading-container">Загрузка композиторов...</div>;
  }

  return (
    <div className="composers-page">
      <h1>🎵 Композиторы</h1>
      <p className="subtitle">
        {userProfile?.program_ru}, {userProfile?.grade} класс
      </p>

      {composers.length === 0 ? (
        <div className="empty-state">
          <p>Нет композиторов для выбранной программы и класса</p>
        </div>
      ) : (
        <div className="composers-grid">
          {composers.map((composer) => (
            <div
              key={composer.id}
              className="composer-card"
              onClick={() => handleComposerClick(composer.id)}
            >
              <div className="composer-card-header">
                <h3>{composer.name}</h3>
                <p>{composer.years}</p>
              </div>
              <div className="composer-card-content">
                <p>{composer.shortBio}</p>
                <div className="composer-genres">
                  {composer.mainGenres.slice(0, 3).map((genre, idx) => (
                    <span key={idx} className="genre-tag">{genre}</span>
                  ))}
                </div>
                <button className="study-btn">📖 Изучить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
