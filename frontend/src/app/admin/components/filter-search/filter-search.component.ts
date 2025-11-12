import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule, DatePipe } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DatePicker } from 'primeng/datepicker';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { CommonService } from '../../../services/common.service';
import { SUPPORTED_MAIN_LOCATIONS } from '../../../constants/main-location.constants';
import { LazyLoadParams } from '../../../interfaces/custom-lazy-load-event';

@Component({
    selector: 'app-filter-search', 
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        Select,
        InputTextModule,
        ButtonModule,
        CommonModule, SelectButtonModule, DatePicker, IconField, InputIcon, 
        FloatLabel, 
    ],
    providers: [
        DatePipe
    ],
    templateUrl: './filter-search.component.html',
    styleUrl: './filter-search.component.scss'
})
export class FilterSearchComponent implements OnInit, OnChanges{
  readonly baseDateFilterOptions = [
    { label: 'Yıl', value: 'year' },
    { label: 'Ay', value: 'month' },
    { label: 'Gün', value: 'date_range' },
  ];

  dateFilterOptions = [...this.baseDateFilterOptions];
  reservationDateFilterOptions = [...this.baseDateFilterOptions];
  date: Date = new Date();
  today: Date = new Date();
  
  @Input() wantCarTypeFilter: boolean = false;
  @Input() wantRoleFilter: boolean = false;
  @Input() wantStatusFilter: boolean = false;
  @Input() wantChangeRequestStatusFilter: boolean = false;
  @Input() wantMainLocationFilter: boolean = false;
  @Input() wantPaymentMethodFilter: boolean = false;
  
  @Input() wantDateFilter: boolean = false;
  @Input() dateFilterLabel: string = 'Transfer Date';
  @Input() wantYearFilter: boolean = false;
  @Input() wantMonthFilter: boolean = false;
  @Input() wantDateRangeFilter: boolean = false;
  @Input() wantDateVariationFilter: boolean = false;
  @Input() wantReservationCreationDateRangeFilter: boolean = false;
  @Input() wantReservationCreationDateVariationFilter: boolean = false;
  
  @Input() wantSearchFilter: boolean = true;
  @Input() wantOrdering: boolean = false;
  @Input() orderingOptions: { label: string; value: string }[] = [];
  @Input() defaultOrdering: string | null = null;
  @Input() dateVariationLabel: string = 'Transfer Date Range';
  @Input() reservationDateVariationLabel: string = 'Reservation Created Range';
  @Input() wantDetailedButton: boolean = false;
  private _detailedFilterKeys: string[] = [];
  @Input()
  set detailedFilterKeys(value: string[]) {
    this._detailedFilterKeys = value ?? [];
    this.updateDetailedFilterSet();
  }
  get detailedFilterKeys(): string[] {
    return this._detailedFilterKeys;
  }
  
  @Input() carTypes: any[] = [];
  @Input() roles: any[] = [];
  @Input() statuses: any[] = [];
  @Input() changeRequestStatuses: any[] = [];
  @Input() paymentMethods: { label: string; value: string | null }[] = [];
  @Input() filterTodayByDefault: boolean = false;

  // Blog specific inputs
  @Input() blogCategories: any[] = [];
  @Input() wantBlogCategoryFilter: boolean = false;
  
  // Pagination
  @Input() first: number = 0;
  @Input() rows: number = 2;
  @Input() totalRecords: number = 0;
  
  @Output() searchEmitter: EventEmitter<any> = new EventEmitter();
  @Output() getStatusesEmitter: EventEmitter<any> = new EventEmitter();
  @Output() getChangeRequestStatusesEmitter: EventEmitter<any> = new EventEmitter();
  @Output() getBlogCategoryEmitter: EventEmitter<any> = new EventEmitter();
  
  filterSearchForm: FormGroup;
  event: LazyLoadParams = {};
  
