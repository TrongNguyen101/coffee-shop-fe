import { useEffect, useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { RESPONSE_CODE } from '@/constants/messages';
import type { TableItem } from '../types';

export interface TableEditValues {
  tableNumber: number;
  description?: string;
  status: number;
  shopId: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface TableEditModalProps {
  open: boolean;
  onClose: () => void;
  record: TableItem | null;
  onSubmit: (values: TableEditValues) => Promise<void> | void;
  loading?: boolean;
  shopOptions?: SelectOption[];
  optionsLoading?: boolean;
}

export function TableEditModal({
  open,
  onClose,
  record,
  onSubmit,
  loading = false,
  shopOptions = [],
  optionsLoading = false,
}: TableEditModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<TableEditValues>();
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isOwner = roleName === ROLES.OWNER;
  const isOpenedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      isOpenedRef.current = false;
      return;
    }
    if (!isOpenedRef.current && record) {
      isOpenedRef.current = true;
      form.resetFields();
      form.setFieldsValue({
        tableNumber: record.tableNumber,
        description: record.description ?? '',
        status: record.status ?? 1,
        shopId: record.shopId,
      });
    }
  }, [open, record, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: TableEditValues) => {
    try {
      await onSubmit({
        ...values,
        tableNumber: Number(values.tableNumber),
        description: values.description?.trim() || undefined,
        shopId: record?.shopId ?? values.shopId,
      });
      handleClose();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const resData = error.response?.data;
        const resCode = resData?.code;
        const serverMessage = (
          typeof resData?.message === 'string' ? resData.message : ''
        ).toLowerCase();

        if (
          resCode === RESPONSE_CODE.CONFLICT ||
          resCode === 'ER005' ||
          serverMessage.includes('already exists')
        ) {
          form.setFields([
            {
              name: 'tableNumber',
              errors: [t('tables.numberConflict')],
            },
          ]);
        }
      }
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      centered
      title={t('tables.editTitle')}
      width={480}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>{t('form.cancel')}</Button>
          <Button type="primary" loading={loading} onClick={() => form.submit()}>
            {t('form.save')}
          </Button>
        </div>
      }
    >
      <Divider className="my-3!" />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={(changedValues) => {
          if ('tableNumber' in changedValues) {
            form.setFields([{ name: 'tableNumber', errors: [] }]);
          }
        }}
      >
        <Form.Item
          name="tableNumber"
          label={t('tables.tableNumber')}
          rules={[
            {
              validator: (_, value) => {
                if (value === undefined || value === null || value === '') {
                  return Promise.reject(new Error(t('tables.tableNumberRequired')));
                }
                const num = Number(value);
                if (isNaN(num) || !Number.isInteger(num) || num < 1) {
                  return Promise.reject(new Error(t('tables.tableNumberInvalid')));
                }
                if (num > 9999) {
                  return Promise.reject(new Error(t('responses.EV005')));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            className="w-full!"
            precision={0}
            placeholder={t('tables.tableNumberPlaceholder')}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('tables.description')}
          rules={[
            { max: 255, message: t('responses.EV005') },
            {
              // Allows: Unicode letters, numbers, spaces, and punctuation: - & / ( ) , . '
              pattern: /^[\p{L}\p{N}\s\-&/(),.']*$/u,
              message: t('responses.EV007'),
            },
          ]}
        >
          <Input.TextArea
            rows={2}
            maxLength={255}
            showCount
            placeholder={t('tables.descriptionPlaceholder')}
          />
        </Form.Item>

        <Form.Item name="status" label={t('tables.status')} rules={[{ required: true }]}>
          <Select
            options={[
              { value: 1, label: t('tables.statusOptions.available') },
              { value: 2, label: t('tables.statusOptions.occupied') },
              { value: 3, label: t('tables.statusOptions.reserved') },
            ]}
          />
        </Form.Item>

        {isOwner ? (
          <Form.Item
            name="shopId"
            label={t('tables.shopName')}
            rules={[{ required: true, message: t('tables.shopRequired') }]}
          >
            <Select
              disabled
              options={shopOptions}
              loading={optionsLoading}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        ) : (
          <Form.Item name="shopId" hidden>
            <Input />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
