// bookList.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { BookService, BookResponse } from '../../../services/microservec/book.service';
import { NgFor, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgFor, AsyncPipe],
  templateUrl: './bookList.component.html',
  styleUrls: ['./bookList.component.css']
})
export class BookListComponent implements OnInit, OnDestroy {
  bookStatus$: Observable<BookResponse>;
  isLoading = true;
  errorMessage: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private bookService: BookService) {
    this.bookStatus$ = this.bookService.getBooks();
  }

  ngOnInit() {
    this.bookStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (status) => {
        this.isLoading = false;
        this.errorMessage = status.success ? null : status.message;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load books. Please try again later.';
        console.error('Error loading books:', err);
      }
    });
  }

  getStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push('bi-star-fill');
    }

    if (hasHalfStar) {
      stars.push('bi-star-half');
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push('bi-star');
    }

    return stars;
  }

  retryLoading() {
    this.isLoading = true;
    this.errorMessage = null;
    this.bookStatus$ = this.bookService.getBooks();
    this.ngOnInit();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
