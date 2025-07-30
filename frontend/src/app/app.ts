import { Component } from '@angular/core';
import { LoginComponent } from "./main/login/login.component";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "./main/header/header.component";
import 'zone.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterModule, CommonModule, HeaderComponent]
})
export class App {
  title = 'libraryproject';
  constructor() { }
}
