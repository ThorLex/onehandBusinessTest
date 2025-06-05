 import { FormComponent } from './../form/form.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store, Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { GetTodos, TodoState, AddTodo, UpdateTodo, GetPersons, personState, todoOutput, personOutput } from 'todolib'; // Assuming you have AddTodo and UpdateTodo actions in todolib
import { Angular2SmartTableModule, LocalDataSource, Settings } from 'angular2-smart-table';
import { MatDialog } from '@angular/material/dialog';
import { personInput , todoInput } from 'todolib';




interface NavigationItem {
  label: string;
  icon: string;
  count: number;
  active: boolean;
  bgColor: string;
  textColor: string;
}

interface LabelItem {
  label: string;
  color: string;
  count: number;
  active: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    Angular2SmartTableModule,

  ]
})
export class HomeComponent implements OnInit {
  @Select(TodoState.getTodos) todos$!: Observable<todoInput[]>;
  @Select(personState.getpersons) persons$!: Observable<personInput[]>;

  // Données
  source = new LocalDataSource();
  allTodos: todoInput[] = [];
  filteredTodos: todoInput[] = [];


  allPeople: personInput[] = [];

  // États
  errorMessage: string | null = null;
  initialLoading = true;

  // Filtres et recherche
  searchQuery: string = '';
  activePriorityFilter: string | null = null;
  activeLabelFilters: string[] = [];
  sortBy: string = 'title';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalItems: number = 0;

  // Navigation et labels
  navigationItems: NavigationItem[] = [
    {
      label: 'Toutes les tâches',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      count: 0,
      active: true,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    }
  ];

  labels: LabelItem[] = [
    { label: 'HTML', color: 'bg-orange-500', count: 0, active: false },
    { label: 'CSS', color: 'bg-blue-500', count: 0, active: false },
    { label: 'NODE JS', color: 'bg-green-500', count: 0, active: false },
    { label: 'JQUERY', color: 'bg-purple-500', count: 0, active: false }
  ];

  // Configuration du Smart Table
  settings: Settings = {

    columns: {
  iscompleted: {
        title: 'iscompleted',
        type: 'html',
        valuePrepareFunction: (value: todoInput) => {
         if (!value.iscomplete ||undefined) {
            return `
            <mat-checkbox [checked]="true" disabled></mat-checkbox>`;
          }
          return `
            <mat-checkbox [checked]="false" disabled></mat-checkbox>`;
        },
      },

     person: {
        title: 'Personne',
        type: 'html',
 // You can set a custom component if needed
        valuePrepareFunction: (value: personOutput) => {
          return `<img src="${value.avatar || 'https://gravatar.com/avatar/27205e5c51cb03f862138b22bcb5dc20f94a342e744ff6df1b'}" alt="Avatar"">`;
        },
 width: '50px',
      },


      description: {
        title: 'description',
        type: 'text',
      },


      labels: {
        title: 'Labels',
        type: 'html',

      },

    },
    actions: {
      custom: [
        { name: 'checked', title: '<mat-icon>edit</mat-icon>' ,
          renderComponent: TodoCheckboxComponent,
        }
      ],
      position: 'left',
    },

    hideSubHeader: true,
    pager: {
      display: false
    }
  };

  constructor(private store: Store, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadTodos()

  }

  // Chargement des données
  private loadTodos(): void {
    this.store.dispatch(new GetTodos());
    this.store.dispatch(new GetPersons());
    this.initialLoading = true;

    this.todos$.subscribe({
      next: (todos) => {
        this.allTodos = todos;
        this.applyFiltersAndSearch();
        this.updateCounts();
        this.errorMessage = null;
        this.initialLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du chargement des tâches.";
        this.allTodos = [];
        this.filteredTodos = [];
        this.source.load([]);
        this.initialLoading = false;
      }
    });

    this.persons$.subscribe({
      next: (persons) => {
        this.allPeople = persons;
        this.updateCounts();
      },
      error: (err) => {
        console.error("Erreur lors du chargement des personnes:", err);
        this.allPeople = [];
      }
    });
  }

