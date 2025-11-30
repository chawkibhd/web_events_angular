import { Routes } from '@angular/router';

import { EventsListComponent } from './events/events-list/events-list.component';
import { EventDetailComponent } from './events/event-detail/event-detail.component';
import { DashboardOrganisateurComponent } from './dashboard-organisateur/dashboard-organisateur.component';
import { NotificationsListComponent } from './notifications/notifications-list/notifications-list.component';
import { LoginComponent } from './auth/login/login.component';

import { authGuard } from './auth/auth.guard';
import { organisateurGuard } from './auth/organisateur.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },

  { path: 'events', component: EventsListComponent },

  { path: 'events/:id', component: EventDetailComponent },

  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: DashboardOrganisateurComponent,
    canActivate: [authGuard, organisateurGuard]
  },

  {
    path: 'notifications',
    component: NotificationsListComponent,
    canActivate: [authGuard]
  },

  { path: '**', redirectTo: 'events' }
];