import { personOutput } from "../../dto";

// Actions
export class GetPersons {
  static readonly type = '[Person] Get Persons';
}

export class GetPersonById {
  static readonly type = '[Person] Get Person';
  constructor(public id: string) {}
}

export class AddPerson {
  static readonly type = '[Person] Add Person';
  constructor(public payload: personOutput) {}
}

export class UpdatePerson {
  static readonly type = '[Person] Update Person';
  constructor(public payload: personOutput) {}
}

export class DeletePerson {
  static readonly type = '[Person] Delete Person';
  constructor(public id: string) {}
}
