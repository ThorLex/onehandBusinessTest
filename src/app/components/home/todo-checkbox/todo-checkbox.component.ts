import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-center">
      <input
        type="checkbox"
        [checked]="rowData.completed"
        (change)="onChange($event)"
        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
      >
    </div>
  `
})
export class TodoCheckboxComponent {
  @Input() value: boolean = false;
  @Input() rowData: any;

  @Output() save: EventEmitter<any> = new EventEmitter();

  onChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.save.emit({
      data: this.rowData,
      value: checkbox.checked
    });
  }
}
