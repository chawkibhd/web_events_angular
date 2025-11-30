import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventModel } from './event.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  // Toutes les requêtes passent désormais par l'API Gateway (port 8080)
  private baseUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) { }

  getEvents(): Observable<EventModel[]> {
    return this.http.get<EventModel[]>(this.baseUrl);
  }

  getEvent(id: number): Observable<EventModel> {
    return this.http.get<EventModel>(`${this.baseUrl}/${id}`);
  }

  search(
  keyword?: string,
  lieu?: string,
  type?: string,
  dateDebut?: string,
  dateFin?: string
): Observable<EventModel[]> {
  const params: any = {};

  if (keyword && keyword.trim() !== '') params.keyword = keyword;
  if (lieu && lieu.trim() !== '') params.lieu = lieu;
  if (type && type.trim() !== '') params.type = type;
  if (dateDebut && dateDebut !== '') params.dateDebut = dateDebut;
  if (dateFin && dateFin !== '') params.dateFin = dateFin;

  return this.http.get<EventModel[]>(`${this.baseUrl}/search`, { params });
}

  create(event: EventModel): Observable<EventModel> {
    return this.http.post<EventModel>(this.baseUrl, event);
  }

  update(id: number, event: EventModel): Observable<EventModel> {
    return this.http.put<EventModel>(`${this.baseUrl}/${id}`, event);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
