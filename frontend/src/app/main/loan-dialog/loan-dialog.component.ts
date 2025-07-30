import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Book } from '../../services/microservec/book.service';
import { FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BorrowingService } from '../../services/microservec/borrowing.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-loan-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './loan-dialog.component.html',
  styleUrls: ['./loan-dialog.component.css']
})
export class LoanDialogComponent {
  borrowerEmail = new FormControl('', [Validators.required, Validators.email]);
  dueDate = new FormControl('', [Validators.required]);
  isLoading = false;
  errorMessage = '';

  constructor(
    public dialogRef: MatDialogRef<LoanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { book: Book },
    private borrowingService: BorrowingService
  ) {
    // Set default due date to 2 weeks from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    this.dueDate.setValue(defaultDueDate.toISOString().split('T')[0]);
  }

  submit(): void {
    if (this.borrowerEmail.invalid || this.dueDate.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loanData = {
      bookId: this.data.book.id,
      borrowerEmail: this.borrowerEmail.value!,
      dueDate: this.dueDate.value!
    };

    this.borrowingService.createLoan(loanData).subscribe({
      next: () => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Failed to create loan';
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
