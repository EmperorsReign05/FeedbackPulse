import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://feedbackpulse.onrender.com';
const TOKEN_KEY = 'feedback_pulse_token';

// Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: { field: string; message: string }[];
}

export interface User {
    id: string;
    email: string;
    createdAt?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Project {
    id: string;
    name: string;
    projectKey: string;
    createdAt: string;
    feedbackCount: number;
    embedSnippet?: string;
    // Widget customization
    widgetIcon: string;
    widgetText: string;
    widgetPrimary: string;
    widgetTextColor: string;
    widgetBackground: string;
    widgetPosition: string;
    // Domain restriction
    allowedDomains?: string | null;
}

// Widget settings for creating/updating projects
export interface WidgetSettings {
    widgetIcon?: string;
    widgetText?: string;
    widgetPrimary?: string;
    widgetTextColor?: string;
    widgetBackground?: string;
    widgetPosition?: string;
    allowedDomains?: string;
}

export interface Label {
    id: string;
    label: string;
    createdAt: string;
}

export interface Feedback {
    id: string;
    type: 'Bug' | 'Feature' | 'Other';
    message: string;
    sentiment: 'positive' | 'neutral' | 'negative' | null;
    createdAt: string;
    labels: Label[];
}

export interface PaginatedFeedback {
    data: Feedback[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Token management
export const getToken = (): string | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    return Cookies.get(TOKEN_KEY) || null;
};

export const setToken = (token: string): void => {
    Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: 'lax' });
};

export const removeToken = (): void => {
    Cookies.remove(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};

// API request helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'An error occurred',
                details: data.details,
            };
        }

        return data;
    } catch (error) {
        console.error('API request error:', error);
        return {
            success: false,
            error: 'Network error. Please check your connection.',
        };
    }
}

// Auth API
export const authApi = {
    signup: (email: string, password: string) =>
        apiRequest<AuthResponse>('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    login: (email: string, password: string) =>
        apiRequest<AuthResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    me: () => apiRequest<User>('/api/auth/me'),

    googleLogin: (idToken: string) =>
        apiRequest<AuthResponse>('/api/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken }),
        }),
};

// Projects API
export const projectsApi = {
    list: () => apiRequest<Project[]>('/api/projects'),

    get: (projectId: string) =>
        apiRequest<Project>(`/api/projects/${projectId}`),

    create: (name: string, widgetSettings?: WidgetSettings) =>
        apiRequest<Project>('/api/projects', {
            method: 'POST',
            body: JSON.stringify({
                name,
                ...(widgetSettings || {}),
            }),
        }),

    delete: (projectId: string) =>
        apiRequest<void>(`/api/projects/${projectId}`, {
            method: 'DELETE',
        }),
};

// Feedback API
export const feedbackApi = {
    list: (projectId: string, page = 1, limit = 10, type = 'All') =>
        apiRequest<PaginatedFeedback>(
            `/api/projects/${projectId}/feedback?page=${page}&limit=${limit}&type=${type}`
        ),

    analyzeSentiment: (feedbackId: string) =>
        apiRequest<{ feedbackId: string; sentiment: string; feedback: Feedback }>(
            `/api/feedback/${feedbackId}/sentiment`,
            { method: 'POST' }
        ),

    delete: (feedbackId: string) =>
        apiRequest<void>(`/api/feedback/${feedbackId}`, {
            method: 'DELETE',
        }),
};

// Labels API
export const labelsApi = {
    add: (feedbackId: string, label: string) =>
        apiRequest<Label>(`/api/feedback/${feedbackId}/labels`, {
            method: 'POST',
            body: JSON.stringify({ label }),
        }),

    remove: (feedbackId: string, labelId: string) =>
        apiRequest<void>(`/api/feedback/${feedbackId}/labels/${labelId}`, {
            method: 'DELETE',
        }),
};

// Webhook settings type
export interface WebhookSettings {
    webhookUrl: string | null;
    webhookSecret: string | null;
    webhookEnabled: boolean;
}

// Webhooks API
export const webhooksApi = {
    get: (projectId: string) =>
        apiRequest<WebhookSettings>(`/api/projects/${projectId}/webhook`),

    update: (projectId: string, settings: { webhookUrl?: string | null; webhookEnabled?: boolean }) =>
        apiRequest<WebhookSettings>(`/api/projects/${projectId}/webhook`, {
            method: 'PUT',
            body: JSON.stringify(settings),
        }),

    regenerateSecret: (projectId: string) =>
        apiRequest<WebhookSettings>(`/api/projects/${projectId}/webhook/regenerate-secret`, {
            method: 'POST',
        }),

    test: (projectId: string) =>
        apiRequest<{ message: string; statusCode?: number }>(`/api/projects/${projectId}/webhook/test`, {
            method: 'POST',
        }),
};

// Server-side API helper (for SSR)
export const serverApiRequest = async <T>(
    endpoint: string,
    token?: string
): Promise<ApiResponse<T>> => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers,
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'An error occurred',
            };
        }

        return data;
    } catch (error) {
        console.error('Server API request error:', error);
        return {
            success: false,
            error: 'Failed to fetch data',
        };
    }
};

export default {
    auth: authApi,
    projects: projectsApi,
    feedback: feedbackApi,
    labels: labelsApi,
    webhooks: webhooksApi,
};

