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
import { FilterSearchComponent } from '../../components/filter-search/filter-search.component';
import { SharedPaginatorComponent } from '../../components/shared-paginator/shared-paginator.component';
import { environment as env } from '../../../../environments/environment';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { PaginatedResponse } from '../../../models/paginated-response.model';
import { MainLocationService } from '../../services/main-location.service';
import { MainLocation } from '../../models/main-location.model';
import { MainLocationFormComponent } from '../../components/main-location-form/main-location-form.component';

@Component({
  selector: 'app-main-location-list',
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
  templateUrl: './main-location-list.component.html',
  styleUrl: './main-location-list.component.scss'
})
export class MainLocationListComponent implements OnInit {

  // Pagination
  @ViewChild(FilterSearchComponent) filterSearch!: FilterSearchComponent;
  first: number = 0;
  rows: number = 2;
  totalRecords: number = 0;
    
  loading: boolean = false;
  mainLocations: MainLocation[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(
    private mainLocationService: MainLocationService, 
    public dialogService: DialogService,
    public messageService: MessageService, 
    private confirmationService: ConfirmationService, 
    private httpErrorPrinter: HttpErrorPrinterService
  ) {}

  ngOnInit() {
    this.rows = env.pagination.defaultPageSize;
  }

  getMainLocations(queryString: string = '') {
    this.loading = true;
    this.mainLocationService.getMainLocations(queryString).subscribe({
      next: (paginatedResponse: PaginatedResponse<MainLocation>) => {
        console.log('Fetched MainLocations successfully: ', paginatedResponse);
        this.mainLocations = paginatedResponse.results!;
        this.totalRecords = paginatedResponse.count!;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching MainLocations: ', error)
        this.loading = false;
      }
    });
  }

  updateObj(mainLocation: MainLocation) {
    this.showForm(mainLocation);
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
        this.mainLocationService.deleteMainLocation(id).subscribe({
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

  showForm(objToEdit: MainLocation | null = null) {
    this.ref = this.dialogService.open(MainLocationFormComponent, {
      header: 'Ana Lokasyon Ekle/Düzenle',
      styleClass: 'fit-content-dialog',
      contentStyle: { "overflow": "auto" },
      closable: true,
      modal: true,
      data: {
        mainLocation: objToEdit
      }, 
      draggable: true,
      resizable: true,
    });

    this.ref.onClose.subscribe((mainLocation: MainLocation) => {
      if (mainLocation) {
        if (objToEdit) {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'MainLocation updated successfully' });
        } else {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'MainLocation added successfully' });
        }
        this.filterSearch.search();
      }
    });
  }

  search(queryString: string = ''): void {
    this.getMainLocations(queryString);
  }

  onPageChange(event: any): void {
    this.filterSearch.event.first = event.first;
    this.filterSearch.event.rows = event.rows;
    this.filterSearch.search();
  }


}
