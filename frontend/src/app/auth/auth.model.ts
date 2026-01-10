// auth/auth.model.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

export interface LoginResponse {
  status: 'OTP_REQUIRED';
  message: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    role: 'ADMIN';
  };
}
