import React from 'react';
import { Avatar, Button, Dropdown, Typography, Modal, message } from 'antd';
import { UserOutlined, MoreOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Text } = Typography;

interface UserProfileProps {
  className?: string;
  showRole?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ className = "user-profile", showRole = false }) => {
  const { logout, username } = useAuth();

  const handleLogout = () => {
    Modal.confirm({
      title: 'Sign Out',
      content: 'Are you sure you want to sign out?',
      okText: 'Sign Out',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: () => {
        logout();
      }
    });
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      // TODO: Navigate to profile page
    } else if (key === 'settings') {
      // TODO: Navigate to settings page
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'View Profile',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Account Settings',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'Sign Out',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <div className={className}>
      <Avatar size={40} icon={<UserOutlined />} />
      <div className="user-info">
        <Text strong>{username || 'Admin'}</Text>
        {showRole && <Text type="secondary">Admin</Text>}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button 
          type="text" 
          onClick={() => logout()}
          style={{ 
            color: '#ffffff', 
            border: 'none', 
            background: 'transparent',
            padding: '4px 8px',
            fontSize: '12px'
          }}
        >
          Sign Out
        </Button>
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          trigger={['click']}
          placement="topRight"
          arrow
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            className="user-menu-button"
            style={{ color: '#ffffff', border: 'none', background: 'transparent' }}
          />
        </Dropdown>
      </div>
    </div>
  );
};

export default UserProfile;
