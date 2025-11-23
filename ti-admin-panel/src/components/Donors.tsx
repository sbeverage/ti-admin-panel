import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Input, Select, Table, Pagination, Dropdown, message, Spin, Modal } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import {
  DashboardOutlined, UserOutlined, StarOutlined, RiseOutlined, SettingOutlined,
  CalendarOutlined, CrownOutlined, FileTextOutlined, ExclamationCircleOutlined,
  MenuOutlined, BellOutlined, SearchOutlined, MoreOutlined, UserAddOutlined,
  FilterOutlined, SortAscendingOutlined, SortDescendingOutlined, EditOutlined,
  DownOutlined, GiftOutlined, BankOutlined, TeamOutlined, GlobalOutlined, DeleteOutlined,
  MailOutlined
} from '@ant-design/icons';
import InviteDonorModal from './InviteDonorModal';
import EditDonorModal from './EditDonorModal';
import { donorAPI } from '../services/api';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';
import './Donors.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Donors: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('30-days');
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingDonor, setEditingDonor] = useState<any>(null);
  const [isDeleteUserModalVisible, setIsDeleteUserModalVisible] = useState(false);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [donorsData, setDonorsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDonors, setTotalDonors] = useState(0);
  const [resendingInvitation, setResendingInvitation] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Load donors from API
  const loadDonors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading donors from API...');
      const response = await donorAPI.getDonors(currentPage, pageSize);
      console.log('Donor API response:', response);
      
      if (response.success) {
        // Transform API data to match our table structure
        const transformedData = response.data.map((donor: any) => ({
          key: donor.id.toString(),
          id: donor.id, // Store original ID for API calls
          name: donor.name || 'Unknown',
          email: donor.email || 'N/A',
          contact: donor.phone || 'N/A',
          beneficiary: donor.beneficiary_name || 'N/A',
          coworking: donor.coworking ? 'Yes' : 'No',
          donation: donor.total_donations ? `$${donor.total_donations}` : '$0',
          oneTime: donor.one_time_donation ? `$${donor.one_time_donation}` : '$0',
          lastDonated: donor.last_donation_date ? new Date(donor.last_donation_date).toLocaleDateString() : 'Never',
          cityState: donor.address ? `${donor.address.city}, ${donor.address.state}` : 'N/A',
          active: donor.is_active || false,
          enabled: donor.is_enabled || false,
          avatar: donor.name ? donor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'D',
          // Store original data for editing
          originalData: donor
        }));
        
        setDonorsData(transformedData);
        setTotalDonors(response.pagination?.total || transformedData.length);
        console.log('Donors loaded successfully');
      } else {
        setError('Failed to load donors');
        setDonorsData([]);
        setTotalDonors(0);
      }
    } catch (error: any) {
      console.error('Error loading donors:', error);
      
      // Check if it's a 404 error (endpoint not ready)
      if (error.message && error.message.includes('404')) {
        console.log('⚠️ Donor endpoint not ready yet');
        setError('Backend endpoint is being prepared. Use "Invite Donor" button to add donors.');
        setDonorsData([]);
        setTotalDonors(0);
      } else {
        setError('Failed to load donors');
        setDonorsData([]);
        setTotalDonors(0);
      }
    } finally {
      setLoading(false);
    }
  };


  // Load data on component mount and when page changes
  useEffect(() => {
    loadDonors();
  }, [currentPage, pageSize]);

  const handleToggleChange = (key: string, field: 'active' | 'enabled') => {
    setDonorsData(prevData =>
      prevData.map(item =>
        item.key === key
          ? { ...item, [field]: !item[field] }
          : item
      )
    );
    console.log(`Toggled ${field} for key ${key}`);
  };

  const handleTimeFilterChange = (key: string) => {
    setSelectedTimeFilter(key);
    // Here you would typically fetch new data based on the selected time period
    console.log(`Time filter changed to: ${key}`);
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

  const columns = [
    {
      title: (
        <div className="sortable-header">
          Donor name
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space 
          onClick={(e) => {
            e.stopPropagation();
            console.log('Clicked on name column');
            handleEditDonor(record);
          }}
          style={{ cursor: 'pointer', width: '100%' }}
        >
          <Avatar size={32} style={{ backgroundColor: '#DB8633' }}>
            {record.avatar}
          </Avatar>
          <Text strong style={{ cursor: 'pointer' }}>{text}</Text>
        </Space>
      ),
      fixed: 'left' as const,
      width: 200,
    },
    {
      title: 'Emails',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 250,
    },
    {
      title: 'Contact number',
      dataIndex: 'contact',
      key: 'contact',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 180,
    },
    {
      title: 'Selected beneficiary name',
      dataIndex: 'beneficiary',
      key: 'beneficiary',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 280,
    },
    {
      title: (
        <div className="sortable-header">
          Coworking
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'coworking',
      key: 'coworking',
      render: (text: string) => (
        <span className={`coworking-status ${text.toLowerCase()}`}>
          {text}
        </span>
      ),
      width: 150,
    },
    {
      title: (
        <div className="sortable-header">
          Donation
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'donation',
      key: 'donation',
      render: (text: string) => <Text strong style={{ color: '#DB8633' }}>{text}</Text>,
      width: 140,
    },
    {
      title: (
        <div className="sortable-header">
          One time gifts
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'oneTime',
      key: 'oneTime',
      render: (text: string) => <Text strong style={{ color: '#DB8633' }}>{text}</Text>,
      width: 160,
    },
    {
      title: (
        <div className="sortable-header">
          Last donated date
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'lastDonated',
      key: 'lastDonated',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 180,
    },
    {
      title: (
        <div className="sortable-header">
          City, State
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'cityState',
      key: 'cityState',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 160,
    },
    {
      title: 'Active/De-active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: any) => (
        <div className="toggle-switch">
          <div 
            className={`toggle ${active ? 'active' : 'inactive'}`} 
            onClick={(e) => {
              e.stopPropagation();
              handleToggleChange(record.key, 'active');
            }}
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
        <div className="toggle-switch">
          <div 
            className={`toggle ${enabled ? 'active' : 'inactive'}`} 
            onClick={(e) => {
              e.stopPropagation();
              handleToggleChange(record.key, 'enabled');
            }}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 160,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 180,
      align: 'center' as const,
      render: (text: string, record: any, index: number) => {
        if (!record) {
          return <div style={{ color: 'red', padding: '10px' }}>❌ No record</div>;
        }
        
        const isResending = resendingInvitation === record.id;
        
        return (
          <div 
            id={`actions-${record?.key || record?.id}`}
            className="actions-column-container"
            style={{ 
              display: 'flex', 
              gap: '6px', 
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '100%',
              padding: '4px 0',
              boxSizing: 'border-box',
              margin: '0 auto'
            }}
          >
            <Button 
              size="middle"
              icon={<EditOutlined />}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                handleEditDonor(record);
              }}
              className="edit-donor-button"
              title="Edit Donor"
              style={{
                backgroundColor: '#fff7e6',
                borderColor: '#DB8633',
                color: '#DB8633',
                fontWeight: 600,
                width: '32px',
                height: '32px',
                padding: 0,
                minWidth: '32px',
                maxWidth: '32px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                flexShrink: 0
              }}
            />
            <Button 
              size="middle"
              icon={<MailOutlined />}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                handleResendInvitation(record);
              }}
              className="resend-invitation-button"
              title="Resend Invitation Email"
              loading={isResending}
              disabled={isResending}
              style={{
                backgroundColor: '#e6f7ff',
                borderColor: '#1890ff',
                color: '#1890ff',
                width: '32px',
                height: '32px',
                padding: 0,
                minWidth: '32px',
                maxWidth: '32px',
                fontSize: '14px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isResending ? 'not-allowed' : 'pointer',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                flexShrink: 0,
                opacity: isResending ? 0.6 : 1
              }}
            />
            <Button 
              size="middle"
              icon={<DeleteOutlined />}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteUser(record);
              }}
              className="delete-donor-button"
              title="Delete Donor"
              style={{ 
                backgroundColor: '#fff1f0',
                borderColor: '#ff4d4f',
                color: '#ff4d4f',
                width: '32px',
                height: '32px',
                padding: 0,
                minWidth: '32px',
                maxWidth: '32px',
                fontSize: '14px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                flexShrink: 0
              }}
            />
          </div>
        );
      },
    },
  ];

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  const handleInviteDonor = async (values: any) => {
    try {
      console.log('Creating new donor:', values);
      
      const donorData = {
        name: values.name,
        email: values.email,
        phone: values.contact,
        beneficiary_id: values.beneficiary,
        coworking: values.coworking || false,
        address: {
          city: values.cityState?.split(',')[0]?.trim() || '',
          state: values.cityState?.split(',')[1]?.trim() || ''
        },
        is_active: true,
        is_enabled: true
      };
      
      const response = await donorAPI.createDonor(donorData);
      
      if (response.success) {
        message.success('Donor created successfully!');
        setIsInviteModalVisible(false);
        // Refresh the donors list
        loadDonors();
      } else {
        message.error('Failed to create donor');
      }
    } catch (error) {
      console.error('Error creating donor:', error);
      message.error('Failed to create donor. Please try again.');
    }
  };

  const handleEditDonor = (record: any) => {
    console.log('=== handleEditDonor CALLED ===');
    console.log('Opening edit modal for donor:', record);
    console.log('Record keys:', record ? Object.keys(record) : 'NO RECORD');
    console.log('Record data:', JSON.stringify(record, null, 2));
    
    if (!record) {
      console.error('No record provided to handleEditDonor');
      message.error('Cannot edit: No donor selected');
      return;
    }
    
    if (!record.id && !record.key) {
      console.error('Record missing ID:', record);
      message.error('Cannot edit: Donor ID missing');
      return;
    }
    
    console.log('Setting editingDonor and opening modal...');
    console.log('Before: isEditModalVisible =', isEditModalVisible, 'editingDonor =', editingDonor);
    
    setEditingDonor(record);
    setIsEditModalVisible(true);
    
    // Force a re-render check
    setTimeout(() => {
      console.log('After (delayed): isEditModalVisible should be true now');
    }, 100);
    
    console.log('Modal state set to visible');
  };

  const handleUpdateDonor = async (values: any) => {
    if (!editingDonor || !editingDonor.id) {
      message.error('Cannot update donor: missing donor ID');
      return;
    }

    try {
      setLoading(true);
      
      // Parse city and state from cityState
      const cityStateParts = values.cityState?.split(', ') || [values.city || '', values.state || ''];
      const city = cityStateParts[0] || values.city || '';
      const state = cityStateParts[1] || values.state || '';
      
      // Prepare donor data for API
      // Note: Fields like beneficiary_name, coworking, total_donations are typically calculated
      // from related tables and may be ignored by the backend during updates
      const donorData: any = {
        name: values.name,
        email: values.email,
        phone: values.contact,
        address: {
          city: city,
          state: state,
          zipCode: values.zipCode || '',
          street: '' // Street address not currently in form, but backend expects it
        },
        is_active: editingDonor.active !== undefined ? editingDonor.active : true,
        is_enabled: editingDonor.enabled !== undefined ? editingDonor.enabled : true
        // Note: 'notes' field removed - column doesn't exist in users table
        // Note: beneficiary_name, coworking, total_donations, one_time_donation, 
        // last_donation_date are typically calculated fields and may be ignored by backend
      };
      
      // Only include notes if the column exists (check with backend team first)
      // if (values.notes) {
      //   donorData.notes = values.notes;
      // }
      
      console.log('Updating donor:', editingDonor.id, donorData);
      console.log('Donor data payload:', JSON.stringify(donorData, null, 2));
      const response = await donorAPI.updateDonor(editingDonor.id, donorData);
      
      if (response.success || response.data) {
        message.success('Donor updated successfully!');
        setIsEditModalVisible(false);
        setEditingDonor(null);
        // Refresh the donors list
        await loadDonors();
      } else {
        message.error(response.message || 'Failed to update donor');
      }
    } catch (error: any) {
      console.error('Error updating donor:', error);
      console.error('Error details:', error.message);
      
      // Check error type and show appropriate message
      if (error.message && error.message.includes('404')) {
        message.error('Donor not found. Please verify the donor ID.');
      } else if (error.message && error.message.includes('500')) {
        message.error(`Server error: ${error.message}. Please check the backend logs.`);
      } else if (error.message && error.message.includes('400')) {
        message.error(`Invalid data: ${error.message}`);
      } else {
        message.error(error.message || 'Failed to update donor. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (record: any) => {
    if (!record || !record.id) {
      message.error('Cannot resend invitation: missing donor ID');
      return;
    }

    setResendingInvitation(record.id);

    try {
      const response = await donorAPI.resendInvitation(record.id);
      
      if (response.success || response.data) {
        message.success(`Invitation email resent successfully to ${record.email || record.name}`);
        // Optionally refresh the donor list
        await loadDonors();
      } else {
        const errorMsg = response.error || response.message || 'Failed to resend invitation email';
        message.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      
      // Extract error message - prefer details if available as it's more specific
      let errorMessage = 'Failed to resend invitation. Please try again.';
      
      if (error.details) {
        // Use the parsed details which should contain the actual error from email service
        errorMessage = error.details;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Show more detailed error for 500 errors with extended duration
      if (error.status === 500) {
        errorMessage = errorMessage || 'Server error. Please contact support if this issue persists.';
        message.error({
          content: `❌ ${errorMessage}`,
          duration: 8, // Extended duration for detailed errors
        });
      } else {
        message.error(`❌ ${errorMessage}`);
      }
    } finally {
      setResendingInvitation(null);
    }
  };

  const handleDeleteUser = (record: any) => {
    setDeletingUser(record);
    setIsDeleteUserModalVisible(true);
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser || !deletingUser.id) {
      message.error('Cannot delete donor: missing donor ID');
      return;
    }

    try {
      setLoading(true);
      const response = await donorAPI.deleteDonor(deletingUser.id);
      
      if (response.success || response.data) {
        message.success(`Donor ${deletingUser.name || deletingUser.email} deleted successfully`);
        setIsDeleteUserModalVisible(false);
        setDeletingUser(null);
        // Refresh donors list
        await loadDonors();
      } else {
        message.error(response.message || 'Failed to delete donor');
      }
    } catch (error: any) {
      console.error('Error deleting donor:', error);
      message.error(error.message || 'Failed to delete donor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="donors-layout">
      <>
        {/* Mobile Menu Button - Right Side */}
        <Button
          className="mobile-menu-btn-right"
          icon={<MenuOutlined />}
          onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
        />

        {/* Sidebar */}
        <Sider
        width={280}
        className={`standard-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
        breakpoint="lg"
        collapsedWidth="0"
        onCollapse={(collapsed) => setCollapsed(collapsed)}
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
          mode="inline"
          defaultSelectedKeys={['donors']}
          selectedKeys={[location.pathname === '/donors' ? 'donors' : '']}
          items={menuItems}
          className="standard-menu"
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      {/* Main Content */}
      <Layout className="standard-main-content">
        <Header className="donors-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Donors</Title>
            <Text type="secondary" className="donors-count">
              {totalDonors} Donor{totalDonors !== 1 ? 's' : ''} Found
            </Text>
          </div>
          <div className="header-right">
            <Button 
              type="primary" 
              icon={<UserAddOutlined />}
              size="large"
              className="invite-donor-btn"
              onClick={() => setIsInviteModalVisible(true)}
            >
              + Invite A Donor
            </Button>
          </div>
        </Header>

        <Content className="donors-content">
          <div className="content-wrapper">
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-section">
                <Search
                  placeholder="Search Donor"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="donor-search"
                />
              </div>
              
              <div className="filter-section">
                <div className="filter-dropdowns">
                  <Text strong className="filter-label">Filters</Text>
                  <Select
                    placeholder="Select Beneficiary"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="united-way">United Way</Option>
                    <Option value="red-cross">American Red Cross</Option>
                    <Option value="feeding-america">Feeding America</Option>
                  </Select>
                  
                  <Select
                    placeholder="Select Duration"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="1-week">1 Week</Option>
                    <Option value="1-month">1 Month</Option>
                    <Option value="3-months">3 Months</Option>
                    <Option value="6-months">6 Months</Option>
                  </Select>
                  
                  <Select
                    placeholder="All User"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="all">All Users</Option>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                  
                  <Select
                    placeholder="City, State"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="springfield-il">Springfield, IL</Option>
                    <Option value="portland-or">Portland, OR</Option>
                    <Option value="charleston-sc">Charleston, SC</Option>
                  </Select>
                </div>
              </div>
              

            </div>

            {/* Donors Table */}
            <div className="donors-table-section">
              <Spin spinning={loading}>
                
                {donorsData.length === 0 && !loading && (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Text>No donors found. Use "Invite A Donor" button to add one.</Text>
                  </div>
                )}
                
                <Table
                  dataSource={donorsData}
                  columns={columns}
                  pagination={false}
                  size="middle"
                  className="donors-table"
                  rowClassName="donor-row"
                  scroll={{ x: 2140 }}
                  bordered={false}
                  rowKey={(record) => record.key || record.id || 'unknown'}
                  virtual={false}
                  onRow={(record, index) => {
                    return {
                      onClick: (event: React.MouseEvent) => {
                        // Check if clicking on buttons or other interactive elements
                        const target = event.target as HTMLElement;
                        if (!target) return;
                        
                        // Don't open modal if clicking on buttons, toggles, or action column
                        const isButton = target.closest('button') !== null;
                        const isToggle = target.closest('.toggle') !== null || target.closest('.toggle-switch') !== null;
                        const isAntBtn = target.closest('.ant-btn') !== null;
                        const isSpace = target.closest('.ant-space') !== null;
                        const isActionsColumn = target.closest('.ant-table-cell')?.querySelector('.ant-space') !== null;
                        
                        if (isButton || isToggle || isAntBtn || isSpace || isActionsColumn) {
                          return; // Let the button handle its own click
                        }
                        
                        // Otherwise, open edit modal
                        handleEditDonor(record);
                      },
                      style: { 
                        cursor: 'pointer',
                        userSelect: 'none'
                      }
                    };
                  }}
                  locale={{
                    emptyText: error ? `Error: ${error}` : 'No donors found'
                  }}
                />
              </Spin>
              
              {/* Pagination */}
              <div className="pagination-section">
                <Pagination
                  current={currentPage}
                  total={totalDonors}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  onChange={handlePageChange}
                  className="donors-pagination"
                />
              </div>
            </div>
          </div>
        </Content>
      </Layout>
      
      {/* Invite Donor Modal */}
      <InviteDonorModal
        visible={isInviteModalVisible}
        onCancel={() => setIsInviteModalVisible(false)}
        onSubmit={handleInviteDonor}
      />

      {/* Edit Donor Modal */}
      <EditDonorModal
        visible={isEditModalVisible}
        donor={editingDonor}
        onCancel={() => {
          console.log('Edit modal cancelled');
          setIsEditModalVisible(false);
          setEditingDonor(null);
        }}
        onSubmit={handleUpdateDonor}
      />

      {/* Delete User Confirmation Modal */}
      <Modal
        title="Delete Donor"
        open={isDeleteUserModalVisible}
        onOk={confirmDeleteUser}
        onCancel={() => {
          setIsDeleteUserModalVisible(false);
          setDeletingUser(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
      >
        {deletingUser && (
          <div>
            <p>Are you sure you want to permanently delete this donor?</p>
            <div style={{ 
              padding: '16px', 
              background: '#fff7e6', 
              borderRadius: '4px',
              marginTop: '16px',
              marginBottom: '16px'
            }}>
              <Text strong>Donor Details:</Text>
              <br />
              <Text>Name: {deletingUser.name}</Text>
              <br />
              <Text>Email: {deletingUser.email}</Text>
              {deletingUser.beneficiary && (
                <>
                  <br />
                  <Text>Beneficiary: {deletingUser.beneficiary}</Text>
                </>
              )}
              {deletingUser.donation && (
                <>
                  <br />
                  <Text>Total Donations: {deletingUser.donation}</Text>
                </>
              )}
            </div>
            <p style={{ color: '#ff4d4f', marginBottom: 0 }}>
              <Text strong>Warning:</Text> This action cannot be undone. All donor data including donations, profile picture, and other associated information will be permanently deleted.
            </p>
          </div>
        )}
      </Modal>
      </>
    </Layout>
  );
};

export default Donors; 