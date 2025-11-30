import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

export type UserRole = 'PARTICIPANT' | 'ORGANISATEUR';

export interface CurrentUser {
  id: number;
  email: string;
  fullName?: string;
  role: UserRole;
  token: string;
}

interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  role: string;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName?: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Toutes les routes auth passent par le gateway (port 8080)
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  private currentUser?: CurrentUser;

  // est-ce qu'on a accès au localStorage ? (SSR-safe)
  private storageAvailable =
    typeof window !== 'undefined' && typeof localStorage !== 'undefined';

  constructor(private http: HttpClient) {
    if (this.storageAvailable) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
  }

  login(email: string, password: string): Observable<CurrentUser> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(res => {
        const user: CurrentUser = {
          id: res.userId,
          email: res.email,
          fullName: res.fullName,
          role: res.role as UserRole,
          token: res.token
        };
        return user;
      }),
      tap(user => {
        this.currentUser = user;
        if (this.storageAvailable) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
    );
  }

  register(data: { email: string; fullName: string; password: string; role: string }) {
  // on précise à Angular : la réponse est du TEXTE, pas du JSON
  return this.http.post(`${this.apiUrl}/register`, data, {
    responseType: 'text' as 'json'
  });
}

  logout(): void {
    if (this.currentUser?.token) {
      this.http.post(`${this.apiUrl}/logout`, {}, {
        headers: { 'X-Auth-Token': this.currentUser.token }
      }).subscribe({
        next: () => {},
        error: () => {}
      });
    }
    this.currentUser = undefined;
    if (this.storageAvailable) {
      localStorage.removeItem('currentUser');
    }
  }

  getUser(): CurrentUser | null {
    return this.currentUser ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  /** Récupère les infos publiques d'un utilisateur par son id (via gateway) */
  getUserById(id: number) {
    return this.http.get<UserProfile>(`${this.apiUrl}/users/${id}`);
  }
}
