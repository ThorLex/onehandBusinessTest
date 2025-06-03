import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { TodoState } from 'todolib';
import { personState } from 'todolib';


@NgModule({
  imports: [
    BrowserModule,
    NgxsModule.forRoot([TodoState, personState]),
    AppComponent,
    RouterModule.forRoot([
      { path: '', component: AppComponent }
    ]),

  ],
  bootstrap: []
})
export class AppModule {}
