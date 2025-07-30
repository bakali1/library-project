import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-return-confirm-dialog',
  standalone: true, // Mark as standalone
  imports: [ // Add required modules
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    DatePipe
  ],
  template: `
    <h2 mat-dialog-title>Confirm Return</h2>
    <mat-dialog-content>
      <p>Return <strong>{{data.bookTitle}}</strong> borrowed by {{data.teacherName}}?</p>
      <p>Due Date: {{data.dueDate | date:'shortDate'}}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="confirmReturn()">
        Confirm Return
      </button>
    </mat-dialog-actions>
  `
})
export class ReturnConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ReturnConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  confirmReturn() {
    this.dialogRef.close(true);
  }
}
