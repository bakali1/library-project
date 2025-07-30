import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { BorrowingService } from '../../services/microservec/borrowing.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-return',
  standalone: true, // Mark as standalone
  templateUrl: './return.component.html',
  styleUrls: ['./return.component.css'],
  imports: [ // Add all required modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterModule,
    DatePipe // Add DatePipe here
  ],
  providers: [DatePipe] // Provide DatePipe if needed
})
export class ReturnComponent implements OnInit {
  borrowIdControl = new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/)]);
  isLoading = false;
  activeLoans: any[] = [];

  constructor(
    private borrowingService: BorrowingService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadActiveLoans();
  }

  loadActiveLoans(): void {
    this.borrowingService.getActiveLoans().subscribe({
      next: (response) => {
        if (response.success) {
          this.activeLoans = response.borrows.map((loan: any) => ({
            id: loan.id,
            bookTitle: loan.book.title,
            teacherName: loan.user.userName,
            dueDate: new Date(loan.due_date)
          }));
        }
      },
      error: (err) => {
        console.error('Failed to load active loans', err);
      }
    });
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }

  submitReturn(): void {
    // Validate input
    if (!this.borrowIdControl.value) {
        this.snackBar.open('Please enter a borrow ID', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
        });
        return;
    }

    const borrowId = parseInt(this.borrowIdControl.value, 10);

    // Validate numeric value
    if (isNaN(borrowId)) {
        this.snackBar.open('Borrow ID must be a number', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
        });
        return;
    }

    // Validate positive number
    if (borrowId <= 0) {
        this.snackBar.open('Borrow ID must be a positive number', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
        });
        return;
    }

    this.isLoading = true;

    this.borrowingService.returnBook(borrowId).subscribe({
        next: () => {
            this.isLoading = false;
            this.snackBar.open('Book returned successfully!', 'Close', {
                duration: 3000,
                panelClass: ['success-snackbar']
            });
            this.borrowIdControl.reset();
            this.loadActiveLoans();
        },
        error: (err) => {
            this.isLoading = false;
            this.handleReturnError(err);
        }
    });
}

private handleReturnError(err: any) {
    const errorKey: string = err.message || 'UNKNOWN_ERROR';
    const errorMessages: { [key: string]: string } = {
        'MISSING_BORROW_ID': 'Borrow ID is required',
        'INVALID_BORROW_ID': 'Invalid borrow ID format',
        'BORROW_NOT_FOUND': 'Loan record not found',
        'UNKNOWN_ERROR': 'An unexpected error occurred'
    };

    this.snackBar.open(errorMessages[errorKey] || errorKey, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
    });
}


  returnSelected(loan: any): void {
    this.borrowIdControl.setValue(loan.id.toString());
    this.submitReturn();
  }

  scanBarcode(): void {
    // Simulate barcode scan
    if (this.activeLoans.length > 0) {
      const randomLoan = this.activeLoans[Math.floor(Math.random() * this.activeLoans.length)];
      this.borrowIdControl.setValue(randomLoan.id.toString());
      this.snackBar.open(`Scanned borrow ID: ${randomLoan.id}`, 'Close', { duration: 2000 });
    } else {
      this.snackBar.open('No active loans to scan', 'Close', { duration: 3000 });
    }
  }
}
