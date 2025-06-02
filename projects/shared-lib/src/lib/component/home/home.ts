import { Component } from '@angular/core';

@Component({
  selector: 'lib-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

  constructor() {
    this.onInit();
  }

  onInit() {
    console.log('HomeComponent initialized');
  }

  protected title = 'Shared Library Home Component';

}
