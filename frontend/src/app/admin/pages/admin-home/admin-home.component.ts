import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menubar } from 'primeng/menubar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-home',
  imports: [
    RouterOutlet, Menubar, 
    SplitButtonModule, ButtonModule,  
    CommonModule, 
  ],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent implements OnInit {
  items: MenuItem[] | undefined;
  userActions: MenuItem[] | undefined;

  constructor(
    private router: Router, 
    public authService: AuthService, 
    public userService: UserService, 
  ) { 
    this.userService.initGetUserDetail();
  }

  ngOnInit(): void {

    this.items = [
      {
          label: 'Anasayfa',
          icon: 'pi pi-home', 
          routerLink: '/'
      },
      {
          label: 'Rezervasyonlar',
          icon: 'pi pi-star', 
          routerLink: '/admin/reservations'
      },
      {
          label: 'Meşhur Güzergahlar Fiyat Listesi',
          icon: 'pi pi-euro', 
          routerLink: '/admin/popularroutes'
      },
      {
          label: 'Kurler',
          icon: 'pi pi-dollar', 
          routerLink: '/admin/rates'
      },
      {
          label: 'Kullanıcılar',
          icon: 'pi pi-user', 
          routerLink: '/admin/users'
      },
  ];

  this.userActions = [
    {
      label: 'See Profile',
      icon: 'pi pi-user',
      command: () => {
        console.log('See Profile clicked');
      }
    },
    {
      label: 'Change Password',
      icon: 'pi pi-lock',
      command: () => {
        console.log('Change Password clicked');
      }
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        this.authService.logout();
        this.router.navigate(['/']);
      }
    }
  ];
  this.router.navigate(['/admin/reservations']);
}

}
