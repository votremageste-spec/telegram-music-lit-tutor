import React, { useEffect, useState } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { DOOPTests, FGTTests } from '../data/data';
import { TestQuestion } from '../components/TestQuestion';

interface TestsPageProps {
  onNavigate: (page: string, params?: any) => void;
  userProfile: any;
}

export const TestsPage: React.FC<TestsPageProps> = ({ onNavigate, userProfile }) => {
  const { hapticFeedback } = useTelegram();
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    const allTests = userProfile?.program === 'FGT' ? FGTTests : DOOPTests;
    setTests(allTests);
  }, [userProfile]);

  const startTest = (test: any) => {
    setSelectedTest(test);
    setCurrentQuestion(0);
    setAnswers([]);
    setTestStarted(true);
    hapticFeedback.medium();
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion + 1 < selectedTest.questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Тест завершён
      const score = answers.filter((ans, idx) => ans === selectedTest.questions[idx].correctAnswer).length;
      const result = {
        testId: selectedTest.id,
        title: selectedTest.title,
        score,
        total: selectedTest.questions.length,
        answers,
        percentage: Math.round((score / selectedTest.questions.length) * 100),
        questions: selectedTest.questions.map((q: any, idx: number) => ({
          ...q,
          userAnswer: answers[idx],
          isCorrect: answers[idx] === q.correctAnswer
        }))
      };
      onNavigate('test-result', { testResult: result });
    }
  };

  if (testStarted && selectedTest) {
    const question = selectedTest.questions[currentQuestion];
    return (
      <div className="tests-page">
        <button className="back-button" onClick={() => setTestStarted(false)}>← Назад</button>
        <h2>{selectedTest.title}</h2>
        <TestQuestion
          question={question}
          questionNumber={currentQuestion + 1}
          totalQuestions={selectedTest.questions.length}
          onAnswer={handleAnswer}
          onNext={handleNext}
          showExplanation={true}
        />
      </div>
    );
  }

  return (
    <div className="tests-page">
      <h1>✍️ Тесты</h1>
      <p className="subtitle">Проверь свои знания</p>

      <div className="tests-list">
        {tests.map((test) => (
          <div key={test.id} className="test-card" onClick={() => startTest(test)}>
            <h3>{test.title}</h3>
            <p>Количество вопросов: {test.questions.length}</p>
            <button className="start-test-btn">Начать тест →</button>
          </div>
        ))}
      </div>

      {tests.length === 0 && (
        <div className="empty-state">
          <p>Нет тестов для выбранной программы</p>
        </div>
      )}
    </div>
  );
};
