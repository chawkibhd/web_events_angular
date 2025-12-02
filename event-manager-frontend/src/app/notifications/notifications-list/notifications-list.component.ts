import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../notifications.service';
import { NotificationModel } from '../notification.model';
import { AuthService } from '../../auth/auth.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { RegistrationsService } from '../../registrations/registrations.service';

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
  isOrganisateur = false;

  constructor(
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private registrationsService: RegistrationsService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isOrganisateur = user?.role === 'ORGANISATEUR';
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
        this.notifications = data.map((notif) => ({
          ...notif,
          originalMessage: notif.message,
          decision: this.inferDecision(notif)
        }));
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

  private inferDecision(notif: NotificationModel): 'ACCEPTEE' | 'REFUSEE' | undefined {
    const content = (notif.message || '').toLowerCase();
    if (content.includes('accept')) {
      return 'ACCEPTEE';
    }
    if (content.includes('refus')) {
      return 'REFUSEE';
    }
    return undefined;
  }

  resetDecision(notif: NotificationModel): void {
    notif.decision = undefined;
    if (notif.originalMessage) {
      notif.message = notif.originalMessage;
    }
  }

  decideRegistration(notif: NotificationModel, decision: 'ACCEPTEE' | 'REFUSEE'): void {
    if (!notif.eventId || !notif.participantId) {
      this.error = 'Impossible de traiter la décision : données manquantes.';
      return;
    }

    this.registrationsService.updateStatus(notif.eventId, notif.participantId, decision).subscribe({
      next: () => {
        // Met à jour le message localement
        if (!notif.originalMessage) {
          notif.originalMessage = notif.message;
        }
        notif.message = decision === 'ACCEPTEE'
          ? 'Inscription acceptée.'
          : 'Inscription refusée.';
        notif.lue = true;
        notif.decision = decision;
      },
      error: () => {
        this.error = 'Erreur lors de la mise à jour de l’inscription.';
      }
    });
  }

  deleteNotification(notif: NotificationModel): void {
    if (!notif.id) return;

    // Bloque la suppression d'une nouvelle inscription tant que l'organisateur n'a pas décidé
    if (this.isOrganisateur && notif.type === 'NOUVELLE_INSCRIPTION' && !notif.lue) {
      this.error = 'Décide d’abord (accepter/refuser) avant de supprimer.';
      return;
    }

    this.notificationsService.delete(notif.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
      },
      error: () => {
        this.error = 'Erreur lors de la suppression de la notification.';
      }
    });
  }
}
