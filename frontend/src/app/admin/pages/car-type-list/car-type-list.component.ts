import { Component, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';
import { SharedToolbarComponent } from '../../components/shared-toolbar/shared-toolbar.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { CarTypeFormComponent } from '../../components/car-type-form/car-type-form.component';
import { FilterSearchComponent } from '../../components/filter-search/filter-search.component';
import { SharedPaginatorComponent } from '../../components/shared-paginator/shared-paginator.component';
import { environment as env } from '../../../../environments/environment';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { CarType } from '../../models/car-type.model';
import { CarTypeService } from '../../services/car-type.service';
import { PaginatedResponse } from '../../../models/paginated-response.model';

@Component({
    selector: 'app-car-type-list',
    imports: [
        TableModule,
        ToastModule,
        InputTextModule,
        ConfirmDialogModule,
        ActionButtonsComponent,
        SharedToolbarComponent, FilterSearchComponent, SharedPaginatorComponent,
    ],
    providers: [
        DialogService,
        MessageService,
        ConfirmationService,
        HttpErrorPrinterService,
    ],
    templateUrl: './car-type-list.component.html',
    styleUrl: './car-type-list.component.scss'
})
export class CarTypeListComponent implements OnInit {

  // Pagination
  @ViewChild(FilterSearchComponent) filterSearch!: FilterSearchComponent;
  first: number = 0;
  rows: number = 2;
  totalRecords: number = 0;
    
  loading: boolean = false;
  car_types: CarType[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(
    private carTypeService: CarTypeService, 
    public dialogService: DialogService,
    public messageService: MessageService, 
    private confirmationService: ConfirmationService, 
    private httpErrorPrinter: HttpErrorPrinterService
  ) {}

  ngOnInit() {
    this.rows = env.pagination.defaultPageSize;
  }

  getCarTypes(queryString: string = '') {
    this.loading = true;
    this.carTypeService.getCarTypes(queryString).subscribe({
      next: (paginatedCarTypes: PaginatedResponse<CarType>) => {
        console.log('Fetched CarTypes successfully: ', paginatedCarTypes);
        this.car_types = paginatedCarTypes.results!;
        this.totalRecords = paginatedCarTypes.count!;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching CarTypes: ', error)
        this.loading = false;
      }
    });
  }

  updateObj(carType: CarType) {
    this.showForm(carType);
  }

  createObj() {
    this.showForm();
  }

  deleteObj(id: string) {
    this.confirmationService.confirm({
      message: 'Silmek istediğinizden emin misiniz?',
      header: 'Silme İşlemi',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass:"p-button-danger p-button-text",
      rejectButtonStyleClass:"p-button-text p-button-text",
      acceptIcon:"none",
      rejectIcon:"none",
      acceptLabel: "Sil",
      rejectLabel: "Vazgeç",
      dismissableMask: true, 

      accept: () => {
        this.carTypeService.deleteCarType(id).subscribe({
          next: (res: any) => {
            this.messageService.add(
              {severity:'success', summary:'Başarılı', detail:'Başarıyla silindi!'});
            this.filterSearch.search();
          },
          error: (err: HttpErrorResponse) => {
            this.httpErrorPrinter.printHttpError(err);
          }
        });
      }
    });

  }

  showForm(objToEdit: CarType | null = null) {
    this.ref = this.dialogService.open(CarTypeFormComponent, {
      header: 'Araba Tipi Ekle/Düzenle',
      styleClass: 'fit-content-dialog',
      contentStyle: { "overflow": "auto" },
      closable: true,
      modal: true,
      data: {
        carType: objToEdit
      }, 
      draggable: true,
      resizable: true,
    });

    this.ref.onClose.subscribe((carType: CarType) => {
      if (carType) {
        if (objToEdit) {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'CarType updated successfully' });
        } else {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'CarType added successfully' });
        }
        this.filterSearch.search();
      }
    });
  }

  search(queryString: string = ''): void {
    this.getCarTypes(queryString);
  }

  onPageChange(event: any): void {
    this.filterSearch.event.first = event.first;
    this.filterSearch.event.rows = event.rows;
    this.filterSearch.search();
  }


}
