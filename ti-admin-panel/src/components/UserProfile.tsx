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
    console.log('handleLogout function called');
    Modal.confirm({
      title: 'Sign Out',
      content: 'Are you sure you want to sign out?',
      okText: 'Sign Out',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: () => {
        console.log('Logout confirmed, calling logout function');
        logout();
        message.success('Signed out successfully');
      },
      onCancel: () => {
        console.log('Logout cancelled');
      }
    });
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    console.log('Menu item clicked:', key);
    if (key === 'logout') {
      console.log('Logout clicked, showing confirmation modal');
      handleLogout();
    } else if (key === 'profile') {
      console.log('View Profile clicked');
      // TODO: Navigate to profile page
    } else if (key === 'settings') {
      console.log('Account Settings clicked');
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
      <div style={{ display: 'flex', gap: '4px' }}>
        <Button 
          type="text" 
          size="small"
          onClick={() => {
            console.log('Direct logout test clicked');
            handleLogout();
          }}
          style={{ color: '#ff4d4f', fontSize: '12px' }}
        >
          Test Logout
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
            onClick={(e) => {
              console.log('3 dots button clicked');
              e.stopPropagation();
            }}
          />
        </Dropdown>
      </div>
    </div>
  );
};

export default UserProfile;
