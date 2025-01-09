import { Component, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginatedResponse } from '../../../models/paginated-response.model';
import { RateService } from '../../services/rate.service';
import { Rate } from '../../models/rate.model';
import { environment as env } from '../../../../environments/environment';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';
import { SharedToolbarComponent } from '../../components/shared-toolbar/shared-toolbar.component';
import { FilterSearchComponent } from '../../components/filter-search/filter-search.component';
import { SharedPaginatorComponent } from '../../components/shared-paginator/shared-paginator.component';
import { RateFormComponent } from '../../components/rate-form/rate-form.component';

@Component({
    selector: 'app-rate-list',
    imports: [
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
    templateUrl: './rate-list.component.html',
    styleUrl: './rate-list.component.scss'
})
export class RateListComponent implements OnInit {
    
  // Pagination
  @ViewChild(FilterSearchComponent) filterSearch!: FilterSearchComponent;
  first: number = 0;
  rows: number = 2;
  totalRecords: number = 0;

  loading: boolean = false;
  rates: Rate[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(
    private rateService: RateService,
    public dialogService: DialogService,
    public messageService: MessageService,
    private confirmationService: ConfirmationService,
    private httpErrorPrinter: HttpErrorPrinterService
  ) { }

  ngOnInit(): void {
    this.rows = env.pagination.defaultPageSize;
  }

  getRates(queryString: string = '') {
    this.loading = true;
    this.rateService.getRates(queryString).subscribe({
      next: (paginatedResponse: PaginatedResponse<Rate>) => {
        console.log('Fetched Rates successfully: ', paginatedResponse.results);
        this.rates = paginatedResponse.results!;
        this.totalRecords = paginatedResponse.count!;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching Rates: ', error)
        this.loading = false;
      }
    });
  }

  updateObj(rate: Rate) {
    this.showForm(rate);
  }

  createObj() {
    this.showForm();
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
        this.rateService.deleteRate(id).subscribe({
          next: (res: any) => {
            this.messageService.add(
              { severity: 'success', summary: 'Başarılı', detail: 'Başarıyla silindi!' });
            this.filterSearch.search();
          },
          error: (err: HttpErrorResponse) => {
            this.httpErrorPrinter.printHttpError(err);
          }
        });
      }
    });

  }

  showForm(objToEdit: Rate | null = null) {
    this.ref = this.dialogService.open(RateFormComponent, {
      header: 'Para Birimi Ekle/Düzenle',
      styleClass: 'fit-content-dialog',
      contentStyle: { "overflow": "auto" },
      closable: true,
      modal: true,
      data: {
        rate: objToEdit
      }, 
      draggable: true,
      resizable: true,
    });

    this.ref.onClose.subscribe((rate: Rate) => {
      if (rate) {
        if (objToEdit) {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'Rate updated successfully' });
        } else {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'Rate added successfully' });
        }
        this.filterSearch.search();
      }
    });
  }

  search(queryString: string = ''): void {
    this.getRates(queryString);
  }

  onPageChange(event: any): void {
    this.filterSearch.event.first = event.first;
    this.filterSearch.event.rows = event.rows;
    this.filterSearch.search();
  }


}
