const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('habit_tracker_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('habit_tracker_token', token);
  } else {
    localStorage.removeItem('habit_tracker_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  // Handle CSV download or plain text
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    const blob = await response.blob();
    return blob;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data?.error?.message || `Request failed with status ${response.status}`);
    err.code = data?.error?.code || 'UNKNOWN_ERROR';
    err.details = data?.error?.details || {};
    err.status = response.status;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
    login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me')
  },

  // Habits
  habits: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      if (params.label) query.set('label', params.label);
      if (params.date) query.set('date', params.date);
      const qs = query.toString();
      return request(`/habits${qs ? `?${qs}` : ''}`);
    },
    get: (id, date) => request(`/habits/${id}${date ? `?date=${date}` : ''}`),
    create: (data) => request('/habits', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/habits/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id, permanent = false) => request(`/habits/${id}${permanent ? '?permanent=true' : ''}`, { method: 'DELETE' }),
    archive: (id) => request(`/habits/${id}/archive`, { method: 'POST' }),
    unarchive: (id) => request(`/habits/${id}/unarchive`, { method: 'POST' }),
    restore: (id) => request(`/habits/${id}/restore`, { method: 'POST' })
  },

  // Completions
  completions: {
    list: (habitId, from, to) => {
      const q = new URLSearchParams();
      if (from) q.set('from', from);
      if (to) q.set('to', to);
      const qs = q.toString();
      return request(`/habits/${habitId}/completions${qs ? `?${qs}` : ''}`);
    },
    mark: (habitId, date, count) => request(`/habits/${habitId}/completions/${date}`, {
      method: 'PUT',
      body: JSON.stringify(count !== undefined ? { count } : {})
    }),
    undo: (habitId, date) => request(`/habits/${habitId}/completions/${date}`, { method: 'DELETE' })
  },

  // Dashboard
  dashboard: {
    getStats: (date) => request(`/dashboard/stats${date ? `?date=${date}` : ''}`)
  },

  // Labels
  labels: {
    list: () => request('/labels'),
    create: (data) => request('/labels', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/labels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => request(`/labels/${id}`, { method: 'DELETE' })
  },

  // Quotes
  quotes: {
    getDaily: () => request('/quotes/daily')
  },

  // Export
  exportCsv: async () => {
    const blob = await request('/export/csv');
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habits_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};
