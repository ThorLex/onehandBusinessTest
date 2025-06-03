import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class FormComponent implements OnInit {
  protected title = 'Todo Form';

  constructor() {}

  ngOnInit() {
    console.log('FormComponent initialized');
  }

  // Add your form logic here
  // For example, you can define form controls, validation, and submission methods
}
