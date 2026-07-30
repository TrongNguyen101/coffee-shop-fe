// src/pages/drinks/api/drinksAPI.ts
import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import type {
  DrinksResponse,
  GetDrinksRequest,
  CreateDrinkRequest,
  CreateDrinkResponse,
} from '../types';

export async function getDrinksApi(payload: GetDrinksRequest): Promise<DrinksResponse> {
  const response = await api.post<DrinksResponse>(ENDPOINT.GET_DRINKS, payload);
  return response.data;
}

export async function createDrinkApi(payload: CreateDrinkRequest): Promise<CreateDrinkResponse> {
  const response = await api.post<CreateDrinkResponse>(ENDPOINT.CREATE_DRINK, payload);
  return response.data;
}
