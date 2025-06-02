import { todoOutput } from "../../dto";

// Actions
export class GetTodos {
  static readonly type = '[Todo] Get Todos';
}

export class GetTodoById {
  static readonly type = '[Todo] Get Todo';
  constructor(public id: number) {}
}

export class AddTodo {
  static readonly type = '[Todo] Add Todo';
  constructor(public payload: todoOutput) {}
}

export class UpdateTodo {
  static readonly type = '[Todo] Update Todo';
  constructor(public payload: todoOutput) {}
}

export class DeleteTodo {
  static readonly type = '[Todo] Delete Todo';
  constructor(public id: number) {}
}
