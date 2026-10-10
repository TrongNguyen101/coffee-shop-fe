import { useEffect, useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { RESPONSE_CODE } from '@/constants/messages';

export interface TableCreateValues {
  tableNumber: number;
  description?: string;
  status: number;
  shopId: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface TableCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TableCreateValues) => Promise<void> | void;
  loading?: boolean;
  shopOptions: SelectOption[];
  optionsLoading?: boolean;
  defaultShopId?: string;
}

export function TableCreateModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  shopOptions,
  optionsLoading = false,
  defaultShopId,
}: TableCreateModalProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<TableCreateValues>();
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isOwner = roleName === ROLES.OWNER;
  const isOpenedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      isOpenedRef.current = false;
      return;
    }
    // Initialize form fields once per opening to prevent wiping user inputs on re-render
    if (!isOpenedRef.current) {
      isOpenedRef.current = true;
      form.resetFields();
      form.setFieldValue('status', 1);
      if (isOwner) {
        const initialShopId = defaultShopId || shopOptions[0]?.value;
        if (initialShopId) form.setFieldValue('shopId', initialShopId);
      }
    }
  }, [open, isOwner, defaultShopId, shopOptions, form]);

  const handleClose = () => {
    isOpenedRef.current = false;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: TableCreateValues) => {
    try {
      await onSubmit({
        ...values,
        tableNumber: Number(values.tableNumber),
        description: values.description?.trim() || undefined,
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
      title={t('tables.createTitle')}
      width={480}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>{t('form.cancel')}</Button>
          <Button type="primary" loading={loading} onClick={() => form.submit()}>
            {t('form.create')}
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
              // Allows Unicode letters, digits, spaces, and punctuation: - & / ( ) , . '
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
