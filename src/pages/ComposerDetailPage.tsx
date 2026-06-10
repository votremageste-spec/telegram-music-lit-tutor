import React, { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { DOOPComposers, FGTComposers } from '../data/data';
import { AudioPlayer } from '../components/AudioPlayer';
import { Composer } from '../types';

interface ComposerDetailPageProps {
  composerId: string;
  userProfile: any;
  onBack: () => void;
}

export const ComposerDetailPage: React.FC<ComposerDetailPageProps> = ({
  composerId,
  userProfile,
  onBack,
}) => {
  const { showAlert, hapticFeedback, mainButton } = useTelegram();
  const [composer, setComposer] = useState<Composer | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState<{ score: number; total: number } | null>(null);

  useEffect(() => {
    const allComposers = userProfile?.program === 'FGT' ? FGTComposers : DOOPComposers;
    const found = allComposers.find(c => c.id === composerId);
    if (found) {
      setComposer(found);
    }
  }, [composerId, userProfile]);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    const isLast = currentQuestion === (composer?.testQuestions.length || 0) - 1;
    if (isLast) {
      const score = newAnswers.filter((ans, idx) => ans === composer?.testQuestions[idx].correctAnswer).length;
      setTestResult({ score, total: composer?.testQuestions.length || 0 });
      setTestCompleted(true);
      hapticFeedback.success();
      showAlert(`Тест завершён! Результат: ${score} из ${composer?.testQuestions.length}`);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const startTest = () => {
    setTestMode(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setTestCompleted(false);
    setTestResult(null);
    mainButton.hide();
  };

  const resetTest = () => {
    setTestMode(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setTestCompleted(false);
    setTestResult(null);
  };

  if (!composer) {
    return <div className="loading-container">Загрузка...</div>;
  }

  if (testMode) {
    const question = composer.testQuestions[currentQuestion];
    if (!question) return null;

    return (
      <div className="composer-detail">
        <button className="back-button" onClick={resetTest}>← Назад к композитору</button>
        <div className="test-container">
          <h2>Тест: {composer.name}</h2>
          <div className="test-question-card">
            <div className="question-progress">
              Вопрос {currentQuestion + 1} из {composer.testQuestions.length}
            </div>
            <div className="question-text">{question.question}</div>
            <div className="options-list">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  className="option-btn"
                  onClick={() => handleAnswer(idx)}
                >
                  {String.fromCharCode(65 + idx)}. {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testCompleted && testResult) {
    return (
      <div className="composer-detail">
        <button className="back-button" onClick={resetTest}>← Назад</button>
        <div className="result-container">
          <h2>Результат теста: {composer.name}</h2>
          <div className="result-score">
            {testResult.score} из {testResult.total}
          </div>
          <div className="result-percentage">
            {Math.round((testResult.score / testResult.total) * 100)}%
          </div>
          <button className="retry-btn" onClick={startTest}>Пройти заново</button>
          <button className="back-to-composer-btn" onClick={resetTest}>Вернуться к композитору</button>
        </div>
      </div>
    );
  }

  return (
    <div className="composer-detail">
      <button className="back-button" onClick={onBack}>← Назад</button>

      <div className="composer-header">
        <h1>{composer.name}</h1>
        <p>{composer.years}</p>
      </div>

      <div className="composer-section">
        <h2>📖 Биография и творчество</h2>
        <div className="section-content">
          {composer.biography.split('\n').map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </div>

      <div className="composer-section">
        <h2>🎵 Главные произведения</h2>
        <ul className="works-list">
          {composer.mainWorks.map((work, idx) => (
            <li key={idx}>{work}</li>
          ))}
        </ul>
      </div>

      <div className="composer-section">
        <h2>📝 Что нужно знать к экзамену</h2>
        <ul className="exam-list">
          {composer.worksForExam.map((work, idx) => (
            <li key={idx}>{work}</li>
          ))}
        </ul>
      </div>

      {composer.audioFragments.length > 0 && (
        <div className="composer-section">
          <h2>🎧 Послушать фрагменты</h2>
          <div className="audio-list">
            {composer.audioFragments.map((fragment) => (
              <AudioPlayer
                key={fragment.id}
                src={fragment.path}
                title={fragment.title}
                composer={fragment.composer}
              />
            ))}
          </div>
        </div>
      )}

      <div className="composer-section">
        <h2>✍️ Проверить себя</h2>
        <p>Проверьте свои знания по творчеству {composer.name}</p>
        <button className="test-btn" onClick={startTest}>
          Начать тест ({composer.testQuestions.length} вопросов)
        </button>
      </div>
    </div>
  );
};
