const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
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
  getProgress(telegramId: number) {
    return this.request(`/progress/${telegramId}`);
  },

  updateProgress(telegramId: number, progressData: any) {
    return this.request(`/progress/${telegramId}`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
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

  markTicketLearned(telegramId: number, ticketId: string) {
    return this.request('/tickets/learned', {
      method: 'POST',
      body: JSON.stringify({ telegramId, ticketId }),
    });
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
  }
};
