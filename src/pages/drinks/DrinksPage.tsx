import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';
import {
  Row,
  Col,
  Pagination,
  Empty,
  Spin,
  Button,
  Typography,
  Tag,
  Drawer,
  Radio,
  Select,
} from 'antd';
import { SearchInput } from '@/components/search/SearchInput';
import { useNotifyModal } from '@/components/modal/NotifyModal';
import { useAppSelector } from '@/store/hooks';
import { ROLES } from '@/permission/roles';
import { useDrinks } from './hooks/useDrinks';
import type { DrinkItem } from './types';
import { DrinkCardGrouped, type GroupedDrink } from './components/DrinkCardGrouped';
import { DrinkCreateModal } from './components/DrinkCreateModal';

// Group drink variants by name/id into a single drink object
function groupDrinks(items: DrinkItem[]): GroupedDrink[] {
  const map = new Map<string, GroupedDrink>();
  for (const it of items) {
    const key = it.drinkName || it.drinkId;
    const existing = map.get(key);
    const variant = { drinkId: it.drinkId, size: it.size, price: it.price };
    if (existing) {
      existing.variants.push(variant);
    } else {
      map.set(key, {
        drinkName: it.drinkName,
        imageUrl: it.imageUrl,
        drinkCategoryId: it.drinkCategoryId,
        id: it.drinkId,
        status: it.status,
        isDeleted: it.isDeleted,
        variants: [variant],
      } as unknown as GroupedDrink);
    }
  }
  return Array.from(map.values());
}

export function DrinksPage() {
  const { t } = useTranslation();
  const { showError } = useNotifyModal();

  // THÊM MỚI: Check role permission (STAFF role cannot see create button)
  const roleName = useAppSelector((state) => state.auth.profile?.roleName);
  const isStaff = roleName === ROLES.STAFF;

  // Fetch drinks data and handlers from custom hook
  const {
    items,
    totalElements,
    loading,
    searchLoading,
    createLoading,
    currentPage,
    currentPageSize,
    showEmptyModal,
    closeEmptyModal,
    handleSearch,
    handlePageChange,
    createDrink,
  } = useDrinks(1, 10);

  // Show error modal when user search returns no results
  useEffect(() => {
    if (showEmptyModal) {
      showError(
        t('drinks.emptySearch') || 'Không tìm thấy đồ uống nào phù hợp với từ khóa tìm kiếm.',
        t('common.error') || 'Lỗi',
      );
      closeEmptyModal();
    }
  }, [showEmptyModal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Group drinks list whenever items change
  const grouped = useMemo(() => groupDrinks(items ?? []), [items]);

  // Drawer and variant selection states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<GroupedDrink | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const fallbackImage = 'https://placehold.co/600x400?text=No+Image';

  // Open detail drawer and select the first size variant by default
  const onCardClick = (g: GroupedDrink) => {
    setSelected(g);
    if (g.variants && g.variants.length > 0) {
      setSelectedVariantId(g.variants[0]?.drinkId ?? null);
    } else {
      setSelectedVariantId(null);
    }
    setDrawerOpen(true);
  };

  // Get price for the currently selected size variant
  const priceForSelected = () => {
    if (!selected || !selectedVariantId) return '—';
    const v = selected.variants.find((x) => x.drinkId === selectedVariantId);
    return v?.price ?? '—';
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4 bg-white shadow-sm">
      <Typography.Title level={4} className="mb-0!">
        {t('drinks.title') || 'Đồ Uống'}
      </Typography.Title>

      {/* Search Input & Action Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-48">
          <SearchInput
            onSearch={(val) => handleSearch(val)}
            loading={searchLoading}
            placeholder={t('drinks.searchPlaceholder') || 'Search drink...'}
          />
        </div>

        {/* ADD NEW: Create a new button in the right corner; hidden for the STAFF role. */}
        {!isStaff && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            {t('form.create') || 'Tạo mới'}
          </Button>
        )}
      </div>

      {/* Drink Cards Grid */}
      <Spin spinning={loading} description={t('common.loading')}>
        {grouped.length === 0 && !loading ? (
          <div className="py-8">
            <Empty description={t('drinks.empty') || 'not found any data drink'} />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {grouped.map((g) => (
              <Col key={g.id ?? g.drinkName} xs={24} sm={12} md={8} lg={6}>
                <DrinkCardGrouped record={g} onClick={() => onCardClick(g)} />
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {/* Pagination Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 24,
          position: 'relative',
          width: '100%',
        }}
      >
        <div style={{ flex: 1 }} />

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={currentPageSize}
            total={totalElements}
            onChange={(p, ps) => handlePageChange(p, ps)}
            showSizeChanger={false}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Select
            value={currentPageSize}
            onChange={(val) => handlePageChange(1, Number(val))}
            options={[
              { value: 10, label: '10 / trang' },
              { value: 15, label: '15 / trang' },
              { value: 20, label: '20 / trang' },
            ]}
            style={{ width: 120 }}
          />
        </div>
      </div>

      {/* Drink Detail Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
        title={selected?.drinkName}
        // Nút Đóng cố định dưới footer chuẩn Ant Design
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setDrawerOpen(false)}>{t('form.close') || 'Đóng'}</Button>
          </div>
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            {/* Drink Image */}
            <div className="w-full h-64 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
              <img
                src={selected.imageUrl || fallbackImage}
                alt="drink"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  if (el.src !== fallbackImage) {
                    el.src = fallbackImage;
                  }
                }}
              />
            </div>

            {/* Drink Title & Size Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <Typography.Title level={4} className="mb-0!">
                {selected.drinkName}
              </Typography.Title>
              {selected?.variants?.length && (
                <Tag color="green">{selected.variants.length} size</Tag>
              )}
            </div>

            {/* Variant Selector */}
            <div>
              <Typography.Text strong>{t('drinks.chooseSize') || 'Chọn kích cỡ'}</Typography.Text>
              <div className="mt-2 w-full overflow-x-auto">
                <Radio.Group
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  buttonStyle="solid"
                  className="flex flex-wrap gap-2"
                >
                  {selected.variants.map((v) => (
                    <Radio.Button key={v.drinkId} value={v.drinkId}>
                      {v.size.trim()} - {v.price}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            </div>

            {/* Price and Status Row */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-100">
              <div>
                <div className="text-sm text-gray-500">{t('drinks.price') || 'Giá'}</div>
                <div className="text-xl font-bold text-green-600">{priceForSelected()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{t('drinks.status') || 'Trạng thái'}</div>
                <Tag
                  color={selected.status === 'Đang bán' ? 'green' : 'default'}
                  className="mt-1 mr-0"
                >
                  {selected.status ?? '—'}
                </Tag>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create drink Create Modal */}
      <DrinkCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createDrink}
        loading={createLoading}
      />
    </div>
  );
}
