import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { todoOutput } from '../dto';


@Injectable({
  providedIn: 'root',
})
export class todoService {
  getTodos(): Observable<todoOutput[]> {
    // Replace with actual implementation
    return of([]);
  }

  getTodo(id: number): Observable<todoOutput> {
    // Replace with actual implementation
    return of({ id } as todoOutput);
  }

  addTodo(payload: todoOutput): Observable<todoOutput> {
    // Replace with actual implementation
    return of(payload);
  }

  updateTodo(payload: todoOutput): Observable<todoOutput> {
    // Replace with actual implementation
    return of(payload);
  }

  deleteTodo(id: number): Observable<any> {
    // Replace with actual implementation
    return of(null);
  }
}
