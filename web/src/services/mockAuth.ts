import type { AuthUser } from "../types";
import { getUser, setUser, clearUser } from "./storage";

export function isAuthed(): boolean {
  return !!getUser();
}

export function login(email: string, _password: string): AuthUser {
  const existing = getUser();
  if (existing && existing.email === email) return existing;

  const user: AuthUser = {
    email,
    createdAt: new Date().toISOString(),
  };
  setUser(user);
  return user;
}

export function logout(): void {
  // ONLY remove the user token. DO NOT run localStorage.clear()
  // otherwise you will delete your timeline and history logs!
  localStorage.removeItem("sm_user");
}