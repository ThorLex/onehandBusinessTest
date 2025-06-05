
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators, FormControl, FormGroup, Form } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

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
  id?: number; // Optional for new tasks
  title: string;
  person: Person;
  startDate: string;
  endDate: string | null;
  priority: 'Facile' | 'Moyen' | 'Difficile';
  labels: Array<'HTML' | 'CSS' | 'NODE JS' | 'JQUERY'>;
  description: string;
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  @Input() task: TodoItem | null = null;
  @Input() allPeople: Person[] = []; // List of all available people
  @Output() saveTask = new EventEmitter<TodoItem>();
  @Output() cancel = new EventEmitter<void>();

  taskForm: FormGroup;
  isEditMode = false;

  filteredPeople: Observable<Person[]>;
  labelInput = { nativeElement: { value: '' } }; // Mock for label input element
  labelCtrl = new FormControl();
  availableLabels: Array<'HTML' | 'CSS' | 'NODE JS' | 'JQUERY'> = ['HTML', 'CSS', 'NODE JS', 'JQUERY'];
  filteredLabels: Observable<string[]>;

  constructor(public dialogRef: MatDialogRef<FormComponent>) {
    this.taskForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(3)]),
      person: new FormControl(null, [Validators.required, this.personNameMinLengthValidator, this.personUniqueNameValidator]),
      startDate: new FormControl(new Date(), Validators.required),
      endDate: new FormControl(null),
      priority: new FormControl('Facile', Validators.required),
      labels: new FormControl([] as Array<'HTML' | 'CSS' | 'NODE JS' | 'JQUERY'>),
      description: new FormControl(''),
      isCompleted: new FormControl(false)
    });

    this.filteredPeople = this.taskForm.get('person')!.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value?.name)),
      map(name => (name ? this._filterPeople(name) : this.allPeople.slice()))
    );

    this.filteredLabels = this.labelCtrl.valueChanges.pipe(
      startWith(null),
      map((label: string | null) => (label ? this._filterLabels(label) : this.availableLabels.slice())),
    );
  }

  ngOnInit(): void {
    if (this.task) {
      this.isEditMode = true;
      this.taskForm.patchValue({
        ...this.task,
        person: this.task.person, // Ensure person object is patched correctly
        startDate: new Date(this.task.startDate),
        endDate: this.task.endDate ? new Date(this.task.endDate) : null,
        isCompleted: !!this.task.endDate // If endDate exists, task is completed
      });
      if (this.task.endDate) {
        this.taskForm.get('endDate')?.disable();
      }
    }
  }

  // Custom validator for person name min length (after trim)
  personNameMinLengthValidator(control: FormControl): { [key: string]: any } | null {
    const person = control.value as Person;
    if (person && typeof person.name === 'string' && person.name.trim().length < 3) {
      return { 'personNameMinLength': true };
    }
    return null;
  }

  // Custom validator for unique person name (considering allPeople)
  personUniqueNameValidator = (control: FormControl): { [key: string]: any } | null => {
    const person = control.value as Person;
    if (person && typeof person.name === 'string' && this.allPeople) {
      const foundPerson = this.allPeople.find(p => p.name.trim().toLowerCase() === person.name.trim().toLowerCase());
      if (foundPerson && (!this.isEditMode || (this.isEditMode && this.task && foundPerson.id !== this.task.person.id))) {
        return { 'personNameUnique': true };
      }
    }
    return null;
  }

  // Helper to display person name in autocomplete
  displayPersonName(person: Person): string {
    return person ? person.name : '';
  }

  private _filterPeople(value: string): Person[] {
    const filterValue = value.toLowerCase();
    return this.allPeople.filter(person => person.name.toLowerCase().includes(filterValue));
  }

  getErrorMessage(controlName: string): string {
    const control = this.taskForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis.';
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} caractères requis.`;
    }
    if (control?.hasError('email')) {
      return 'Adresse e-mail invalide.';
    }
    if (control?.hasError('personNameMinLength')) {
      return 'Le nom de la personne doit avoir au moins 3 caractères (après suppression des espaces).';
    }
    if (control?.hasError('personNameUnique')) {
      return 'Ce nom de personne existe déjà.';
    }
    return '';
  }

  onCompletionChange(checked: boolean): void {
    if (checked) {
      this.taskForm.get('endDate')?.setValue(new Date());
      this.taskForm.get('endDate')?.disable();
    } else {
      this.taskForm.get('endDate')?.setValue(null);
      this.taskForm.get('endDate')?.enable();
    }
  }

  removeLabel(label: string): void {
    const labels = this.taskForm.get('labels')?.value as string[];
    const index = labels.indexOf(label);
    if (index >= 0) {
      labels.splice(index, 1);
      this.taskForm.get('labels')?.setValue(labels);
    }
  }

  selectedLabel(event: any): void {
    const labels = this.taskForm.get('labels')?.value as string[];
    const value = event.option.viewValue;
    if (value && !labels.includes(value)) {
      labels.push(value);
      this.taskForm.get('labels')?.setValue(labels);
    }
    this.labelInput.nativeElement.value = '';
    this.labelCtrl.setValue(null);
  }

  addLabelFromInput(event: any): void {
    const input = event.input;
    const value = (event.value || '').trim();

    if (value && this.availableLabels.includes(value as any)) {
      const labels = this.taskForm.get('labels')?.value as string[];
      if (!labels.includes(value)) {
        labels.push(value as any);
        this.taskForm.get('labels')?.setValue(labels);
      }
    }

    if (input) {
      input.value = '';
    }
    this.labelCtrl.setValue(null);
  }

  private _filterLabels(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableLabels.filter(label => label.toLowerCase().includes(filterValue));
  }


  onSave(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.getRawValue(); // Use getRawValue to get disabled field values
      const savedTask: TodoItem = {
        ...this.task, // Keep existing ID if in edit mode
        title: formValue.title.trim(),
        person: formValue.person,
        startDate: formValue.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        endDate: formValue.endDate ? formValue.endDate.toISOString().split('T')[0] : null,
        priority: formValue.priority,
        labels: formValue.labels,
        description: formValue.description
      };
      this.saveTask.emit(savedTask);
      this.dialogRef.close();
    } else {
      // Mark all fields as touched to display validation errors
      this.taskForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.dialogRef.close();
  }
}
