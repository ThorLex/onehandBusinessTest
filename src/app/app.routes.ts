import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { FormComponent } from './components/form/form.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'task', component: AppComponent },
  // { path: 'person', component: Personcomponent },
];
