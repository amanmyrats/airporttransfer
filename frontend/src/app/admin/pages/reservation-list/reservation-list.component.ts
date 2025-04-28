import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { TableModule } from 'primeng/table'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ReservationFormComponent } from '../../components/reservation-form/reservation-form.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ActionButtonsComponent } from '../../components/action-buttons/action-buttons.component';
import { SharedToolbarComponent } from '../../components/shared-toolbar/shared-toolbar.component';
import { CommonModule } from '@angular/common';
import { SharedPaginatorComponent } from '../../components/shared-paginator/shared-paginator.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { Column } from '../../models/column.model';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { concatMap, of } from 'rxjs';
import { PdfService } from '../../services/pdf.service';
import { ReservationPdfComponent } from '../../components/reservation-pdf/reservation-pdf.component';
import { StatusFormComponent } from '../../components/status-form/status-form.component';
import { ButtonModule } from 'primeng/button';
import { ReservationDetailComponent } from '../../components/reservation-detail/reservation-detail.component';
import { HttpErrorPrinterService } from '../../../services/http-error-printer.service';
import { Reservation } from '../../models/reservation.model';
import { ReservationService } from '../../services/reservation.service';
import { UserColumnService } from '../../services/user-column.service';
import { environment as env } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../models/paginated-response.model';
import { FilterSearchComponent } from '../../components/filter-search/filter-search.component';
import { CurrencyService } from '../../../services/currency.service';


