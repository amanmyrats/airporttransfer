export interface LazyLoadParams {
  /**
   * Zero-based index of the first record in the current page.
   */
  first?: number;

  /**
   * Number of records per page.
   */
  rows?: number;

  /**
   * Field name used for sorting.
   */
  sortField?: string | null;

  /**
   * Sort direction: 1 for ascending, -1 for descending, 0/undefined for none.
   */
  sortOrder?: 1 | -1 | 0 | null;

  /**
   * Arbitrary filters keyed by field identifier.
   */
  filters?: Record<string, any>;
}

/**
 * Represents a custom event object for lazy loading data with additional pagination and sorting fields.
 */
export interface CustomLazyLoadEvent extends LazyLoadParams {
  /**
   * The zero-based index of the current page (for pagination).
   */
  page?: number;

  /**
   * The number of rows to load per page (for pagination).
   */
  page_size?: number;

  /**
   * An optional string representing the desired sorting order (e.g., "field1 ASC, field2 DESC").
   */
  ordering?: string;
}
