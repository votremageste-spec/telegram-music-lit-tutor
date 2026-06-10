import React, { useEffect, useState } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { ProfilePage } from './pages/ProfilePage';
import { MainPage } from './pages/MainPage';
import { ComposersPage } from './pages/ComposersPage';
import { ComposerDetailPage } from './pages/ComposerDetailPage';
import { AudioQuizPage } from './pages/AudioQuizPage';
import { TicketsPage } from './pages/TicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { TestsPage } from './pages/TestsPage';
import { TestResultPage } from './pages/TestResultPage';
import { AssistantPage } from './pages/AssistantPage';
import { ProgressPage } from './pages/ProgressPage';
import { BottomNav } from './components/Layout/BottomNav';
import { MainLayout } from './components/Layout/MainLayout';
import './styles.css';

type Page = 'profile' | 'main' | 'composers' | 'composer-detail' | 'audio' | 'tickets' | 'ticket-detail' | 'tests' | 'test-result' | 'assistant' | 'progress';

interface AppState {
  currentPage: Page;
  selectedComposerId?: string;
  selectedTicketId?: string;
  testResult?: any;
}

function App() {
  const { user, themeParams, colorScheme, isReady, showAlert } = useTelegram();
  const [appState, setAppState] = useState<AppState>({ currentPage: 'profile' });
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile && user?.id) {
      const profile = JSON.parse(savedProfile);
      if (profile.telegram_id === user.id) {
        setUserProfile(profile);
        setAppState({ currentPage: 'main' });
      }
    }
  }, [user]);

  const handleProfileComplete = (profile: any) => {
    setUserProfile(profile);
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setAppState({ currentPage: 'main' });
  };

  const navigateTo = (page: Page, params?: any) => {
    setAppState(prev => ({
      ...prev,
      currentPage: page,
      ...params,
    }));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (themeParams) {
      root.style.setProperty('--tg-bg-color', themeParams.bg_color || '#ffffff');
      root.style.setProperty('--tg-text-color', themeParams.text_color || '#000000');
      root.style.setProperty('--tg-hint-color', themeParams.hint_color || '#999999');
      root.style.setProperty('--tg-link-color', themeParams.link_color || '#2481cc');
      root.style.setProperty('--tg-button-color', themeParams.button_color || '#2481cc');
      root.style.setProperty('--tg-button-text-color', themeParams.button_text_color || '#ffffff');
      root.style.setProperty('--tg-secondary-bg-color', themeParams.secondary_bg_color || '#f0f0f0');
    }
    root.style.setProperty('--tg-color-scheme', colorScheme);
  }, [themeParams, colorScheme]);

  if (!isReady) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка Музлит-Репетитора...</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (appState.currentPage) {
      case 'profile':
        return <ProfilePage onComplete={handleProfileComplete} />;
      case 'main':
        return <MainPage onNavigate={navigateTo} userProfile={userProfile} />;
      case 'composers':
        return <ComposersPage onNavigate={navigateTo} userProfile={userProfile} />;
      case 'composer-detail':
        return <ComposerDetailPage composerId={appState.selectedComposerId!} userProfile={userProfile} onBack={() => navigateTo('composers')} />;
      case 'audio':
        return <AudioQuizPage userProfile={userProfile} onBack={() => navigateTo('main')} />;
      case 'tickets':
        return <TicketsPage onNavigate={navigateTo} userProfile={userProfile} />;
      case 'ticket-detail':
        return <TicketDetailPage ticketId={appState.selectedTicketId!} userProfile={userProfile} onBack={() => navigateTo('tickets')} />;
      case 'tests':
        return <TestsPage onNavigate={navigateTo} userProfile={userProfile} />;
      case 'test-result':
        return <TestResultPage result={appState.testResult} onNavigate={navigateTo} />;
      case 'assistant':
        return <AssistantPage userProfile={userProfile} onBack={() => navigateTo('main')} />;
      case 'progress':
        return <ProgressPage userProfile={userProfile} onBack={() => navigateTo('main')} />;
      default:
        return <MainPage onNavigate={navigateTo} userProfile={userProfile} />;
    }
  };

  const showBottomNav = !['profile', 'composer-detail', 'ticket-detail', 'test-result'].includes(appState.currentPage);

  return (
    <MainLayout>
      {renderPage()}
      {showBottomNav && <BottomNav currentPage={appState.currentPage} onNavigate={navigateTo} />}
    </MainLayout>
  );
}

export default App;
