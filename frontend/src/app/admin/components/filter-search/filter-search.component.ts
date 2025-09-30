import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LazyLoadEvent } from 'primeng/api';
import { CommonModule, DatePipe } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DatePicker } from 'primeng/datepicker';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { CommonService } from '../../../services/common.service';
import { SUPPORTED_MAIN_LOCATIONS } from '../../../constants/main-location.constants';

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
export class FilterSearchComponent implements OnInit{
  dateFilterOptions: any = [
    { label: 'Yıl', value: 'year' },
    { label: 'Ay', value: 'month' },
    { label: 'Gün', value: 'date_range' },
  ]
  date: Date = new Date();
  today: Date = new Date();
  
  @Input() wantCarTypeFilter: boolean = false;
  @Input() wantRoleFilter: boolean = false;
  @Input() wantStatusFilter: boolean = false;
  @Input() wantMainLocationFilter: boolean = false;
  
  @Input() wantDateFilter: boolean = false;
  @Input() wantYearFilter: boolean = false;
  @Input() wantMonthFilter: boolean = false;
  @Input() wantDateRangeFilter: boolean = false;
  @Input() wantDateVariationFilter: boolean = false;
  
  @Input() wantSearchFilter: boolean = true;
  
  @Input() carTypes: any[] = [];
  @Input() roles: any[] = [];
  @Input() statuses: any[] = [];
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
  @Output() getBlogCategoryEmitter: EventEmitter<any> = new EventEmitter();
  
  filterSearchForm: FormGroup;
  event: LazyLoadEvent = {};
  
  mainLocations: any[] = SUPPORTED_MAIN_LOCATIONS;

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
      car_type: [''],
      role: [''],
      status: [''],
      search: [''], 
      main_location: [''],
      // page: [''],
      // page_size: [''],
      // ordering: [''],
    });
  }

  ngOnInit(): void {
    this.modifyDateFilterOptions();
    this.event.rows = this.rows;
    this.checkActiveUrlQueryParamsAndPatchFormValuesWithQueryParams();
    this.getStatusesEmitter.emit();
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

  onSubmit(){
    // Reset page number to 1 when filter changes
    this.event.first = 0;
    this.first = 0;
    this.search();
  }
  
  search(){
    console.log("Searching...");
    this.parseDatesToBackendFormat();
    console.log(this.filterSearchForm.value);
    const formValues = this.filterSearchForm.value;
    // Remove date_range from form values
    delete formValues.date_range;
    delete formValues.year_date;
    delete formValues.month_date;
    delete formValues.date_filter_option;
    this.event.filters = formValues;
    const queryString = this.commonService.buildPaginationParams(this.event)
    this.searchEmitter.emit(queryString);
    this.updateActiveUrlQueryParams(queryString);
  }

  getQueryParams(){
    return this.commonService.buildPaginationParams(this.event);
  }

  checkActiveUrlQueryParamsAndPatchFormValuesWithQueryParams(){
    const snaptshorUrl = window.location.href.split('?')[1];
    const urlSearchParams = new URLSearchParams(snaptshorUrl);

    urlSearchParams.forEach((value, key) => {
      if (this.filterSearchForm.controls[key]) {
        if (key === 'year') {
          this.filterSearchForm.controls['year_date'].patchValue(new Date(Number(value),1,1));
          this.filterSearchForm.controls['date_filter_option'].patchValue('year');
        } else if (key === 'month') {
          const year = urlSearchParams.get('year');
          this.filterSearchForm.controls['month_date'].patchValue(new Date(Number(year), Number(value)-1, 1));
          this.filterSearchForm.controls['date_filter_option'].patchValue('month');
        } else {
          this.filterSearchForm.controls[key].patchValue(value);
          this.filterSearchForm.controls['date_filter_option'].patchValue('date_range');      
        }

      }
      
    } );

    if (this.filterTodayByDefault && !this.filterSearchForm.get('transfer_date')?.value) {
      this.filterSearchForm.patchValue({ transfer_date: new Date() });
    }
    if (this.wantDateVariationFilter) {
      this.filterSearchForm.patchValue({
        year_date: new Date(new Date().getFullYear(),1,1), 
        month_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
        date_range: [new Date(),new Date()]
      })
    }
    console.log("Form values: ", this.filterSearchForm.value);

  }

  clearSearch(){
    this.filterSearchForm.reset();
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
  }

  modifyDateFilterOptions(){
    if (!this.wantDateRangeFilter){
      this.dateFilterOptions = this.dateFilterOptions.filter(
        (option: any) => option.value !== 'date_range');
    }
  }

}
