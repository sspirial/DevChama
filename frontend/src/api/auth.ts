import http from './http';
import type { User } from '../types';

const USER_KEY = 'user';
const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export async function login(username: string, password: string): Promise<User> {
  const resp = await http.post('auth/token/', { username, password });
  const { access, refresh } = resp.data as { access: string; refresh: string };
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);

  const profileResp = await http.get('auth/profile/');
  const user: User = profileResp.data;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function register(payload: {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}): Promise<void> {
  await http.post('auth/register/', payload);
}

export function logout() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  // Optional: reload to reset app state
  window.location.href = '/login';
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export async function updateProfile(updates: Partial<User>): Promise<User> {
  const resp = await http.put('auth/profile/', updates);
  const user: User = resp.data;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}
