import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Input,
  Button,
  Avatar,
  Space,
  Pagination,
  Select,
  Card,
  Row,
  Col,
  Table,
  Tag,
  message,
  Spin,
  Popconfirm
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  SettingOutlined,
  MenuOutlined,
  MoreOutlined,
  SearchOutlined,
  GiftOutlined,
  BankOutlined,
  UserAddOutlined,
  RiseOutlined,
  CrownOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  GlobalOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  PercentageOutlined,
  ShoppingOutlined,
  CalculatorOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import { discountAPI, vendorAPI } from '../services/api';
import AddDiscountModal from './AddDiscountModal';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';
import './Discounts.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Discounts: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [discountsData, setDiscountsData] = useState<any[]>([]);
  const [vendorsData, setVendorsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDiscounts, setTotalDiscounts] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load discounts from API
  const loadDiscounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading discounts from API...');
      const response = await discountAPI.getDiscounts(currentPage, pageSize);
      console.log('Discount API response:', response);
      
      if (response.success) {
        // Transform API data to match our table structure
        const transformedData = response.data.map((discount: any) => ({
          key: discount.id.toString(),
          id: discount.id,
          title: discount.title || discount.name || 'Untitled Discount',
          vendorId: discount.vendor_id || discount.vendorId,
          vendorName: discount.vendor_name || discount.vendorName || 'Unknown Vendor',
          description: discount.description || '',
          discountType: discount.discount_type || discount.discountType,
          discountValue: discount.discount_value || discount.discountValue,
          discountCode: discount.discount_code || discount.pos_code || discount.discountCode || 'N/A',
          usageLimit: discount.usage_limit || discount.usageLimit || 'unlimited',
          isActive: discount.is_active !== undefined ? discount.is_active : (discount.isActive !== undefined ? discount.isActive : true),
          startDate: discount.start_date || discount.startDate,
          endDate: discount.end_date || discount.endDate,
          createdAt: discount.created_at || discount.createdAt,
          // Store raw data for editing
          rawData: discount
        }));
        
        // Apply filters
        let filteredData = transformedData;
        if (searchText) {
          filteredData = filteredData.filter((d: any) => 
            d.title.toLowerCase().includes(searchText.toLowerCase()) ||
            d.description.toLowerCase().includes(searchText.toLowerCase()) ||
            d.discountCode.toLowerCase().includes(searchText.toLowerCase())
          );
        }
        if (selectedVendor) {
          filteredData = filteredData.filter((d: any) => 
            d.vendorId.toString() === selectedVendor || 
            d.vendorName.toLowerCase().includes(selectedVendor.toLowerCase())
          );
        }
        if (selectedType) {
          filteredData = filteredData.filter((d: any) => d.discountType === selectedType);
        }
        
        setDiscountsData(filteredData);
        setTotalDiscounts(response.pagination?.total || filteredData.length);
        console.log('Discounts loaded successfully');
      } else {
        setError('Failed to load discounts');
        setDiscountsData([]);
        setTotalDiscounts(0);
      }
    } catch (error: any) {
      console.error('Error loading discounts:', error);
      setError('Failed to load discounts');
      setDiscountsData([]);
      setTotalDiscounts(0);
    } finally {
      setLoading(false);
    }
  };

  // Load vendors for filter dropdown
  const loadVendors = async () => {
    try {
      const response = await vendorAPI.getVendors(1, 1000);
      if (response.success && response.data) {
        setVendorsData(response.data);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadDiscounts();
    loadVendors();
  }, [currentPage, pageSize]);

  // Reload when filters change
  useEffect(() => {
    if (currentPage === 1) {
      loadDiscounts();
    } else {
      setCurrentPage(1);
    }
  }, [searchText, selectedVendor, selectedType]);

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

  const handleDeleteDiscount = async (discountId: number) => {
    try {
      const response = await discountAPI.deleteDiscount(discountId);
      if (response.success) {
        message.success('Discount deleted successfully');
        loadDiscounts();
      } else {
        message.error('Failed to delete discount');
      }
    } catch (error: any) {
      console.error('Error deleting discount:', error);
      message.error(error.message || 'Failed to delete discount');
    }
  };

  const handleEditDiscount = (discount: any) => {
    setEditingDiscount({
      id: discount.id,
      title: discount.title,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      posCode: discount.discountCode,
      usageLimit: discount.usageLimit,
      description: discount.description
    });
    setIsAddModalVisible(true);
  };

  const handleAddDiscount = () => {
    setEditingDiscount(null);
    setIsAddModalVisible(true);
  };

  const handleDiscountSuccess = () => {
    loadDiscounts();
    setIsAddModalVisible(false);
    setEditingDiscount(null);
  };

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <PercentageOutlined />;
      case 'fixed':
        return <DollarOutlined />;
      case 'bogo':
        return <ShoppingOutlined />;
      case 'free':
        return <GiftOutlined />;
      default:
        return <GiftOutlined />;
    }
  };

  const getDiscountTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'green';
      case 'fixed':
        return 'blue';
      case 'bogo':
        return 'purple';
      case 'free':
        return 'gold';
      default:
        return 'default';
    }
  };

  const formatDiscountValue = (type: string, value: number) => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'fixed':
        return `$${value}`;
      case 'bogo':
        return 'BOGO';
      case 'free':
        return 'FREE';
      default:
        return value.toString();
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
      title: 'Discount Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Space>
          {getDiscountTypeIcon(record.discountType)}
          <Text strong>{text}</Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: 'Vendor',
      dataIndex: 'vendorName',
      key: 'vendorName',
      render: (text: string) => <Text>{text}</Text>,
      width: 200,
    },
    {
      title: 'Type',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type: string) => (
        <Tag color={getDiscountTypeColor(type)}>
          {type === 'fixed' ? 'Fixed Amount' : type === 'percentage' ? 'Percentage' : type === 'bogo' ? 'BOGO' : 'Free'}
        </Tag>
      ),
      width: 120,
    },
    {
      title: 'Value',
      dataIndex: 'discountValue',
      key: 'discountValue',
      render: (value: number, record: any) => (
        <Text strong style={{ color: '#DB8633' }}>
          {formatDiscountValue(record.discountType, value)}
        </Text>
      ),
      width: 100,
    },
    {
      title: 'Code',
      dataIndex: 'discountCode',
      key: 'discountCode',
      render: (code: string) => (
        <Tag color="blue">{code}</Tag>
      ),
      width: 120,
    },
    {
      title: 'Usage Limit',
      dataIndex: 'usageLimit',
      key: 'usageLimit',
      render: (limit: string) => (
        <Text>{limit === 'unlimited' ? 'Unlimited' : `${limit}x/month`}</Text>
      ),
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditDiscount(record)}
            size="small"
          />
          <Popconfirm
            title="Delete Discount"
            description={`Are you sure you want to delete "${record.title}"?`}
            onConfirm={() => handleDeleteDiscount(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
      width: 120,
      fixed: 'right' as const,
    },
  ];

  return (
    <Layout className="discounts-layout">
      {/* Mobile Menu Button */}
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
          className="standard-menu"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      <Layout className="main-content">
        <Header className="discounts-header" style={{ background: '#fff', padding: '16px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>Discounts</Title>
              <Text type="secondary">{totalDiscounts} Discounts Found</Text>
            </div>
            <Button
              type="primary"
              icon={<GiftOutlined />}
              onClick={handleAddDiscount}
              style={{
                backgroundColor: '#DB8633',
                borderColor: '#DB8633',
                color: '#ffffff'
              }}
            >
              Add Discount
            </Button>
          </div>
        </Header>

        <Content className="discounts-content" style={{ padding: '24px', background: '#f0f2f5' }}>
          {/* Search and Filter Bar */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Search Discount Name or Code"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={() => loadDiscounts()}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Filter by Vendor"
                  size="large"
                  style={{ width: '100%' }}
                  allowClear
                  value={selectedVendor}
                  onChange={(value) => setSelectedVendor(value)}
                >
                  {vendorsData.map((vendor: any) => (
                    <Option key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Filter by Type"
                  size="large"
                  style={{ width: '100%' }}
                  allowClear
                  value={selectedType}
                  onChange={(value) => setSelectedType(value)}
                >
                  <Option value="percentage">Percentage</Option>
                  <Option value="fixed">Fixed Amount</Option>
                  <Option value="bogo">Buy 1 Get 1</Option>
                  <Option value="free">Free</Option>
                </Select>
              </Col>
            </Row>
          </Card>

          {/* Discounts Table */}
          <Card>
            <Spin spinning={loading}>
              {error ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Text type="danger">{error}</Text>
                </div>
              ) : (
                <>
                  <Table
                    columns={columns}
                    dataSource={discountsData}
                    pagination={false}
                    scroll={{ x: 1200 }}
                    rowKey="key"
                  />
                  <div style={{ marginTop: '16px', textAlign: 'right' }}>
                    <Pagination
                      current={currentPage}
                      total={totalDiscounts}
                      pageSize={pageSize}
                      onChange={(page, size) => {
                        setCurrentPage(page);
                        if (size) setPageSize(size);
                      }}
                      showSizeChanger
                      showQuickJumper
                      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} discounts`}
                    />
                  </div>
                </>
              )}
            </Spin>
          </Card>
        </Content>
      </Layout>

      {/* Add/Edit Discount Modal */}
      <AddDiscountModal
        visible={isAddModalVisible}
        vendorId={editingDiscount?.vendorId || (selectedVendor ? parseInt(selectedVendor) : 0)}
        vendorName={editingDiscount?.vendorName}
        onCancel={() => {
          setIsAddModalVisible(false);
          setEditingDiscount(null);
        }}
        onSuccess={handleDiscountSuccess}
        editingDiscount={editingDiscount}
      />
    </Layout>
  );
};

export default Discounts;
