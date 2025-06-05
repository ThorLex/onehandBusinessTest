import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { TodoState } from 'todolib';
import { personState } from 'todolib';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


@NgModule({
  imports: [
    BrowserModule,
    NgxsModule.forRoot([TodoState, personState]),
    AppComponent,
    RouterModule.forRoot([
      { path: '', component: AppComponent }
    ]),

  ],
  bootstrap: [],
  providers: [
    provideAnimationsAsync()
  ]
})
export class AppModule {}
