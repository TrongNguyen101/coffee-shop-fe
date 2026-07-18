import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { notification } from 'antd';
import { ENV } from '@/constants/evn';
import { RESPONSE_CODE } from '@/constants/messages';
import { store } from '@/store/store';
import { setUserId, clearUserId } from '@/store/authSlice';
import { getResponseMessage } from '@/utils/getResponseMessage';

interface ApiResponseBody {
  code?: string;
}

export const api = axios.create({
  baseURL: ENV.API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach X-User-Id from Redux store
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userId = store.getState().auth.userId;
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor — map backend response code to translated message
api.interceptors.response.use(
  (response) => {
    const userId = response.headers['x-user-id'];
    if (userId) {
      store.dispatch(setUserId(userId));
    }
    return response;
  },
  (error: AxiosError<ApiResponseBody>) => {
    const code = error.response?.data?.code ?? RESPONSE_CODE.INTERNAL_SERVER_ERROR;

    if (error.response?.status === 401) {
      store.dispatch(clearUserId());
    }

    notification.error({
      message: 'Lỗi',
      description: getResponseMessage(code),
      placement: 'topRight',
      duration: 3,
    });
    return Promise.reject(error);
  },
);
