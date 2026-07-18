import { useState } from 'react';
import { Layout, Typography } from 'antd';
import {
  CoffeeOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  LineChartOutlined,
  TeamOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SideBar } from '@/components/side-bar/SideBar';

const { Header, Content, Footer } = Layout;

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation();

  const NAV_ITEMS = [
    { key: '/', label: t('sidebar.drinks'), icon: <CoffeeOutlined /> },
    { key: '/orders', label: t('sidebar.orders'), icon: <ShoppingCartOutlined /> },
    { key: '/categories', label: t('sidebar.categories'), icon: <AppstoreOutlined /> },
    { key: '/revenue', label: t('sidebar.revenues'), icon: <LineChartOutlined /> },
    { key: '/staff', label: t('sidebar.staffs'), icon: <TeamOutlined /> },
    { key: '/branch-shop', label: t('sidebar.branchShops'), icon: <ShopOutlined /> },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center px-8 !sticky top-0 z-10">
        <Typography.Title level={4} className="!text-white !mb-0">
          {collapsed ? t('common.appNameShort') : t('common.appName')}
        </Typography.Title>
      </Header>

      <Layout>
        <SideBar items={NAV_ITEMS} collapsed={collapsed} onCollapse={setCollapsed} />

        <Layout>
          <Content className="p-8 min-h-screen">
            <Outlet />
          </Content>

          <Footer className="text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} {t('common.appName')}
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
}
