import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventsService } from '../events.service';
import { EventModel } from '../event.model';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-events-list',
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
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit {

  events: EventModel[] = [];
  loading: boolean = false;
  error?: string;

  // critères de recherche
  keyword: string = '';
  lieu: string = '';
  type: string = '';
  dateDebut: string = '';
  dateFin: string = '';
  showAdvanced = false;

  constructor(private eventsService: EventsService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = undefined;

    this.eventsService.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des événements.';
        this.loading = false;
      }
    });
  }

  search(): void {
    // toggle advanced hidden? keep state
    // si aucun critère => recharger tout
    if (
      (!this.keyword || this.keyword.trim() === '') &&
      (!this.lieu || this.lieu.trim() === '') &&
      (!this.type || this.type.trim() === '') &&
      !this.dateDebut &&
      !this.dateFin
    ) {
      this.loadEvents();
      return;
    }

    this.loading = true;
    this.error = undefined;

    this.eventsService
      .search(this.keyword, this.lieu, this.type, this.dateDebut, this.dateFin)
      .subscribe({
        next: (data) => {
          this.events = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'Erreur lors de la recherche.';
          this.loading = false;
        }
      });
  }

  resetFilters(): void {
    this.keyword = '';
    this.lieu = '';
    this.type = '';
    this.dateDebut = '';
    this.dateFin = '';
    this.loadEvents();
  }

  toggleAdvanced(): void {
    this.showAdvanced = !this.showAdvanced;
  }
}
