// API configuration and utilities for frontend-backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  business_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Business {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  support_policies?: string;
  owner_id: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  business?: Business;
  token: string;
  message: string;
}

export interface Conversation {
  id: string;
  platform: string;
  user_id: string;
  chat_id: string;
  message: string;
  response: string;
  timestamp: string;
  created_at: string;
}

export interface BotStatus {
  bot: {
    id: number;
    first_name: string;
    username: string;
  };
  webhook: any;
  polling: boolean;
  environment: string;
}

// API client class
class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          message: data.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Authentication endpoints
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        companyName: userData.companyName,
        phone: userData.phone,
      }),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  async getProfile(): Promise<ApiResponse<{ user: User; business?: Business }>> {
    return this.request<{ user: User; business?: Business }>('/api/auth/profile');
  }

  // AI conversation endpoints
  async generateAIResponse(data: {
    message: string;
    context?: string;
    platform: 'whatsapp' | 'telegram' | 'website';
  }): Promise<ApiResponse<{
    response: string;
    confidence: number;
    suggestedActions: string[];
    timestamp: string;
  }>> {
    return this.request('/api/ai/conversation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Telegram bot endpoints
  async getBotStatus(): Promise<ApiResponse<BotStatus>> {
    return this.request<BotStatus>('/api/telegram/status');
  }

  async sendTelegramMessage(data: {
    chatId: string;
    message: string;
    parseMode?: string;
  }): Promise<ApiResponse<{
    messageId: number;
    chatId: string;
    timestamp: string;
  }>> {
    return this.request('/api/telegram/send-message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Conversation endpoints
  async getConversationHistory(params?: {
    platform?: string;
    limit?: number;
  }): Promise<ApiResponse<{
    conversations: Conversation[];
    total: number;
    platform: string;
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.platform) queryParams.append('platform', params.platform);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/api/conversations/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getConversationAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    totalConversations: number;
    platforms: Record<string, number>;
    averageResponseTime: number;
    dateRange: { start?: string; end?: string };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = `/api/conversations/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    message: string;
    timestamp: string;
    version: string;
  }>> {
    return this.request('/health');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual API functions for convenience
export const auth = {
  register: (userData: Parameters<typeof apiClient.register>[0]) => apiClient.register(userData),
  login: (credentials: Parameters<typeof apiClient.login>[0]) => apiClient.login(credentials),
  logout: () => apiClient.logout(),
  getProfile: () => apiClient.getProfile(),
};

export const ai = {
  generateResponse: (data: Parameters<typeof apiClient.generateAIResponse>[0]) => 
    apiClient.generateAIResponse(data),
};

export const telegram = {
  getStatus: () => apiClient.getBotStatus(),
  sendMessage: (data: Parameters<typeof apiClient.sendTelegramMessage>[0]) => 
    apiClient.sendTelegramMessage(data),
};

export const conversations = {
  getHistory: (params?: Parameters<typeof apiClient.getConversationHistory>[0]) => 
    apiClient.getConversationHistory(params),
  getAnalytics: (params?: Parameters<typeof apiClient.getConversationAnalytics>[0]) => 
    apiClient.getConversationAnalytics(params),
};

export const health = {
  check: () => apiClient.healthCheck(),
};

// Hook for managing authentication state
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      auth.getProfile()
        .then(response => {
          if (response.success && response.data) {
            setUser(response.data.user);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await auth.login(credentials);
    if (response.success && response.data) {
      setUser(response.data.user);
    }
    return response;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return { user, loading, login, logout };
};

// React import for the hook
import { useState, useEffect } from 'react';
