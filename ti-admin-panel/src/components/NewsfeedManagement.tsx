import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Table, Tag, Space, Modal, Form, Input, Select, Upload, Avatar, Badge, Tabs, message, Popconfirm, Tooltip, Divider, Statistic, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  RiseOutlined,
  GiftOutlined,
  BankOutlined,
  CalendarOutlined,
  CrownOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  MessageOutlined,
  LikeOutlined,
  ShareAltOutlined,
  PictureOutlined,
  SendOutlined,
  FilterOutlined,
  SearchOutlined,
  FlagOutlined,
  SafetyCertificateOutlined,
  MoreOutlined,
  TeamOutlined,
  GlobalOutlined,
  MenuOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import './NewsfeedManagement.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Header, Sider, Content } = Layout;

interface NewsfeedPost {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected' | 'admin';
  likes: number;
  comments: number;
  shares: number;
  userType: string;
  priority: 'low' | 'medium' | 'high';
  flagged: boolean;
  flaggedReason?: string;
}

interface AdminPost {
  id: string;
  title: string;
  content: string;
  image?: string;
  userType: string;
  priority: 'low' | 'medium' | 'high';
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'published';
  timestamp: Date;
}

const NewsfeedManagement: React.FC = () => {
  const [posts, setPosts] = useState<NewsfeedPost[]>([]);
  const [adminPosts, setAdminPosts] = useState<AdminPost[]>([]);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<NewsfeedPost | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAdminPostModalVisible, setIsAdminPostModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [adminPostForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('community');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'dashboard') {
      navigate('/dashboard');
    } else if (key === 'donors') {
      navigate('/donors');
    } else if (key === 'beneficiaries') {
      navigate('/beneficiaries');
    } else if (key === 'vendor') {
      navigate('/vendor');
    } else if (key === 'tenants') {
      navigate('/tenants');
    } else if (key === 'discounts') {
      navigate('/discounts');
    } else if (key === 'leaderboard') {
      navigate('/leaderboard');
    } else if (key === 'newsfeed-management') {
      navigate('/newsfeed-management');
    } else if (key === 'ads-management') {
      // TODO: Handle ads management navigation
      console.log('Ads Management clicked');
    } else if (key === 'pending-approvals') {
      navigate('/pending-approvals');
    } else if (key === 'referral-analytics') {
      navigate('/referral-analytics');
    } else if (key === 'geographic-analytics') {
      navigate('/geographic-analytics');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      title: 'Dashboard Overview'
    },
    {
      key: 'donors',
      icon: <UserOutlined />,
      label: 'Donors',
      title: 'Donor Management'
    },
    {
      key: 'beneficiaries',
      icon: <StarOutlined />,
      label: 'Beneficiaries',
      title: 'Beneficiary Management'
    },
    {
      key: 'vendor',
      icon: <RiseOutlined />,
      label: 'Vendor',
      title: 'Vendor Management'
    },
    {
      key: 'discounts',
      icon: <GiftOutlined />,
      label: 'Discounts',
      title: 'Discount Management'
    },
    {
      key: 'tenants',
      icon: <BankOutlined />,
      label: 'Tenants',
      title: 'Tenant Management'
    },
    {
      key: 'leaderboard',
      icon: <CrownOutlined />,
      label: 'Leaderboard',
      title: 'Leaderboard & Rankings'
    },
    {
      key: 'feeds',
      icon: <FileTextOutlined />,
      label: 'Feeds',
      title: 'Content Management',
      children: [
        {
          key: 'newsfeed-management',
          label: 'Newsfeed Management',
          title: 'Newsfeed Management'
        },
        {
          key: 'ads-management',
          label: 'Ads Management',
          title: 'Ads Management'
        },
      ],
    },
    {
      key: 'pending-approvals',
      icon: <ExclamationCircleOutlined />,
      label: 'Pending Approvals',
      title: 'Pending Approvals'
    },
    {
      key: 'referral-analytics',
      icon: <TeamOutlined />,
      label: 'Referral Analytics',
      title: 'Referral Analytics & Tracking'
    },
    {
      key: 'geographic-analytics',
      icon: <GlobalOutlined />,
      label: 'Geographic Analytics',
      title: 'Geographic Analytics & Insights'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      title: 'System Settings & Configuration'
    },
  ];

  // Load data from API
  useEffect(() => {
    setPosts([
      {
        id: '1',
        author: 'Sarah Johnson',
        authorAvatar: 'https://via.placeholder.com/40',
        content: 'Just completed our community garden project! The kids loved planting vegetables and learning about sustainability. #CommunityGarden #Sustainability #KidsEducation',
        image: 'https://via.placeholder.com/400x300',
        timestamp: new Date('2024-01-15T10:30:00'),
        status: 'approved',
        likes: 24,
        comments: 8,
        shares: 12,
        userType: 'Beneficiary',
        priority: 'medium',
        flagged: false
      },
      {
        id: '2',
        author: 'Mike Chen',
        authorAvatar: 'https://via.placeholder.com/40',
        content: 'Great turnout at the food drive yesterday! We collected over 500 pounds of food for local families in need. Thank you everyone for your generosity!',
        timestamp: new Date('2024-01-14T16:45:00'),
        status: 'pending',
        likes: 18,
        comments: 5,
        shares: 7,
        userType: 'Vendor',
        priority: 'high',
        flagged: false
      },
      {
        id: '3',
        author: 'Anonymous User',
        content: 'This is inappropriate content that needs moderation...',
        timestamp: new Date('2024-01-13T09:15:00'),
        status: 'rejected',
        likes: 2,
        comments: 1,
        shares: 0,
        userType: 'Donor',
        priority: 'low',
        flagged: true,
        flaggedReason: 'Inappropriate language and content'
      },
      {
        id: '4',
        author: 'Emily Rodriguez',
        authorAvatar: 'https://via.placeholder.com/40',
        content: 'Excited to announce our new partnership with local businesses! This will help us expand our community outreach programs significantly.',
        timestamp: new Date('2024-01-12T14:20:00'),
        status: 'approved',
        likes: 31,
        comments: 12,
        shares: 18,
        userType: 'Vendor',
        priority: 'medium',
        flagged: false
      },
      {
        id: '5',
        author: 'David Thompson',
        authorAvatar: 'https://via.placeholder.com/40',
        content: 'Just made a donation to support the youth education program. Every child deserves access to quality education!',
        timestamp: new Date('2024-01-11T11:45:00'),
        status: 'approved',
        likes: 15,
        comments: 3,
        shares: 5,
        userType: 'Donor',
        priority: 'low',
        flagged: false
      }
    ]);

    setAdminPosts([
      {
        id: 'admin1',
        title: 'Welcome to THRIVE Community!',
        content: 'We\'re excited to launch our new community platform where neighbors can connect, share, and support each other. Let\'s build something amazing together!',
        userType: 'All Users',
        priority: 'high',
        status: 'published',
        timestamp: new Date('2024-01-10T08:00:00')
      }
    ]);
  }, []);

  const handleApprove = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, status: 'approved' as const } : post
    ));
    message.success('Post approved successfully!');
  };

  const handleReject = (postId: string, reason: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, status: 'rejected' as const, flaggedReason: reason } : post
    ));
    message.success('Post rejected successfully!');
  };

  const handleDelete = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
    message.success('Post deleted successfully!');
  };

  const handleViewPost = (post: NewsfeedPost) => {
    setSelectedPost(post);
    setIsViewModalVisible(true);
  };

  const handlePublishAdminPost = (values: any) => {
    const newPost: AdminPost = {
      id: `admin${Date.now()}`,
      title: values.title,
      content: values.content,
      image: values.image?.[0]?.url,
      userType: values.userType,
      priority: values.priority,
      status: 'published',
      timestamp: new Date()
    };
    
    setAdminPosts([newPost, ...adminPosts]);
    setIsAdminPostModalVisible(false);
    adminPostForm.resetFields();
    message.success('Admin post published successfully!');
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'delete', selectedIds: string[]) => {
    if (action === 'approve') {
      setPosts(posts.map(post => 
        selectedIds.includes(post.id) ? { ...post, status: 'approved' as const } : post
      ));
      message.success(`${selectedIds.length} posts approved successfully!`);
    } else if (action === 'reject') {
      setPosts(posts.map(post => 
        selectedIds.includes(post.id) ? { ...post, status: 'rejected' as const } : post
      ));
      message.success(`${selectedIds.length} posts rejected successfully!`);
    } else if (action === 'delete') {
      setPosts(posts.filter(post => !selectedIds.includes(post.id)));
      message.success(`${selectedIds.length} posts deleted successfully!`);
    }
  };

  const communityColumns: ColumnsType<NewsfeedPost> = [
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (author: string, record) => (
        <Space>
          <Avatar src={record.authorAvatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{author}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.timestamp.toLocaleDateString()}
            </Text>
          </div>
        </Space>
      ),
      width: 200
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <div style={{ maxWidth: 300 }}>
          <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
            {content}
          </Paragraph>
        </div>
      ),
      width: 300
    },
    {
      title: 'User Type',
      dataIndex: 'userType',
      key: 'userType',
      render: (userType: string) => {
        const colorMap: { [key: string]: string } = {
          'Beneficiary': 'green',
          'Vendor': 'blue',
          'Donor': 'purple'
        };
        return (
          <Tag color={colorMap[userType] || 'default'}>{userType}</Tag>
        );
      },
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'Pending Review', icon: <WarningOutlined /> },
          approved: { color: 'green', text: 'Approved', icon: <CheckCircleOutlined /> },
          rejected: { color: 'red', text: 'Rejected', icon: <CloseCircleOutlined /> },
          admin: { color: 'purple', text: 'Admin Post', icon: <SafetyCertificateOutlined /> }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
      width: 120
    },
    {
      title: 'Engagement',
      key: 'engagement',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Likes">
            <Badge count={record.likes} size="small">
              <LikeOutlined style={{ color: '#DB8633' }} />
            </Badge>
          </Tooltip>
          <Tooltip title="Comments">
            <Badge count={record.comments} size="small">
              <MessageOutlined style={{ color: '#324E58' }} />
            </Badge>
          </Tooltip>
          <Tooltip title="Shares">
            <Badge count={record.shares} size="small">
              <ShareAltOutlined style={{ color: '#666' }} />
            </Badge>
          </Tooltip>
        </Space>
      ),
      width: 120
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Post">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewPost(record)}
              style={{ color: '#DB8633' }}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record.id)}
                  style={{ color: '#DB8633' }}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(record.id, 'Content not appropriate')}
                  style={{ color: '#324E58' }}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title="Are you sure you want to delete this post?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                style={{ color: '#324E58' }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      width: 120
    }
  ];

  const adminPostColumns: ColumnsType<AdminPost> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <Text strong>{title}</Text>
      ),
      width: 200
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, maxWidth: 300 }}>
          {content}
        </Paragraph>
      ),
      width: 300
    },
    {
      title: 'User Type',
      dataIndex: 'userType',
      key: 'userType',
      render: (userType: string) => (
        <Tag color="purple">{userType}</Tag>
      ),
      width: 120
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const priorityConfig = {
          low: { color: 'green', text: 'Low' },
          medium: { color: 'orange', text: 'Medium' },
          high: { color: 'red', text: 'High' }
        };
        const config = priorityConfig[priority as keyof typeof priorityConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      width: 100
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          draft: { color: 'default', text: 'Draft' },
          scheduled: { color: 'blue', text: 'Scheduled' },
          published: { color: 'green', text: 'Published' }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      width: 100
    },
    {
      title: 'Published',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: Date) => (
        <Text type="secondary">{timestamp.toLocaleDateString()}</Text>
      ),
      width: 120
    }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.author.toLowerCase().includes(searchText.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Mobile Menu Button - Right Side */}
      <Button
        className="mobile-menu-btn-right"
        icon={<MenuOutlined />}
        onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarVisible && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={() => setMobileSidebarVisible(false)}
        />
      )}

      {/* Sidebar */}
      <Sider 
        width={250} 
        className={`sidebar ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
      >
        <div className="logo-section">
          <div className="logo-container">
            <img src="/white-logo.png" alt="THRIVE Initiative" className="logo" />
            <div className="fallback-text">THRIVE</div>
          </div>
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={['newsfeed-management']}
          selectedKeys={['newsfeed-management']}
          defaultOpenKeys={['feeds']}
          style={{ borderRight: 0 }}
          items={menuItems}
          className="dashboard-menu"
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      {/* Main Content */}
      <Layout className="main-content">
        <Header className="dashboard-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0, color: '#ffffff' }}>
              Newsfeed Management
            </Title>
            <Text style={{ color: '#ffffff', opacity: 0.8, margin: 0 }}>
              Manage community posts and publish admin announcements
            </Text>
          </div>
          <div className="header-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAdminPostModalVisible(true)}
              style={{
                background: '#DB8633',
                borderColor: '#DB8633',
                height: '40px'
              }}
            >
              Publish New Post
            </Button>
          </div>
        </Header>

        <Content className="dashboard-content">
          <div className="newsfeed-management">
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Posts"
                    value={posts.length}
                    valueStyle={{ color: '#DB8633' }}
                    prefix={<MessageOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Pending Review"
                    value={posts.filter(p => p.status === 'pending').length}
                    valueStyle={{ color: '#DB8633' }}
                    prefix={<WarningOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Approved Posts"
                    value={posts.filter(p => p.status === 'approved').length}
                    valueStyle={{ color: '#DB8633' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Admin Posts"
                    value={adminPosts.length}
                    valueStyle={{ color: '#324E58' }}
                    prefix={<SafetyCertificateOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Main Content */}
            <Card>
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Community Posts" key="community">
                  <div style={{ marginBottom: 16 }}>
                    <Row gutter={16} align="middle">
                      <Col flex="auto">
                        <Input
                          placeholder="Search posts by author or content..."
                          prefix={<SearchOutlined />}
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          style={{ maxWidth: 400 }}
                        />
                      </Col>
                      <Col>
                        <Select
                          value={statusFilter}
                          onChange={setStatusFilter}
                          style={{ width: 150 }}
                          placeholder="Filter by status"
                        >
                          <Option value="all">All Status</Option>
                          <Option value="pending">Pending</Option>
                          <Option value="approved">Approved</Option>
                          <Option value="rejected">Rejected</Option>
                        </Select>
                      </Col>
                    </Row>
                  </div>
                  
                  {/* Bulk Actions */}
                  <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <Row gutter={16} align="middle">
                      <Col>
                        <Text strong style={{ color: '#324E58' }}>Bulk Actions:</Text>
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckCircleOutlined />}
                          onClick={() => handleBulkAction('approve', selectedRowKeys.map(key => key.toString()))}
                          disabled={selectedRowKeys.length === 0}
                          style={{ background: '#DB8633', borderColor: '#DB8633' }}
                        >
                          Approve Selected ({selectedRowKeys.length})
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          size="small"
                          icon={<CloseCircleOutlined />}
                          onClick={() => handleBulkAction('reject', selectedRowKeys.map(key => key.toString()))}
                          disabled={selectedRowKeys.length === 0}
                          style={{ background: '#DB8633', borderColor: '#DB8633' }}
                        >
                          Reject Selected ({selectedRowKeys.length})
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          type="primary"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleBulkAction('delete', selectedRowKeys.map(key => key.toString()))}
                          disabled={selectedRowKeys.length === 0}
                          style={{ background: '#324E58', borderColor: '#324E58' }}
                        >
                          Delete Selected ({selectedRowKeys.length})
                        </Button>
                      </Col>
                      <Col>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Select posts using checkboxes below
                        </Text>
                      </Col>
                      <Col>
                        <Button
                          size="small"
                          onClick={() => setSelectedRowKeys([])}
                          disabled={selectedRowKeys.length === 0}
                        >
                          Clear Selection
                        </Button>
                      </Col>
                    </Row>
                  </div>
                  
                  <Table
                    columns={communityColumns}
                    dataSource={filteredPosts}
                    rowKey="id"
                    rowSelection={{
                      selectedRowKeys,
                      onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
                      selections: [
                        Table.SELECTION_ALL,
                        Table.SELECTION_INVERT,
                        Table.SELECTION_NONE,
                      ],
                    }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} of ${total} posts`
                    }}
                    loading={loading}
                  />
                </TabPane>

                <TabPane tab="Admin Posts" key="admin">
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setIsAdminPostModalVisible(true)}
                      style={{
                        background: '#DB8633',
                        borderColor: '#DB8633',
                        height: '40px'
                      }}
                    >
                      Publish New Post
                    </Button>
                  </div>
                  
                  <Table
                    columns={adminPostColumns}
                    dataSource={adminPosts}
                    rowKey="id"
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true
                    }}
                  />
                </TabPane>
              </Tabs>
            </Card>

            {/* View Post Modal */}
            <Modal
              title="View Post Details"
              open={isViewModalVisible}
              onCancel={() => setIsViewModalVisible(false)}
              footer={[
                <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                  Close
                </Button>
              ]}
              width={600}
            >
              {selectedPost && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Avatar src={selectedPost.authorAvatar} icon={<UserOutlined />} size={48} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '16px' }}>{selectedPost.author}</div>
                        <div style={{ color: '#666' }}>
                          {selectedPost.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </Space>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                    <Paragraph>{selectedPost.content}</Paragraph>
                  </div>
                  
                  {selectedPost.image && (
                    <div style={{ marginBottom: 16 }}>
                      <img 
                        src={selectedPost.image} 
                        alt="Post image" 
                        style={{ width: '100%', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                  
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                      <Statistic title="Likes" value={selectedPost.likes} prefix={<LikeOutlined />} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Comments" value={selectedPost.comments} prefix={<MessageOutlined />} />
                    </Col>
                    <Col span={8}>
                      <Statistic title="Shares" value={selectedPost.shares} prefix={<ShareAltOutlined />} />
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>User Type:</Text> <Tag color="blue">{selectedPost.userType}</Tag>
                    </Col>
                    <Col span={12}>
                      <Text strong>Priority:</Text> <Tag color="orange">{selectedPost.priority}</Tag>
                    </Col>
                  </Row>
                  
                  {selectedPost.flagged && selectedPost.flaggedReason && (
                    <div style={{ marginTop: 16, padding: 12, background: '#fff2f0', borderRadius: '6px' }}>
                      <Text type="danger">
                        <FlagOutlined /> Flagged: {selectedPost.flaggedReason}
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </Modal>

            {/* Publish Admin Post Modal */}
            <Modal
              title="Publish Admin Post"
              open={isAdminPostModalVisible}
              onCancel={() => setIsAdminPostModalVisible(false)}
              footer={null}
              width={700}
            >
              <Form
                form={adminPostForm}
                layout="vertical"
                onFinish={handlePublishAdminPost}
              >
                <Form.Item
                  name="title"
                  label="Post Title"
                  rules={[{ required: true, message: 'Please enter a title' }]}
                >
                  <Input placeholder="Enter post title" />
                </Form.Item>
                
                <Form.Item
                  name="content"
                  label="Post Content"
                  rules={[{ required: true, message: 'Please enter post content' }]}
                >
                  <TextArea 
                    rows={6} 
                    placeholder="Write your post content here..."
                  />
                </Form.Item>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="userType"
                      label="User Type"
                      rules={[{ required: true, message: 'Please select a user type' }]}
                    >
                      <Select placeholder="Select user type">
                        <Option value="Beneficiary">Beneficiary</Option>
                        <Option value="Vendor">Vendor</Option>
                        <Option value="Donor">Donor</Option>
                        <Option value="All Users">All Users</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="priority"
                      label="Priority"
                      rules={[{ required: true, message: 'Please select priority' }]}
                    >
                      <Select placeholder="Select priority">
                        <Option value="low">Low</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="high">High</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  name="image"
                  label="Add Image (Optional)"
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
                
                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                  <Space>
                    <Button onClick={() => setIsAdminPostModalVisible(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SendOutlined />}
                      style={{
                        background: '#DB8633',
                        borderColor: '#DB8633'
                      }}
                    >
                      Publish Post
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default NewsfeedManagement; 