import { useMemo } from 'react';
import { Modal, Button, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { OrderEditor } from '@/components/order/OrderEditor';
import { useOrderEditor } from '@/hooks/useOrderEditor';
import type { OrderInitialValues } from '@/types/order';
import type { InvoiceItem, EditInvoiceRequest } from '../types';

interface InvoiceEditModalProps {
  open: boolean;
  onClose: () => void;
  record: InvoiceItem | null;
  onSubmit: (values: EditInvoiceRequest) => Promise<void> | void;
  loading?: boolean;
}

interface BodyProps extends Omit<InvoiceEditModalProps, 'record'> {
  record: InvoiceItem;
}

// Mounted only while the modal is open, so the form starts from the selected invoice every time
function InvoiceEditModalBody({ open, onClose, record, onSubmit, loading = false }: BodyProps) {
  const { t } = useTranslation();

  const initialOrder = useMemo<OrderInitialValues | undefined>(
    () =>
      record.tableId
        ? {
            tableId: record.tableId,
            tableNumber: record.tableNumber,
            lines: (record.items ?? []).map((item) => ({
              drinkDetailId: item.drinkDetailId,
              drinkName: item.drinkName,
              size: item.size,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              note: item.note ?? undefined,
            })),
          }
        : undefined,
    [record],
  );

  const editor = useOrderEditor(open, record.shopId, initialOrder);

  const handleSubmit = async () => {
    const order = editor.buildOrderPayload();

    if (!order) return;

    try {
      await onSubmit({ invoiceId: record.invoiceId, ...order });
      onClose();
    } catch {
      // Error notification is already shown by the response interceptor
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      destroyOnHidden
      title={t('invoices.editTitle')}
      width={1280}
      mask={{ closable: !loading }}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          {t('form.cancel')}
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          disabled={editor.cart.length === 0 || !editor.tableId}
          onClick={handleSubmit}
        >
          {t('form.save')}
        </Button>,
      ]}
    >
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 bg-gray-50 rounded-lg px-4 py-3 mb-4 text-sm">
        <div>
          <span className="text-gray-500">{t('invoices.shopName')}: </span>
          <span className="font-medium">{record.shopName}</span>
        </div>
        <div>
          <span className="text-gray-500">{t('invoices.staffName')}: </span>
          <span className="font-medium">{record.staffName}</span>
        </div>
        <div>
          <span className="text-gray-500">{t('invoices.invoiceCode')}: </span>
          <span className="font-medium">{record.invoiceCode || '—'}</span>
        </div>
      </div>

      <Divider className="my-3!" />

      <OrderEditor editor={editor} />
    </Modal>
  );
}

export function InvoiceEditModal({ record, ...props }: InvoiceEditModalProps) {
  if (!props.open || !record) return null;

  return <InvoiceEditModalBody key={record.invoiceId} record={record} {...props} />;
}
