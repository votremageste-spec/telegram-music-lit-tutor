export interface UserProfile {
  telegram_id: number;
  first_name: string;
  username?: string;
  program: 'DOOP' | 'FGT';
  program_ru: 'ДООП' | 'ФГТ';
  specialization: string;
  grade: number;
  created_at: Date;
  updated_at: Date;
}

export interface Composer {
  id: string;
  name: string;
  years: string;
  portrait?: string;
  shortBio: string;
  biography: string;
  mainGenres: string[];
  mainWorks: string[];
  worksForExam: string[];
  audioFragments: AudioFragment[];
  testQuestions: TestQuestion[];
  program: 'DOOP' | 'FGT';
  grades: number[];
}

export interface AudioFragment {
  id: string;
  title: string;
  composer: string;
  path: string;
  description?: string;
  year?: string;
}

export interface Ticket {
  id: string;
  number: number;
  question1: string;
  answer1: string;
  question2: string;
  answer2: string;
  audioFragmentId?: string;
  program: 'DOOP' | 'FGT';
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  type: 'composer' | 'term' | 'general';
}

export interface Test {
  id: string;
  title: string;
  questions: TestQuestion[];
  program: 'DOOP' | 'FGT';
  grade?: number;
}

export interface UserProgress {
  learnedComposers: string[];
  learnedTickets: string[];
  audioQuizResults: AudioQuizResult[];
  testResults: TestResult[];
  overallProgress: number;
}

export interface AudioQuizResult {
  date: Date;
  mode: 'training' | 'exam';
  program: string;
  grade: number;
  score: number;
  total: number;
  mistakes: string[];
  percentage: number;
}

export interface TestResult {
  testId: string;
  score: number;
  total: number;
  answers: number[];
  date: Date;
  percentage: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
