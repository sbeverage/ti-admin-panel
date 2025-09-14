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
        message.success('Signed out successfully');
      }
    });
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
      onClick: handleLogout,
    },
  ];

  return (
    <div className={className}>
      <Avatar size={40} icon={<UserOutlined />} />
      <div className="user-info">
        <Text strong>{username || 'Admin'}</Text>
        {showRole && <Text type="secondary">Admin</Text>}
      </div>
      <Dropdown
        menu={{ items: userMenuItems }}
        trigger={['click']}
        placement="topRight"
        arrow
      >
        <Button 
          type="text" 
          icon={<MoreOutlined />}
          className="user-menu-button"
        />
      </Dropdown>
    </div>
  );
};

export default UserProfile;