  mainLocations: any[] = SUPPORTED_MAIN_LOCATIONS;
  showDetailedFilters = false;
  private detailedFilterSet: Set<string> = new Set();

  constructor(
    private fb: FormBuilder, 
    private commonService: CommonService, 
    private datePipe: DatePipe
  ){
    this.filterSearchForm = this.fb.group({
      transfer_date: [ '' ],
      date_filter_option: ['year'],
      date_range: [ [ '', '' ] ],
      start_date: [ '' ],
      end_date: [ '' ],
      year_date: [ '' ],
      year: [ '' ],
      month_date: [ ''],
      month: [ ''],
      reservation_date_filter_option: ['year'],
      reservation_date_range: [[ '', '' ]],
      reservation_start_date: [''],
      reservation_end_date: [''],
      reservation_year_date: [''],
      reservation_year: [''],
      reservation_month_date: [''],
      reservation_month: [''],
      car_type: [''],
      role: [''],
      status: [''],
      method: [''],
      latest_change_request_status: [''],
      has_change_request: [''],
      search: [''], 
      main_location: [''],
      ordering: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wantDetailedButton'] && !this.wantDetailedButton) {
      this.showDetailedFilters = false;
    }
  }

  ngOnInit(): void {
    this.modifyDateFilterOptions();
    this.event.rows = this.rows;
    this.checkActiveUrlQueryParamsAndPatchFormValuesWithQueryParams();
    this.applyDefaultOrdering();
    this.getStatusesEmitter.emit();
    this.getChangeRequestStatusesEmitter.emit();
    this.getBlogCategoryEmitter.emit();
    this.search();
    }

  onFilterChange(){
    // Reset page number to 1 when filter changes
    this.event.first = 0;
    this.first = 0;
    this.search();
  }

  onDateRangeFilterChange(){
    const dateRange = this.filterSearchForm.get('date_range')?.value
    if (dateRange){
      const endDate = this.datePipe.transform(dateRange[1], 'yyyy-MM-dd');
      if (endDate) {
        // Reset page number to 1 when filter changes
        this.event.first = 0;
        this.first = 0;
        this.search();
      }
    }
  }

  onYearFilterClear(){
    this.filterSearchForm.patchValue({ year: '' });
    this.onFilterChange();
  }

  onMonthFilterClear(){
    this.filterSearchForm.patchValue({ month: '' });
    this.onFilterChange();
  }

  onDateRangeFilterClear(){
    this.filterSearchForm.patchValue({ start_date: '', end_date: '' });
    this.onFilterChange();
  }

  onReservationDateRangeFilterChange(){
    const dateRange = this.filterSearchForm.get('reservation_date_range')?.value;
    if (dateRange){
      const endDate = this.datePipe.transform(dateRange[1], 'yyyy-MM-dd');
      if (endDate) {
        this.event.first = 0;
        this.first = 0;
        this.search();
      }
    }
  }

  onReservationYearFilterClear(){
    this.filterSearchForm.patchValue({ reservation_year: '' });
    this.onFilterChange();
  }

  onReservationMonthFilterClear(){
    this.filterSearchForm.patchValue({ reservation_month: '' });
    this.onFilterChange();
  }

  onReservationDateRangeFilterClear(){
    this.filterSearchForm.patchValue({ reservation_start_date: '', reservation_end_date: '' });
    this.onFilterChange();
  }

  onSubmit(){
    // Reset page number to 1 when filter changes
    this.event.first = 0;
    this.first = 0;
    this.search();
  }
  
  private applyDefaultOrdering(): void {
    const orderingControl = this.filterSearchForm.get('ordering');
    if (!orderingControl || !this.defaultOrdering || orderingControl.value) {
      return;
    }
    orderingControl.patchValue(this.defaultOrdering);
  }

  private ensureDateVariationDefaults(): void {
    const now = new Date();
    if (this.wantDateVariationFilter) {
      if (!this.filterSearchForm.get('year_date')?.value) {
        this.filterSearchForm.patchValue({ year_date: new Date(now.getFullYear(), 1, 1) });
      }
      if (!this.filterSearchForm.get('month_date')?.value) {
        this.filterSearchForm.patchValue({ month_date: new Date(now.getFullYear(), now.getMonth(), 1) });
      }
      const currentRange = this.filterSearchForm.get('date_range')?.value;
      if (!currentRange || !currentRange[0] || !currentRange[1]) {
        this.filterSearchForm.patchValue({ date_range: [new Date(now), new Date(now)] });
      }
    }
    if (this.wantReservationCreationDateVariationFilter) {
      if (!this.filterSearchForm.get('reservation_year_date')?.value) {
        this.filterSearchForm.patchValue({ reservation_year_date: new Date(now.getFullYear(), 1, 1) });
      }
      if (!this.filterSearchForm.get('reservation_month_date')?.value) {
        this.filterSearchForm.patchValue({
          reservation_month_date: new Date(now.getFullYear(), now.getMonth(), 1),
        });
      }
      const reservationRange = this.filterSearchForm.get('reservation_date_range')?.value;
      if (!reservationRange || !reservationRange[0] || !reservationRange[1]) {
        this.filterSearchForm.patchValue({
          reservation_date_range: [new Date(now), new Date(now)],
        });
      }
    }
  }

  search(){
    console.log("Searching...");
    this.applyDefaultOrdering();
    this.parseDatesToBackendFormat();
    console.log(this.filterSearchForm.value);
    const formValues = this.filterSearchForm.value;
    // Remove date_range from form values
    delete formValues.date_range;
    delete formValues.year_date;
    delete formValues.month_date;
    delete formValues.date_filter_option;
    delete formValues.reservation_date_range;
    delete formValues.reservation_year_date;
    delete formValues.reservation_month_date;
    delete formValues.reservation_date_filter_option;
    this.event.filters = formValues;
    const queryString = this.commonService.buildPaginationParams(this.event)
    this.searchEmitter.emit(queryString);
    this.updateActiveUrlQueryParams(queryString);
  }

  getQueryParams(){
    return this.commonService.buildPaginationParams(this.event);
  }

  checkActiveUrlQueryParamsAndPatchFormValuesWithQueryParams(){
    const snaptshorUrl = window.location.href.split('?')[1] || '';
    const urlSearchParams = new URLSearchParams(snaptshorUrl);
    let reservationStartDateParam: string | null = null;
    let reservationEndDateParam: string | null = null;

    urlSearchParams.forEach((value, key) => {
      const sanitizedValue = this.stripHashFragment(value);
      switch (key) {
        case 'year':
          this.filterSearchForm.controls['year_date']?.patchValue(new Date(Number(sanitizedValue), 1, 1));
          this.filterSearchForm.controls['date_filter_option']?.patchValue('year');
          break;
        case 'month': {
          const year = this.stripHashFragment(urlSearchParams.get('year') ?? '');
          if (year) {
            this.filterSearchForm.controls['month_date']?.patchValue(
              new Date(Number(year), Number(sanitizedValue) - 1, 1),
            );
          }
          this.filterSearchForm.controls['date_filter_option']?.patchValue('month');
          break;
        }
        case 'start_date':
        case 'end_date':
          if (this.filterSearchForm.controls[key]) {
            this.filterSearchForm.controls[key].patchValue(sanitizedValue);
          }
          this.filterSearchForm.controls['date_filter_option']?.patchValue('date_range');
          break;
        case 'reservation_year':
          this.filterSearchForm.controls['reservation_year_date']?.patchValue(new Date(Number(sanitizedValue), 1, 1));
          this.filterSearchForm.controls['reservation_date_filter_option']?.patchValue('year');
          break;
        case 'reservation_month': {
          const reservationYear = this.stripHashFragment(urlSearchParams.get('reservation_year') ?? '');
          if (reservationYear) {
            this.filterSearchForm.controls['reservation_month_date']?.patchValue(
              new Date(Number(reservationYear), Number(sanitizedValue) - 1, 1),
            );
          }
          this.filterSearchForm.controls['reservation_date_filter_option']?.patchValue('month');
          break;
        }
        case 'reservation_start_date':
          reservationStartDateParam = sanitizedValue || null;
          break;
        case 'reservation_end_date':
          reservationEndDateParam = sanitizedValue || null;
          break;
        case 'ordering':
          this.filterSearchForm.controls['ordering']?.patchValue(sanitizedValue);
          break;
        default:
          if (this.filterSearchForm.controls[key]) {
            this.filterSearchForm.controls[key].patchValue(sanitizedValue);
          }
          break;
      }
    } );

    if (reservationStartDateParam || reservationEndDateParam) {
      const startDate = reservationStartDateParam ? new Date(reservationStartDateParam) : null;
      const endDate = reservationEndDateParam ? new Date(reservationEndDateParam) : null;
      this.filterSearchForm.controls['reservation_start_date']?.patchValue(reservationStartDateParam ?? '');
      this.filterSearchForm.controls['reservation_end_date']?.patchValue(reservationEndDateParam ?? '');
      this.filterSearchForm.controls['reservation_date_range']?.patchValue([startDate, endDate]);
      this.filterSearchForm.controls['reservation_date_filter_option']?.patchValue('date_range');
    }

    if (this.filterTodayByDefault && !this.filterSearchForm.get('transfer_date')?.value) {
      this.filterSearchForm.patchValue({ transfer_date: new Date() });
    }
    this.ensureDateVariationDefaults();
    console.log("Form values: ", this.filterSearchForm.value);

  }

  clearSearch(){
    this.filterSearchForm.reset();
    this.filterSearchForm.patchValue({
      date_filter_option: 'year',
      reservation_date_filter_option: 'year',
      status: '',
      method: '',
      latest_change_request_status: '',
      has_change_request: '',
    });
    if (this.filterTodayByDefault) {
      this.filterSearchForm.patchValue({ transfer_date: new Date() });
    }
    this.ensureDateVariationDefaults();
    this.applyDefaultOrdering();
    this.search();
  }

  updateActiveUrlQueryParams(queryString: string){
    window.history.replaceState({}, '', window.location.pathname + queryString);
  }

  clickCallBack(): void {
    console.log("Click callback");
  }

  nextDay() {
    const currentDate = this.filterSearchForm.get('transfer_date')?.value;
    if (currentDate) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);  // Increment by one day
      this.date = nextDate;
      this.filterSearchForm.patchValue({ transfer_date: this.date });
    }
  }

  prevDay() {
    const currentDate = this.filterSearchForm.get('transfer_date')?.value;
    if (currentDate) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);  // Decrement by one day
      this.date = prevDate;
      this.filterSearchForm.patchValue({ transfer_date: this.date });
    }
  }

  toggleDetailedFilters(): void {
    if (!this.wantDetailedButton) {
      return;
    }
    this.showDetailedFilters = !this.showDetailedFilters;
  }

  shouldDisplayFilter(key: string): boolean {
    if (!this.wantDetailedButton) {
      return true;
    }
    if (!this.detailedFilterSet.has(key)) {
      return true;
    }
    return this.showDetailedFilters;
  }

  private updateDetailedFilterSet(): void {
    this.detailedFilterSet = new Set(this.detailedFilterKeys ?? []);
  }

  parseDatesToBackendFormat(): void {
    // Convert transfer_date to ISO 8601 format before sending data
    const selectedDate = this.filterSearchForm.get('transfer_date')?.value;
    const formattedDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
    if (formattedDate) {
      this.filterSearchForm.patchValue({ transfer_date: formattedDate });
    }
    
    // YEAR
    if (this.filterSearchForm.get('date_filter_option')?.value === 'year') {
      const year_date = this.filterSearchForm.get('year_date')?.value
      if (year_date) {
        const year = this.datePipe.transform(year_date, 'yyyy');
        this.filterSearchForm.patchValue({ year: year });
      }
    } else {
      this.filterSearchForm.patchValue({ year: '' });
    }

    // MONTH
    if (this.filterSearchForm.get('date_filter_option')?.value === 'month') {
      const month_date = this.filterSearchForm.get('month_date')?.value
      if (month_date) {
        const month = this.datePipe.transform(month_date, 'MM');
        const year = this.datePipe.transform(month_date, 'yyyy');
        this.filterSearchForm.patchValue({ year: year });
        this.filterSearchForm.patchValue({ month: month });
      }
    } else {
      this.filterSearchForm.patchValue({ month: '' });
    }

    // DATE RANGE
    if (this.filterSearchForm.get('date_filter_option')?.value === 'date_range') {
      const dateRange = this.filterSearchForm.get('date_range')?.value
      if (dateRange){
        const startDate = this.datePipe.transform(dateRange[0], 'yyyy-MM-dd');
        const endDate = this.datePipe.transform(dateRange[1], 'yyyy-MM-dd');
        this.filterSearchForm.patchValue({ start_date: startDate, end_date: endDate });
      }
    } else {
      this.filterSearchForm.patchValue({ start_date: '', end_date: '' });
    }

    const reservationFilterOption = this.filterSearchForm.get('reservation_date_filter_option')?.value;

    if (reservationFilterOption === 'year') {
      const reservationYearDate = this.filterSearchForm.get('reservation_year_date')?.value;
      if (reservationYearDate) {
        const reservationYear = this.datePipe.transform(reservationYearDate, 'yyyy');
        this.filterSearchForm.patchValue({ reservation_year: reservationYear });
      }
    } else if (reservationFilterOption !== 'month') {
      this.filterSearchForm.patchValue({ reservation_year: '' });
    }

    if (reservationFilterOption === 'month') {
      const reservationMonthDate = this.filterSearchForm.get('reservation_month_date')?.value;
      if (reservationMonthDate) {
        const reservationMonth = this.datePipe.transform(reservationMonthDate, 'MM');
        const reservationYear = this.datePipe.transform(reservationMonthDate, 'yyyy');
        this.filterSearchForm.patchValue({ reservation_year: reservationYear });
        this.filterSearchForm.patchValue({ reservation_month: reservationMonth });
      }
    } else {
      this.filterSearchForm.patchValue({ reservation_month: '' });
    }

    if (reservationFilterOption === 'date_range') {
      const reservationDateRange = this.filterSearchForm.get('reservation_date_range')?.value;
      if (reservationDateRange) {
        const reservationStartDate = this.datePipe.transform(reservationDateRange[0], 'yyyy-MM-dd');
        const reservationEndDate = this.datePipe.transform(reservationDateRange[1], 'yyyy-MM-dd');
        this.filterSearchForm.patchValue({
          reservation_start_date: reservationStartDate,
          reservation_end_date: reservationEndDate,
        });
      }
    } else {
      this.filterSearchForm.patchValue({ reservation_start_date: '', reservation_end_date: '' });
    }
  }

  modifyDateFilterOptions(){
    this.dateFilterOptions = this.buildDateFilterOptions(this.wantDateRangeFilter);
    this.reservationDateFilterOptions = this.buildDateFilterOptions(this.wantReservationCreationDateRangeFilter);
  }

  private buildDateFilterOptions(includeRange: boolean): { label: string; value: string }[] {
    const options = this.baseDateFilterOptions.map(option => ({ ...option }));
    return includeRange ? options : options.filter(option => option.value !== 'date_range');
  }

  private stripHashFragment(value: string): string {
    const hashIndex = value.indexOf('#');
    return hashIndex === -1 ? value : value.slice(0, hashIndex);
  }

}
