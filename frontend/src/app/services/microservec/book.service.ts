import { Injectable } from '@angular/core';
import { ApiRequestService } from '../auth/api/api-request.service';
import { UserInfoService } from '../auth/UserInfo.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface BookResponse {
  success: boolean;
  message: string;
  books: Book[];
}

export interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  numberOfCopies: number;
  publicationYear: number;
  topics: string;
  schoolId: number;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  constructor(
    private api: ApiRequestService,
    private userInfo: UserInfoService
  ) {}

  getBooks(): Observable<BookResponse> {
    // Prepare request payload according to backend expectations
    const request = {
      school: this.userInfo.getUserInfo()!.schoolId,
    };
    return this.api.post('book/bookList', request).pipe(
      map(response => this.transformResponse(response)),
      catchError(error => of(this.handleError(error)))
    );
  }

  private transformResponse(response: any): BookResponse {
    // Handle backend response format
    const success = response.success === true || response.success === "true";
    const message = response.message || '';

    // Map books array to consistent format
    const books = (response.books || []).map((book: any) => ({
      id: book.id,
      title: book.title || '',
      author: book.author || '',
      publisher: book.publisher || '',
      numberOfCopies: this.parseNumber(book.numberOfCopies ?? book.number_of_copies),
      publicationYear: this.parseNumber(book.publicationYear ?? book.publication_year),
      topics: book.topics || '',
      schoolId: this.parseNumber(book.schoolId ?? book.school_id)
    }));

    return { success, message, books };
  }

  private parseNumber(value: any): number {
    // Handle various number formats safely
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  private handleError(error: any): BookResponse {
    // Handle APIRequestService error format
    const errorMessage = error?.message || 'Failed to load books. Please try again.';
    return {
      success: false,
      message: errorMessage,
      books: []
    };
  }
}
