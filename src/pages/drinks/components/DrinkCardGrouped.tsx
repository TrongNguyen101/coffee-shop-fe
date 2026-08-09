import { Card, Typography, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { DrinkItem } from '../types';

interface Props {
  record: DrinkItem;
  onClick?: (record: DrinkItem) => void;
  onDelete?: (record: DrinkItem) => void;
  isStaff?: boolean;
}

export function DrinkCardGrouped({ record, onClick, onDelete, isStaff = false }: Props) {
  const fallbackImage = 'https://placehold.co/400x400?text=No+Image';

  return (
    <Card
      hoverable
      onClick={() => onClick?.(record)}
      cover={
        <div className="w-full aspect-[4/3] overflow-hidden bg-gray-50 rounded-t-lg">
          <img
            alt="cover"
            src={record.imageUrl || fallbackImage}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              if (el.src !== fallbackImage) {
                el.src = fallbackImage;
              }
            }}
          />
        </div>
      }
      styles={{ body: { padding: '8px 10px' } }}
      style={{
        width: '100%',
        border: '1px solid rgba(0,0,0,0.06)',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div className="flex flex-col justify-between gap-2">
        {/* Drink Name */}
        <div>
          <Typography.Paragraph
            ellipsis={{ rows: 2 }}
            className="mb-0! text-xs font-semibold leading-snug text-gray-800"
            title={record.drinkName}
          >
            {record.drinkName}
          </Typography.Paragraph>
        </div>

        {!isStaff && onDelete && (
          <div className="flex items-center justify-end mt-1">
            <Button
              danger
              type="text"
              shape="circle"
              size="small"
              className="flex items-center justify-center min-w-[24px] w-6 h-6"
              icon={<DeleteOutlined style={{ fontSize: 13 }} />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(record);
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
