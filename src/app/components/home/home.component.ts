import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GetTodos, TodoState } from 'todolib';
import { Angular2SmartTableModule, LocalDataSource, Settings } from 'angular2-smart-table';

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
    Angular2SmartTableModule
  ]
})
export class HomeComponent implements OnInit {
  @Select(TodoState.getTodos) todos$!: Observable<TodoItem[]>;

  // Données
  source = new LocalDataSource();
  allTodos: TodoItem[] = [];
  filteredTodos: TodoItem[] = [];

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
  settings:Settings = {
    columns: {
      avatar: {
        title: '',
        type: 'html',
        valuePrepareFunction: ( row: TodoItem) => {
          return `<img src="${row.person?.avatar || ''}" alt="avatar" style="width:32px;height:32px;border-radius:50%;" />`;
        },
        width: '48px',


      },
      title: {
        title: 'Titre',
        type: 'text',

      },
      person: {
        title: 'Personne',
        type: 'html',
        valuePrepareFunction: ( row: TodoItem) => {
          return `<span><i class='fas fa-user text-blue-400 mr-1'></i> ${row.person?.name || ''}</span>`;
        },

      },
      startDate: {
        title: 'Début',
        type: 'text',
        valuePrepareFunction: (value: string) => {
          return new Date(value).toLocaleDateString('fr-FR');
        },

      },
      endDate: {
        title: 'Fin',
        type: 'text',
        valuePrepareFunction: (value: string | null) => {
          return value ? new Date(value).toLocaleDateString('fr-FR') : '-';
        },

      },
      priority: {
        title: 'Priorité',
        type: 'html',
        valuePrepareFunction: (cell: string) => {
          const priorityConfig = {
            'Facile': { icon: 'fa-check-circle', color: 'text-green-500' },
            'Moyen': { icon: 'fa-exclamation-circle', color: 'text-yellow-500' },
            'Difficile': { icon: 'fa-times-circle', color: 'text-red-500' }
          };
          const config = priorityConfig[cell as keyof typeof priorityConfig];
          return `<span><i class='fa ${config.icon} ${config.color} mr-1'></i> ${cell}</span>`;
        },

      },
      labels: {
        title: 'Labels',
        type: 'html',
        valuePrepareFunction: (cell: string[]) => {
          if (!Array.isArray(cell)) return '';
          const labelConfig = {
            'HTML': { icon: 'fab fa-html5', color: 'text-orange-500' },
            'CSS': { icon: 'fab fa-css3-alt', color: 'text-blue-500' },
            'NODE JS': { icon: 'fab fa-node-js', color: 'text-green-500' },
            'JQUERY': { icon: 'fab fa-js', color: 'text-purple-500' }
          };
          return cell.map((label: string) => {
            const config = labelConfig[label as keyof typeof labelConfig];
            return `<span class='inline-flex items-center mr-1'><i class='${config.icon} ${config.color} mr-1'></i>${label}</span>`;
          }).join(' ');
        },

      },
      description: {
        title: 'Description',
        type: 'text',

      }
    },
    actions: false,
    hideSubHeader: true,
    pager: {
      display: false
    }
  };

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.loadTodos();
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
      let aValue: any = a[this.sortBy as keyof TodoItem];
      let bValue: any = b[this.sortBy as keyof TodoItem];

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
    // Logique pour la navigation si nécessaire
    console.log('Navigation clicked:', item.label);
  }

  onLabelClick(label: LabelItem): void {
    this.toggleLabelFilter(label.label);
  }

  // Ajout d'une nouvelle tâche
  onAddNewTask(): void {
    // Logique pour ajouter une nouvelle tâche
    console.log('Ajouter une nouvelle tâche');
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
