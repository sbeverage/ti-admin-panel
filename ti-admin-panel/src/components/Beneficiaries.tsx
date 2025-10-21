import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Input,
  Button,
  Table,
  Card,
  Avatar,
  Space,
  Dropdown,
  Pagination,
  Row,
  Col,
  Select,
  Badge,
  Tag,
  message,
  Spin
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  SettingOutlined,
  MenuOutlined,
  BellOutlined,
  PictureOutlined,
  MoreOutlined,
  SearchOutlined,
  DownOutlined,
  EditOutlined,
  CheckCircleFilled,
  UserAddOutlined,
  RiseOutlined,
  GiftOutlined,
  BankOutlined,
  CalendarOutlined,
  CrownOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  SortAscendingOutlined,
  TeamOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import InviteBeneficiaryModal from './InviteBeneficiaryModal';
import BeneficiaryProfile from './BeneficiaryProfile';
import UserProfile from './UserProfile';
import { beneficiaryAPI } from '../services/api';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';
import './Beneficiaries.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Beneficiaries: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('30-days');
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [beneficiariesData, setBeneficiariesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Load beneficiaries from API
  const loadBeneficiaries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading beneficiaries from API...');
      const response = await beneficiaryAPI.getBeneficiaries(currentPage, pageSize);
      console.log('Beneficiary API response:', response);
      
      if (response.success) {
        // Transform API data to match our table structure
        const transformedData = response.data.map((beneficiary: any) => ({
          key: beneficiary.id.toString(),
          beneficiaryName: beneficiary.name || 'Unknown',
          contactName: beneficiary.contact_name || 'N/A',
          email: beneficiary.email || 'N/A',
          contactNumber: beneficiary.phone || 'N/A',
          bankAccount: beneficiary.bank_account ? `****${beneficiary.bank_account.slice(-4)}` : 'N/A',
          donation: beneficiary.total_donations ? `$${beneficiary.total_donations.toLocaleString()}` : '$0',
          dateOfJoin: beneficiary.created_at ? new Date(beneficiary.created_at).toLocaleDateString() : 'N/A',
          cityState: beneficiary.address ? `${beneficiary.address.city}, ${beneficiary.address.state}` : 'N/A',
          beneficiaryCause: beneficiary.cause || 'General',
          beneficiaryType: beneficiary.type || 'Local',
          donors: beneficiary.donor_count || 0,
          active: beneficiary.is_active || false,
          enabled: beneficiary.is_enabled || false,
          avatar: beneficiary.name ? beneficiary.name.charAt(0).toUpperCase() : 'B'
        }));
        
        setBeneficiariesData(transformedData);
        setTotalBeneficiaries(response.pagination?.total || transformedData.length);
        console.log('Beneficiaries loaded successfully');
      } else {
        setError('Failed to load beneficiaries');
        setBeneficiariesData([]);
        setTotalBeneficiaries(0);
      }
    } catch (error: any) {
      console.error('Error loading beneficiaries:', error);
      
      // Check if it's a 404 error (endpoint not ready)
      if (error.message && error.message.includes('404')) {
        console.log('⚠️ Beneficiary endpoint not ready yet');
        setError('Backend endpoint is being prepared. Use "Invite Beneficiary" button to add beneficiaries.');
        setBeneficiariesData([]);
        setTotalBeneficiaries(0);
      } else {
        setError('Failed to load beneficiaries');
        setBeneficiariesData([]);
        setTotalBeneficiaries(0);
      }
    } finally {
      setLoading(false);
    }
  };


  // Load data on component mount and when page changes
  useEffect(() => {
    loadBeneficiaries();
  }, [currentPage, pageSize]);

  const handleToggleChange = (key: string, field: 'active' | 'enabled') => {
    // This would typically update the backend
    console.log(`Toggling ${field} for beneficiary ${key}`);
  };

  const handleInviteBeneficiary = () => {
    setInviteModalVisible(true);
  };

  const handleInviteModalCancel = () => {
    setInviteModalVisible(false);
  };

  const handleInviteModalSubmit = async (values: any) => {
    try {
      console.log('Creating new beneficiary:', values);
      
      const beneficiaryData = {
        name: values.beneficiaryName,
        contact_name: values.contactName,
        email: values.email,
        phone: values.contactNumber,
        address: {
          city: values.cityState?.split(',')[0]?.trim() || '',
          state: values.cityState?.split(',')[1]?.trim() || ''
        },
        cause: values.beneficiaryCause,
        type: values.beneficiaryType,
        is_active: true,
        is_enabled: true
      };
      
      const response = await beneficiaryAPI.createBeneficiary(beneficiaryData);
      
      if (response.success) {
        message.success('Beneficiary created successfully!');
        setInviteModalVisible(false);
        // Refresh the beneficiaries list
        loadBeneficiaries();
      } else {
        message.error('Failed to create beneficiary');
      }
    } catch (error) {
      console.error('Error creating beneficiary:', error);
      message.error('Failed to create beneficiary. Please try again.');
    }
  };

  const handleBeneficiaryClick = (beneficiaryId: string) => {
    setSelectedBeneficiaryId(beneficiaryId);
    setProfileVisible(true);
  };

  const handleProfileClose = () => {
    setProfileVisible(false);
    setSelectedBeneficiaryId(null);
  };

  const handleBeneficiaryUpdate = (updatedData: any) => {
    console.log('Beneficiary updated:', updatedData);
    // Here you would typically update the local state or refresh the data
    // For now, we'll just close the profile
    setProfileVisible(false);
    setSelectedBeneficiaryId(null);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
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
    } else if (key === 'referral-analytics') {
      navigate('/referral-analytics');
    } else if (key === 'geographic-analytics') {
      navigate('/geographic-analytics');
    } else if (key === 'settings') {
      navigate('/settings');
       }
  };

  const timeFilterMenu = [
    {
      key: '7-days',
      label: 'Last 7 Days',
      icon: <CheckCircleFilled />
    },
    {
      key: '30-days',
      label: 'Last 30 Days',
      icon: <CheckCircleFilled />
    },
    {
      key: '90-days',
      label: 'Last 90 Days',
      icon: <CheckCircleFilled />
    },
    {
      key: '1-year',
      label: 'Last 1 Year',
      icon: <CheckCircleFilled />
    }
  ];

  // No hardcoded data - use API data only

  const columns = [
    {
      title: (
        <div className="sortable-header">
          Beneficiary name
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'beneficiaryName',
      key: 'beneficiaryName',
      render: (text: string, record: any) => (
        <Space>
          <Avatar size={32} style={{ backgroundColor: '#DB8633' }}>
            {record.beneficiaryName.charAt(0)}
          </Avatar>
          <Text 
            strong 
            className="clickable-beneficiary-name"
            onClick={() => handleBeneficiaryClick(record.key)}
            style={{ cursor: 'pointer', color: '#DB8633' }}
          >
            {text}
          </Text>
        </Space>
      ),
      fixed: 'left' as const,
      width: 200,
    },
    { 
      title: 'Contact name', 
      dataIndex: 'contactName', 
      key: 'contactName', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 150 
    },
    { 
      title: 'Emails', 
      dataIndex: 'email', 
      key: 'email', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 200 
    },
    { 
      title: 'Contact number', 
      dataIndex: 'contactNumber', 
      key: 'contactNumber', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 150 
    },
    { 
      title: 'Bank Account', 
      dataIndex: 'bankAccount', 
      key: 'bankAccount', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 150 
    },
    {
      title: 'Donation',
      dataIndex: 'donation',
      key: 'donation',
      render: (text: string) => <Text strong style={{ color: '#DB8633' }}>{text}</Text>,
      width: 120,
    },
    {
      title: 'Date of join',
      dataIndex: 'dateOfJoin',
      key: 'dateOfJoin',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 130,
    },
    {
      title: 'City, State',
      dataIndex: 'cityState',
      key: 'cityState',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 130,
    },
    {
      title: 'Beneficiary cause',
      dataIndex: 'beneficiaryCause',
      key: 'beneficiaryCause',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 200,
    },
    {
      title: 'Beneficiary Type',
      dataIndex: 'beneficiaryType',
      key: 'beneficiaryType',
      render: (text: string) => {
        let color = 'default';
        if (text === 'International') color = 'blue';
        else if (text === 'National') color = 'green';
        else if (text === 'Local') color = 'orange';
        return <Tag color={color}>{text}</Tag>;
      },
      width: 150,
    },
    {
      title: 'Donors',
      dataIndex: 'donors',
      key: 'donors',
      render: (text: number) => <Text strong>{text}</Text>,
      width: 100,
    },
    {
      title: 'Active/De-active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: any) => (
        <div className="toggle-switch">
          <div 
            className={`toggle ${active ? 'active' : 'inactive'}`}
            onClick={() => handleToggleChange(record.key, 'active')}
          >
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
      render: (enabled: boolean, record: any) => (
        <div className="enable-disable-toggle">
          <div 
            className={`toggle ${enabled ? 'active' : 'inactive'}`}
            onClick={() => handleToggleChange(record.key, 'enabled')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 140,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: any) => (
        <Button type="text" icon={<EditOutlined />} size="small" className="edit-action-btn" />
      ),
      width: 100,
      fixed: 'right' as const,
    },
  ];

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
      key: 'events',
      icon: <CalendarOutlined />,
      label: 'Events',
      title: 'Event Management'
    },
    {
      key: 'leaderboard',
      icon: <CrownOutlined />,
      label: 'Leaderboard',
      title: 'Leaderboard & Rankings'
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



  return (
    <Layout className="standard-layout">
      {/* Mobile Menu Button - Right Side */}
      <Button
        className="mobile-menu-btn-right"
        icon={<MenuOutlined />}
        onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      {/* Sidebar */}
      <Sider
        className={`standard-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
        width={280}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div className="standard-logo-section">
          <div className="standard-logo-container">
            <img
              src="/white-logo.png"
              alt="THRIVE Logo"
              className="standard-logo-image"
            />
          </div>
        </div>

        <Menu
          className="standard-menu"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      <Layout className="standard-main-content">
        <Header className="beneficiaries-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Beneficiaries</Title>
            <Text type="secondary" className="beneficiaries-count">
              {totalBeneficiaries} Beneficiaries Found
            </Text>
          </div>
          <div className="header-right">
            <Button 
              type="primary" 
              icon={<UserAddOutlined />}
              size="large"
              className="invite-beneficiary-btn"
              onClick={handleInviteBeneficiary}
            >
              + Invite A Beneficiary
            </Button>
          </div>
        </Header>

        <Content className="beneficiaries-content">
          <div className="content-wrapper">
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-section">
                <Search
                  placeholder="Search Beneficiaries"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="beneficiary-search"
                />
              </div>
              
              <div className="filter-section">
                <Text strong className="filter-label">Filters</Text>
                <div className="filter-dropdowns">
                  <Select
                    placeholder="Select Cause"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="health">Health and Medical</Option>
                    <Option value="education">Education</Option>
                    <Option value="environment">Environment</Option>
                    <Option value="children">Children and Youth</Option>
                  </Select>
                  
                  <Select
                    placeholder="Select Duration"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="short">Short Term</Option>
                    <Option value="long">Long Term</Option>
                    <Option value="ongoing">Ongoing</Option>
                  </Select>
                  
                  <Select
                    placeholder="Beneficiary Type"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="international">International</Option>
                    <Option value="national">National</Option>
                    <Option value="local">Local</Option>
                  </Select>
                  
                  <Select
                    placeholder="City, State"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="springfield">Springfield, IL</Option>
                    <Option value="portland">Portland, OR</Option>
                    <Option value="charleston">Charleston, SC</Option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Beneficiaries Table */}
            <div className="beneficiaries-table-section">
              <Spin spinning={loading}>
                <Table
                  dataSource={beneficiariesData}
                  columns={columns}
                  pagination={false}
                  size="middle"
                  className="beneficiaries-table"
                  rowClassName="beneficiary-row"
                  scroll={{ x: 1800 }}
                  bordered={false}
                  locale={{
                    emptyText: error ? `Error: ${error}` : 'No beneficiaries found'
                  }}
                />
              </Spin>
              
              {/* Pagination */}
              <div className="pagination-section">
                <Pagination
                  current={currentPage}
                  total={totalBeneficiaries}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  onChange={handlePageChange}
                  className="beneficiaries-pagination"
                />
              </div>
            </div>
          </div>
        </Content>
      </Layout>

      {/* Invite Beneficiary Modal */}
      <InviteBeneficiaryModal
        visible={inviteModalVisible}
        onCancel={handleInviteModalCancel}
        onSubmit={handleInviteModalSubmit}
      />

      {/* Beneficiary Profile Modal */}
      {profileVisible && selectedBeneficiaryId && (
        <BeneficiaryProfile
          beneficiaryId={selectedBeneficiaryId}
          onClose={handleProfileClose}
          onUpdate={handleBeneficiaryUpdate}
        />
      )}
    </Layout>
  );
};

export default Beneficiaries; 