import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetTodos, TodoState } from 'todolib';
import { Angular2SmartTableModule, Settings } from 'angular2-smart-table';
import { DomSanitizer } from '@angular/platform-browser';

interface TodoItem {
  id: number;
  title: string;
  person: {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    createdAt: string;
    updatedAt: string;
  };
  startDate: string;
  endDate: string | null;
  priority: 'Facile' | 'Moyen' | 'Difficile';
  labels: Array<'HTML' | 'CSS' | 'NODE JS' | 'JQUERY'>;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    Angular2SmartTableModule
  ]
})
export class HomeComponent implements OnInit {
  @Select(TodoState.getTodos) todos$!: Observable<TodoItem[]>;
  errorMessage: string | null = null;
  initialLoading = true;
  source: TodoItem[] = [];
  filteredSource: TodoItem[] = [];

  priorities = ['Facile', 'Moyen', 'Difficile'];
  labels = ['HTML', 'CSS', 'NODE JS', 'JQUERY'];
  activePriorityFilter: string | null = null;
  activeLabelFilters: string[] = [];
  searchQuery: string = '';

  currentPage: number = 1;
  pageSize: number = 8;
  get Math() { return Math; }

  settings: Settings = {
    columns: {
      avatar: {
        title: '',
        type: 'html',
        valuePrepareFunction: (cell: any, row: any) => {
          return `<img src="${row.person?.avatar || ''}" alt="avatar" style="width:32px;height:32px;border-radius:50%;" />`;
        },
        width: '48px'
      },
      title: {
        title: 'Titre',
        type: 'text',
        filter: { type: 'text' }
      },
      person: {
        title: 'Personne',
        type: 'html',
        valuePrepareFunction: (cell: any, row: any) => {
          return `<span><i class='fas fa-user text-blue-400 mr-1'></i> ${row.person?.name || ''}</span>`;
        },
        filter: { type: 'text' }
      },
      startDate: {
        title: 'Début',
        type: 'text',
        filter: { type: 'text' }
      },
      endDate: {
        title: 'Fin',
        type: 'text',
        filter: { type: 'text' }
      },
      priority: {
        title: 'Priorité',
        type: 'html',
        valuePrepareFunction: (cell: any) => {
          let icon = '';
          let color = '';
          if (cell === 'Facile') { icon = 'fa-circle-check'; color = 'text-green-500'; }
          if (cell === 'Moyen') { icon = 'fa-circle-exclamation'; color = 'text-yellow-500'; }
          if (cell === 'Difficile') { icon = 'fa-circle-xmark'; color = 'text-red-500'; }
          return `<span><i class='fas ${icon} ${color} mr-1'></i> ${cell}</span>`;
        },
        filter: {
          type: 'list',
          config: {
            list: [
              { title: 'Facile', value: 'Facile' },
              { title: 'Moyen', value: 'Moyen' },
              { title: 'Difficile', value: 'Difficile' }
            ],
            selectText: 'Toutes'
          }
        }
      },
      labels: {
        title: 'Labels',
        type: 'html',
        valuePrepareFunction: (cell: any) => {
          if (!Array.isArray(cell)) return '';
          return cell.map((label: string) => {
            let icon = '';
            let color = '';
            if (label === 'HTML') { icon = 'fa-html5'; color = 'text-orange-500'; }
            if (label === 'CSS') { icon = 'fa-css3-alt'; color = 'text-blue-500'; }
            if (label === 'NODE JS') { icon = 'fa-node-js'; color = 'text-green-500'; }
            if (label === 'JQUERY') { icon = 'fa-js'; color = 'text-purple-500'; }
            return `<span class='inline-flex items-center mr-1'><i class='fab ${icon} ${color} mr-1'></i>${label}</span>`;
          }).join(' ');
        },
        filter: {
          type: 'list',
          config: {
            list: [
              { title: 'HTML', value: 'HTML' },
              { title: 'CSS', value: 'CSS' },
              { title: 'NODE JS', value: 'NODE JS' },
              { title: 'JQUERY', value: 'JQUERY' }
            ],
            selectText: 'Tous'
          }
        }
      },
      description: {
        title: 'Description',
        type: 'text',
        filter: { type: 'text' }
      }
    },
    actions: false,
    hideSubHeader: true
  };

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.initialLoading = true;
    this.store.dispatch(new GetTodos());
    this.todos$.subscribe({
      next: (todos) => {
        this.source = todos;
        this.applyFiltersAndSearch();
        this.errorMessage = null;
        this.initialLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Erreur lors du chargement des tâches.";
        this.source = [];
        this.filteredSource = [];
        this.initialLoading = false;
      }
    });
  }

  // Remplace la logique de pagination custom par celle du smart-table
  get pagedSource(): TodoItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSource.slice(start, start + this.pageSize);
  }

  // Recherche et tri sont gérés par le smart-table, donc on ne filtre plus côté composant
  applyFiltersAndSearch(): void {
    let filtered = [...this.source];
    if (this.activePriorityFilter) {
      filtered = filtered.filter(todo => todo.priority === this.activePriorityFilter);
    }
    if (this.activeLabelFilters.length > 0) {
      filtered = filtered.filter(todo =>
        this.activeLabelFilters.every(label => todo.labels.includes(label as any))
      );
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(q) ||
        todo.description.toLowerCase().includes(q) ||
        todo.person?.name?.toLowerCase().includes(q)
      );
    }
    this.filteredSource = filtered;
  }

  togglePriorityFilter(priority: string): void {
    this.activePriorityFilter = this.activePriorityFilter === priority ? null : priority;
    this.applyFiltersAndSearch();
  }

  toggleLabelFilter(label: string): void {
    if (this.activeLabelFilters.includes(label)) {
      this.activeLabelFilters = this.activeLabelFilters.filter(l => l !== label);
    } else {
      this.activeLabelFilters = [...this.activeLabelFilters, label];
    }
    this.applyFiltersAndSearch();
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value;
    this.applyFiltersAndSearch();
  }
}
