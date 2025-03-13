import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { UserService } from '../../services/user.service';
import { usePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

@Component({
    selector: 'app-password-reset',
    imports: [
        ToastModule, FormsModule, ReactiveFormsModule, ButtonModule, 
        InputTextModule, 
        FloatLabel, 
    ],
    providers: [
        HttpErrorPrinterService, MessageService,
    ],
    templateUrl: './password-reset.component.html',
    styleUrl: './password-reset.component.scss'
})
export class PasswordResetComponent implements OnInit {
  passwordResetForm: FormGroup;
  loading: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private httpErrorPrinterService: HttpErrorPrinterService,
  ) {
    this.passwordResetForm = this.fb.group({
      email: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    usePreset(Aura);
  }

  onSubmit() {
    if (this.passwordResetForm.valid) {
      this.loading = true;
      this.userService.passwordReset(this.passwordResetForm.value).subscribe({
        next: (resp: any) => {
          console.log('Password reset request response:');
          console.log(resp);
          const queryParams = {
            email: this.passwordResetForm.value.email,
            msg: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
          };
          this.onGotoLogin(queryParams);
          this.loading = false;
        },
        error: (error: any) => {
          console.log(error);
          this.httpErrorPrinterService.printHttpError(error);
          this.loading = false;
        }
      });
    } else {
      console.log('Invalid form');
    }
  }

  onGotoLogin(queryParams: any = {}) {
    this.router.navigate(['/login/'], { queryParams });
  }

}
