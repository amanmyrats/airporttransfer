export interface ReservationSummary {
  id: number | null;
  number: string | null;
  pickup: string | null;
  destination: string | null;
  status: string | null;
  transfer_date: string | null;
}

export type ReviewStatus = 'pending' | 'published' | 'rejected';

export interface MyReview {
  id: number;
  reservation: number;
  reservation_id: number;
  reservation_obj: ReservationSummary | null;
  route_id: number | null;
  rating: number;
  title: string | null;
  comment: string | null;
  status: ReviewStatus;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewPayload {
  reservation: number;
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string | null;
  comment?: string | null;
}

export interface PublicReview {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  reservation_obj: ReservationSummary | null;
  route_id: number | null;
  author_display: string;
  created_at: string;
  is_verified: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AdminReview {
  id: number;
  reservation: number | null;
  reservation_id: number | null;
  reservation_obj: ReservationSummary | null;
  route: number | null;
  route_id: number | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_public: boolean;
  is_verified: boolean;
  is_flagged: boolean;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateAdminReviewPayload {
  reservation: number;
  route?: number | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  is_public?: boolean;
  is_verified?: boolean;
  is_flagged?: boolean;
  status?: ReviewStatus;
}

export interface UpdateAdminReviewPayload {
  reservation?: number | null;
  route?: number | null;
  rating?: number;
  title?: string | null;
  comment?: string | null;
  is_public?: boolean;
  is_verified?: boolean;
  is_flagged?: boolean;
  status?: ReviewStatus;
}

export interface ReviewReply {
  id: number;
  review: number;
  author: number;
  author_name: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewReplyPayload {
  review: number;
  body: string;
}

export interface UpdateReviewReplyPayload {
  body?: string;
}
