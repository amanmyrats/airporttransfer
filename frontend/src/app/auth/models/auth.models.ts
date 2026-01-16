import { LanguageCode } from '../../constants/language.contants';

export interface CustomerProfileDto {
  phone_e164?: string;
  preferred_language: LanguageCode;
  marketing_opt_in: boolean;
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  is_staff: boolean;
  is_superuser?: boolean;
  is_client: boolean;
  is_company_user: boolean;
  first_name?: string;
  last_name?: string;
  customer_profile?: CustomerProfileDto;
  profile?: CustomerProfileDto;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface RefreshResponse {
  access: string;
  refresh?: string;
  user?: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  preferred_language: CustomerProfileDto['preferred_language'];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  uid: string;
  token: string;
  new_password: string;
}

export interface VerifyEmailPayload {
  key: string;
}

export interface SocialGooglePayload {
  id_token: string;
}

export interface SocialApplePayload {
  identity_token: string;
}

export interface SocialFacebookPayload {
  access_token: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  customer_profile?: Partial<CustomerProfileDto>;
  profile?: Partial<CustomerProfileDto>;
}
