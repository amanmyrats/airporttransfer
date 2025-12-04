import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginatedResponse } from '../../../models/paginated-response.model';
import { environment as env } from '../../../../environments/environment';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';
import { SharedToolbarComponent } from '../../components/shared-toolbar/shared-toolbar.component';
import { FilterSearchComponent } from '../../components/filter-search/filter-search.component';
import { SharedPaginatorComponent } from '../../components/shared-paginator/shared-paginator.component';
import { PopularRoute } from '../../models/popular-route.model';
import { PopularRouteService } from '../../services/popular-route.service';
import { PopularRouteFormComponent } from '../../components/popular-route-form/popular-route-form.component';
import { ImportFormComponent } from '../../components/import-form/import-form.component';


@Component({
  selector: 'app-popular-route-list',
  imports: [
      CommonModule,
      TableModule,
      ToastModule,
      InputTextModule,
      ConfirmDialogModule,
      ActionButtonsComponent,
      SharedToolbarComponent, FilterSearchComponent,
      SharedPaginatorComponent,
  ],
  providers: [
      DialogService,
      MessageService,
      ConfirmationService,
      HttpErrorPrinterService,
  ],
  templateUrl: './popular-route-list.component.html',
  styleUrl: './popular-route-list.component.scss'
})
export class PopularRouteListComponent implements OnInit {
    
  // Pagination
  @ViewChild(FilterSearchComponent) filterSearch!: FilterSearchComponent;
  first: number = 0;
  rows: number = 2;
  totalRecords: number = 0;

  loading: boolean = false;
  isImporting: boolean = false;
  isExporting: boolean = false;
  popularRoutes: PopularRoute[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(
    private popularRouteService: PopularRouteService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private confirmationService: ConfirmationService,
    private httpErrorPrinterService: HttpErrorPrinterService
  ) { }

  ngOnInit(): void {
    this.rows = env.pagination.defaultPageSize;
  }

  getPopularRoutes(queryString: string = '') {
    this.loading = true;
    this.popularRouteService.getPopularRoutes(queryString).subscribe({
      next: (paginatedResponse: PaginatedResponse<PopularRoute>) => {
        console.log('Fetched PopularRoutes successfully: ', paginatedResponse.results);
        this.popularRoutes = paginatedResponse.results!;
        this.totalRecords = paginatedResponse.count!;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching PopularRoutes: ', error)
        this.loading = false;
      }
    });
  }

  updateObj(popularRoute: PopularRoute) {
    this.showForm(popularRoute);
  }

  createObj() {
    this.showForm();
  }


  export(): void {
    this.isExporting = true;
    this.popularRouteService.handleExport(this.filterSearch.getQueryParams());
    this.isExporting = false;
  }

  import(): void {
    this.isImporting = true;
    this.ref = this.dialogService.open(ImportFormComponent, {
      header: 'Meşhur Güzergahları Topluca Yükle',
      styleClass: 'fit-content-dialog',
      contentStyle: { "overflow": "auto" },
      width: '90%',
      height: '90%',
      baseZIndex: 10000, 
      maximizable: true,
      resizable: true,
      closable: true,
      modal: true,
    });

    this.ref.onClose.subscribe((file: File) => {
      if (file) {
        console.log("File to import: ", file);
        this.popularRouteService.import(file).subscribe({
          next: () => {
            this.messageService.add(
              { severity: 'success', summary: 'Success', detail: 'Meşhur Güzergahlar başarıyla yüklendi!' });
            this.filterSearch.search();
            this.isImporting = false;

          },
          error: (error: any) => {
            this.httpErrorPrinterService.printHttpError(error);
            this.isImporting = false;
          }
        });
      } else {
        this.isImporting = false;
      }
    });
  }


  deleteObj(id: string) {
    this.confirmationService.confirm({
      message: 'Silmek istediğinizden emin misiniz?',
      header: 'Silme İşlemi',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: "Sil",
      rejectLabel: "Vazgeç",
      dismissableMask: true,

      accept: () => {
        this.popularRouteService.deletePopularRoute(id).subscribe({
          next: (res: any) => {
            this.messageService.add(
              { severity: 'success', summary: 'Başarılı', detail: 'Başarıyla silindi!' });
            this.filterSearch.search();
          },
          error: (err: HttpErrorResponse) => {
            this.httpErrorPrinterService.printHttpError(err);
          }
        });
      }
    });

  }

  showForm(objToEdit: PopularRoute | null = null) {
    this.ref = this.dialogService.open(PopularRouteFormComponent, {
      header: 'Meşhur Güzergahları Ekle/Düzenle',
      styleClass: 'fit-content-dialog',
      contentStyle: { "overflow": "auto" },
      closable: true,
      modal: true,
      data: {
        popularRoute: objToEdit
      }, 
      draggable: true,
      resizable: true,
    });

    this.ref.onClose.subscribe((popularRoute: PopularRoute) => {
      if (popularRoute) {
        if (objToEdit) {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'PopularRoute updated successfully' });
        } else {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'PopularRoute added successfully' });
        }
        this.filterSearch.search();
      }
    });
  }

  search(queryString: string = ''): void {
    this.getPopularRoutes(queryString);
  }

  onPageChange(event: any): void {
    this.filterSearch.event.first = event.first;
    this.filterSearch.event.rows = event.rows;
    this.filterSearch.search();
  }


}
