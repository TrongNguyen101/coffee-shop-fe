import { Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { TableItem } from '../types';
import { getTableCardStyle } from '../utils/tableStatus';

interface TableCardProps {
  record: TableItem;
  onClick?: (record: TableItem) => void;
  onEdit?: (record: TableItem) => void;
  onDelete?: (record: TableItem) => void;
}

export function TableCard({ record, onClick, onEdit, onDelete }: TableCardProps) {
  const { t } = useTranslation();
  const style = getTableCardStyle(record.status);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${t('tables.tableNumber')}: ${record.tableNumber}`}
      className={`group relative aspect-square w-full rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md ${style.card}`}
      onClick={() => onClick?.(record)}
      onKeyDown={(e) => {
        // Only trigger when the card itself is focused
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(record);
        }
      }}
    >
      {/* Table number displayed at the center */}
      <span className="text-4xl font-bold leading-none select-none">{record.tableNumber}</span>

      {/* Edit and Delete action buttons at bottom-right corner */}
      {(onEdit || onDelete) && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          {onEdit && (
            <Button
              type="text"
              shape="circle"
              size="small"
              aria-label={t('form.edit')}
              className="flex items-center justify-center! bg-white/80 hover:bg-white! text-inherit shadow-xs"
              icon={<EditOutlined style={{ fontSize: 13 }} />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
            />
          )}
          {onDelete && (
            <Button
              danger
              type="text"
              shape="circle"
              size="small"
              aria-label={t('form.delete')}
              className="flex items-center justify-center! bg-white/80 hover:bg-red-50! shadow-xs"
              icon={<DeleteOutlined style={{ fontSize: 13 }} />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
