import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';

@Component({
  selector: 'app-admin-home',
  imports: [
    RouterOutlet, Menubar, 
  ],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent implements OnInit {
  items: MenuItem[] | undefined;

  constructor(private router: Router) { }

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

  this.router.navigate(['/admin/reservations']);
}

}
