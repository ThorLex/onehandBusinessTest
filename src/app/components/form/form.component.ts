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
import { GetPersons } from 'todolib';
import { Store } from '@ngxs/store';
import { personInput,todoInput } from 'todolib';





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
  @Input() task: todoInput | null = null;
  @Input() allPeople: personInput[] = []; // List of all available people
  @Output() saveTask = new EventEmitter<todoInput>();
  @Output() cancel = new EventEmitter<void>();

  taskForm: FormGroup;
  isEditMode = false;

  filteredPeople: Observable<personInput[]>;
  labelInput = { nativeElement: { value: '' } };
  labelCtrl = new FormControl();
  availableLabels: Array<'HTML' | 'CSS' | 'NODE JS' | 'JQUERY'> = ['HTML', 'CSS', 'NODE JS', 'JQUERY'];
  filteredLabels: Observable<string[]>;

  // Pour la traduction (exemple, à adapter selon ton système)
  translate(key: string): string {
    const translations: any = {
      'form.required': 'Ce champ est requis.',
      'form.minlength': 'Minimum 3 caractères requis.',
      'form.email': 'Adresse e-mail invalide.',
      'form.personNameMinLength': 'Le nom de la personne doit avoir au moins 3 caractères (après suppression des espaces).',
      'form.personNameUnique': 'Ce nom de personne existe déjà.',
      'form.titleUnique': 'Ce titre existe déjà.',
    };
    return translations[key] || key;
  }

  // Ajoute une méthode pour styliser les champs invalides
  isInvalid(controlName: string): boolean {
    const control = this.taskForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  constructor(public dialogRef: MatDialogRef<FormComponent>,
    private store: Store,
  ) {
    this.taskForm = new FormGroup({
      title: new FormControl('', [Validators.required, this.trimValidator]),
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
    this.store.dispatch(new GetPersons());
    if (this.task) {
      this.isEditMode = true;
      this.taskForm.patchValue({
        ...this.task,
        person: this.task.person,
        startDate: this.task.startDate ? this.task.startDate : '',
        endDate: this.task.endDate ? this.task.endDate : null,
        isCompleted: !!this.task.endDate
      });
      if (this.task.endDate) {
        this.taskForm.get('endDate')?.disable();
      }
    }
  }

  getPersons(){
this.store.dispatch(new GetPersons());
  }

  // Validator pour trim sur le titre
  trimValidator(control: FormControl): { [key: string]: any } | null {
    if (typeof control.value === 'string' && control.value.trim().length < 3) {
      return { 'minlength': true };
    }
    return null;
  }

  // Custom validator for person name min length (after trim)
  personNameMinLengthValidator(control: FormControl): { [key: string]: any } | null {
    const person = control.value as personInput;
    if (person && typeof person.name === 'string' && person.name.trim().length < 3) {
      return { 'personNameMinLength': true };
    }
    return null;
  }

  // Custom validator for unique person name (considering allPeople)
  personUniqueNameValidator = (control: FormControl): { [key: string]: any } | null => {
    const person = control.value as personInput;
    if (person && typeof person.name === 'string' && this.allPeople) {
      const foundPerson = this.allPeople.find(p => p.name.trim().toLowerCase() === person.name.trim().toLowerCase());
      if (foundPerson && (!this.isEditMode || (this.isEditMode && this.task && foundPerson.id !== this.task.person.id))) {
        return { 'personNameUnique': true };
      }
    }
    return null;
  }

  // Handler pour l'input personne (autocomplete natif)
  onPersonInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const found = this.allPeople.find(p => p.name === value);
    if (found) {
      this.taskForm.get('person')?.setValue(found);
    } else {
      this.taskForm.get('person')?.setValue({ name: value } as any);
    }
  }

  // Handler pour la checkbox terminée
  onCompletionCheckbox(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.onCompletionChange(checked);
  }

  // Handler pour l'ajout de label avec Enter
  onLabelInputEnter(event: KeyboardEvent |any) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value) {
      this.addLabelFromInput({ input, value });
    }
    event.preventDefault();
  }

  // Helper to display personInput name in autocomplete
  displayPersonName(personInput: personInput): string {
    return personInput ? personInput.name : '';
  }

  private _filterPeople(value: string): personInput[] {
    const filterValue = value.toLowerCase();
    return this.allPeople.filter(personInput => personInput.name.toLowerCase().includes(filterValue));
  }

  getErrorMessage(controlName: string): string {
    const control = this.taskForm.get(controlName);
    if (control?.hasError('required')) {
      return this.translate('form.required');
    }
    if (control?.hasError('minlength')) {
      return this.translate('form.minlength');
    }
    if (control?.hasError('email')) {
      return this.translate('form.email');
    }
    if (control?.hasError('personNameMinLength')) {
      return this.translate('form.personNameMinLength');
    }
    if (control?.hasError('personNameUnique')) {
      return this.translate('form.personNameUnique');
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
      const formValue = this.taskForm.getRawValue();
      // Correction : conversion des dates si elles sont de type string
      let startDate = formValue.startDate;
      let endDate = formValue.endDate;
      if (typeof startDate === 'string') {
        startDate = new Date(startDate);
      }
      if (formValue.isCompleted) {
        endDate = new Date();
      } else if (typeof endDate === 'string' && endDate) {
        endDate = new Date(endDate);
      }
      const savedTask: todoInput = {
        ...this.task,
        id: this.task?.id as number,
        title: formValue.title.trim(),
        person: formValue.person,
        startDate: startDate ? startDate.toISOString().split('T')[0] : '',
        endDate: endDate ? endDate.toISOString().split('T')[0] : null,
        priority: formValue.priority,
        labels: formValue.labels,
        description: formValue.description
      };
      this.saveTask.emit(savedTask);
      this.dialogRef.close();
    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.dialogRef.close();
  }
}
