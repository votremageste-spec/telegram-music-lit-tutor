const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

type LocalProgress = {
  learnedTickets: string[];
  testResults: any[];
  audioResults: any[];
  updated_at: string;
};

function getSafeTelegramId(telegramId?: number | null) {
  return telegramId ?? 100000001;
}

function getProgressStorageKey(telegramId: number) {
  return `music_lit_progress_${telegramId}`;
}

function createEmptyProgress(): LocalProgress {
  return {
    learnedTickets: [],
    testResults: [],
    audioResults: [],
    updated_at: new Date().toISOString(),
  };
}

function readLocalProgress(telegramId: number): LocalProgress {
  if (typeof window === 'undefined') {
    return createEmptyProgress();
  }

  try {
    const raw = window.localStorage.getItem(getProgressStorageKey(telegramId));

    if (!raw) {
      return createEmptyProgress();
    }

    const parsed = JSON.parse(raw);

    return {
      ...createEmptyProgress(),
      ...parsed,
      learnedTickets: Array.isArray(parsed.learnedTickets)
        ? parsed.learnedTickets.map(String)
        : [],
    };
  } catch (error) {
    console.warn('Не удалось прочитать локальный прогресс:', error);
    return createEmptyProgress();
  }
}

function writeLocalProgress(telegramId: number, progress: LocalProgress) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      getProgressStorageKey(telegramId),
      JSON.stringify(progress)
    );
  } catch (error) {
    console.warn('Не удалось сохранить локальный прогресс:', error);
  }
}

function addLearnedTicketLocally(telegramId: number, ticketId: string | number) {
  const progress = readLocalProgress(telegramId);
  const ticketIdString = String(ticketId);

  const learnedTickets = Array.from(
    new Set([...progress.learnedTickets, ticketIdString])
  );

  const updatedProgress: LocalProgress = {
    ...progress,
    learnedTickets,
    updated_at: new Date().toISOString(),
  };

  writeLocalProgress(telegramId, updatedProgress);

  return updatedProgress;
}

export const api = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API Error ${endpoint}:`, error);
      return { success: false, error: String(error) };
    }
  },

  // User endpoints
  getUser(telegramId: number) {
    return this.request(`/user/${telegramId}`);
  },

  createUser(userData: any) {
    return this.request('/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser(telegramId: number, userData: any) {
    return this.request(`/user/${telegramId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Progress endpoints
  async getProgress(telegramId?: number | null) {
    const safeTelegramId = getSafeTelegramId(telegramId);

    const response = await this.request(`/progress/${safeTelegramId}`);

    if (response.success && response.data) {
      const serverProgress = response.data as any;

      const normalizedProgress: LocalProgress = {
        ...createEmptyProgress(),
        ...serverProgress,
        learnedTickets: Array.isArray(serverProgress.learnedTickets)
          ? serverProgress.learnedTickets.map(String)
          : [],
        updated_at: new Date().toISOString(),
      };

      writeLocalProgress(safeTelegramId, normalizedProgress);

      return {
        success: true,
        data: normalizedProgress,
      };
    }

    // Если сервер прогресса пока не работает,
    // используем локальный прогресс из браузера / Telegram Mini App.
    return {
      success: true,
      data: readLocalProgress(safeTelegramId),
    };
  },

  async updateProgress(telegramId: number, progressData: any) {
    const safeTelegramId = getSafeTelegramId(telegramId);
    const currentProgress = readLocalProgress(safeTelegramId);

    const updatedProgress: LocalProgress = {
      ...currentProgress,
      ...progressData,
      learnedTickets: Array.isArray(progressData.learnedTickets)
        ? progressData.learnedTickets.map(String)
        : currentProgress.learnedTickets,
      updated_at: new Date().toISOString(),
    };

    writeLocalProgress(safeTelegramId, updatedProgress);

    const response = await this.request(`/progress/${safeTelegramId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedProgress),
    });

    if (!response.success) {
      console.warn('Прогресс сохранён локально, но не сохранён на сервере');
    }

    return {
      success: true,
      data: updatedProgress,
    };
  },

  // Tests endpoints
  getTests(program: string, grade?: number) {
    let url = `/tests?program=${program}`;
    if (grade) url += `&grade=${grade}`;
    return this.request(url);
  },

  submitTestResult(telegramId: number, result: any) {
    return this.request('/test-result', {
      method: 'POST',
      body: JSON.stringify({ telegramId, ...result }),
    });
  },

  // Audio endpoints
  getAudioFragments(program: string, grade: number) {
    return this.request(`/audio?program=${program}&grade=${grade}`);
  },

  submitAudioQuizResult(telegramId: number, result: any) {
    return this.request('/audio-result', {
      method: 'POST',
      body: JSON.stringify({ telegramId, ...result }),
    });
  },

  // Assistant endpoint
  sendMessageToAssistant(messages: any[], context: any) {
    return this.request('/assistant', {
      method: 'POST',
      body: JSON.stringify({ messages, context }),
    });
  },

  // Tickets endpoints
  getTickets(program: string) {
    return this.request(`/tickets?program=${program}`);
  },

  getTicketDetail(ticketId: string) {
    return this.request(`/tickets/${ticketId}`);
  },

  async markTicketLearned(telegramId: number, ticketId: string | number) {
    const safeTelegramId = getSafeTelegramId(telegramId);

    // Сначала сохраняем локально, чтобы пользователь сразу видел результат.
    const localProgress = addLearnedTicketLocally(safeTelegramId, ticketId);

    // Потом пробуем сохранить на сервере.
    // Если серверный маршрут пока не готов, приложение всё равно продолжит работать.
    const response = await this.request('/tickets/learned', {
      method: 'POST',
      body: JSON.stringify({
        telegramId: safeTelegramId,
        ticketId: String(ticketId),
      }),
    });

    if (!response.success) {
      console.warn('Билет сохранён локально, но не сохранён на сервере');
    }

    return {
      success: true,
      data: localProgress,
    };
  },

  // Composers endpoints
  getComposers(program: string, grade: number) {
    return this.request(`/composers?program=${program}&grade=${grade}`);
  },

  getComposerDetail(composerId: string) {
    return this.request(`/composers/${composerId}`);
  },

  submitComposerTest(telegramId: number, composerId: string, result: any) {
    return this.request('/composer-test', {
      method: 'POST',
      body: JSON.stringify({ telegramId, composerId, ...result }),
    });
  },
};
