import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Registration } from './registration.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationsService {

  // Passe par le gateway pour joindre le microservice des inscriptions
  private baseUrl = 'http://localhost:8080/api/registrations';

  constructor(private http: HttpClient) { }

  // S'inscrire
  register(eventId: number, participantId: number = 1): Observable<Registration> {
    const body: Registration = {
      eventId,
      participantId,
      statut: 'INSCRIT'
    };
    return this.http.post<Registration>(this.baseUrl, body);
  }

  // Se désinscrire (via l'id d'inscription)
  unregister(registrationId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${registrationId}`);
  }

  // Récupérer les inscriptions pour un événement
  getRegistrationsByEvent(eventId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.baseUrl}/event/${eventId}`);
  }

  // (plus tard) : récupérer les inscriptions d'un participant
  getRegistrationsByParticipant(participantId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.baseUrl}/participant/${participantId}`);
  }
}
