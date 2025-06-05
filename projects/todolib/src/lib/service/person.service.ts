import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { personOutput } from '../dto';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private readonly API_URL = 'http://localhost:5000/persons';

  constructor(private http: HttpClient) {}

  getPersons(): Observable<personOutput[]> {
    return this.http.get<personOutput[]>(this.API_URL);
  }

  getPerson(id: number): Observable<personOutput> {
    return this.http.get<personOutput>(`${this.API_URL}/${id}`);
  }

  addPerson(payload: personOutput): Observable<personOutput> {
    return this.http.post<personOutput>(this.API_URL, payload);
  }

  updatePerson(payload: personOutput): Observable<personOutput> {
    return this.http.put<personOutput>(`${this.API_URL}/${payload.id}`, payload);
  }

  deletePerson(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
