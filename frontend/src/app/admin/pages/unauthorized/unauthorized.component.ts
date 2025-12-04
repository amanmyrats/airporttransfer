import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { usePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

@Component({
    selector: 'app-unauthorized',
    imports: [
        CommonModule, RouterModule,
    ],
    templateUrl: './unauthorized.component.html',
    styleUrl: './unauthorized.component.scss'
})
export class UnauthorizedComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    usePreset(Aura);

  }
}
