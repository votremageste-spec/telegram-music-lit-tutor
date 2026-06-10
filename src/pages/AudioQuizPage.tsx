import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { AudioFragmentsList } from '../data/data';
import { api } from '../services/api';

interface AudioQuizPageProps {
  userProfile: any;
  onBack: () => void;
}

interface QuizQuestion {
  id: string;
  fragment: any;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export const AudioQuizPage: React.FC<AudioQuizPageProps> = ({ userProfile, onBack }) => {
  const { showAlert, hapticFeedback } = useTelegram();
  const [mode, setMode] = useState<'training' | 'exam' | 'select'>('select');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState(false);

  useEffect(() => {
    const fragmentsToUse = AudioFragmentsList.slice(0, 6);
    const generatedQuestions = fragmentsToUse.map((fragment, idx) => {
      const otherComposers = AudioFragmentsList
        .filter(f => f.composer !== fragment.composer)
        .map(f => f.composer)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 3);
      
      const options = [fragment.composer, ...otherComposers];
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      
      return {
        id: fragment.id,
        fragment,
        options,
        correctAnswer: options.indexOf(fragment.composer),
        explanation: `Это произведение "${fragment.title}" композитора ${fragment.composer}`
      };
    });
    setQuestions(generatedQuestions);
  }, []);

  const startQuiz = (selectedMode: 'training' | 'exam') => {
    setMode(selectedMode);
    setCurrentIndex(0);
    setScore(0);
    setMistakes([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setHintUsed(false);
  };

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentIndex].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      hapticFeedback.success();
    } else {
      setMistakes([...mistakes, questions[currentIndex].fragment.title]);
      hapticFeedback.error();
    }

    setShowResult(true);

    if (mode === 'exam') {
      setTimeout(() => {
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex(currentIndex + 1);
          setSelectedAnswer(null);
          setShowResult(false);
        } else {
          finishQuiz();
        }
      }, 1500);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setHintUsed(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const percentage = Math.round((score / questions.length) * 100);
    const result = {
      mode,
      program: userProfile?.program,
      grade: userProfile?.grade,
      score,
      total: questions.length,
      mistakes,
      percentage,
      date: new Date(),
    };
    
    await api.submitAudioQuizResult(userProfile?.telegram_id, result);
    hapticFeedback.success();
    showAlert(`Викторина завершена!\nРезультат: ${score} из ${questions.length} (${percentage}%)`);
    setMode('select');
  };

  const showHint = () => {
    setHintUsed(true);
    showAlert(`Подсказка: Это произведение "${questions[currentIndex]?.fragment.title}"`);
  };

  if (mode === 'select') {
    return (
      <div className="audio-quiz-page">
        <button className="back-button" onClick={onBack}>← Назад</button>
        <h1>🎧 Аудиовикторина</h1>
        <p>Проверь свои знания: узнай произведение по фрагменту</p>

        <div className="mode-selection">
          <div className="mode-card" onClick={() => startQuiz('training')}>
            <div className="mode-icon">📖</div>
            <h3>Тренировка</h3>
            <p>С подсказками и объяснениями</p>
            <small>Можно использовать подсказки</small>
          </div>

          <div className="mode-card" onClick={() => startQuiz('exam')}>
            <div className="mode-icon">🎯</div>
            <h3>Экзамен</h3>
            <p>Без подсказок — как на настоящем экзамене</p>
            <small>Результат только после завершения</small>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  return (
    <div className="audio-quiz-page">
      <button className="back-button" onClick={() => setMode('select')}>← Выход</button>
      
      <div className="quiz-header">
        <span className="quiz-mode">{mode === 'training' ? '📖 Тренировка' : '🎯 Экзамен'}</span>
        <span className="quiz-progress">Вопрос {currentIndex + 1} из {questions.length}</span>
      </div>

      <div className="quiz-container">
        <div className="quiz-player">
          <audio
            id="quiz-audio"
            src={currentQuestion.fragment.path}
            controls
            className="audio-controls"
          />
        </div>

        <div className="quiz-question">
          <p>Кто автор этого произведения?</p>
        </div>

        <div className="options-list">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              className={`option-btn ${selectedAnswer === idx ? 'selected' : ''} ${
                showResult && idx === currentQuestion.correctAnswer ? 'correct' : ''
              } ${showResult && selectedAnswer === idx && idx !== currentQuestion.correctAnswer ? 'incorrect' : ''}`}
              onClick={() => handleAnswer(idx)}
              disabled={showResult}
            >
              {String.fromCharCode(65 + idx)}. {option}
            </button>
          ))}
        </div>

        {mode === 'training' && !showResult && (
          <button className="hint-btn" onClick={showHint}>
            💡 Подсказка {hintUsed ? '(использована)' : ''}
          </button>
        )}

        {showResult && mode === 'training' && (
          <div className="result-feedback">
            <div className={`feedback ${selectedAnswer === currentQuestion.correctAnswer ? 'correct' : 'incorrect'}`}>
              {selectedAnswer === currentQuestion.correctAnswer ? '✅ Правильно!' : '❌ Неправильно!'}
            </div>
            <div className="explanation">{currentQuestion.explanation}</div>
            <button className="next-btn" onClick={nextQuestion}>
              {currentIndex + 1 === questions.length ? 'Завершить' : 'Следующий вопрос →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
