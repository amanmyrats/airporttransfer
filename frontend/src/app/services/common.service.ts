import { Injectable } from '@angular/core';
import { LazyLoadParams } from '../interfaces/custom-lazy-load-event';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private buildCriterias(filters?: any): string {
    const filter: string[] = [];

    for (const attr in filters) {
      if (attr) {
        
        filter.push(attr + ':*' + filters[attr].value + '*');
      }
    }

    return filter.join(',');
  }

  private buildFilter(filters?: any): string {
    let result: string = '';
    for (const attr in filters) {
      if (attr) {
        // console.log(attr + " - " + filters[attr].value);
        result += '&'+attr+'='+filters[attr].value;
      }
    }
    return result;
  }

  private buildFilterFromForm(filters?: any): string {
    let result: string = '';
    // console.log(filters);
    for (const attr in filters) {
      if (attr) {
        // console.log(attr + " - " + filters[attr]);
        if (filters[attr]) {
          result += '&'+attr+'='+filters[attr];
        }
      }
    }
    return result;
  }

  public buildPaginationParams(event: LazyLoadParams): string {
    if (!event) {
      return '';
    }
    // let filter: string = this.buildFilter(event.filters);
    let filter: string = this.buildFilterFromForm(event.filters);
    const direction = event.sortOrder === 1 ? 'asc' : 'desc';

    // If result of page is 0 then assign 1
    const page: string = ((event?.first || 0) / (event?.rows || 1) ? (event?.first || 0) / (event?.rows || 1) + 1 : 1).toString();
    const page_size: string = (event.rows ? event.rows : 1).toString();
    const ordering: string | null = event.sortField ? event.sortField : null;
    let queryString = `?page=${page}&page_size=${page_size}`;
    if (ordering){
      queryString += `&ordering=${ordering}`
    }
    return `${queryString}${filter}`;
  }


  // public buildPaginationParamsCustom(event: CustomLazyLoadEvent): string {
  //   if (!event) {
  //     return '';
  //   }
  //   // let filter: string = this.buildFilter(event.filters);
  //   let filter: string = this.buildFilterFromForm(event.filters);
  //   // const direction = event.sortOrder === 1 ? 'asc' : 'desc';

  //   // If result of page is 0 then assign 1
  //   // const page: string = ((event?.first || 0) / (event?.rows || 1) + 1 ? (event?.first || 0) / (event?.rows || 1) + 1 : 1).toString();


  //   return `?page=${event.page ? event.page : 1}&page_size=${event.page_size}&ordering=${event.ordering}${filter}`;
  // }

  /**
   * Parse a query string into a plain object.
   * Supports repeated keys by collecting values into arrays.
   */
  public parseQueryParams(queryString: string): Record<string, string | string[]> {
    if (!queryString) {
      return {};
    }
    const trimmed = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    if (!trimmed) {
      return {};
    }
    const params = new URLSearchParams(trimmed);
    const result: Record<string, string | string[]> = {};
    params.forEach((value, key) => {
      if (result[key] === undefined) {
        result[key] = value;
      } else if (Array.isArray(result[key])) {
        (result[key] as string[]).push(value);
      } else {
        result[key] = [result[key] as string, value];
      }
    });
    return result;
  }

  /**
   * Build a query string from an object.
   * Falsy values (empty string, null, undefined) are removed.
   */
  public toQueryString(
    params: Record<string, string | number | boolean | (string | number | boolean)[] | null | undefined>,
    includeQuestionMark: boolean = true,
  ): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(item => {
          if (item !== undefined && item !== null && item !== '') {
            searchParams.append(key, String(item));
          }
        });
        return;
      }
      searchParams.set(key, String(value));
    });
    const serialized = searchParams.toString();
    if (!serialized) {
      return '';
    }
    return includeQuestionMark ? `?${serialized}` : serialized;
  }
}
