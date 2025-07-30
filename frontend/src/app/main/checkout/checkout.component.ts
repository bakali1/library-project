// checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { BookService, Book } from '../../services/microservec/book.service';
import { MatDialog } from '@angular/material/dialog';
import { LoanDialogComponent } from '../loan-dialog/loan-dialog.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  books: Book[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private bookService: BookService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (response) => {
        this.books = response.books;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load books';
        this.isLoading = false;
      }
    });
  }

  openLoanDialog(book: Book): void {
    const dialogRef = this.dialog.open(LoanDialogComponent, {
      width: '500px',
      data: { book }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadBooks();
      }
    });
  }
}
