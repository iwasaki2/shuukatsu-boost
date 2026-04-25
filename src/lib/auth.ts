export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  password: string;
}

const USERS_KEY = "gkb_users";
const SESSION_KEY = "gkb_session";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? (JSON.parse(stored) as User[]) : [];
}

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  const id = getCurrentUserId();
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}

export function login(email: string, password: string): User | null {
  const user = getUsers().find((u) => u.email === email && u.password === btoa(password));
  if (!user) return null;
  localStorage.setItem(SESSION_KEY, user.id);
  return user;
}

export function register(email: string, password: string, name: string): User | null {
  const users = getUsers();
  if (users.find((u) => u.email === email)) return null;
  const newUser: User = {
    id: generateId(),
    email,
    name,
    createdAt: new Date().toISOString(),
    password: btoa(password),
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
  localStorage.setItem(SESSION_KEY, newUser.id);
  return newUser;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
