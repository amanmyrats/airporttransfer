import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RoleService } from '../../services/role.service';

@Component({
    selector: 'app-action-buttons',
    imports: [
        ButtonModule, CommonModule
    ],
    templateUrl: './action-buttons.component.html',
    styleUrl: './action-buttons.component.scss'
})
export class ActionButtonsComponent implements OnInit{
  @Input() wantEdit: boolean = false;
  @Input() wantDelete: boolean = false;
  @Input() wantDetail: boolean = false;
  @Input() wantAssignDriver: boolean = false;
  @Input() wantDownloadPdf: boolean = false;
  @Input() wantChangeRequest: boolean = false;
  @Input() editRole: string = 'company_yonetici';
  @Input() deleteRole: string = 'company_yonetici';
  @Input() detailRole: string = 'company_yonetici';
  @Input() assignDriverRole: string = 'company_operasyoncu';
  @Input() downloadPdfRole: string = 'company_operasyoncu';
  @Input() changeRequestRole: string = 'company_rezervasyoncu';
  @Input() obj: any;
  @Output() updateEmitter: EventEmitter<any> = new EventEmitter();
  @Output() deleteEmitter: EventEmitter<any> = new EventEmitter();
  @Output() detailEmitter: EventEmitter<any> = new EventEmitter();
  @Output() assignDriverEmitter: EventEmitter<any> = new EventEmitter();
  @Output() downloadPdfEmitter: EventEmitter<any> = new EventEmitter();
  @Output() changeRequestEmitter: EventEmitter<any> = new EventEmitter();

  constructor(
    public roleService: RoleService,
  ) { }

  ngOnInit(): void {
  }

  onUpdate() {
    this.updateEmitter.emit(this.obj);
  }

  onDelete() {
    this.deleteEmitter.emit(this.obj.id);
  }

  onDetail() {
    this.detailEmitter.emit(this.obj);
  }

  onAssignDriver() {
    this.assignDriverEmitter.emit(this.obj);
  }

  downloadPdf() {
    this.downloadPdfEmitter.emit(this.obj);
  }

  onChangeRequest(): void {
    this.changeRequestEmitter.emit(this.obj);
  }

  hasPermission(roleName: string): boolean {
    return this.roleService.hasRole(roleName);
  }
}
