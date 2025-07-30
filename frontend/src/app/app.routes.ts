import { Routes } from '@angular/router';
import { LoginComponent } from './main/login/login.component';
import { DashboardComponent } from './main/dashboard/dashboard.component';
import { RegisterComponent } from './main/register/register.component';
import { AuthGuard } from './services/auth/AuthGard.service';
import { BookListComponent } from './main/bookList/bookList/bookList.component';
import { ReturnComponent } from './main/returns/return.component';
import { OverdueComponent } from './main/overdue/overdue.component';
import { CheckoutComponent } from './main/checkout/checkout.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - Library App'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register - Library App'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    title: 'Dashboard - Library App'
  },
  {
    path: 'return',
    component: ReturnComponent,
    canActivate: [AuthGuard],
    title: 'Returns - Library App'
  },
  {
    path: 'overdue',
    component: OverdueComponent,
    canActivate: [AuthGuard],
    title: 'overdue - Library App'
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'booklist',
    component: BookListComponent,
    canActivate: [AuthGuard],
    title: 'Book List - Library App'
  },
  {
  path: 'checkout',
  component: CheckoutComponent,
  canActivate: [AuthGuard],
  title: 'Checkout - Library App'
  },
  // Add a wildcard route for 404 handling
  {
    path: '**',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  { path: 'returnbook', component: ReturnComponent }
];
