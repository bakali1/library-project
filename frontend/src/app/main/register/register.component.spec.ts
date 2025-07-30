import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegisterComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.myform.value).toEqual({
      fullName: '',
      email: '',
      tel: '',
      password: '',
      repassword: ''
    });
  });

  it('should validate fullName field', () => {
    const fullName = component.myform.controls['fullName'];
    expect(fullName.valid).toBeFalsy();

    fullName.setValue('a');
    expect(fullName.errors?.['minlength']).toBeTruthy();

    fullName.setValue('John Doe');
    expect(fullName.valid).toBeTruthy();
  });

  // Add more test cases for other fields
});
