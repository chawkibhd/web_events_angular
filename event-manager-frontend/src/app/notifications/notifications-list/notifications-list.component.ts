import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../notifications.service';
import { NotificationModel } from '../notification.model';
import { AuthService } from '../../auth/auth.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [CommonModule, HlmButtonImports],
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.css']
})
export class NotificationsListComponent implements OnInit {

  notifications: NotificationModel[] = [];
  loading: boolean = false;
  error?: string;
  showPopup = false;
  popupNotification?: NotificationModel;

  constructor(
    private notificationsService: NotificationsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.error = 'Veuillez vous connecter pour voir vos notifications.';
      return;
    }

    this.loading = true;
    this.error = undefined;

    this.notificationsService.getMyNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
        this.preparePopup();
      },
      error: () => {
        this.error = 'Erreur lors du chargement des notifications.';
        this.loading = false;
      }
    });
  }

  private preparePopup(): void {
    if (this.notifications.length === 0) {
      this.popupNotification = undefined;
      this.showPopup = false;
      return;
    }
    // on privilégie la plus récente non lue, sinon la plus récente
    const unread = this.notifications.find(n => !n.lue);
    this.popupNotification = unread ?? this.notifications[0];
    this.showPopup = !!this.popupNotification;
  }

  closePopup(): void {
    this.showPopup = false;
  }

  markPopupAsRead(): void {
    if (!this.popupNotification) {
      this.showPopup = false;
      return;
    }
    this.markAsRead(this.popupNotification);
    this.showPopup = false;
  }

  markAsRead(notif: NotificationModel): void {
    if (!notif.id) return;

    this.notificationsService.markAsRead(notif.id).subscribe({
      next: (updated) => {
        notif.lue = updated.lue;
        if (this.popupNotification && this.popupNotification.id === notif.id) {
          this.popupNotification.lue = true;
        }
      },
      error: () => {
        this.error = 'Erreur lors de la mise à jour de la notification.';
      }
    });
  }
}
