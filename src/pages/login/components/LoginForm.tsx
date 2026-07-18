import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import type { LoginRequest } from '../types';

interface LoginFormProps {
  loading: boolean;
  onSubmit: (values: LoginRequest) => void;
}

export function LoginForm({ loading, onSubmit }: LoginFormProps) {
  const { t } = useTranslation();

  return (
    <Form layout="vertical" onFinish={onSubmit} autoComplete="off">
      <Form.Item name="username" rules={[{ required: true, message: t('login.usernameRequired') }]}>
        <Input placeholder={t('login.usernamePlaceholder')} size="large" />
      </Form.Item>

      <Form.Item name="password" rules={[{ required: true, message: t('login.passwordRequired') }]}>
        <Input.Password placeholder={t('login.passwordPlaceholder')} size="large" />
      </Form.Item>

      <Form.Item className="mb-0">
        <Button type="primary" htmlType="submit" size="large" loading={loading} className="w-full">
          {t('login.submit')}
        </Button>
      </Form.Item>
    </Form>
  );
}
