import React, { useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { api } from '../services/api';

interface ProfilePageProps {
  onComplete: (profile: any) => void;
}

type Program = 'DOOP' | 'FGT';

type SpecializationOption = {
  value: string;
  emoji: string;
  title: string;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ onComplete }) => {
  const { user, showAlert, hapticFeedback } = useTelegram();

  const [program, setProgram] = useState<Program>('DOOP');
  const [specialization, setSpecialization] = useState('');
  const [grade, setGrade] = useState(7);
  const [loading, setLoading] = useState(false);

  const specializations: Record<Program, SpecializationOption[]> = {
    DOOP: [
      {
        value: 'instrumentalist',
        emoji: '🎹',
        title: 'Инструменталист / Хоровик',
      },
      {
        value: 'vocalist',
        emoji: '🎤',
        title: 'Вокалист',
      },
      {
        value: 'folklore',
        emoji: '🎭',
        title: 'Фольклор',
      },
    ],
    FGT: [
      {
        value: 'instrumentalist',
        emoji: '🎹',
        title: 'Инструменталист / Хоровик',
      },
      {
        value: 'vocalist',
        emoji: '🎤',
        title: 'Вокалист',
      },
    ],
  };

  const grades = [4, 5, 6, 7, 8];

  const handleProgramChange = (selectedProgram: Program) => {
    setProgram(selectedProgram);

    // При смене программы сбрасываем специализацию,
    // потому что у ДООП и ФГТ разные наборы вариантов.
    setSpecialization('');
  };

  const handleSubmit = async () => {
    if (!specialization) {
      showAlert('Пожалуйста, выберите специализацию');
      return;
    }

    setLoading(true);
    hapticFeedback.medium();

    const telegramId = user?.id ?? 100000001;

    const selectedSpecialization = specializations[program].find(
      (item) => item.value === specialization
    );

    const profile = {
      telegram_id: telegramId,
      first_name: user?.first_name || 'Ученик',
      username: user?.username || 'demo_user',
      program,
      program_ru: program === 'DOOP' ? 'ДООП' : 'ФГТ',
      specialization,
      specialization_ru: selectedSpecialization?.title || specialization,
      grade,
      created_at: new Date(),
      updated_at: new Date(),
    };

    try {
      const response = await api.createUser(profile);

      if (!response.success) {
        console.warn(
          'Профиль не сохранён на сервере, используем локальное сохранение'
        );
      }

      localStorage.setItem('userProfile', JSON.stringify(profile));
      hapticFeedback.success();
      onComplete(profile);
    } catch (error) {
      console.warn('Ошибка соединения, используем локальное сохранение', error);

      localStorage.setItem('userProfile', JSON.stringify(profile));
      onComplete(profile);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>🎵 МУЗЛИТ-РЕПЕТИТОР</h1>

        <p>Добро пожаловать, {user?.first_name || 'ученик'}!</p>

        <p style={{ fontSize: '12px', marginTop: '8px' }}>
          Готовься к экзамену по русской музыкальной литературе
        </p>
      </div>

      <div className="profile-form">
        <div className="form-section">
          <h3>Выберите программу обучения</h3>

          <div className="program-buttons">
            <button
              type="button"
              className={`program-btn ${program === 'DOOP' ? 'active' : ''}`}
              onClick={() => handleProgramChange('DOOP')}
            >
              <span className="option-emoji">📚</span>
              <span className="option-title">ДООП</span>
              <span className="option-subtitle">
                Общеразвивающая программа
              </span>
            </button>

            <button
              type="button"
              className={`program-btn ${program === 'FGT' ? 'active' : ''}`}
              onClick={() => handleProgramChange('FGT')}
            >
              <span className="option-emoji">🎓</span>
              <span className="option-title">ФГТ</span>
              <span className="option-subtitle">
                Предпрофессиональная программа
              </span>
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>Ваша специализация</h3>

          <div className="specialization-buttons">
            {specializations[program].map((spec) => (
              <button
                type="button"
                key={spec.value}
                className={`spec-btn ${
                  specialization === spec.value ? 'active' : ''
                }`}
                onClick={() => setSpecialization(spec.value)}
              >
                <span className="option-emoji">{spec.emoji}</span>
                <span className="option-title">{spec.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Ваш класс</h3>

          <div className="grade-buttons">
            {grades.map((g) => (
              <button
                type="button"
                key={g}
                className={`grade-btn ${grade === g ? 'active' : ''}`}
                onClick={() => setGrade(g)}
              >
                {g} класс
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="start-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Сохранение...' : '🚀 Начать подготовку к экзамену'}
        </button>
      </div>
    </div>
  );
};
