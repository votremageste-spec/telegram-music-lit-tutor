import React from 'react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: any) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'profile', label: 'Профиль', icon: '👤' },
    { id: 'main', label: 'Главное', icon: '🏠' },
    { id: 'composers', label: 'Композиторы', icon: '🎵' },
    { id: 'audio', label: 'Аудио', icon: '🎧' },
    { id: 'tickets', label: 'Билеты', icon: '📝' },
    { id: 'assistant', label: 'Ассистент', icon: '🤖' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
