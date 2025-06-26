import { Component } from '@angular/core';
import { environment as env } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dev-env',
  imports: [
    CommonModule, 
  ],
  templateUrl: './dev-env.component.html',
  styleUrl: './dev-env.component.scss'
})
export class DevEnvComponent {
  isDevEnvironment = !env.production;

}
