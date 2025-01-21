import { Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { FloatLabel } from 'primeng/floatlabel';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { FormErrorPrinterService } from '../../../services/form-error-printer.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../services/user.service';
import { MessageModule } from 'primeng/message';

@Component({
    selector: 'app-login',
    imports: [
        InputTextModule,
        FloatLabel, 
        FormsModule,
        ButtonModule,
        ReactiveFormsModule, 
        CommonModule,
        PasswordModule,
        ToastModule, 
        MessageModule, 
    ],
    providers: [
        HttpErrorPrinterService, 
        FormErrorPrinterService,
        MessageService,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading: boolean = false;
  queryParams: any = null;
  messages = signal<any[]>([]);

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private httpErrorPrinterService: HttpErrorPrinterService,
    private formErrorPrinterService: FormErrorPrinterService,
    private messageService: MessageService, 
    private userService: UserService, 
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      // Redirect to admin page
      console.log('Redirect to admin page');
      this.userService.initGetUserDetail();
      this.router.navigate(['/admin/reservations/']);
    }
    this.getQueryParams();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(
        this.loginForm.controls['email'].value,
        this.loginForm.controls['password'].value
      ).subscribe({
        next: (success) => {
          if (success) {
            console.log(success)
            // Redirect to admin page
            console.log('Redirect to admin page');
            this.userService.initGetUserDetail();
            this.router.navigate(['/admin/reservations/']);
          } else {
            // Show error message
            console.log('Login failed');
            this.loading = false;
          }
        },
        error: (error) => {
          console.log('Login failed');
          this.loading = false;
          this.httpErrorPrinterService.printHttpError(error);
        }
      });
    } else {
      // Show error message
      console.log('Invalid form');
      this.formErrorPrinterService.printFormValidationErrors(this.loginForm);
    }
  }

  onRegister() {
    this.router.navigate(['/register/']);
  }

  onBackToMain() {
    this.router.navigate(['/']);
  }

  onGoToPasswordReset() {
    console.log('Redirect to password reset page');
    this.router.navigate(['passwordreset/']);
  }

  getQueryParams() {
    this.queryParams = this.router.parseUrl(this.router.url).queryParams;
    if (this.queryParams.msg) {
      this.messages.set([{ severity: 'success', detail: this.queryParams.msg }]);
    }
  }

  addMessage(message: any) {
    const currentMessages = this.messages();
    currentMessages.push(message);
    this.messages.set(currentMessages);
  }

  clearMessages() {
      this.messages.set([]);
  }
}
