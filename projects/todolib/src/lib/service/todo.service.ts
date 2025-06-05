import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { todoOutput } from '../dto';

@Injectable({
  providedIn: 'root',
})
export class todoService {
  private readonly API_URL = 'http://localhost:5000/todos';

  constructor(private http: HttpClient) {}

  getTodos(): Observable<todoOutput[]> {
    return this.http.get<todoOutput[]>(this.API_URL);
  }

  getTodo(id: number): Observable<todoOutput> {
    return this.http.get<todoOutput>(`${this.API_URL}/${id}`);
  }

  addTodo(payload: todoOutput): Observable<todoOutput> {
    return this.http.post<todoOutput>(this.API_URL, payload);
  }

  updateTodo(payload: todoOutput): Observable<todoOutput> {
    return this.http.put<todoOutput>(`${this.API_URL}/${payload.id}`, payload);
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
