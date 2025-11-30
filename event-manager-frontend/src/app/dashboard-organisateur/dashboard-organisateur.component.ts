import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventsService } from '../events/events.service';
import { EventModel } from '../events/event.model';
import { RegistrationsService } from '../registrations/registrations.service';
import { Registration } from '../registrations/registration.model';
import { AuthService } from '../auth/auth.service';
import { FileUploadService } from '../files/file-upload.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-dashboard-organisateur',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    // Spartan UI
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports
  ],
  templateUrl: './dashboard-organisateur.component.html',
  styleUrls: ['./dashboard-organisateur.component.css']
})
export class DashboardOrganisateurComponent implements OnInit {

  events: EventModel[] = [];
  loading: boolean = false;
  error?: string;
  success?: string;

  // stats
  participantsStats: { [eventId: number]: number } = {};
  totalRegistrations: number = 0;

  // participants détaillés pour un événement
  selectedEvent?: EventModel;
  selectedEventRegistrations: Registration[] = [];
  participantsLoading: boolean = false;
  participantsError?: string;

  // événement en cours de création
  newEvent: EventModel = {
    titre: '',
    description: '',
    lieu: '',
    dateDebut: '',
    dateFin: '',
    type: '',
    imageUrl: '',
    programmeUrl: ''
    // organisateurId: sera ajouté dans createEvent()
  };

  // fichier image sélectionné pour l’affiche
  selectedImageFile?: File;

  constructor(
    private eventsService: EventsService,
    private registrationsService: RegistrationsService,
    private authService: AuthService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = undefined;

    const user = this.authService.getUser();
    if (!user || user.role !== 'ORGANISATEUR') {
      this.loading = false;
      this.error = 'Veuillez vous connecter en tant qu’organisateur.';
      this.events = [];
      return;
    }

    this.eventsService.getEvents().subscribe({
      next: (data) => {
        const userId = user.id;
        this.events = data.filter(e => e.organisateurId === userId);
        this.loading = false;
        this.loadStats();
      },
      error: () => {
        this.error = 'Erreur lors du chargement des événements.';
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.participantsStats = {};
    this.totalRegistrations = 0;

    // pour chaque événement on récupère ses inscriptions
    this.events.forEach(ev => {
      if (!ev.id) return;

      this.registrationsService.getRegistrationsByEvent(ev.id).subscribe({
        next: (regs) => {
          this.participantsStats[ev.id!] = regs.length;
          this.totalRegistrations = Object.values(this.participantsStats)
            .reduce((sum, nb) => sum + nb, 0);
        },
        error: () => {
          // en cas d’erreur sur un event, on laisse juste 0
          this.participantsStats[ev.id!] = 0;
        }
      });
    });
  }

  onImageFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedImageFile = file;
    }
  }

  /** S'assure que les chaînes datetime-local sont au format ISO avec secondes (pour Spring) */
  private normalizeDateTime(value: string): string {
    if (!value) return '';
    // datetime-local fournit "YYYY-MM-DDTHH:mm" : on ajoute les secondes si absentes
    return value.length === 16 ? `${value}:00` : value;
  }

  createEvent(): void {
    this.error = undefined;
    this.success = undefined;

    const titre = this.newEvent.titre?.trim();
    const lieu = this.newEvent.lieu?.trim();
    const dateDebut = this.normalizeDateTime(this.newEvent.dateDebut);
    const dateFin = this.normalizeDateTime(this.newEvent.dateFin);

    if (!titre || !lieu || !dateDebut || !dateFin) {
      this.error = 'Merci de remplir au minimum le titre, le lieu, la date de début et de fin.';
      return;
    }

    const user = this.authService.getUser();
    if (!user || user.role !== 'ORGANISATEUR') {
      this.error = 'Vous devez être connecté en tant qu’organisateur pour créer un événement.';
      return;
    }

    // Payload prêt pour l'API
    this.newEvent.organisateurId = user.id;
    this.newEvent.titre = titre;
    this.newEvent.lieu = lieu;
    this.newEvent.dateDebut = dateDebut;
    this.newEvent.dateFin = dateFin;

    const create = () => {
      this.eventsService.create(this.newEvent).subscribe({
        next: (created) => {
          this.success = 'Événement créé avec succès.';
          this.events.push(created);
          this.newEvent = {
            titre: '',
            description: '',
            lieu: '',
            dateDebut: '',
            dateFin: '',
            type: '',
            imageUrl: '',
            programmeUrl: ''
          };
          this.selectedImageFile = undefined;
          this.loadStats();
        },
        error: () => {
          this.error = 'Erreur lors de la création de l’événement.';
        }
      });
    };

    // s'il y a un fichier, on l’upload d'abord
    if (this.selectedImageFile) {
      this.fileUploadService.upload(this.selectedImageFile).subscribe({
        next: (url) => {
          this.newEvent.imageUrl = url; // ex: /api/files/xxxx.png
          create();
        },
        error: () => {
          this.error = 'Erreur lors de l’upload de l’affiche.';
        }
      });
    } else {
      // pas de fichier => on crée directement
      create();
    }
  }

  deleteEvent(id?: number): void {
    if (!id) return;
    if (!confirm('Supprimer cet événement ?')) return;

    this.eventsService.delete(id).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== id);
        this.loadStats();
      },
      error: () => {
        this.error = 'Erreur lors de la suppression.';
      }
    });
  }

  loadParticipantsForEvent(event: EventModel): void {
    if (!event.id) return;

    this.selectedEvent = event;
    this.selectedEventRegistrations = [];
    this.participantsLoading = true;
    this.participantsError = undefined;

    this.registrationsService.getRegistrationsByEvent(event.id).subscribe({
      next: (regs) => {
        this.selectedEventRegistrations = regs;
        this.participantsLoading = false;
      },
      error: () => {
        this.participantsError = 'Erreur lors du chargement des participants.';
        this.participantsLoading = false;
      }
    });
  }
}
