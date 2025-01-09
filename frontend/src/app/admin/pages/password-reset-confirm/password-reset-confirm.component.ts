import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-password-reset-confirm',
    imports: [
        FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule, 
        FloatLabel, 
    ],
    templateUrl: './password-reset-confirm.component.html',
    styleUrl: './password-reset-confirm.component.scss'
})
export class PasswordResetConfirmComponent {
    uid: string | null;
    token: string | null;
    passwordResetConfirmForm: FormGroup;

    constructor(
      private fb: FormBuilder,
      private userService: UserService,
      private route: ActivatedRoute, 
      private router: Router
    ) {
        this.uid = this.route.snapshot.queryParamMap.get('uid');
        this.token = this.route.snapshot.queryParamMap.get('token');
        console.log(this.uid);
        console.log(this.token);
        this.passwordResetConfirmForm = this.fb.group({
            new_password: ['', Validators.required],
            confirm_password: ['', Validators.required],
            uid: [this.uid, Validators.required],
            token: [this.token, Validators.required]
        });
    }

    onSubmit() {
      console.log(this.passwordResetConfirmForm.value);
        if (this.passwordResetConfirmForm.value.newPassword !== this.passwordResetConfirmForm.value.confirmPassword) {
            console.log('Passwords do not match!');
            return;
        }
        if (this.uid === null || this.token === null) {
            console.log('Invalid URL');
            return;
        }
        if (this.passwordResetConfirmForm.invalid) {
            console.log('Invalid form');
            return;
        }
        this.userService.passwordResetConfirm(this.passwordResetConfirmForm.value).subscribe({
            next: (data) => {
                console.log(data);
                const queryParams = {
                  msg: 'Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.'
                };
                this.onGotoLogin(queryParams);
            },
            error: (error) => {
                console.log(error);
            }
        })
    }

    onGotoLogin(queryParams: any = {}) {
      this.router.navigate(['/login'], { queryParams });
    }
}

