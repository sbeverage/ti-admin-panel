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
  Spin,
  Modal
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
  DeleteOutlined,
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
  const [selectedBeneficiaryData, setSelectedBeneficiaryData] = useState<any | null>(null);
  const [profileVisible, setProfileVisible] = useState(false);
  const [beneficiariesData, setBeneficiariesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [isDeleteBeneficiaryModalVisible, setIsDeleteBeneficiaryModalVisible] = useState(false);
  const [deletingBeneficiary, setDeletingBeneficiary] = useState<any | null>(null);
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
        // Log the actual API response structure for debugging
        console.log('📊 Raw API response data:', response.data);
        if (response.data && response.data.length > 0) {
          const sample = response.data[0];
          console.log('📋 Sample beneficiary object:', sample);
          console.log('📋 All keys in beneficiary object:', Object.keys(sample));
          console.log('📋 Full beneficiary data structure:', JSON.stringify(sample, null, 2));
          console.log('📋 Image fields:', {
            imageUrl: sample.imageUrl,
            image_url: sample.image_url,
            main_image: sample.main_image,
            main_image_url: sample.main_image_url,
            logo: sample.logo,
            logo_url: sample.logo_url,
            image: sample.image
          });
        }
        
        // Transform API data to match our table structure
        // Handle both new charity structure and legacy beneficiary structure
        // Filter out soft-deleted records (if backend returns them)
        const filteredData = response.data.filter((beneficiary: any) => {
          // Exclude soft-deleted records
          return !beneficiary.deleted_at && 
                 !beneficiary.deletedAt && 
                 !beneficiary.is_deleted && 
                 !beneficiary.isDeleted &&
                 beneficiary.deleted !== true;
        });
        
        const transformedData = filteredData.map((beneficiary: any) => {
          // Log the raw beneficiary data for debugging
          console.log('🔍 Processing beneficiary:', beneficiary.name || beneficiary.id, {
            phone: beneficiary.phone,
            phoneNumber: beneficiary.phoneNumber,
            contactNumber: beneficiary.contactNumber,
            contact_number: beneficiary.contact_number,
            contact_name: beneficiary.contact_name,
            contactName: beneficiary.contactName,
            primaryContact: beneficiary.primaryContact,
            email: beneficiary.email,
            primaryEmail: beneficiary.primaryEmail,
            bank_account: beneficiary.bank_account,
            bankAccount: beneficiary.bankAccount,
            location: beneficiary.location,
            city: beneficiary.city,
            state: beneficiary.state
          });
          
          // Extract all possible field variations from API
          const name = beneficiary.name || beneficiary.beneficiaryName || 'Unknown';
          const category = beneficiary.category || beneficiary.cause || beneficiary.beneficiaryCause || 'General';
          const type = beneficiary.type || beneficiary.beneficiaryType || 'Medium';
          
          // Location - build from available fields
          let location = beneficiary.location || '';
          if (!location && beneficiary.city && beneficiary.state) {
            location = `${beneficiary.city}, ${beneficiary.state}`;
            if (beneficiary.zip_code) {
              location += ` ${beneficiary.zip_code}`;
            }
          } else if (!location && beneficiary.address) {
            location = `${beneficiary.address.city || ''}, ${beneficiary.address.state || ''}`.replace(/^,\s*|,\s*$/g, '');
          }
          if (!location) location = beneficiary.cityState || '';
          
          // Phone - check all variations, but don't default to 'N/A' if field exists but is empty
          const phone = beneficiary.phone || 
                       beneficiary.phoneNumber || 
                       beneficiary.contactNumber || 
                       beneficiary.contact_number || 
                       '';
          
          // Email - Check all possible field variations
          const email = beneficiary.email || 
                       beneficiary.primaryEmail || 
                       beneficiary.primary_email || 
                       beneficiary.contact_email ||
                       beneficiary.contactEmail ||
                       '';
          
          // Contact Name - check all variations
          const contactName = beneficiary.contact_name || 
                             beneficiary.contactName || 
                             beneficiary.primaryContact || 
                             beneficiary.primary_contact || 
                             '';
          
          const createdAt = beneficiary.createdAt || beneficiary.created_at || beneficiary.dateOfJoin || beneficiary.date_of_join;
          const isActive = beneficiary.isActive !== undefined ? beneficiary.isActive : 
                          (beneficiary.is_active !== undefined ? beneficiary.is_active : 
                          (beneficiary.active !== undefined ? beneficiary.active : true));
          
          // Extract logo URL - prioritize logo over main image for table display
          // Logo should be displayed next to the name in the table
          const imageUrl = beneficiary.logo || 
                          beneficiary.logo_url || 
                          beneficiary.logoUrl ||
                          beneficiary.imageUrl || 
                          beneficiary.main_image || 
                          beneficiary.main_image_url || 
                          '';
          
          // Bank account - format if exists
          let bankAccountDisplay = '';
          if (beneficiary.bank_account) {
            const accountStr = beneficiary.bank_account.toString();
            bankAccountDisplay = accountStr.length > 4 ? `****${accountStr.slice(-4)}` : accountStr;
          } else if (beneficiary.bankAccount) {
            const accountStr = beneficiary.bankAccount.toString();
            bankAccountDisplay = accountStr.length > 4 ? `****${accountStr.slice(-4)}` : accountStr;
          }
          
          // Helper function to ensure we never return empty strings or "N/A"
          const ensureValue = (value: any, fallback: string = 'Not provided'): string => {
            if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'n/a') {
              return fallback;
            }
            return String(value);
          };
          
          // Extract all available fields from the API response
          return {
            key: beneficiary.id?.toString() || beneficiary.key || Math.random().toString(),
            beneficiaryName: ensureValue(name, 'Unknown'),
            contactName: ensureValue(contactName || (email ? email : ''), 'Not provided'),
            email: ensureValue(email, 'Not provided'),
            contactNumber: ensureValue(phone, 'Not provided'),
            bankAccount: ensureValue(bankAccountDisplay, 'Not provided'),
            donation: beneficiary.total_donations ? `$${beneficiary.total_donations.toLocaleString()}` : 
                     (beneficiary.totalDonations ? `$${beneficiary.totalDonations.toLocaleString()}` :
                     (beneficiary.donation || '$0')),
            dateOfJoin: createdAt ? new Date(createdAt).toLocaleDateString() : 'Not provided',
            cityState: ensureValue(location, 'Not provided'),
            beneficiaryCause: ensureValue(category, 'General'),
            beneficiaryType: ensureValue(type, 'Medium'),
            donors: beneficiary.donor_count || beneficiary.donorCount || beneficiary.mutual || beneficiary.donors || 0,
            active: isActive,
            enabled: isActive,
            avatar: name ? name.charAt(0).toUpperCase() : 'B',
            imageUrl: imageUrl, // Store image URL for avatar
            // Store full beneficiary data for profile view - preserve ALL fields from API
            rawData: beneficiary
          };
        });
        
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
    // The InviteBeneficiaryModal handles the API call itself
    // This callback is called after successful creation to refresh the list
    console.log('Beneficiary created, refreshing list...');
    setInviteModalVisible(false);
    // Refresh the beneficiaries list to show the newly created beneficiary with all fields
    await loadBeneficiaries();
  };

  const handleBeneficiaryClick = (beneficiaryId: string, record: any) => {
    setSelectedBeneficiaryId(beneficiaryId);
    setSelectedBeneficiaryData(record.rawData || record);
    setProfileVisible(true);
  };

  const handleProfileClose = () => {
    setProfileVisible(false);
    setSelectedBeneficiaryId(null);
    setSelectedBeneficiaryData(null);
  };

  const handleBeneficiaryUpdate = async (updatedData: any) => {
    console.log('Beneficiary updated:', updatedData);
    // Refresh the beneficiaries list to show updated data
    await loadBeneficiaries();
    // Close the profile
    setProfileVisible(false);
    setSelectedBeneficiaryId(null);
  };

  const handleDeleteBeneficiary = (record: any) => {
    setDeletingBeneficiary(record);
    setIsDeleteBeneficiaryModalVisible(true);
  };

  const confirmDeleteBeneficiary = async () => {
    if (!deletingBeneficiary) {
      message.error('Cannot delete beneficiary: missing beneficiary data');
      return;
    }

    // Try to get ID from multiple possible locations
    const beneficiaryId = deletingBeneficiary.rawData?.id || 
                         deletingBeneficiary.id || 
                         deletingBeneficiary.key ||
                         (deletingBeneficiary.rawData && deletingBeneficiary.rawData.id);
    
    if (!beneficiaryId) {
      console.error('Beneficiary record structure:', deletingBeneficiary);
      message.error('Cannot delete beneficiary: missing beneficiary ID');
      return;
    }

    try {
      setLoading(true);
      // Convert to number if it's a string
      const idToDelete = typeof beneficiaryId === 'string' ? parseInt(beneficiaryId) : beneficiaryId;
      console.log('Deleting beneficiary with ID:', idToDelete);
      const response = await beneficiaryAPI.deleteBeneficiary(idToDelete);
      
      if (response.success || response.data) {
        message.success(`Beneficiary ${deletingBeneficiary.beneficiaryName || deletingBeneficiary.name} deleted successfully`);
        setIsDeleteBeneficiaryModalVisible(false);
        
        // Immediately remove from local state (in case backend does soft delete)
        const deletedKey = deletingBeneficiary.key || deletingBeneficiary.id?.toString();
        setBeneficiariesData(prevData => prevData.filter(item => 
          item.key !== deletedKey && 
          item.id?.toString() !== deletedKey &&
          item.rawData?.id?.toString() !== deletedKey
        ));
        setTotalBeneficiaries(prev => Math.max(0, prev - 1));
        
        setDeletingBeneficiary(null);
        // Also refresh from API to ensure consistency
        await loadBeneficiaries();
      } else {
        message.error(response.error || response.message || 'Failed to delete beneficiary');
      }
    } catch (error: any) {
      console.error('Error deleting beneficiary:', error);
      message.error(error.message || 'Failed to delete beneficiary. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <Avatar 
            size={32} 
            src={record.rawData?.logo || 
                 record.rawData?.logo_url || 
                 record.rawData?.logoUrl ||
                 record.imageUrl || 
                 record.rawData?.imageUrl || 
                 record.rawData?.main_image || 
                 record.rawData?.main_image_url}
            style={{ 
              backgroundColor: (record.rawData?.logo || 
                               record.rawData?.logo_url || 
                               record.rawData?.logoUrl ||
                               record.imageUrl || 
                               record.rawData?.imageUrl || 
                               record.rawData?.main_image || 
                               record.rawData?.main_image_url) ? 'transparent' : '#DB8633',
              border: 'none'
            }}
          >
            {!(record.rawData?.logo || 
               record.rawData?.logo_url || 
               record.rawData?.logoUrl ||
               record.imageUrl || 
               record.rawData?.imageUrl || 
               record.rawData?.main_image || 
               record.rawData?.main_image_url) && record.beneficiaryName.charAt(0)}
          </Avatar>
          <Text 
            strong 
            className="clickable-beneficiary-name"
            onClick={() => handleBeneficiaryClick(record.key, record)}
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
      render: (text: string) => {
        const displayText = (!text || text === 'N/A' || text === 'n/a') ? 'Not provided' : text;
        return <Text type="secondary">{displayText}</Text>;
      }, 
      width: 150 
    },
    { 
      title: 'Emails', 
      dataIndex: 'email', 
      key: 'email', 
      render: (text: string) => {
        const displayText = (!text || text === 'N/A' || text === 'n/a') ? 'Not provided' : text;
        return <Text type="secondary">{displayText}</Text>;
      }, 
      width: 200 
    },
    { 
      title: 'Contact number', 
      dataIndex: 'contactNumber', 
      key: 'contactNumber', 
      render: (text: string) => {
        const displayText = (!text || text === 'N/A' || text === 'n/a') ? 'Not provided' : text;
        return <Text type="secondary">{displayText}</Text>;
      }, 
      width: 150 
    },
    { 
      title: 'Bank Account', 
      dataIndex: 'bankAccount', 
      key: 'bankAccount', 
      render: (text: string) => {
        const displayText = (!text || text === 'N/A' || text === 'n/a') ? 'Not provided' : text;
        return <Text type="secondary">{displayText}</Text>;
      }, 
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
        if (!text || text === 'N/A' || text === 'n/a' || text === 'Not provided') {
          return <Tag>Not provided</Tag>;
        }
        let color = 'default';
        if (text === 'Large' || text === 'International') color = 'blue';
        else if (text === 'Medium' || text === 'National') color = 'green';
        else if (text === 'Small' || text === 'Local') color = 'orange';
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
      fixed: 'right' as const,
      width: 180,
      align: 'center' as const,
      render: (text: string, record: any) => {
        if (!record) {
          return null;
        }
        
        return (
          <div 
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
                handleBeneficiaryClick(record.key, record);
              }}
              className="edit-beneficiary-button"
              title="Edit Beneficiary"
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
              icon={<DeleteOutlined />}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteBeneficiary(record);
              }}
              className="delete-beneficiary-button"
              title="Delete Beneficiary"
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
      {profileVisible && selectedBeneficiaryId && selectedBeneficiaryData && (
        <BeneficiaryProfile
          beneficiaryId={selectedBeneficiaryId}
          beneficiaryData={selectedBeneficiaryData}
          onClose={handleProfileClose}
          onUpdate={handleBeneficiaryUpdate}
        />
      )}

      {/* Delete Beneficiary Confirmation Modal */}
      <Modal
        title="Delete Beneficiary"
        open={isDeleteBeneficiaryModalVisible}
        onOk={confirmDeleteBeneficiary}
        onCancel={() => {
          setIsDeleteBeneficiaryModalVisible(false);
          setDeletingBeneficiary(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
      >
        {deletingBeneficiary && (
          <div>
            <p>Are you sure you want to permanently delete this beneficiary?</p>
            <div style={{ 
              padding: '16px', 
              background: '#fff7e6', 
              borderRadius: '4px',
              marginTop: '16px',
              marginBottom: '16px'
            }}>
              <Text strong>Beneficiary Details:</Text>
              <br />
              <Text>Name: {deletingBeneficiary.beneficiaryName || deletingBeneficiary.name}</Text>
              {deletingBeneficiary.cityState && (
                <>
                  <br />
                  <Text>Location: {deletingBeneficiary.cityState}</Text>
                </>
              )}
              {deletingBeneficiary.beneficiaryCause && (
                <>
                  <br />
                  <Text>Category: {deletingBeneficiary.beneficiaryCause}</Text>
                </>
              )}
              {deletingBeneficiary.donation && (
                <>
                  <br />
                  <Text>Total Donations: {deletingBeneficiary.donation}</Text>
                </>
              )}
            </div>
            <p style={{ color: '#ff4d4f', marginBottom: 0 }}>
              <Text strong>Warning:</Text> This action cannot be undone. All beneficiary data including donations, images, and other associated information will be permanently deleted.
            </p>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Beneficiaries; 