import React from 'react';
import { Avatar, Button, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Text } = Typography;

interface UserProfileProps {
  className?: string;
  showRole?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ className = "user-profile", showRole = false }) => {
  const { logout, username } = useAuth();


  return (
    <div className={className}>
      <Avatar size={40} icon={<UserOutlined />} />
      <div className="user-info">
        <Text strong>{username || 'Admin'}</Text>
      </div>
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
    </div>
  );
};

export default UserProfile;
