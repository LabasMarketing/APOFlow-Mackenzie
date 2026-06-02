import { APORecord, AlunoResumo, NotificationItem, Role, Usuario } from '@/lib/mock-data';

const API_BASE = '/api';
const TOKEN_KEY = 'apoflow.jwt';

export function getStoredToken(): string | null {
  return typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
}

export function storeToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (response.status === 401) {
    clearToken();
    window.localStorage.removeItem('apoflow.current-user');
    window.location.href = '/';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message ?? 'Falha na comunicação com a API.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const queryKeys = {
  apos: ['apos'] as const,
  students: ['students'] as const,
  users: ['users'] as const,
  notifications: (recipient: string) => ['notifications', recipient] as const,
};

export interface AuthResult {
  token: string | null;
  userId: string;
  email: string;
  nome: string;
  papel: Role;
  papeis: Role[];
  primeiroAcesso: boolean;
  mensagem?: string | null;
}

export function register(nome: string, email: string, senha: string) {
  return request<AuthResult>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
  }).then((res) => { if (res.token) storeToken(res.token); return res; });
}

export function login(email: string, senha: string) {
  return request<AuthResult>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  }).then((res) => {
    if (res.token) storeToken(res.token);
    return res;
  });
  // NOTE: login now only triggers OTP - token comes from verifyOtp
}

export function verifyOtp(email: string, code: string) {
  return request<AuthResult>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  }).then((res) => { storeToken(res.token!); return res; });
}

export function changePassword(email: string, senhaAntiga: string, novaSenha: string) {
  return request<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ email, senhaAntiga, novaSenha }),
  });
}

export function checkFirstAccess(email: string) {
  return request<boolean>(`/auth/first-access/${encodeURIComponent(email)}`, {
    method: 'GET',
  });
}

export function forgotPassword(email: string) {
  return request<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, novaSenha: string) {
  return request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, novaSenha }),
  });
}

export const api = {
  post: <T>(path: string, data?: unknown) => request<T>(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  }),
  get: <T>(path: string) => request<T>(path, {
    method: 'GET',
  }),
};

export function getApos() {
  return request<APORecord[]>('/apos');
}

export function getStudents() {
  return request<AlunoResumo[]>('/students');
}

export function getNotifications(recipient: string) {
  return request<NotificationItem[]>(`/notifications?recipient=${encodeURIComponent(recipient)}`);
}

export function markNotificationsAsRead(recipient: string) {
  return request<void>('/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ recipient }),
  });
}

export function createApo(payload: {
  alunoId: string;
  titulo: string;
  tipo: string;
  descricao: string;
  pontos: number;
  anexos: string[];
}) {
  return request<APORecord>('/apos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function saveApoDraft(payload: {
  alunoId: string;
  titulo: string;
  tipo: string;
  descricao: string;
  pontos: number;
  anexos: string[];
}) {
  return request<APORecord>('/apos/rascunho', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resubmitApo(apoId: string, payload: {
  alunoId: string;
  titulo: string;
  tipo: string;
  descricao: string;
  pontos: number;
  anexos: string[];
}) {
  return request<APORecord>(`/apos/${apoId}/aluno/reenviar`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function giveUpApo(apoId: string) {
  return request<APORecord>(`/apos/${apoId}/aluno/desistir`, {
    method: 'POST',
  });
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  papel: string;
  papeis: Role[];
  fotoUrl: string | null;
  periodo: string | null;
  drt: string | null;
  orientadorId: string | null;
  orientadorNome: string | null;
}

export function getProfile() {
  return request<UserProfile>('/users/me');
}

export function updateProfile(payload: Partial<Omit<UserProfile, 'id' | 'email' | 'papel'>>) {
  return request<UserProfile>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  papel: Role;
  papeis: Role[];
  drt: string | null;
  orientadorId: string | null;
  orientadorNome: string | null;
}

export function getUsers() {
  return request<AdminUser[]>('/users');
}

export function updateUserRoles(userId: string, papeis: Role[], orientadorId?: string | null) {
  return request<AdminUser>(`/users/${encodeURIComponent(userId)}/roles`, {
    method: 'PUT',
    body: JSON.stringify({ papeis, orientadorId }),
  });
}

export function deleteUser(userId: string) {
  return request<{ message: string }>(`/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}

export function deleteAccount() {
  return request<{ message: string }>('/users/me', {
    method: 'DELETE',
  });
}

export function approveByOrientador(apoId: string) {
  return request<APORecord>(`/apos/${apoId}/orientador/aprovar`, { method: 'POST' });
}

export function returnByOrientador(apoId: string, justificativa: string) {
  return request<APORecord>(`/apos/${apoId}/orientador/devolver`, {
    method: 'POST',
    body: JSON.stringify({ justificativa }),
  });
}

export function voteApo(apoId: string, payload: { membro: string; decisao: 'aprovar' | 'reprovar' | 'devolver'; justificativa: string }) {
  return request<APORecord>(`/apos/${apoId}/comissao/voto`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function decideApo(apoId: string, action: 'aprovar' | 'reprovar' | 'devolver', justificativa: string) {
  return request<APORecord>(`/apos/${apoId}/coordenacao/decisao?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    body: JSON.stringify({ justificativa }),
  });
}

export function archiveApo(apoId: string) {
  return request<APORecord>(`/apos/${apoId}/secretaria/arquivar`, { method: 'POST' });
}

export function launchApo(apoId: string) {
  return request<APORecord>(`/apos/${apoId}/secretaria/lancar`, { method: 'POST' });
}