  // Gestion des filtres et recherche
  applyFiltersAndSearch(): void {
    let filtered = [...this.allTodos];

    // Filtre de recherche
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(query) ||
        todo.description.toLowerCase().includes(query) ||
        todo.person?.name?.toLowerCase().includes(query)
      );
    }

    // Filtre de priorité
    if (this.activePriorityFilter) {
      filtered = filtered.filter(todo => todo.priority === this.activePriorityFilter);
    }

    // Filtre de labels
    if (this.activeLabelFilters.length > 0) {
      filtered = filtered.filter(todo =>
        this.activeLabelFilters.every(label => todo.labels.includes(label as any))
      );
    }

    // Tri
    filtered = this.sortData(filtered);

    this.filteredTodos = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
    this.updateTableSource();
  }

  private sortData(data: todoInput[]): todoInput[] {
    return data.sort((a, b) => {
      let aValue: any = (a as any)[this.sortBy];
      let bValue: any = (b as any)[this.sortBy];

      if (this.sortBy === 'person') {
        aValue = a.person?.name || '';
        bValue = b.person?.name || '';
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return this.sortOrder === 'asc' ? comparison : -comparison;
      }

      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private updateTableSource(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const paginatedData = this.filteredTodos.slice(start, start + this.itemsPerPage);
    this.source.load(paginatedData);
  }

  // Gestion des filtres
  togglePriorityFilter(priority: string): void {
    this.activePriorityFilter = this.activePriorityFilter === priority ? null : priority;
    this.applyFiltersAndSearch();
  }

  toggleLabelFilter(label: string): void {
    const index = this.activeLabelFilters.indexOf(label);
    if (index > -1) {
      this.activeLabelFilters.splice(index, 1);
    } else {
      this.activeLabelFilters.push(label);
    }


    const labelItem = this.labels.find(l => l.label === label);
    if (labelItem) {
      labelItem.active = this.activeLabelFilters.includes(label);
    }

    this.applyFiltersAndSearch();
  }


  onSearch(): void {
    this.applyFiltersAndSearch();
  }


  onSortChange(): void {
    this.applyFiltersAndSearch();
  }


  goToPreviousPage(): void {
    console.log('goToPreviousPage called');
    console.log('Current page before decrement:', this.currentPage);

  }

  goToNextPage(): void {
    console.log('goToNextPage called');
    console.log('Current page before increment:', this.currentPage);
    const maxPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage < maxPages) {
      this.currentPage++;
      this.updateTableSource();
    }
  }

  getCurrentRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} sur ${this.totalItems}`;
  }

  // Mise à jour des compteurs
  private updateCounts(): void {
    this.navigationItems[0].count = this.filteredTodos.length;
    this.labels.forEach(label => {
      label.count = this.allTodos.filter(todo =>
        todo.labels.includes(label.label as any)
      ).length;
    });
  }

  // Gestion des événements de navigation
  onNavigationClick(item: NavigationItem ): void {
    console.log('Navigation clicked:', item?.label);
  }

  onLabelClick(label: LabelItem): void {
    this.toggleLabelFilter(label.label);
  }

  // Ajout d'une nouvelle tâche
  onAddNewTask(): void {
    this.openTaskModal(null);
  }


  onEditTask(task: todoInput): void {
    this.openTaskModal(task);
  }

  openTaskModal(task: todoInput | null): void {
    console.log('bonjour a tous ')
    const dialogRef = this.dialog.open(FormComponent, {
      width: '600px',
      data: { task: task, allPeople: this.allPeople }
    });

    dialogRef.componentInstance.saveTask.subscribe((savedTask: todoOutput) => {
      if (savedTask.id) {
        this.store.dispatch(new UpdateTodo(savedTask));
      } else {
        const newId = Math.max(...this.allTodos.map(t => t.id as number)) + 1;
        this.store.dispatch(new AddTodo({ ...savedTask, id: newId }));
      }
      this.loadTodos();
    });

    dialogRef.componentInstance.cancel.subscribe(() => {
      console.log('Modal cancelled');
    });
  }

  // Getters utilitaires
  get Math() {
    return Math;
  }

  get isPreviousDisabled(): boolean {
    return this.currentPage === 1;
  }

  get isNextDisabled(): boolean {
    return this.currentPage >= Math.ceil(this.totalItems / this.itemsPerPage);
  }

  // Méthodes utilitaires pour le template
  getPriorityCount(priority: string): number {
    return this.allTodos.filter(todo => todo.priority === priority).length;
  }

  isPriorityActive(priority: string): boolean {
    return this.activePriorityFilter === priority;
  }

  isLabelActive(label: string): boolean {
    return this.activeLabelFilters.includes(label);
  }
}
