import { api } from '@/api/api';
import { ENDPOINT } from '@/constants/endpoint';
import { RESPONSE_CODE } from '@/constants/messages';
import type {
  SearchShopBranchRequest,
  ShopBranchesResponse,
  CreateShopBranchRequest,
} from '../types';

export async function getShopBranchesApi(
  payload: SearchShopBranchRequest,
): Promise<ShopBranchesResponse> {
  const response = await api.post<ShopBranchesResponse>(ENDPOINT.GET_SHOP_BRANCHES, payload);
  return response.data;
}

// Suppress global ER005 toast so modal can show exact conflict message
export async function createShopBranchApi(payload: CreateShopBranchRequest): Promise<void> {
  await api.post(ENDPOINT.CREATE_SHOP_BRANCH, payload, {
    suppressCodes: [RESPONSE_CODE.CONFLICT, 'ER005'],
  });
}
