import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { setUserId } from '@/store/authSlice';
import { useToast } from '@/components/toast/useToast';
import { loginApi } from '../api/loginApi';
import type { LoginRequest } from '../types';

export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const login = async (values: LoginRequest) => {
    setLoading(true);
    toast.info(t('login.toastLoading'));
    try {
      const response = await loginApi(values);
      dispatch(setUserId(response.userId));
      toast.success(t('login.toastSuccess'));
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
