import { HomeComponent } from 'shared-lib';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HomeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor() {
    this.oninit();
  }

  oninit(){
    console.log('App initialized');
  }
  protected title = 'Todo List Application';
}
