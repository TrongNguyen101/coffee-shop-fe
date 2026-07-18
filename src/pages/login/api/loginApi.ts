import { api } from '@/api/api';
import type { LoginRequest, LoginResponse } from '../types';

export async function loginApi(payload: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', payload);
  return response.data;
}
