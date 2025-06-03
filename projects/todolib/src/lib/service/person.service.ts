import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { personOutput } from '../dto';


@Injectable({
  providedIn: 'root',
})
export class PersonService {
  getPersons(): Observable<personOutput[]> {
    // Replace with actual implementation
    return of([]);
  }

  getPerson(id: number): Observable<personOutput> {
    // Replace with actual implementation
    return of({ id } as personOutput);
  }

  addPerson(payload: personOutput): Observable<personOutput> {
    // Replace with actual implementation
    return of(payload);
  }

  updatePerson(payload: personOutput): Observable<personOutput> {
    // Replace with actual implementation
    return of(payload);
  }

  deletePerson(id: number): Observable<any> {
    // Replace with actual implementation
    return of(null);
  }
}
