import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserInfoService } from '../auth/UserInfo.service';
import { ApiRequestService } from '../auth/api/api-request.service';
import { Injectable } from "@angular/core";

export interface BorrowResponse {
  success: boolean;
  message: string;
  borrows: Borrow[];
}

interface Borrow {
  id:number
  book: Book;
  user: User;
  borrow_date: Date;
  due_date: Date;
  return_date: Date | null;
  status: string;
  school: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  number_of_copies: string;
  publication_year: number;
  topics: string;
}

interface User {
  id: number;
  userName: string;
  email: string;
  role: string;
  phone: string;
  schoolId: number;
}

@Injectable({
  providedIn: 'root'
})
export class BorrowingService {

  constructor(
    private api: ApiRequestService,
    private userInfo: UserInfoService
  ) {}

    returnBook(borrowId: number): Observable<any> {
    if (!borrowId) {
        return throwError(() => new Error('Borrow ID is required'));
    }

    return this.api.post('book/return', { borrowId }).pipe(
        catchError(error => {
            console.error('Return book error:', error);
            const errorMsg = error.error?.message ||
                          error.message ||
                          'Failed to process return';
            throw new Error(errorMsg);
        })
    );
}

   createLoan(loanData: {bookId: number, borrowerEmail: string, dueDate: string}): Observable<any> {
    // Format due date to ISO string
    const formattedDueDate = new Date(loanData.dueDate).toISOString();

    return this.api.post('book/borrowingcreate', {
        bookId: loanData.bookId,
        borrowerEmail: loanData.borrowerEmail,
        dueDate: formattedDueDate
    }).pipe(
        catchError(error => {
            // Extract backend error message
            const errorMsg = error.error?.message ||
                             error.message ||
                             'Failed to create loan';
            throw new Error(errorMsg);
        })
    );
  };

  getActiveLoans(): Observable<BorrowResponse> {
    return this.api.get('book/borrowsList/ACTIVE');
  }

  getBorrowedBooks(schoolId?: string): Observable<BorrowResponse> {
    const request = {
      school: this.getSchoolId(schoolId)
    };

    return this.api.post('book/borrowsList', request).pipe(
      map(response => this.transformResponse(response)),
      catchError(error => of(this.handleError(error)))
    );
  }

  getBorrowedBooksByStatus(status: string, schoolId?: string): Observable<BorrowResponse> {
    const params = {
      schoolId: this.getSchoolId(schoolId),
      status
    };
    return this.api.get(`book/borrowsList/${status}`, params).pipe(
      map(response => this.transformResponse(response)),
      catchError(error => of(this.handleError(error)))
    );
  }

  private getSchoolId(requestedSchoolId?: string): string {
    const user = this.userInfo.getUserInfo();
    return user?.role === "SUPERADMIN"
      ? requestedSchoolId || '-1'
      : user?.schoolId?.toString() || '';
  }

  private transformResponse(response: any): BorrowResponse {
    return {
      success: response.success === true || response.success === "true",
      message: response.message || '',
      borrows: this.mapBorrows(response.borrowDTOs || [])
    };
  }

  private mapBorrows(borrowDTOs: any[]): Borrow[] {
    return borrowDTOs.map(borrowDto => ({
      id: this.parseNumber(borrowDto.id),
      book: this.mapBook(borrowDto.books),
      user: this.mapUser(borrowDto.user),
      borrow_date: this.parseDate(borrowDto.borrow_date) as Date,
      due_date: this.parseDate(borrowDto.due_date) as Date,
      return_date: this.parseDate(borrowDto.return_date, true),
      status: borrowDto.status || '',
      school: borrowDto.school_id?.toString() || borrowDto.school || 'Unknown School'
    }));
  }

  private mapBook(bookDto: any): Book {
    return {
      id: this.parseNumber(bookDto?.id),
      title: bookDto?.title || 'Unknown Title',
      author: bookDto?.author || 'Unknown Author',
      publisher: bookDto?.publisher || 'Unknown Publisher',
      number_of_copies: bookDto?.numberOfCopies?.toString() || '0',
      publication_year: this.parseNumber(bookDto?.publicationYear),
      topics: bookDto?.topics || 'No topics specified'
    };
  }

  private mapUser(userDto: any): User {
    return {
      id: this.parseNumber(userDto?.id),
      userName: userDto?.userName || 'Unknown User',
      email: userDto?.email || '',
      role: userDto?.role || '',
      phone: userDto?.phone || '',
      schoolId: this.parseNumber(userDto?.schoolId)
    };
  }

  private parseDate(dateString: any, nullable: boolean = false): Date | null {
    if (!dateString) return nullable ? null : new Date();
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? (nullable ? null : new Date()) : date;
  }

  private parseNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  private handleError(error: any): BorrowResponse {
    console.error('Borrowing Service Error:', error);
    return {
      success: false,
      message: error?.message || 'Failed to load borrowed books. Please try again.',
      borrows: []
    };
  }
}
