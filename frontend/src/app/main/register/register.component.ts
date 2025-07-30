import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  myform: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myform = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      tel: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      repassword: ['', [Validators.required]]
    }, { validator: this.passwordsMatch });
  }

  passwordValidator(control: any) {
    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;
    return valid ? null : { weakPassword: true };
  }

  passwordsMatch(group: FormGroup) {
    const pass = group.get('password')?.value;
    const repass = group.get('repassword')?.value;
    return pass === repass ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.myform.valid) {
      console.log('Form Submitted', this.myform.value);
      // Add your registration logic here
    } else {
      this.myform.markAllAsTouched();
    }
  }
}
