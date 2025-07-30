import { LoginService } from '../../services/microservec/login.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  // Current user information
  currentUser = {
    name: 'Library Admin',
    role: 'Librarian',
    avatar: 'assets/images/user-avatar.png' // Default avatar path
  };

  // Branch selection data
  selectedBranch = 1;
  branches = [
    { id: 1, name: 'Main Campus', city: 'Riyadh' },
    { id: 2, name: 'North Branch', city: 'Jeddah' },
    { id: 3, name: 'East Branch', city: 'Dammam' }
  ];

  // School levels data
  activeLevel = 'primary';
  schoolLevels = [
    { id: 'primary', name: 'Primary School' },
    { id: 'middle', name: 'Middle School' },
    { id: 'high', name: 'High School' }
  ];

  // Current date display
  currentDate = new Date();

  // Search functionality
  searchQuery = '';

  constructor(private loginService:LoginService){
  }
  /**
   * Sets the active school level
   * @param levelId The school level ID
   */
  setActiveLevel(levelId: string): void {
    this.activeLevel = levelId;
    // You can add logic here to filter content based on level
    console.log(`Active level changed to: ${levelId}`);
  }

  /**
   * Handles branch selection change
   */
  onBranchChange(): void {
    console.log(`Branch changed to: ${this.selectedBranch}`);
    // Add logic to reload data for the selected branch
  }

  /**
   * Performs search
   */
  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log(`Searching for: ${this.searchQuery}`);
      // Implement your search functionality here
    }
  }

  /**
   * Handles logout
   */
  logout(): void {
    this.loginService.logout()
    // Implement your logout logic here
  }
}
