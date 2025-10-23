import { Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute, 
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
            

        // Get redirect URL from query param or sessionStorage, fallback to /admin/reservations/
        console.log('this.route.snapshot.queryParamMap.get("returnUrl"):', this.route.snapshot.queryParamMap.get('returnUrl'));
        const queryReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        // get ruturnUrl from queryReturnUrl
        const targetUrl = queryReturnUrl || '/admin/reservations/';
        console.log('queryReturnUrl:', queryReturnUrl);
        console.log('targetUrl:', targetUrl);
        // Clear stored returnUrl so it doesn't persist across sessions
        try { sessionStorage.removeItem('auth.returnUrl'); } catch {}

        this.router.navigateByUrl(targetUrl);
        
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

// import { Component, OnInit, signal, inject } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';
// import { ButtonModule } from 'primeng/button';
// import { InputTextModule } from 'primeng/inputtext';
// import { MessageService } from 'primeng/api';
// import { ToastModule } from 'primeng/toast';
// import { CommonModule } from '@angular/common';
// import { PasswordModule } from 'primeng/password';
// import { FloatLabel } from 'primeng/floatlabel';
// import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
// import { FormErrorPrinterService } from '../../../services/form-error-printer.service';
// import { AuthService } from '../../../services/auth.service';
// import { UserService } from '../../services/user.service';
// import { MessageModule } from 'primeng/message';
// import { finalize } from 'rxjs/operators';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     InputTextModule,
//     FloatLabel,
//     FormsModule,
//     ButtonModule,
//     ReactiveFormsModule,
//     CommonModule,
//     PasswordModule,
//     ToastModule,
//     MessageModule,
//   ],
//   providers: [
//     HttpErrorPrinterService,
//     FormErrorPrinterService,
//     MessageService,
//   ],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.scss'
// })
// export class LoginComponent implements OnInit {
//   loginForm: FormGroup;
//   loading = false;
//   messages = signal<any[]>([]);

//   private router = inject(Router);
//   private route = inject(ActivatedRoute);
//   private authService = inject(AuthService);
//   private fb = inject(FormBuilder);
//   private httpErrorPrinterService = inject(HttpErrorPrinterService);
//   private formErrorPrinterService = inject(FormErrorPrinterService);
//   private messageService = inject(MessageService);
//   private userService = inject(UserService);

//   constructor() {
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required]], // add Validators.email if your backend expects an email
//       password: ['', Validators.required]
//     });
//   }

//   ngOnInit() {
//     // Show optional message from query param (?msg=...)
//     const msg = this.route.snapshot.queryParamMap.get('msg');
//     if (msg) {
//       this.messages.set([{ severity: 'success', detail: msg }]);
//     }

//     // If already logged in, immediately redirect to target
//     if (this.authService.isLoggedIn()) {
//       const target = this.getSafeReturnUrl() ?? '/admin/reservations/';
//       this.userService.initGetUserDetail();
//       this.router.navigateByUrl(target);
//     }
//   }

//   onSubmit() {
//     if (!this.loginForm.valid) {
//       this.formErrorPrinterService.printFormValidationErrors(this.loginForm);
//       return;
//     }

//     this.loading = true;
//     const email = this.loginForm.controls['email'].value;
//     const password = this.loginForm.controls['password'].value;

//     this.authService.login(email, password)
//       .pipe(finalize(() => (this.loading = false)))
//       .subscribe({
//         next: (success) => {
//           if (success) {
//             this.userService.initGetUserDetail();

//             // Prefer explicit returnUrl query param, then sessionStorage fallback, then default
//             const returnUrl = this.getSafeReturnUrl() ?? '/admin/reservations/';
//             this.clearStoredReturnUrl();
//             this.router.navigateByUrl(returnUrl);
//           } else {
//             this.addMessage({ severity: 'error', detail: 'Login failed. Please check your credentials.' });
//           }
//         },
//         error: (error) => {
//           this.httpErrorPrinterService.printHttpError(error);
//         }
//       });
//   }

//   onRegister() {
//     this.router.navigate(['/register/']);
//   }

//   onBackToMain() {
//     this.router.navigate(['/']);
//   }

//   onGoToPasswordReset() {
//     this.router.navigate(['passwordreset/']);
//   }

//   /** ---- helpers ---- */

//   private getSafeReturnUrl(): string | null {
//     // 1) from query param
//     const qp = this.route.snapshot.queryParamMap.get('returnUrl');
//     if (qp && this.isSafeAppUrl(qp)) return qp;

//     // 2) from sessionStorage (set by interceptor on 401)
//     try {
//       const stored = sessionStorage.getItem('auth.returnUrl');
//       if (stored && this.isSafeAppUrl(stored)) return stored;
//     } catch {}

//     return null;
//   }

//   private clearStoredReturnUrl() {
//     try { sessionStorage.removeItem('auth.returnUrl'); } catch {}
//   }

  // Basic guard: only allow in-app relative paths
  // private isSafeAppUrl(url: string): boolean {
  //   // Reject absolute URLs to prevent open redirects
  //   return !/^https?:\/\//i.test(url);
  // }

//   addMessage(message: any) {
//     const currentMessages = this.messages();
//     currentMessages.push(message);
//     this.messages.set(currentMessages);
//   }

//   clearMessages() {
//     this.messages.set([]);
//   }
// }
