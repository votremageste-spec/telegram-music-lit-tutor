import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: any;
  }
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function useTelegram() {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [themeParams, setThemeParams] = useState<any>({});
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.expand();
      
      setTg(webApp);
      setUser(webApp.initDataUnsafe?.user || null);
      setThemeParams(webApp.themeParams || {});
      setColorScheme(webApp.colorScheme || 'light');
    }
  }, []);

  const close = () => {
    if (tg) tg.close();
  };

  const showAlert = (message: string) => {
    if (tg) tg.showAlert(message);
  };

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (tg) {
        tg.showConfirm(message, (confirmed: boolean) => resolve(confirmed));
      } else {
        resolve(window.confirm(message));
      }
    });
  };

  const hapticFeedback = {
    light: () => tg?.Haptics?.impactOccurred('light'),
    medium: () => tg?.Haptics?.impactOccurred('medium'),
    heavy: () => tg?.Haptics?.impactOccurred('heavy'),
    success: () => tg?.Haptics?.notificationOccurred('success'),
    error: () => tg?.Haptics?.notificationOccurred('error'),
  };

  const mainButton = {
    show: (text?: string) => {
      if (tg?.MainButton) {
        if (text) tg.MainButton.setText(text);
        tg.MainButton.show();
      }
    },
    hide: () => tg?.MainButton?.hide(),
    onClick: (callback: () => void) => {
      if (tg?.MainButton) {
        tg.MainButton.onClick(callback);
      }
    },
    offClick: (callback: () => void) => {
      if (tg?.MainButton) {
        tg.MainButton.offClick(callback);
      }
    },
    setParams: (params: { text?: string; color?: string; text_color?: string }) => {
      if (tg?.MainButton) {
        if (params.text) tg.MainButton.setText(params.text);
        if (params.color) tg.MainButton.setParams({ color: params.color });
      }
    }
  };

  const sendData = (data: any) => {
    if (tg) {
      tg.sendData(JSON.stringify(data));
    }
  };

  return {
    tg,
    user,
    themeParams,
    colorScheme,
    close,
    showAlert,
    showConfirm,
    hapticFeedback,
    mainButton,
    sendData,
    isReady: !!tg,
    initData: tg?.initData || '',
    initDataUnsafe: tg?.initDataUnsafe || {},
  };
}
