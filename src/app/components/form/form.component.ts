import { Component, EventEmitter, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { personInput, todoInput } from 'todolib';

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
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  @ViewChild('labelInput') labelInput!: ElementRef<HTMLInputElement>;

  task: todoInput | null = null;
  saveTask = new EventEmitter<todoInput>();
  cancel = new EventEmitter<void>();
  persons: personInput[] = [];

  taskForm: FormGroup;
  isEditMode = false;
  labelCtrl = new FormControl('');
  filteredLabels: Observable<string[]>;
  availableLabels: Array<'HTML' | 'CSS' | 'NODE JS' | 'JQUERY'> = ['HTML', 'CSS', 'NODE JS', 'JQUERY'];

  constructor(
    public dialogRef: MatDialogRef<FormComponent>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: { task: todoInput | null; allPeople: personInput[] }
  ) {
    this.taskForm = new FormGroup({
      title: new FormControl('', [Validators.required, this.trimValidator]),
      person: new FormControl(null, [Validators.required]),
      startDate: new FormControl(new Date(), Validators.required),
      endDate: new FormControl(null),
      priority: new FormControl('Facile', Validators.required),
      labels: new FormControl([] as Array<string>),
      description: new FormControl(''),
      isCompleted: new FormControl(false)
    });

    this.filteredLabels = this.labelCtrl.valueChanges.pipe(
      startWith(null),
      map((label: string | null) => (label ? this._filterLabels(label) : this.availableLabels.slice()))
    );
  }

  ngOnInit(): void {
    this.persons = this.data.allPeople;

    if (this.data.task) {
      this.task = this.data.task;
      this.isEditMode = true;

      this.taskForm.patchValue({
        title: this.task.title,
        person: this.task.person,
        description: this.task.description,
        priority: this.task.priority,
        labels: this.task.labels || [],
        startDate: this.task.startDate ? new Date(this.task.startDate) : new Date(),
        endDate: this.task.endDate ? new Date(this.task.endDate) : null,
        isCompleted: !!this.task.endDate
      });

      if (this.task.endDate) {
        this.taskForm.get('endDate')?.disable();
      }
    }
  }

  trimValidator(control: FormControl): { [key: string]: any } | null {
    if (typeof control.value === 'string' && control.value.trim().length < 3) {
      return { minlength: true };
    }
    return null;
  }

 getEvent($event: Event): KeyboardEvent
  {
    return $event as KeyboardEvent;
  }

  onCompletionCheckbox(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.onCompletionChange(checked);
  }

  onLabelInputEnter(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value) {
      this.addLabelFromInput({ input, value });
    }
    event.preventDefault();
  }
  getErrorMessage(controlName: string): string {
    const control = this.taskForm.get(controlName);
    if (control?.hasError('required')) return 'Ce champ est requis.';
    if (control?.hasError('minlength')) return 'Minimum 3 caractères requis.';
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
    if (this.labelInput) {
      this.labelInput.nativeElement.value = '';
    }
    this.labelCtrl.setValue(null);
  }

  addLabelFromInput(event: { input: HTMLInputElement, value: string }): void {
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

  isInvalid(controlName: string): boolean {
    const control = this.taskForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  onSave(): void {
    if (!this.taskForm.valid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.getRawValue();
    const startDate = typeof formValue.startDate === 'string' ? new Date(formValue.startDate) : formValue.startDate;
    const endDate = formValue.isCompleted ? new Date() :
                   (typeof formValue.endDate === 'string' && formValue.endDate ? new Date(formValue.endDate) : formValue.endDate);

    const savedTask: todoInput = {
      id: this.isEditMode ? this.data.task?.id ?? null : null,
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
  }

  onCancel(): void {
    this.cancel.emit();
    this.dialogRef.close();
  }
}
