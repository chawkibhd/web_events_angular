import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NotificationModel } from './notification.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  // Passe par le gateway pour atteindre le microservice de notifications
  private baseUrl = 'http://localhost:8080/api/notifications';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /** Récupérer les notifications du user connecté */
  getMyNotifications(): Observable<NotificationModel[]> {
    const user = this.authService.getUser();

    if (!user) {
      return throwError(() => new Error("Utilisateur non connecté."));
    }

    return this.http.get<NotificationModel[]>(
      `${this.baseUrl}/participant/${user.id}`
    );
  }

  /** Marquer une notification comme lue */
  markAsRead(id: number): Observable<NotificationModel> {
    return this.http.patch<NotificationModel>(
      `${this.baseUrl}/${id}/lue`, {}
    );
  }
}
