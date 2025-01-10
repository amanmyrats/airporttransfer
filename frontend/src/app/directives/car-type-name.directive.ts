import { Directive, Input, OnChanges, ElementRef } from '@angular/core';
import { CarTypeService } from '../services/car-type.service';

@Directive({
  selector: '[appCarTypeName]'
})
export class CarTypeNameDirective implements OnChanges {
  @Input('appCarTypeName') carTypeCode!: string;

  constructor(private elementRef: ElementRef, private carTypeService: CarTypeService) {}

  ngOnChanges(): void {
    this.updateCarName();
  }

  private updateCarName(): void {
    if (this.carTypeCode) {
      const carType = this.carTypeService.getCarTypeByCode(this.carTypeCode);
      this.elementRef.nativeElement.textContent = carType ? carType.name : 'Unknown Car Type';
    } else {
      this.elementRef.nativeElement.textContent = '';
    }
  }
}
