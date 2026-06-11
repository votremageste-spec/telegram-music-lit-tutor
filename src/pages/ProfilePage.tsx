import React, { useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { api } from '../services/api';

interface ProfilePageProps {
  onComplete: (profile: any) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onComplete }) => {
  const { user, showAlert, hapticFeedback } = useTelegram();
  const [program, setProgram] = useState<'DOOP' | 'FGT'>('DOOP');
  const [specialization, setSpecialization] = useState('');
  const [grade, setGrade] = useState(7);
  const [loading, setLoading] = useState(false);

  const specializations = {
    DOOP: [
      { value: 'instrumentalist', label: '🎹 Инструменталист' },
      { value: 'vocalist', label: '🎤 Вокалист/Хоровик' },
      { value: 'folklore', label: '🎭 Фольклор' },
    ],
    FGT: [
      { value: 'instrumentalist', label: '🎹 Инструменталист' },
      { value: 'vocalist', label: '🎤 Вокалист/Хоровик' },
    ],
  };

  const grades = [4, 5, 6, 7, 8];

  const handleSubmit = async () => {
  if (!specialization) {
    showAlert('Пожалуйста, выберите специализацию');
    return;
  }

  setLoading(true);
  hapticFeedback.medium();

  // В Telegram берём настоящий id пользователя.
  // В обычном браузере используем тестовый id, чтобы приложение можно было проверять.
  const telegramId = user?.id ?? 100000001;

  const profile = {
    telegram_id: telegramId,
    first_name: user?.first_name || 'Ученик',
    username: user?.username || 'demo_user',
    program,
    program_ru: program === 'DOOP' ? 'ДООП' : 'ФГТ',
    specialization,
    grade,
    created_at: new Date(),
    updated_at: new Date(),
  };

  try {
    // Сначала пробуем сохранить на сервере.
    // Если сервер пока не настроен, приложение всё равно продолжит работу.
    const response = await api.createUser(profile);

    if (!response.success) {
      console.warn('Профиль не сохранён на сервере, используем локальное сохранение');
    }

    // Главное для MVP: сохраняем локально и переходим дальше.
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
        <p style={{ fontSize: '12px', marginTop: '8px' }}>Готовься к экзамену по русской музыкальной литературе</p>
      </div>

      <div className="profile-form">
        <div className="form-section">
          <h3>Выберите программу обучения</h3>
          <div className="program-buttons">
            <button
              className={`program-btn ${program === 'DOOP' ? 'active' : ''}`}
              onClick={() => setProgram('DOOP')}
            >
              📚 ДООП
              <small>Общеразвивающая программа</small>
            </button>
            <button
              className={`program-btn ${program === 'FGT' ? 'active' : ''}`}
              onClick={() => setProgram('FGT')}
            >
              🎓 ФГТ
              <small>Предпрофессиональная программа</small>
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>Ваша специализация</h3>
          <div className="specialization-buttons">
            {specializations[program].map((spec) => (
              <button
                key={spec.value}
                className={`spec-btn ${specialization === spec.value ? 'active' : ''}`}
                onClick={() => setSpecialization(spec.value)}
              >
                {spec.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Ваш класс</h3>
          <div className="grade-buttons">
            {grades.map((g) => (
              <button
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
