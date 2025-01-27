import { AfterViewInit, Component, effect, OnInit, ViewChild } from '@angular/core';
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
import { LoginComponent } from '../login/login.component';
import { SOCIAL_ICONS } from '../../../constants/social.constants';

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
    LoginComponent,
  ],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent implements OnInit {
  socialIcons = SOCIAL_ICONS;

  @ViewChild('op') op: any | null = null;

  items: MenuItem[] | undefined;
  userMenuItems: MenuItem[] | undefined;
  activeRoute: string = '';
  firstName: string = '';

  constructor(
    private activeRouteService: ActiveRouteService,
    private router: Router,
    public userService: UserService,
    public authService: AuthService,
  ) {
    this.setNavbarMenu();
  }

  ngOnInit() {
    this.userService.initGetUserDetail();
    this.activeRouteService.activeRoute$.subscribe(route => {
      this.activeRoute = route;
    });
  }

  setNavbarMenu(): void {
    this.setSuperAdminMenu();
    this.setUserMenu();
  }

  onMenuItemClick(linkAddress: string) {
    (this.op ?? { hide: () => { } }).hide();
    this.router.navigateByUrl(linkAddress);
  }

  logOut() {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

  getFirstName(): void {
    this.firstName = localStorage?.getItem('firstName')!;
  }

  private setSuperAdminMenu() {
    this.items = [
      {
        label: 'Rezervasyonlar',
        icon: 'pi pi-star',
        routerLink: '/admin/reservations/'
      },
      {
        label: 'Meşhur Güzergahlar Fiyat Listesi',
        icon: 'pi pi-euro',
        routerLink: '/admin/popularroutes/'
      },
      {
        label: 'Kurlar',
        icon: 'pi pi-dollar',
        routerLink: '/admin/rates/'
      },
      {
        label: 'Kullanıcılar',
        icon: 'pi pi-user',
        routerLink: '/admin/users/'
      },
    ];
  }

  private setUserMenu() {
    this.userMenuItems = [
      {
        label: 'Profil',
        icon: 'pi pi-user',
        command: () => this.onMenuItemClick('/admin/profile/')

      },
      {
        label: 'Şifre değiştir',
        icon: 'pi pi-key',
        command: () => this.onMenuItemClick('/admin/changepassword/')
      },
      {
        label: 'Çıkış',
        icon: 'pi pi-sign-out',
        command: () => this.logOut()
      },
    ];
  }
}