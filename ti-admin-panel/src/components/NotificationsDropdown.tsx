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
import './NotificationsDropdown.css';

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
      <div className="notifications-dropdown">
        <div className="notifications-dropdown__header">
          <Typography.Text strong>Notifications</Typography.Text>
          <Button
            type="link"
            size="small"
            className="notifications-dropdown__mark-all"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Button>
        </div>
        <List
          className="notifications-dropdown__list"
          dataSource={notifications}
          locale={{ emptyText: 'No notifications yet' }}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              className={`notifications-dropdown__item ${item.read ? '' : 'is-unread'}`}
              style={{ padding: '12px 20px' }}
              onClick={() => markRead(item.id)}
            >
              <List.Item.Meta
                title={
                  <Space size="small" className="notifications-dropdown__title">
                    <Typography.Text strong>{item.title}</Typography.Text>
                    <Tag className={`notification-level-tag level-${item.level}`}>{item.level}</Tag>
                  </Space>
                }
                description={
                  <div className="notifications-dropdown__body">
                    {item.message && <Typography.Text>{item.message}</Typography.Text>}
                    <Typography.Text type="secondary" className="notifications-dropdown__timestamp">
                      {formatTimestamp(item.createdAt)}
                    </Typography.Text>
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
    <Dropdown
      overlay={dropdownContent}
      trigger={['click']}
      placement="bottomRight"
      overlayClassName="notifications-dropdown-overlay"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]} className="notifications-badge">
        <Button type="text" icon={<BellOutlined />} />
      </Badge>
    </Dropdown>
  );
};

export default NotificationsDropdown;
