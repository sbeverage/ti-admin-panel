import React, { useState } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Input, Select, Table, Pagination, Tabs, Tag, Modal, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, UserOutlined, SettingOutlined,
  CalendarOutlined, CrownOutlined, ExclamationCircleOutlined,
  MenuOutlined, MoreOutlined, SearchOutlined,
  SortAscendingOutlined, CheckCircleOutlined, CloseCircleOutlined,
  EyeOutlined, ShopOutlined, HeartOutlined
} from '@ant-design/icons';
import './PendingApprovals.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Unified interface for both vendor and beneficiary data
interface ApprovalItem {
  key: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: string;
  location: string;
  registrationDate: string;
  documentsSubmitted: string;
  verificationStatus: string;
  active: boolean;
  enabled: boolean;
  avatar: string;
  itemType: 'vendor' | 'beneficiary';
}

const PendingApprovals: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('30-days');
  const [activeTab, setActiveTab] = useState('vendors');
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedDocumentFilter, setSelectedDocumentFilter] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleToggleChange = (key: string, field: 'active' | 'enabled') => {
    if (activeTab === 'vendors') {
      setVendorsData(prevData =>
        prevData.map(item =>
          item.key === key
            ? { ...item, [field]: !item[field] }
            : item
        )
      );
    } else {
      setBeneficiariesData(prevData =>
        prevData.map(item =>
          item.key === key
            ? { ...item, [field]: !item[field] }
            : item
        )
      );
    }
    console.log(`Toggled ${field} for key ${key}`);
  };

  const handleTimeFilterChange = (key: string) => {
    setSelectedTimeFilter(key);
    console.log(`Time filter changed to: ${key}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
    console.log(`Searching for: ${value}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'dashboard') {
      navigate('/dashboard');
    } else if (key === 'donors') {
      navigate('/donors');
    } else if (key === 'vendor') {
      navigate('/vendor');
    } else if (key === 'beneficiaries') {
      navigate('/beneficiaries');
    } else if (key === 'tenants') {
      navigate('/tenants');
    } else if (key === 'discounts') {
      navigate('/discounts');
    } else if (key === 'events') {
      navigate('/events');
    } else if (key === 'leaderboard') {
      navigate('/leaderboard');
    } else if (key === 'pending-approvals') {
      navigate('/pending-approvals');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  const timeFilterMenu = [
    {
      key: '7-days',
      label: 'Last 7 Days',
      onClick: () => handleTimeFilterChange('7-days')
    },
    {
      key: '30-days',
      label: 'Last 30 Days',
      onClick: () => handleTimeFilterChange('30-days')
    },
    {
      key: '90-days',
      label: 'Last 90 Days',
      onClick: () => handleTimeFilterChange('90-days')
    },
    {
      key: '1-year',
      label: 'Last 1 Year',
      onClick: () => handleTimeFilterChange('1-year')
    },
    {
      key: 'all-time',
      label: 'All Time',
      onClick: () => handleTimeFilterChange('all-time')
    }
  ];

  const [vendorsData, setVendorsData] = useState<ApprovalItem[]>([
    {
      key: '1',
      name: 'Fresh Market Deli',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@freshmarket.com',
      phone: '(555) 123-4567',
      type: 'Food & Beverage',
      location: 'Springfield, IL',
      registrationDate: 'July 15, 2023',
      documentsSubmitted: 'Complete',
      verificationStatus: 'Pending',
      active: false,
      enabled: false,
      avatar: 'FM',
      itemType: 'vendor'
    },
    {
      key: '2',
      name: 'Tech Solutions Pro',
      contactPerson: 'Michael Chen',
      email: 'michael@techsolutions.com',
      phone: '(555) 234-5678',
      type: 'Technology',
      location: 'Portland, OR',
      registrationDate: 'July 16, 2023',
      documentsSubmitted: 'Complete',
      verificationStatus: 'Pending',
      active: false,
      enabled: false,
      avatar: 'TS',
      itemType: 'vendor'
    },
    {
      key: '3',
      name: 'Green Thumb Nursery',
      contactPerson: 'Emily Rodriguez',
      email: 'emily@greenthumb.com',
      phone: '(555) 345-6789',
      type: 'Home & Garden',
      location: 'Charleston, SC',
      registrationDate: 'July 17, 2023',
      documentsSubmitted: 'Incomplete',
      verificationStatus: 'Pending',
      active: false,
      enabled: false,
      avatar: 'GT',
      itemType: 'vendor'
    }
  ]);

  const [beneficiariesData, setBeneficiariesData] = useState<ApprovalItem[]>([
    {
      key: '1',
      name: 'Hope for Tomorrow',
      contactPerson: 'David Wilson',
      email: 'david@hopefortomorrow.org',
      phone: '(555) 456-7890',
      type: 'Non-Profit',
      location: 'Austin, TX',
      registrationDate: 'July 15, 2023',
      documentsSubmitted: 'Complete',
      verificationStatus: 'Pending',
      active: false,
      enabled: false,
      avatar: 'HT',
      itemType: 'beneficiary'
    },
    {
      key: '2',
      name: 'Community Care Center',
      contactPerson: 'Lisa Thompson',
      email: 'lisa@communitycare.org',
      phone: '(555) 567-8901',
      type: 'Healthcare',
      location: 'Denver, CO',
      registrationDate: 'July 16, 2023',
      documentsSubmitted: 'Complete',
      verificationStatus: 'Pending',
      active: false,
      enabled: false,
      avatar: 'CC',
      itemType: 'beneficiary'
    },
    {
      key: '3',
      name: 'Youth Empowerment League',
      contactPerson: 'Robert Martinez',
      email: 'robert@youthempowerment.org',
      phone: '(555) 678-9012',
      type: 'Education',
      location: 'Nashville, TN',
      registrationDate: 'July 17, 2023',
      documentsSubmitted: 'Incomplete',
      verificationStatus: 'Pending',
      active: false,
      enabled: false,
      avatar: 'YE',
      itemType: 'beneficiary'
    }
  ]);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'donors',
      icon: <UserOutlined />,
      label: 'Donors',
    },
    {
      key: 'vendor',
      icon: <ShopOutlined />,
      label: 'Vendor',
    },
    {
      key: 'beneficiaries',
      icon: <HeartOutlined />,
      label: 'Beneficiaries',
    },
    {
      key: 'tenants',
      icon: <UserOutlined />,
      label: 'Tenants',
    },
    {
      key: 'discounts',
      icon: <CrownOutlined />,
      label: 'Discounts',
    },
    {
      key: 'events',
      icon: <CalendarOutlined />,
      label: 'Events',
    },
    {
      key: 'leaderboard',
      icon: <CrownOutlined />,
      label: 'Leaderboard',
    },
    {
      key: 'pending-approvals',
      icon: <ExclamationCircleOutlined />,
      label: 'Pending Approvals',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  // Unified columns that work for both vendor and beneficiary data
  const approvalColumns = [
    {
      title: (
        <div className="sortable-header">
          {activeTab === 'vendors' ? 'Company Name' : 'Organization Name'}
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ApprovalItem) => (
        <Space>
          <Avatar size={32} style={{ backgroundColor: '#DB8633' }}>
            {record.avatar}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
      fixed: 'left' as const,
      width: 200,
    },
    {
      title: activeTab === 'vendors' ? 'Owner Name' : 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 200,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 140,
    },
    {
      title: activeTab === 'vendors' ? 'Business Type' : 'Organization Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 150,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 140,
    },
    {
      title: 'Registration Date',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 150,
    },
    {
      title: 'Documents',
      dataIndex: 'documentsSubmitted',
      key: 'documentsSubmitted',
      render: (text: string) => (
        <Tag color={text === 'Complete' ? 'green' : 'orange'}>
          {text}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Verification',
      dataIndex: 'verificationStatus',
      key: 'verificationStatus',
      render: (text: string) => (
        <Tag color="blue">{text}</Tag>
      ),
      width: 120,
    },
    {
      title: 'Active/De-active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: ApprovalItem) => (
        <div className="toggle-switch">
          <div className={`toggle ${active ? 'active' : 'inactive'}`} onClick={() => handleToggleChange(record.key, 'active')}>
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 160,
    },
    {
      title: 'Enable/Disable',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: ApprovalItem) => (
        <div className="toggle-switch">
          <div className={`toggle ${enabled ? 'active' : 'inactive'}`} onClick={() => handleToggleChange(record.key, 'enabled')}>
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 160,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: ApprovalItem) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small" 
            className="view-action-btn"
            onClick={() => handleViewDetails(record)}
          />
          <Button 
            type="text" 
            icon={<CheckCircleOutlined />} 
            size="small" 
            className="approve-action-btn"
            onClick={() => handleApprove(record)}
          />
          <Button 
            type="text" 
            icon={<CloseCircleOutlined />} 
            size="small" 
            className="reject-action-btn"
            onClick={() => handleReject(record)}
          />
        </Space>
      ),
      width: 150,
      fixed: 'right' as const,
    },
  ];

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  const handleViewDetails = (record: ApprovalItem) => {
    setSelectedItem(record);
    setApprovalModalVisible(true);
  };

  const handleApprove = (record: ApprovalItem) => {
    message.success(`${activeTab === 'vendors' ? 'Vendor' : 'Beneficiary'} approved successfully!`);
    // Here you would typically update the backend
    if (activeTab === 'vendors') {
      setVendorsData(prevData => prevData.filter(item => item.key !== record.key));
    } else {
      setBeneficiariesData(prevData => prevData.filter(item => item.key !== record.key));
    }
  };

  const handleReject = (record: ApprovalItem) => {
    message.error(`${activeTab === 'vendors' ? 'Vendor' : 'Beneficiary'} rejected.`);
    // Here you would typically update the backend
    if (activeTab === 'vendors') {
      setVendorsData(prevData => prevData.filter(item => item.key !== record.key));
    } else {
      setBeneficiariesData(prevData => prevData.filter(item => item.key !== record.key));
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const getCurrentData = (): ApprovalItem[] => {
    const data = activeTab === 'vendors' ? vendorsData : beneficiariesData;
    
    // Filter by search query if present
    if (searchQuery.trim()) {
      return data.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return data;
  };

  const getTotalCount = (): number => {
    return getCurrentData().length;
  };

  const highlightSearchText = (text: string) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #FFE4B5; padding: 2px 4px; border-radius: 3px;">$1</mark>');
  };

  return (
    <Layout className="donors-layout">
      {/* Mobile Menu Button */}
      <div className="mobile-menu-button">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
          className="mobile-menu-trigger"
        />
      </div>

      {/* Sidebar */}
      <Sider
        width={280}
        className={`donors-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
        breakpoint="lg"
        collapsedWidth="0"
        onCollapse={(collapsed) => setCollapsed(collapsed)}
      >
        <div className="logo-section" style={{
          padding: '20px 16px 12px 16px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'transparent'
        }}>
          {/* Simplified logo section with large centered logo */}
          <div className="logo-container" style={{
            position: 'relative',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img
              src="/white-logo.png"
              alt="Thrive Initiative Logo"
              className="logo-image"
              style={{
                width: '180px',
                height: 'auto',
                maxWidth: '100%',
                display: 'block',
                margin: '0 auto'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="logo-fallback" style={{ display: 'none' }}>
              <div className="fallback-text">THRIVE</div>
            </div>
          </div>
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={['pending-approvals']}
          selectedKeys={[location.pathname === '/pending-approvals' ? 'pending-approvals' : '']}
          style={{ borderRight: 0 }}
          items={menuItems}
          className="donors-menu"
          onClick={handleMenuClick}
        />

        <div className="user-profile">
          <Avatar size={40} icon={<UserOutlined />} />
          <div className="user-info">
            <Text strong>Stephanie Beverage</Text>
          </div>
          <Button type="text" icon={<MoreOutlined />} />
        </div>
      </Sider>

      {/* Main Content */}
      <Layout className="main-content">
        <Header className="donors-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Pending Approvals</Title>
            <Text type="secondary" className="approvals-count">
              {getTotalCount()} {activeTab === 'vendors' ? 'Vendors' : 'Beneficiaries'} Pending Approval
            </Text>
          </div>
          <div className="header-right">
            <Button 
              type="primary" 
              icon={<ExclamationCircleOutlined />}
              size="large"
              className="approval-stats-btn"
            >
              Approval Statistics
            </Button>
          </div>
        </Header>

        <Content className="donors-content">
          <div className="content-wrapper">
            {/* Tabs for Vendors vs Beneficiaries */}
            <div className="approval-tabs-section">
              <Tabs 
                activeKey={activeTab} 
                onChange={handleTabChange}
                className="approval-tabs"
                items={[
                  {
                    key: 'vendors',
                    label: (
                      <span>
                        <ShopOutlined />
                        Vendors ({vendorsData.length})
                      </span>
                    ),
                  },
                  {
                    key: 'beneficiaries',
                    label: (
                      <span>
                        <HeartOutlined />
                        Beneficiaries ({beneficiariesData.length})
                      </span>
                    ),
                  },
                ]}
              />
            </div>

            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-section">
                <Search
                  placeholder={`Search ${activeTab === 'vendors' ? 'Vendors' : 'Beneficiaries'}`}
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="approval-search"
                  value={searchQuery}
                  onSearch={handleSearch}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="filter-section">
                <Text strong className="filter-label">Filters</Text>
                <div className="filter-dropdowns">
                  <Select
                    placeholder="Select Status"
                    className="filter-dropdown"
                    size="large"
                    value={selectedStatusFilter}
                    onChange={setSelectedStatusFilter}
                  >
                    <Option value="all">All Status</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="approved">Approved</Option>
                    <Option value="rejected">Rejected</Option>
                  </Select>
                  
                  <Select
                    placeholder="Documents Status"
                    className="filter-dropdown"
                    size="large"
                    value={selectedDocumentFilter}
                    onChange={setSelectedDocumentFilter}
                  >
                    <Option value="all">All Documents</Option>
                    <Option value="complete">Complete</Option>
                    <Option value="incomplete">Incomplete</Option>
                    <Option value="pending-review">Pending Review</Option>
                  </Select>
                  
                  <Select
                    placeholder="Time Period"
                    className="filter-dropdown"
                    size="large"
                    value={selectedTimeFilter}
                    onChange={setSelectedTimeFilter}
                  >
                    <Option value="7-days">Last 7 Days</Option>
                    <Option value="30-days">Last 30 Days</Option>
                    <Option value="90-days">Last 90 Days</Option>
                    <Option value="all">All Time</Option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Approvals Table */}
            <div className="approvals-table-section">
              <Table
                dataSource={getCurrentData()}
                columns={approvalColumns}
                pagination={false}
                size="middle"
                className="approvals-table"
                rowClassName="approval-row"
                scroll={{ x: 1800 }}
                bordered={false}
              />
              
              {/* Pagination */}
              <div className="pagination-section">
                <Pagination
                  current={currentPage}
                  total={getTotalCount()}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  onChange={handlePageChange}
                  className="approvals-pagination"
                />
              </div>
            </div>
          </div>
        </Content>
      </Layout>

      {/* Approval Details Modal */}
      <Modal
        title={
          <div className="modal-header">
            <ExclamationCircleOutlined className="modal-icon" />
            <Title level={3} style={{ margin: 0, color: '#DB8633' }}>
              {selectedItem?.name} - Approval Details
            </Title>
          </div>
        }
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        footer={[
          <Button key="reject" danger onClick={() => {
            if (selectedItem) {
              handleReject(selectedItem);
              setApprovalModalVisible(false);
            }
          }}>
            Reject
          </Button>,
          <Button key="approve" type="primary" onClick={() => {
            if (selectedItem) {
              handleApprove(selectedItem);
              setApprovalModalVisible(false);
            }
          }}>
            Approve
          </Button>,
        ]}
        width={800}
        className="approval-details-modal"
      >
        {selectedItem && (
          <div className="approval-details">
            <div className="detail-section">
              <Title level={4}>Basic Information</Title>
              <div className="detail-grid">
                <div className="detail-item">
                  <Text strong>Name:</Text>
                  <Text>{selectedItem.name}</Text>
                </div>
                <div className="detail-item">
                  <Text strong>Contact:</Text>
                  <Text>{selectedItem.contactPerson}</Text>
                </div>
                <div className="detail-item">
                  <Text strong>Email:</Text>
                  <Text>{selectedItem.email}</Text>
                </div>
                <div className="detail-item">
                  <Text strong>Phone:</Text>
                  <Text>{selectedItem.phone}</Text>
                </div>
                <div className="detail-item">
                  <Text strong>Location:</Text>
                  <Text>{selectedItem.location}</Text>
                </div>
                <div className="detail-item">
                  <Text strong>Registration Date:</Text>
                  <Text>{selectedItem.registrationDate}</Text>
                </div>
              </div>
            </div>
            
            <div className="detail-section">
              <Title level={4}>Verification Status</Title>
              <div className="status-grid">
                <div className="status-item">
                  <Text strong>Documents:</Text>
                  <Tag color={selectedItem.documentsSubmitted === 'Complete' ? 'green' : 'orange'}>
                    {selectedItem.documentsSubmitted}
                  </Tag>
                </div>
                <div className="status-item">
                  <Text strong>Verification:</Text>
                  <Tag color="blue">{selectedItem.verificationStatus}</Tag>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <Title level={4}>Additional Notes</Title>
              <Text type="secondary">
                Review all submitted documents and verify {selectedItem.itemType === 'vendor' ? 'business legitimacy' : 'organization legitimacy'} before approval.
                Ensure compliance with platform guidelines and requirements.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default PendingApprovals; 