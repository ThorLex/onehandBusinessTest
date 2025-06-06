import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';

import { tap } from 'rxjs/operators';
import { personInput, personOutput } from '../../dto';
import { PersonService } from '../../service';
import { AddPerson, DeletePerson, GetPersonById, GetPersons, UpdatePerson } from '../action';



export interface personStateModel {
  persons: personOutput[] | personInput[] ;
}

@State<personStateModel>({
  name: 'persons',
  defaults: {
    persons: [],
  },
})
@Injectable()
export class personState {
  constructor(private personService: PersonService) {}
  @Selector()
  static getpersons(state: personStateModel) {
    return state.persons;
  }

  @Selector()
  static getPersonById(state: personStateModel, id: number) {
    return state.persons.find(person => person.id === id);
  }

  @Selector()
  static personCount(state: personStateModel) {
    return state.persons.length;
  }

  @Selector()
  static getLastAddedPerson(state: personStateModel) {
    return state.persons[0]; // Puisqu'on ajoute toujours au début du tableau
  }

  @Selector()
  static hasPersons(state: personStateModel) {
    return state.persons.length > 0;
  }

  @Action(GetPersons)
  getpersons({ setState }: StateContext<personStateModel>) {
    return this.personService.getPersons().pipe(
      tap((persons: personOutput[]) => setState({ persons }))
    );
  }

  @Action(GetPersonById)
  getpersonById(
    { getState, setState }: StateContext<personStateModel>,
    { id }: GetPersonById
  ) {
    return this.personService.getPerson(id).pipe(
      tap(() => {
        const filteredpersons = getState().persons.filter(
          (person) => person.id == id
        );
        setState({ persons: filteredpersons });
      })
    );
  }

  @Action(AddPerson)
  addperson(
    { getState, patchState }: StateContext<personStateModel>,
    { payload }: AddPerson
  ) {
    return this.personService.addPerson(payload).pipe(
      tap((newperson: personOutput) =>
        patchState({
          persons: [newperson, ...getState().persons],
        })
      )
    );
  }

  @Action(UpdatePerson)
  updateperson(
    { getState, setState }: StateContext<personStateModel>,
    { payload }: UpdatePerson
  ) {
    return this.personService.updatePerson(payload).pipe(
      tap(() => {
        const state = getState();
        const persons = [...state.persons];
        const index = persons.findIndex((person) => person.id === payload.id);
        if (index !== -1) {
          const updatedperson = { ...persons[index], ...payload };
          persons[index] = updatedperson;
          setState({
            ...state,
            persons,
          });
        }
      })
    );
  }

  @Action(DeletePerson)
  deleteperson(
    { getState, setState }: StateContext<personStateModel>,
    { id }: DeletePerson
  ) {
    return this.personService.deletePerson(id).pipe(
      tap(() => {
        const filteredpersons = getState().persons.filter(
          (person) => person.id !== id
        );
        setState({ persons: filteredpersons });
      })
    );
  }
}

