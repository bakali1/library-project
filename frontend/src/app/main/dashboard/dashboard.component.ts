import { BorrowingService } from '../../services/microservec/borrowing.service';
import { Component, OnInit } from '@angular/core';
import { UserInfoService } from '../../services/auth/UserInfo.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReturnConfirmDialogComponent } from '../return-confirm-dialog/return-confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DashboardStats {
  activeLoans: number;
  overdueBooks: number;
  teachersWithBooks: number;
  availableCopies: number;
  todayLoans: number;
}

export interface Loans {
  id: number;  // Changed from borrowId to match backend DTO
  teacherName: string;
  bookTitle: string;
  schoolLevel: string;
  dateOut: Date;
  dueDate: Date;
  status: string;
  user: { id: number, userName: string };  // Added user structure
  book: { id: number, title: string };     // Added book structure
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    CommonModule,
    RouterLink,
    MatDialogModule
  ],
  providers: [BorrowingService]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    activeLoans: 0,
    overdueBooks: 0,
    teachersWithBooks: 0,
    availableCopies: 0,
    todayLoans: 0
  };

  recentLoans: Loans[] = [];
  loading = true;
  errorMessage = '';
  schoolLevels: any[] = [];
  activeLevel = 1;

  constructor(
    private borrowingService: BorrowingService,
    private userInfoService: UserInfoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.borrowingService.getBorrowedBooks("-1").subscribe({
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  this.stats = {
    activeLoans: borrows.filter(b => b.status === 'ACTIVE').length,
    overdueBooks: borrows.filter(b => b.status === 'OVERDUE').length,
    teachersWithBooks: new Set(borrows.map(b => b.user?.id)).size,
    availableCopies: 0,
    todayLoans: borrows.filter(b => {
      const borrowDate = new Date(b.borrow_date);
      borrowDate.setHours(0, 0, 0, 0);
      return borrowDate.getTime() === today.getTime();
    }).length
  };

  this.recentLoans = borrows
    .filter(b => b.status === 'ACTIVE' || b.status === 'OVERDUE')
    .sort((a, b) => new Date(b.borrow_date).getTime() - new Date(a.borrow_date).getTime())
    .slice(0, 10)
    .map(borrow => ({
      id: borrow?.id || '-1',  // Using id instead of borrowId to match backend
      teacherName: borrow.user?.userName || 'Unknown Teacher',
      bookTitle: borrow.book?.title || 'Unknown Book',
      schoolLevel: borrow.school || 'Unknown School',
      dateOut: new Date(borrow.borrow_date),
      dueDate: new Date(borrow.due_date),
      status: borrow.status || "Active",
      user: borrow.user,
      book: borrow.book
    }));
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

  returnBook(loan: Loans) {
  if (!loan.id) {
    console.error('Invalid loan object:', loan.id);
    this.snackBar.open('Invalid loan data - missing ID', 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
    return;
  }

  const dialogRef = this.dialog.open(ReturnConfirmDialogComponent, {
    width: '400px',
    data: {
      borrowId: loan.id,  // Using id which matches the backend
      bookTitle: loan.bookTitle,
      teacherName: loan.teacherName,
      dueDate: loan.dueDate
    }
  });

  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (confirmed) {
      this.borrowingService.returnBook(loan.id).subscribe({
        next: () => {
          this.snackBar.open('Book returned successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.refreshData();
        },
        error: (err) => {
          console.error('Return failed:', err);
          const errorMessage = err.error?.message || err.message || 'Failed to return book';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  });
}
}
