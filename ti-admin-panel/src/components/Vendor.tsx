import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Input, Select, Table, Pagination, Dropdown, message, Spin, Modal } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import {
  DashboardOutlined, UserOutlined, StarOutlined, RiseOutlined, SettingOutlined,
  CalendarOutlined, CrownOutlined, FileTextOutlined, ExclamationCircleOutlined,
  MenuOutlined, BellOutlined, SearchOutlined, MoreOutlined, UserAddOutlined,
  FilterOutlined, SortAscendingOutlined, SortDescendingOutlined, EditOutlined,
  DownOutlined, ShopOutlined, GiftOutlined, BankOutlined, TeamOutlined, GlobalOutlined,
  CheckCircleOutlined, StopOutlined, CalculatorOutlined, MailOutlined
} from '@ant-design/icons';
import InviteVendorModal from './InviteVendorModal';
import VendorProfile from './VendorProfile';
import { vendorAPI, Vendor as VendorType } from '../services/api';
import { addNotification } from '../services/notifications';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';
import './Vendor.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Vendor: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('30-days');
  const [inviteVendorModalVisible, setInviteVendorModalVisible] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendorsData, setVendorsData] = useState<any[]>([]);
  const [totalVendors, setTotalVendors] = useState(0);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Load vendors from API
  useEffect(() => {
    loadVendors();
  }, [currentPage, pageSize]);

  const loadVendors = async () => {
    setLoading(true);
    setError(null);
    
    // No mock data fallback - use real API data only

    try {
      console.log('🔄 Loading vendors from API...');
      console.time('API Call'); // Start timing
      const response = await vendorAPI.getVendors(currentPage, pageSize);
      console.timeEnd('API Call'); // End timing
      console.log('📦 Vendor API response:', response);
      console.log('✅ Response success:', response.success);
      console.log('📊 Response data length:', response.data?.length);
      console.log('📄 Response pagination:', response.pagination);
      console.log('📋 Response data sample:', response.data?.[0]);
      
      // Ensure data is an array before processing - handle all cases
      let vendorsData: VendorType[] = [];
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          vendorsData = response.data;
        } else {
          console.warn('⚠️ response.data is not an array:', response.data);
          vendorsData = [];
        }
      } else {
        console.warn('⚠️ response.data is undefined:', response);
        vendorsData = [];
      }
      
      console.log('📋 Vendors data array:', vendorsData);
      console.log('📋 Array length:', vendorsData.length);
      console.log('📋 Is array?', Array.isArray(vendorsData));
      console.log('📋 Full response object:', response);
      
      if (response.success && vendorsData.length > 0) {
        // Transform API data to match our table structure
        console.log('🔄 Transforming vendor data...');
        console.log('📋 Vendors to transform:', vendorsData.length);
          const transformedData = vendorsData.map((vendor: VendorType) => ({
            key: vendor.id.toString(),
            name: vendor.name,
            contactName: (vendor as any).contact_name || (vendor as any).contactName || vendor.name || vendor.email,
            email: vendor.email,
            contact: vendor.phone,
            category: vendor.category || 'Uncategorized',
            cityState: vendor.address && vendor.address.city && vendor.address.state 
              ? `${vendor.address.city}, ${vendor.address.state}`
              : vendor.address && vendor.address.city 
              ? vendor.address.city
              : 'Location not specified',
            tier: '$$', // Default tier, could be calculated based on data
            discount: 10, // Default discount, should come from discounts API
            active: true, // Default active status
            enabled: true, // Default enabled status
            status: vendor.status || 'active', // Use vendor status from API, default to active
            avatar: vendor.name.charAt(0).toUpperCase(),
            logo_url: vendor.logo_url || null // Include logo URL for display
          }));
        console.log('Transformed data:', transformedData);
        console.log('Sample vendor status:', transformedData[0]?.status);
        console.log('Setting vendors data...');
        setVendorsData(transformedData);
        setTotalVendors(response.pagination?.total || 0);
        console.log('Vendors data set successfully');
      } else if (response.success && vendorsData.length === 0) {
        // Success but no vendors yet
        console.log('✅ API call successful, but no vendors found');
        setVendorsData([]);
        setTotalVendors(0);
      } else {
        console.error('❌ Failed to load vendors:', response);
        setError((response as any).error || response.message || 'Failed to load vendors');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading vendors:', error);
      console.error('Error details:', error);
      setVendorsData([]);
      setTotalVendors(0);
      setError('Failed to load vendors');
      setLoading(false);
    }
  };


  const handleToggleChange = async (key: string, field: 'active' | 'enabled') => {
    try {
      const vendorId = parseInt(key);
      const currentVendor = vendorsData.find(v => v.key === key);
      if (currentVendor) {
        const updatedData = { [field]: !currentVendor[field] };
        await vendorAPI.updateVendor(vendorId, updatedData);
        
        // Update local state
        setVendorsData(prevData =>
          prevData.map(item =>
            item.key === key
              ? { ...item, [field]: !item[field] }
              : item
          )
        );
        message.success(`Vendor ${field} status updated successfully`);
      }
    } catch (error) {
      console.error(`Error updating vendor ${field}:`, error);
      message.error(`Failed to update vendor ${field} status`);
      addNotification({
        title: 'Vendor update failed',
        message: `Failed to update vendor ${field} status.`,
        level: 'error',
      });
    }
  };

  const handleTimeFilterChange = (key: string) => {
    setSelectedTimeFilter(key);
    console.log(`Time filter changed to: ${key}`);
  };

  const handleInviteVendor = () => {
    setInviteVendorModalVisible(true);
  };

  const handleInviteVendorModalCancel = () => {
    setInviteVendorModalVisible(false);
  };

  const handleInviteVendorModalSubmit = async (values: any) => {
    // The modal already handles vendor creation, we just need to refresh the list
    console.log('Vendor creation completed, refreshing vendor list...');
    setInviteVendorModalVisible(false);
    // Refresh the vendor list with a small delay to ensure backend processing is complete
    setTimeout(() => {
      loadVendors();
    }, 500);
  };

  const handleVendorClick = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setProfileVisible(true);
  };

  const handleProfileClose = () => {
    setProfileVisible(false);
    setSelectedVendorId(null);
  };

  const handleVendorUpdate = async (updatedData: any) => {
    console.log('🔄 Vendor.tsx: handleVendorUpdate called with:', updatedData);
    
    // If updateData indicates success, just refresh the list (update was already done in VendorProfile)
    if (updatedData?.success === true) {
      console.log('🔄 Vendor.tsx: Update already successful, just refreshing list');
      loadVendors();
      return;
    }
    
    // Otherwise, this is a legacy call - try to update (but this shouldn't happen)
    try {
      if (selectedVendorId && updatedData && typeof updatedData === 'object' && !updatedData.success) {
        const vendorId = parseInt(selectedVendorId);
        console.log('🔄 Vendor.tsx: Legacy update path - Updating vendor ID:', vendorId);
        const result = await vendorAPI.updateVendor(vendorId, updatedData);
        console.log('🔄 Vendor.tsx: Update result:', result);
        if (result.success || result.data) {
          message.success('Vendor updated successfully!');
          loadVendors();
        } else {
          const errorMsg = result.error || 'Failed to update vendor. Please try again.';
          console.error('🔄 Vendor.tsx: Update failed:', errorMsg);
          message.error(errorMsg);
        }
      } else {
        // Just refresh the list
        console.log('🔄 Vendor.tsx: No update needed, just refreshing list');
        loadVendors();
      }
    } catch (error: any) {
      console.error('🔄 Vendor.tsx: Error updating vendor:', error);
      console.error('🔄 Vendor.tsx: Error details:', error.message, error.stack);
      // Don't show error if update was already successful
      if (!updatedData?.success) {
        message.error(error.message || 'Failed to update vendor. Please try again.');
      }
    }
  };

  const handleEditVendor = (record: any) => {
    console.log('Edit vendor:', record);
    // Open the vendor profile in edit mode
    setSelectedVendorId(record.key);
    setProfileVisible(true);
  };

  const handleDeleteVendor = (record: any) => {
    // Show confirmation modal
    Modal.confirm({
      title: 'Are you sure you want to delete this vendor?',
      content: `This will permanently delete "${record.name}" and all associated data. This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setLoading(true);
          
          // Call real API
          const mockSuccess = false; // Set to true to test error handling
          
          if (mockSuccess) {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Remove vendor from local state (mock deletion)
            setVendorsData(prevVendors => 
              prevVendors.filter(vendor => vendor.key !== record.key)
            );
            setTotalVendors(prev => prev - 1);
            
            message.success('Vendor deleted successfully (Mock Mode)');
          } else {
            // Call real API (when it's back online)
            await vendorAPI.deleteVendor(parseInt(record.key));
            message.success('Vendor deleted successfully');
            loadVendors();
          }
        } catch (error) {
          console.error('Error deleting vendor:', error);
          message.error('Failed to delete vendor. Please try again.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleToggleStatus = async (record: any) => {
    console.log('Toggle status clicked for vendor:', record);
    console.log('Current status:', record.status);
    
    const newStatus = record.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    console.log('New status will be:', newStatus);
    console.log('Action:', action);
    
    try {
      setLoading(true);
      
      // Call API to update status
      const response = await vendorAPI.updateVendorStatus(parseInt(record.key), newStatus);
      
      console.log('API response:', response);
      
      if (response.success) {
        message.success(`Vendor ${action}d successfully`);
        addNotification({
          title: `Vendor ${action}d`,
          message: record.name || 'Vendor status updated',
          level: 'success',
        });
        // Reload vendors to get updated data
        loadVendors();
      } else {
        message.error(`Failed to ${action} vendor: ${response.error}`);
        addNotification({
          title: `Vendor ${action} failed`,
          message: response.error || 'Status update failed',
          level: 'error',
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error);
      message.error(`Failed to ${action} vendor. Please try again.`);
      addNotification({
        title: `Vendor ${action} failed`,
        message: 'Status update failed. Please try again.',
        level: 'error',
      });
    } finally {
      setLoading(false);
    }
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
    } else if (key === 'pending-approvals') {
      navigate('/pending-approvals');
    } else if (key === 'invitations') {
      navigate('/invitations');
    } else if (key === 'referral-analytics') {
      navigate('/referral-analytics');
    } else if (key === 'geographic-analytics') {
      navigate('/geographic-analytics');
    } else if (key === 'discounts') {
      navigate('/discounts');
    } else if (key === 'reporting') {
      navigate('/reporting');
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
      key: 'pending-approvals',
      icon: <ExclamationCircleOutlined />,
      label: 'Pending Approvals',
      title: 'Pending Approvals'
    },
    {
      key: 'invitations',
      icon: <MailOutlined />,
      label: 'Invitations',
      title: 'Beneficiary & Vendor Invitations'
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
      key: 'reporting',
      icon: <CalculatorOutlined />,
      label: 'Reporting',
      title: 'Payouts & Financial Reporting'
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
          Vendor name
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string, record: any) => (
        <Space>
          <Avatar 
            size={32} 
            src={record.logo_url} // Use logo URL if available
            style={{ backgroundColor: record.logo_url ? 'transparent' : '#DB8633' }}
            icon={!record.logo_url ? record.avatar : undefined} // Show initial if no logo
          >
            {!record.logo_url && record.avatar}
          </Avatar>
          <Text 
            strong 
            className="clickable-vendor-name"
            onClick={() => handleVendorClick(record.key)}
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
      dataIndex: 'contact', 
      key: 'contact', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 150 
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 200 
    },
    { 
      title: 'City, State', 
      dataIndex: 'cityState', 
      key: 'cityState', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 150 
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      render: (text: string) => <Text strong style={{ color: '#DB8633' }}>{text}</Text>,
      width: 80,
    },
    {
      title: 'Dis',
      dataIndex: 'discount',
      key: 'discount',
      render: (text: number) => <Text strong style={{ color: '#DB8633' }}>{text}</Text>,
      width: 80,
    },
    {
      title: 'Active/De-active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: any) => (
        <div className="toggle-switch">
          <div className={`toggle ${active ? 'active' : 'inactive'}`} onClick={() => handleToggleChange(record.key, 'active')}>
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 140,
    },
    {
      title: 'Enable/Disable',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: any) => (
        <div className="enable-disable-toggle">
          <div className={`toggle ${enabled ? 'active' : 'inactive'}`} onClick={() => handleToggleChange(record.key, 'enabled')}>
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 140,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => (
        <Space size="small">
          <span 
            className={`status-badge ${status === 'active' ? 'active' : 'inactive'}`}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: status === 'active' ? '#f6ffed' : '#fff2e8',
              color: status === 'active' ? '#52c41a' : '#fa8c16',
              border: `1px solid ${status === 'active' ? '#b7eb8f' : '#ffd591'}`
            }}
          >
            {status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </Space>
      ),
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: any) => (
        <Space size="small">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              size="small" 
              className="edit-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleEditVendor(record);
              }}
              title="Edit Vendor"
            />
            <Button 
              type={record.status === 'active' ? 'default' : 'primary'}
              icon={record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
              size="small" 
              className="status-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(record);
              }}
              title={record.status === 'active' ? 'Deactivate Vendor' : 'Activate Vendor'}
            >
              {record.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
        </Space>
      ),
      width: 160,
      fixed: 'right' as const,
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const uniqueCategories = Array.from(new Set(vendorsData.map(vendor => vendor.category).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(vendorsData.map(vendor => vendor.status).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(vendorsData.map(vendor => vendor.cityState).filter(Boolean)));

  const filteredVendors = vendorsData.filter((vendor) => {
    const matchesStatus = showInactive ? true : vendor.status === 'active';
    const matchesCategory = selectedCategory ? vendor.category === selectedCategory : true;
    const matchesLocation = selectedLocation ? vendor.cityState === selectedLocation : true;
    const matchesStatusFilter = selectedStatus ? vendor.status === selectedStatus : true;
    const matchesSearch = searchTerm
      ? [vendor.name, vendor.contactName, vendor.email, vendor.contact, vendor.category, vendor.cityState]
          .filter(Boolean)
          .some((value: string) => value.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    return matchesStatus && matchesCategory && matchesLocation && matchesStatusFilter && matchesSearch;
  });

  return (
    <Layout className="vendor-layout">
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
          defaultSelectedKeys={['vendor']}
          selectedKeys={[location.pathname === '/vendor' ? 'vendor' : '']}
          items={menuItems}
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      {/* Main Content */}
      <Layout className="standard-main-content">
        <Header className="vendor-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Vendors</Title>
            <Text type="secondary" className="vendors-count">{totalVendors} Vendors Found</Text>
          </div>
          <div className="header-right">
            <Button 
              type="primary" 
              icon={<UserAddOutlined />}
              size="large"
              className="invite-vendor-btn"
              onClick={handleInviteVendor}
            >
              Invite A Vendor
            </Button>
          </div>
        </Header>

        <Content className="vendor-content">
          <div className="content-wrapper">
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-section">
                <Search
                  placeholder="Search Vendors"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="vendor-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              
              <div className="filter-section">
                <Text strong className="filter-label">Filters</Text>
                <div className="filter-dropdowns">
                  <div className="filter-item">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                        style={{ margin: 0 }}
                      />
                      <Text>Show Inactive Vendors</Text>
                    </label>
                  </div>
                  <Select
                    placeholder="Select Category"
                    className="filter-dropdown"
                    size="large"
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(value)}
                    allowClear
                  >
                    {uniqueCategories.map((category) => (
                      <Option key={category} value={category}>
                        {category}
                      </Option>
                    ))}
                  </Select>
                  
                  <Select
                    placeholder="Select Status"
                    className="filter-dropdown"
                    size="large"
                    value={selectedStatus}
                    onChange={(value) => setSelectedStatus(value)}
                    allowClear
                  >
                    {uniqueStatuses.map((status) => (
                      <Option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Option>
                    ))}
                  </Select>
                  
                  <Select
                    placeholder="Select Location"
                    className="filter-dropdown"
                    size="large"
                    value={selectedLocation}
                    onChange={(value) => setSelectedLocation(value)}
                    allowClear
                  >
                    {uniqueLocations.map((location) => (
                      <Option key={location} value={location}>
                        {location}
                      </Option>
                    ))}
                  </Select>
                  
                  <Select
                    placeholder="Rating"
                    className="filter-dropdown"
                    size="large"
                    disabled
                  />
                </div>
              </div>
              

            </div>

            {/* Vendors Table */}
            <div className="vendors-table-section">
              <Spin spinning={loading}>
              <Table
                dataSource={filteredVendors}
                columns={columns}
                pagination={false}
                size="middle"
                className="vendors-table"
                rowClassName="vendor-row"
                scroll={{ x: 1800 }}
                bordered={false}
                  locale={{
                    emptyText: error ? `Error: ${error}` : 'No vendors found'
                  }}
              />
              </Spin>
              
              {/* Pagination */}
              <div className="pagination-section">
                <Pagination
                  current={currentPage}
                  total={totalVendors}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  onChange={handlePageChange}
                  className="vendors-pagination"
                />
              </div>
            </div>
          </div>
        </Content>
      </Layout>

      {/* Invite Vendor Modal */}
      <InviteVendorModal
        visible={inviteVendorModalVisible}
        onCancel={handleInviteVendorModalCancel}
        onSubmit={handleInviteVendorModalSubmit}
      />

      {/* Vendor Profile Modal */}
      {profileVisible && selectedVendorId && (
        <VendorProfile
          vendorId={selectedVendorId}
          onClose={handleProfileClose}
          onUpdate={handleVendorUpdate}
        />
      )}
    </Layout>
  );
};

export default Vendor; 