@Component({
    selector: 'app-reservation-list',
    imports: [
        TableModule,
        SharedToolbarComponent,
        ToastModule,
        ConfirmDialogModule,
        ActionButtonsComponent,
        CommonModule,
        SharedPaginatorComponent,
        FormsModule,
        MultiSelectModule,
        SkeletonModule,
        ReservationPdfComponent,
        ButtonModule,
        FilterSearchComponent, 
    ],
    providers: [
        DialogService,
        MessageService,
        ConfirmationService,
        HttpErrorPrinterService,
    ],
    templateUrl: './reservation-list.component.html',
    styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent implements OnInit, AfterViewInit {

  // Pagination
  @ViewChild(FilterSearchComponent) filterSearch!: FilterSearchComponent;
  first: number = 0;
  rows: number = 2;
  totalRecords: number = 0;

  reservations: Reservation[] = [];
  loading: boolean = false;
  isExporting: boolean = false;

  ref: DynamicDialogRef | undefined;
  refDetail: DynamicDialogRef | undefined;

  statuses: any[] = [];
  table_name: string = 'reservation';

  reservationForPdf: Reservation | {} = {};
  isGeneratingPdf: boolean = false;

  cols: Column[] = [];
  _selectedColumns: Column[] = [];

  constructor(
    private reservationService: ReservationService,
    private dialogService: DialogService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService, 
    private httpErrorPrinterService: HttpErrorPrinterService,
    private userColumnService: UserColumnService, 
    private pdfService: PdfService, 
    public currencyService: CurrencyService, 
  ){

    this.cols = [
      { id: '', index: 1, field: 'number', header: 'Rezervasyon NO', 
        width: 100, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      
      { id: '', index: 22, field: 'car_type', header: 'Araç Tipi', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      { id: '', index: 23, field: 'child_seat_count', header: 'Çocuk Koltuğu', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      
      { id: '', index: 31, field: 'reservation_date', header: 'Rezervasyon Tarihi', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      { id: '', index: 32, field: 'transfer_date', header: 'Transfer Tarihi', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      { id: '', index: 33, field: 'transfer_time', header: 'Saat', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      { id: '', index: 34, field: 'flight_number', header: 'Flight', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
  
      { id: '', index: 40, field: 'pickup_short', header: 'Pick up', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      { id: '', index: 41, field: 'dest_short', header: 'Destination', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      { id: '', index: 42, field: 'passenger_name', header: 'Müşteri', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      { id: '', index: 43, field: 'passenger_phone', header: 'Telefonu', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      { id: '', index: 44, field: 'passenger_count', header: 'Kişi Sayısı', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
  
      { id: '', index: 60, field: 'amount', header: 'Tutar', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      
      { id: '', index: 80, field: 'status', header: 'Durumu', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      
      { id: '', index: 100, field: 'note', header: 'Not', 
        width: 200, min_width: 50, max_width: 500, 
        table_name:'reservation', is_visible:true },
      
    ];
  
    this._selectedColumns = this.cols.filter(col => col.is_visible);
  
  }
  
  ngOnInit(): void {
    this.rows = env.pagination.defaultPageSize;
    this.getUserColumns('?table_name=' + this.table_name);
  }

  ngAfterViewInit(): void {

  }

  getReservations(queryString: string = ''){
    this.loading = true;
    this.reservationService.getReservations(queryString).subscribe({
      next: (paginatedReservations: PaginatedResponse<Reservation>) => {
        this.reservations = paginatedReservations.results!;
        this.totalRecords = paginatedReservations.count!;
        console.log("Successfully fetched reservations");
        console.log(paginatedReservations);
        this.loading = false;
      },
      error: (error: any) => {
        console.log("Error happened when fetching reservations.");
        console.log(error);
        this.loading = false;
      }
    })
  }

  showForm(reservationToEdit: Reservation | null = null): void {
    this.ref = this.dialogService.open(ReservationFormComponent, {
      header: 'Rezervasyon Ekle/Düzenle',
      styleClass: 'fit-content-dialog',
      contentStyle: { "overflow": "auto" },
      baseZIndex: 10000, 
      closable: true,
      modal: true,
      data: {
        reservation: reservationToEdit
      }, 
      maximizable: true,
      resizable: true,
    });

    this.ref.onClose.subscribe((reservation: Reservation) => {
      if (reservation) {
        if (reservationToEdit) {
          this.messageService.add(
            { severity: 'success', summary: 'Success ', detail: 'Rezervasyon başarıyla güncellendi!' });
        } else {
          this.messageService.add(
            { severity: 'success', summary: 'Success', detail: 'Rezervasyon başarıyla oluşturuldu!' });
        }
        this.filterSearch.search();
      }
    });
  }

  showDetail(reservation: Reservation): void {
    this.refDetail = this.dialogService.open(ReservationDetailComponent, {
      header: 'Rezervasyon Detayı',
      styleClass: 'fit-content-dialog',
      contentStyle: { "overflow": "auto" },
      baseZIndex: 10000, 
      closable: true,
      modal: true,
      data: {
        reservation: reservation,
      },
      maximizable: true,
      resizable: true,
    });
  }

  updateObj(reservation: Reservation): void {
    this.showForm(reservation);
  }

  detailObj(reservation: Reservation): void {
    this.showDetail(reservation);
  }

  deleteObj(id: string): void {
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
        this.reservationService.deleteReservation(id).subscribe({
          next: () => {
            this.getReservations();
              this.messageService.add(
                {severity:'success', summary:'Başarılı', detail:'Başarıyla silindi!'});
          },
          error: (error: any) => {
            console.log("Error happened when deleting reservation");
            console.log(error);
          }
        });
      }
    });

  }

  getStatuses(): void {
    this.reservationService.getStatuses().subscribe({
      next: (statuses: any[]) => {
        console.log('Statuses:', statuses);
        this.statuses = statuses;
      },
      error: (err: any) => {
        this.httpErrorPrinterService.printHttpError(err);
      }
    });
  }

  export(): void {
    this.isExporting = true;
    this.reservationService.handleExport(this.filterSearch.getQueryParams());
    this.isExporting = false;
  }

  openStatusForm(reservation: Reservation): void {
    this.ref = this.dialogService.open(StatusFormComponent, {
      header: 'Durumu Güncelle',
      styleClass: 'fit-content-dialog',
      contentStyle: { "overflow": "auto" },
      width: '50%',
      height: '90%',
      baseZIndex: 10000, 
      closable: true,
      modal: true,
      data: {
        reservation
      },
      maximizable: true,
      resizable: true,
    });

    this.ref.onClose.subscribe((reservation: Reservation) => {
      if (reservation) {
        this.filterSearch.search();
      }
    });
  }

  onPageChange(event: any): void {
    this.filterSearch.event.first = event.first;
    this.filterSearch.event.rows = event.rows;
    this.filterSearch.search();
  }

  search(queryString: string = ''): void {
    this.getReservations(queryString);
  }

  get selectedColumns(): Column[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: Column[]) {
      //restore original order
      this._selectedColumns = this.cols.filter((col) => val.includes(col));
}

getUserColumns(queryString: string = ''): void {
  this.userColumnService.getUserColumns(queryString).pipe(
    // Wait for the first observable (fetching user columns)
    concatMap((paginatedUserColumns: PaginatedResponse<Column>) => {
      // Check for columns that do not exist in user columns
      const columnsThatDoNotExistInUserColumns = this.cols.filter(
        col => !paginatedUserColumns.results!.map(
          userCol => userCol.field).includes(col.field!)
      );
      // If there are missing columns, call bulk create; otherwise, just return the fetched columns
      if (columnsThatDoNotExistInUserColumns.length > 0) {
        return this.userColumnService.bulkCreateUserColumns(columnsThatDoNotExistInUserColumns);
      } else {
        return of(paginatedUserColumns.results!); // No new columns, return existing ones
      }
    })
  ).subscribe({
    next: (result: Column[]) => {
      console.log("Successfully processed user columns", result);
      // Update the columns with the result (whether fetched or created)
      this.cols = result;
      // loop through the this.cols, and add the is_visible property to the selected columns
      this._selectedColumns = this.cols.filter(col => col.is_visible);
      // Sort the columns by index
      this._selectedColumns.sort((a, b) => a.index! - b.index!);
    },
    error: (error: any) => {
      console.log("Error happened while fetching or creating user columns", error);
    }
  });
}


onColResize($event: any): void {
  console.log("Column resized");
  console.log($event);
  const columnName = $event.element.innerText;
  // Find the column by header name
  const column = this.cols.find(col => col.header === columnName);
  if (column && column.id) {
    const newWidth = $event.element.clientWidth;
    column.width = newWidth;
    // Update the column width in the database
    this.userColumnService.updateUserColumn(column.id, column).subscribe({
      next: (result: Column) => {
        console.log("Successfully updated column width", result);
      },
      error: (error: any) => {
        console.log("Error happened while updating column width", error);
      }
    });
  }
}

onColReorder(event: any): void {
  console.log("Column reordered");
  console.log(event);
  const { dragIndex, dropIndex, columns } = event;

  // Prepare the columns data to send to the backend
  const updatedColumns = columns.map((col: any, index: number) => ({
      id: col.id,
      user: col.user,
      table_name: col.table_name,
      field: col.field,
      header: col.header,
      index: index, // This is the new order after drag/drop
      width: col.width,
      min_width: col.min_width,
      max_width: col.max_width,
      is_visible: col.is_visible
  }));
  
  // Send the updated order to the backend
  this.userColumnService.bulkUpdateUserColumns(updatedColumns).subscribe({
      next: (response: any) => {
          console.log('Column order updated successfully');
          console.log(response);
      },
      error: (error: any) => {
          console.error('Error saving column order:', error);
      }
});
}

onColumnSelect(event: any): void {
  console.log("Column selected");
  console.log(event);
  const columnSelected = event.itemValue;
  if (columnSelected && columnSelected.id) {
    const visibility = !event.originalEvent.selected;
    columnSelected.is_visible = visibility;
    // Update the column is_visible property in the database
    this.userColumnService.updateUserColumn(columnSelected.id, columnSelected).subscribe({
      next: (result: Column) => {
        console.log("Successfully updated column visibility", result);
      },
      error: (error: any) => {
        console.log("Error happened while updating column visibility", error);
      }
    });
  }
}

downloadPdf(reservation: Reservation) {
  this.isGeneratingPdf = true;
  console.log('in reservation list downloadPdf')
  this.reservationForPdf = reservation;

  setTimeout(() => {
    const pdfElement = document.querySelector('#pdf-content') as HTMLElement;
    console.log("pdfElement: ");
    console.log(pdfElement);

    if (pdfElement) {
      this.pdfService.downloadPdf(pdfElement, this.reservationForPdf).subscribe({
        next: success => {
          if (success) {
            console.log('PDF downloaded successfully.');
          }
          this.isGeneratingPdf = false;
        },
        error: () => {
          console.error('PDF download failed.');
          this.isGeneratingPdf = false;
        }
      });
    }
  }, 1000);
}

}
