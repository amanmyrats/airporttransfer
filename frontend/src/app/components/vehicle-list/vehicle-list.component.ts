import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-vehicle-list',
  imports: [
    CommonModule, 
  ],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss'
})
export class VehicleListComponent {
  fromLocation = 'Antalya Airport';
  toLocation = 'Lara Beach';

  vehicles = [
    {
      name: 'Mercedes Vito',
      price: 50,
      image: 'assets/images/vito.jpg',
    },
    {
      name: 'Mercedes Sprinter',
      price: 70,
      image: 'assets/images/sprinter.jpg',
    },
    {
      name: 'Luxury Sedan',
      price: 40,
      image: 'assets/images/sedan.jpg',
    },
  ];

  onSelectVehicle(vehicle: any): void {
    console.log('Selected Vehicle:', vehicle);
    // Handle vehicle selection logic here
  }
}
