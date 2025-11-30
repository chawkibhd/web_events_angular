import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventsService } from '../events.service';
import { EventModel } from '../event.model';
import { RegistrationsService } from '../../registrations/registrations.service';
import { Registration } from '../../registrations/registration.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {

  event?: EventModel;
  loading: boolean = false;
  error?: string;

  // inscriptions
  registrations: Registration[] = [];
  participantsCount: number = 0;
  isRegistered: boolean = false;
  registrationId?: number;
  regError?: string;
  regSuccess?: string;

  // pour l'instant, on simule un participant connecté avec l'id 1

    constructor(
    private route: ActivatedRoute,
    private eventsService: EventsService,
    private registrationsService: RegistrationsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : null;

    if (id === null || isNaN(id)) {
      this.error = 'ID d’événement invalide.';
      return;
    }

    this.loadEvent(id);
  }

  loadEvent(id: number): void {
    this.loading = true;
    this.error = undefined;

    this.eventsService.getEvent(id).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
        this.loadRegistrations(id);
      },
      error: () => {
        this.error = 'Erreur lors du chargement de l’événement.';
        this.loading = false;
      }
    });
  }

  loadRegistrations(eventId: number): void {
    this.regError = undefined;
    this.regSuccess = undefined;

        const user = this.authService.getUser();

    this.registrationsService.getRegistrationsByEvent(eventId).subscribe({
      next: (regs) => {
        this.registrations = regs;
        this.participantsCount = regs.length;

        if (user) {
          const mine = regs.find(r => r.participantId === user.id);
          if (mine) {
            this.isRegistered = true;
            this.registrationId = mine.id;
          } else {
            this.isRegistered = false;
            this.registrationId = undefined;
          }
        } else {
          this.isRegistered = false;
          this.registrationId = undefined;
        }
      },
      error: () => {
        this.regError = 'Erreur lors du chargement des inscriptions.';
      }
    });
  }

  register(): void {
    if (!this.event?.id) return;

    this.regError = undefined;
    this.regSuccess = undefined;

    const user = this.authService.getUser();
    if (!user) {
      this.regError = 'Veuillez vous connecter pour vous inscrire.';
      return;
    }

    this.registrationsService.register(this.event.id, user.id).subscribe({
      next: (reg) => {
        this.regSuccess = 'Inscription réalisée avec succès.';
        this.isRegistered = true;
        this.registrationId = reg.id;
        this.registrations.push(reg);
        this.participantsCount = this.registrations.length;
      },
      error: () => {
        this.regError = 'Erreur lors de l’inscription (peut-être déjà inscrit).';
      }
    });
  }

  unregister(): void {
    if (!this.registrationId) return;

    this.regError = undefined;
    this.regSuccess = undefined;

    this.registrationsService.unregister(this.registrationId).subscribe({
      next: () => {
        this.regSuccess = 'Désinscription effectuée.';
        this.isRegistered = false;
        this.registrations = this.registrations.filter(r => r.id !== this.registrationId);
        this.registrationId = undefined;
        this.participantsCount = this.registrations.length;
      },
      error: () => {
        this.regError = 'Erreur lors de la désinscription.';
      }
    });
  }
}