import { Component, OnInit } from '@angular/core';
import { BorrowingService } from '../../services/microservec/borrowing.service';
import { UserInfoService } from '../../services/auth/UserInfo.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Loans {
  teacherName: string;
  bookTitle: string;
  schoolLevel: string;
  dateOut: Date;
  returnDate: Date;
  status: string;
}

@Component({
  selector: 'app-return',
  templateUrl: './return.component.html',
  styleUrls: ['./return.component.css'],
    imports: [
    CommonModule,
    DatePipe,
    RouterLink
  ],
  providers: [BorrowingService]
})
export class ReturnComponent implements OnInit {

  recentLoans: Loans[] = [];
  loading = true;
  errorMessage = '';
  schoolLevels: any[] = [];
  activeLevel = 1;

  constructor(
    private borrowingService: BorrowingService,
    private userInfoService: UserInfoService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.borrowingService.getBorrowedBooksByStatus("RETURNED","-1").subscribe({
      next: (response) => {
        if (response.success) {
          this.processBorrowData(response.borrows);
        } else {
          this.errorMessage = response.message;
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load dashboard data';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private processBorrowData(borrows: any[]): void {
    // Process recent loans
    this.recentLoans = borrows
      .sort((a, b) => new Date(b.borrow_date).getTime() - new Date(a.borrow_date).getTime())
      .slice(0, 10)
      .map(borrow => ({
        teacherName: borrow.user.userName || 'Unknown Teacher',
        bookTitle: borrow.book.title || 'Unknown Book',
        schoolLevel: borrow.school || 'Unknown School',
        dateOut: new Date(borrow.borrow_date),
        returnDate: new Date(borrow.due_date),
        status: borrow.status
      }));
  }

  whatState(dueDate: Date|string,returnDate:Date|null){
    if(returnDate!= null){
      return "RETURNED";
    }
    return this.isOverdue(dueDate)
  }

  isOverdue(dueDate: Date | string): boolean {
    if (!dueDate) return false;
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    return due < new Date();
  }

  setActiveLevel(levelId: number): void {
    this.activeLevel = levelId;
    // Implement filtering by school level if needed
  }

  refreshData(): void {
    this.loading = true;
    this.loadDashboardData();
  }

}
