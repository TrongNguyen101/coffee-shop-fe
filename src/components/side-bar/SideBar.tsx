import { Layout, Menu, type MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const { Sider } = Layout;

interface SideBarProps {
  items: MenuProps['items'];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export function SideBar({ items, collapsed = false, onCollapse }: SideBarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      theme="light"
      className="!sticky top-16 h-[calc(100vh-64px)] overflow-auto self-start !shadow-md"
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
        className="h-full border-r-0"
      />
    </Sider>
  );
}
