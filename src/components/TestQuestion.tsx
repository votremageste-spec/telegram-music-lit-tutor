import React, { useState } from 'react';

interface TestQuestionProps {
  question: {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  };
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: number) => void;
  onNext: () => void;
  showExplanation?: boolean;
}

export const TestQuestion: React.FC<TestQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  showExplanation = false,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    if (answered) return;
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === question.correctAnswer;
    setIsCorrect(correct);
    setAnswered(true);
    onAnswer(answerIndex);
  };

  const isLast = questionNumber === totalQuestions;

  return (
    <div className="test-question">
      <div className="test-header">
        <span>Вопрос {questionNumber} из {totalQuestions}</span>
        <div className="test-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="question-text">{question.text}</div>

      <div className="test-options">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            className={`test-option ${selectedAnswer === idx ? 'selected' : ''} ${
              answered && showExplanation && idx === question.correctAnswer ? 'correct' : ''
            }`}
            onClick={() => handleAnswer(idx)}
            disabled={answered}
          >
            {String.fromCharCode(65 + idx)}. {option}
          </button>
        ))}
      </div>

      {answered && showExplanation && question.explanation && (
        <div className={`explanation ${isCorrect ? 'correct' : 'incorrect'}`}>
          <strong>{isCorrect ? '✅ Верно!' : '❌ Неверно!'}</strong>
          <p>{question.explanation}</p>
        </div>
      )}

      {answered && (
        <button className="next-btn" onClick={onNext}>
          {isLast ? 'Завершить тест' : 'Следующий вопрос →'}
        </button>
      )}
    </div>
  );
};
