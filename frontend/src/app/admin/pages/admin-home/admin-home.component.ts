import { Component, effect, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Menubar } from 'primeng/menubar';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { PopoverModule } from 'primeng/popover';

import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';
import { OverlayModule } from 'primeng/overlay';
import { Popover } from 'primeng/popover';
import { AuthService } from '../../../services/auth.service';
import { ActiveRouteService } from '../../../services/active-route.service';

@Component({
  selector: 'app-admin-home',
  imports: [
    RouterOutlet, Menubar, 
    ButtonModule, 
    PopoverModule, 
    MenubarModule,
    BadgeModule,
    AvatarModule,
    RippleModule,
    CommonModule,
    MenuModule,
    OverlayModule,
    Popover,
    RouterModule,
  ],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent implements OnInit {
    
    @ViewChild('op') op: any | null = null;
    
    items: MenuItem[] | undefined;
    userMenuItems: MenuItem[] | undefined;
    activeRoute: string = '';
    logoPath: string = '';
    firstName: string = '';
    
    constructor(
        private activeRouteService: ActiveRouteService,
        private router: Router,
        private userService: UserService, 
        private authService: AuthService, 
    ) { 
        
        effect(() => {
            this.setNavbarMenu();
        });
    }

    ngOnInit() {
        this.userService.initGetUserDetail();

        this.getFirstName();

        this.logoPath = 'logos/logo_airporttransfer-min.png';

        this.activeRouteService.activeRoute$.subscribe(route => {
            this.activeRoute = route;
        });

        this.router.navigate(['/admin/reservations']);
    }

    setNavbarMenu(): void {
        this.setSuperAdminMenu();
        this.setUserMenu();
    }

    onMenuItemClick(linkAddress: string) {
        (this.op ?? { hide: () => { } }).hide();
        this.router.navigateByUrl(linkAddress);
    }

    getFirstName(): void {
        this.firstName = localStorage?.getItem('firstName')!;
    }

    private setSuperAdminMenu() {
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
    }

    private setUserMenu() {
        this.userMenuItems = [
            {
                label: 'Profil',
                icon: 'pi pi-user',
                command: () => this.onMenuItemClick('/admin/users/profile')

            },
            {
                label: 'Şifre değiştir',
                icon: 'pi pi-key',
                command: () => this.onMenuItemClick('/admin/users/changepassword')
            },
            {
                label: 'Çıkış',
                icon: 'pi pi-sign-out',
                command: () => this.authService.logout()
            },
        ];
    }
}