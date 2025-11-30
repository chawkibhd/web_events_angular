import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  // Les fichiers passent par le gateway vers events-service
  private baseUrl = 'http://localhost:8080/api/files';

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(this.baseUrl + '/upload', formData, {
      responseType: 'text'
    });
  }
}
