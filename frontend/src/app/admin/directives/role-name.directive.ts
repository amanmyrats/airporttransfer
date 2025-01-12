import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appRoleName]'
})
export class RoleNameDirective implements OnChanges {
  @Input('roleKey') roleKey!: string;
  @Input('roleChoices') roleChoices!: any[];

  constructor(
    private elementRef: ElementRef, 
  ) {}

  ngOnChanges(): void {
    this.updateRoleValue();
  }

  private updateRoleValue(): void {
    if (this.roleKey && this.roleChoices) {
      const role = this.roleChoices.find(role => role.key === this.roleKey);
      this.elementRef.nativeElement.textContent = role ? role.value : 'İzın Yok';
    } else {
      this.elementRef.nativeElement.textContent = '';
    }
  }
}
