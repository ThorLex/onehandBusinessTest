import { FormComponent } from './../form/form.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store, Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { GetTodos, TodoState, AddTodo, UpdateTodo } from 'todolib'; // Assuming you have AddTodo and UpdateTodo actions in todolib
import { Angular2SmartTableModule, LocalDataSource, Settings } from 'angular2-smart-table';
import { MatDialog } from '@angular/material/dialog';

interface Person {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

interface TodoItem {
  id: number;
  title: string;
  person: Person;
  startDate: string;
  endDate: string | null;
  priority: 'Facile' | 'Moyen' | 'Difficile';
  labels: Array<'HTML' | 'CSS' | 'NODE JS' | 'JQUERY'>;
  description: string;
}

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
  @Select(TodoState.getTodos) todos$!: Observable<TodoItem[]>;

  // Données
  source = new LocalDataSource();
  allTodos: TodoItem[] = [];
  filteredTodos: TodoItem[] = [];

  // Assuming you have a list of all possible people for the autocomplete
  // This would typically come from a service or another state
  allPeople: Person[] = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', phone: '111-222-3333', avatar: 'https://i.pravatar.cc/150?img=1', createdAt: '', updatedAt: '' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', phone: '444-555-6666', avatar: 'https://i.pravatar.cc/150?img=2', createdAt: '', updatedAt: '' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '777-888-9999', avatar: 'https://i.pravatar.cc/150?img=3', createdAt: '', updatedAt: '' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', phone: '123-456-7890', avatar: 'https://i.pravatar.cc/150?img=4', createdAt: '', updatedAt: '' },
  ];

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
      avatar: {
        title: '',
        type: 'html',

        width: '48px',
      },
      title: {
        title: 'Titre',
        type: 'text',
      },
      person: {
        title: 'Personne',
        type: 'html',


      },
      startDate: {
        title: 'Début',
        type: 'text',

      },
      endDate: {
        title: 'Fin',
        type: 'text',

      },
      priority: {
        title: 'Priorité',
        type: 'html',

      },
      labels: {
        title: 'Labels',
        type: 'html',

      },
      description: {
        title: 'Description',
        type: 'text',
      },
      actions: {
        title: 'Actions',
        type: 'html',


      }
    },
    actions: {
      columnTitle: '',
      add: false,
      edit: false,
      delete: false,
      custom: [
        { name: 'edit', title: '<i class="material-icons">edit</i>' }
      ],
      position: 'right'
    },
    edit: {
      editButtonContent: '<mat-icon>edit</mat-icon>',
    },
    delete: {
      deleteButtonContent: '<mat-icon>delete</mat-icon>',
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

  private sortData(data: TodoItem[]): TodoItem[] {
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

    // Mise à jour de l'état actif
    const labelItem = this.labels.find(l => l.label === label);
    if (labelItem) {
      labelItem.active = this.activeLabelFilters.includes(label);
    }

    this.applyFiltersAndSearch();
  }

  // Gestion de la recherche
  onSearch(): void {
    this.applyFiltersAndSearch();
  }

  // Gestion du tri
  onSortChange(): void {
    this.applyFiltersAndSearch();
  }

  // Gestion de la pagination
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateTableSource();
    }
  }

  goToNextPage(): void {
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
    // Mise à jour du compteur principal
    this.navigationItems[0].count = this.filteredTodos.length;

    // Mise à jour des compteurs de labels
    this.labels.forEach(label => {
      label.count = this.allTodos.filter(todo =>
        todo.labels.includes(label.label as any)
      ).length;
    });
  }

  // Gestion des événements de navigation
  onNavigationClick(item: NavigationItem): void {
    console.log('Navigation clicked:', item.label);
  }

  onLabelClick(label: LabelItem): void {
    this.toggleLabelFilter(label.label);
  }

  // Ajout d'une nouvelle tâche
  onAddNewTask(): void {
    this.openTaskModal(null); // Open modal for adding a new task
  }

  // Édition d'une tâche existante
  onEditTask(task: TodoItem): void {
    this.openTaskModal(task); // Open modal for editing an existing task
  }

  openTaskModal(task: TodoItem | null): void {
    const dialogRef = this.dialog.open(FormComponent, {
      width: '600px',
      data: { task: task, allPeople: this.allPeople } // Pass existing task data and all people
    });

    dialogRef.componentInstance.saveTask.subscribe((savedTask: TodoItem) => {
      if (savedTask.id) {
        // Update existing task
        this.store.dispatch(new UpdateTodo(savedTask)); // Assuming you have an UpdateTodo action
      } else {
        // Add new task with a generated ID (for demonstration, in real app, backend would provide ID)
        const newId = Math.max(...this.allTodos.map(t => t.id)) + 1;
        this.store.dispatch(new AddTodo({ ...savedTask, id: newId })); // Assuming you have an AddTodo action
      }
      this.loadTodos(); // Reload to reflect changes
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
