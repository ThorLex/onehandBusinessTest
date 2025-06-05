
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { TodoState } from 'todolib';
import { personState } from 'todolib';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule } from '@angular/common/http';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Angular2SmartTableModule } from 'angular2-smart-table';
import { FormsModule, ReactiveFormsModule, Validators, FormControl, FormGroup, Form } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';



@NgModule({

  imports: [
    BrowserModule,
    HttpClientModule,
     NgxsReduxDevtoolsPluginModule.forRoot({}),
     NgxsLoggerPluginModule.forRoot({}),
     NgxsModule.forRoot([TodoState, personState], {
            developmentMode: false
          }),
    NgxsModule.forRoot([TodoState, personState]),

     CommonModule,
      FormsModule,
      MatCheckboxModule,
      MatIconModule,
      MatButtonModule,
      Angular2SmartTableModule,
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
  exports: [
     CommonModule,
      FormsModule,
      MatCheckboxModule,
      MatIconModule,
      MatButtonModule,
      Angular2SmartTableModule,
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

  bootstrap: [],
  providers: [

    provideAnimationsAsync()
  ]
})
export class AppModule {}
