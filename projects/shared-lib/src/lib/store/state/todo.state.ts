import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';

import { tap } from 'rxjs/operators';
import { todoInput, todoOutput } from '../../dto';
import { todoService } from '../../service';
import { AddTodo, DeleteTodo, GetTodoById, GetTodos, UpdateTodo } from '../action';



export interface TodoStateModel {
  todos: todoOutput[] | todoInput[] ;
}

@State<TodoStateModel>({
  name: 'todos',
  defaults: {
    todos: [],
  },
})
@Injectable()
export class TodoState {
  constructor(private todoService: todoService) {}

  @Selector()
  static getTodos(state: TodoStateModel) {
    return state.todos;
  }

  @Action(GetTodos)
  getTodos({ setState }: StateContext<TodoStateModel>) {
    return this.todoService.getTodos().pipe(
      tap((todos: todoOutput[]) => setState({ todos }))
    );
  }

  @Action(GetTodoById)
  getTodoById(
    { getState, setState }: StateContext<TodoStateModel>,
    { id }: GetTodoById
  ) {
    return this.todoService.getTodo(id).pipe(
      tap(() => {
        const filteredTodos = getState().todos.filter(
          (todo) => todo.id == id
        );
        setState({ todos: filteredTodos });
      })
    );
  }

  @Action(AddTodo)
  addTodo(
    { getState, patchState }: StateContext<TodoStateModel>,
    { payload }: AddTodo
  ) {
    return this.todoService.addTodo(payload).pipe(
      tap((newTodo: todoOutput) =>
        patchState({
          todos: [newTodo, ...getState().todos],
        })
      )
    );
  }

  @Action(UpdateTodo)
  updateTodo(
    { getState, setState }: StateContext<TodoStateModel>,
    { payload }: UpdateTodo
  ) {
    return this.todoService.updateTodo(payload).pipe(
      tap(() => {
        const state = getState();
        const todos = [...state.todos];
        const index = todos.findIndex((todo) => todo.id === payload.id);
        if (index !== -1) {
          const updatedTodo = { ...todos[index], ...payload };
          todos[index] = updatedTodo;
          setState({
            ...state,
            todos,
          });
        }
      })
    );
  }

  @Action(DeleteTodo)
  deleteTodo(
    { getState, setState }: StateContext<TodoStateModel>,
    { id }: DeleteTodo
  ) {
    return this.todoService.deleteTodo(id).pipe(
      tap(() => {
        const filteredTodos = getState().todos.filter(
          (todo) => todo.id !== id
        );
        setState({ todos: filteredTodos });
      })
    );
  }
}

