import { Form, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { CategorySelectOption } from '../types';

const DRINK_NAME_PATTERN = /^[\p{L}\p{N}\s&/(),.'-]+$/u;

interface DrinkCategoryFieldProps {
  options: CategorySelectOption[];
  onChange?: (value: string, option?: CategorySelectOption | CategorySelectOption[]) => void;
}

export function DrinkNameField() {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="drinkName"
      label={t('drinks.name')}
      rules={[
        { required: true, whitespace: true, message: t('drinks.validation.nameRequired') },
        { max: 100, message: t('drinks.validation.nameMaxLength') },
        { pattern: DRINK_NAME_PATTERN, message: t('drinks.validation.nameInvalid') },
      ]}
    >
      <Input placeholder={t('form.inputNamePlaceholder')} maxLength={100} />
    </Form.Item>
  );
}

export function DrinkCategoryField({ options, onChange }: DrinkCategoryFieldProps) {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="drinkCategoryId"
      label={t('sidebar.categories')}
      rules={[{ required: true, message: t('drinks.validation.categoryRequired') }]}
    >
      <Select
        placeholder={t('form.selectCategoryPlaceholder')}
        options={options}
        onChange={onChange}
        notFoundContent={options.length === 0 ? t('drinks.noCategory') : undefined}
      />
    </Form.Item>
  );
}

export function DrinkStatusField({ required = true }: { required?: boolean }) {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="status"
      label={t('drinks.status')}
      rules={required ? [{ required: true }] : undefined}
    >
      <Select
        options={[
          { value: 1, label: t('drinks.statusActive') },
          { value: 0, label: t('drinks.statusInactive') },
        ]}
      />
    </Form.Item>
  );
}

export function DrinkUploadAction() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{t('drinks.uploadImage')}</div>
    </div>
  );
}
