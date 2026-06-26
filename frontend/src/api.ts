import type { Game } from './types';

export const API_BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('playpace_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const registerUser = async (username: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Registration failed');
  }
  return res.json();
};

export const loginUser = async (username: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Login failed');
  }
  return res.json();
};

export const syncDataDown = async () => {
  const res = await fetch(`${API_BASE_URL}/user/sync`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to sync down');
  return res.json();
};

export const syncDataUp = async (games: any[], budget: any) => {
  const res = await fetch(`${API_BASE_URL}/user/sync`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ games, budget })
  });
  if (!res.ok) throw new Error('Failed to sync up');
  return res.json();
};

export const autocompleteGames = async (q: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/game/autocomplete?q=${encodeURIComponent(q)}`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to autocomplete');
  const data = await response.json();
  return data.results;
};

export const addGame = async (appid: number, name: string, cover_url: string): Promise<Game> => {
  const response = await fetch(`${API_BASE_URL}/game/add`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ appid, name, cover_url })
  });
  if (!response.ok) throw new Error('Failed to add game');
  const data = await response.json();
  return data.game;
};

export const suggestGamesWithAI = async (moods: string[], exclude: string[] = []) => {
  const response = await fetch(`${API_BASE_URL}/ai/suggest`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ moods, exclude })
  });
  if (!response.ok) {
    throw new Error('Failed to suggest games');
  }
  return response.json();
};
