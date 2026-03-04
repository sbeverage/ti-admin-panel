import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Dropdown, List, Space, Tag, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import {
  fetchNotifications,
  markAllRead,
  markRead,
  subscribeToNotifications,
  AppNotification,
} from '../services/notifications';

const levelColors: Record<string, string> = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
};

const formatTimestamp = (timestamp: number) => {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return '';
  }
};

const NotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = async () => {
    const snapshot = await fetchNotifications();
    setNotifications(snapshot.notifications);
    setUnreadCount(snapshot.unreadCount);
  };

  useEffect(() => {
    refresh();
    const unsubscribe = subscribeToNotifications(() => {
      refresh();
    });
    return () => unsubscribe();
  }, []);

  const dropdownContent = useMemo(() => {
    return (
      <div style={{ width: 340 }}>
        <Space
          align="center"
          style={{
            width: '100%',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Typography.Text strong>Notifications</Typography.Text>
          <Button type="link" size="small" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
        </Space>
        <List
          dataSource={notifications}
          locale={{ emptyText: 'No notifications yet' }}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              style={{
                padding: '12px 16px',
                background: item.read ? '#ffffff' : '#faf7f2',
                cursor: 'pointer',
              }}
              onClick={() => markRead(item.id)}
            >
              <List.Item.Meta
                title={
                  <Space size="small">
                    <Typography.Text strong>{item.title}</Typography.Text>
                    <Tag color={levelColors[item.level] || 'blue'}>{item.level}</Tag>
                  </Space>
                }
                description={
                  <div>
                    {item.message && <Typography.Text>{item.message}</Typography.Text>}
                    <div>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {formatTimestamp(item.createdAt)}
                      </Typography.Text>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  }, [notifications, unreadCount]);

  return (
    <Dropdown overlay={dropdownContent} trigger={['click']} placement="bottomRight">
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button type="text" icon={<BellOutlined />} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationsDropdown;
