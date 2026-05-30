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
  MailOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import UserProfile from './UserProfile';
import DashboardSection from './DashboardSection';
import DiscountHighlights from './DiscountHighlights';
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
  const [highlights, setHighlights] = useState<any>(null);
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

    // Fire highlights fetch in parallel — independent of the table data.
    discountAPI
      .getDiscountHighlights()
      .then((r: any) =>
        setHighlights(r?.success ? r.data : null),
      )
      .catch(() => setHighlights(null));

    try {
      const response = await discountAPI.getDiscounts(currentPage, pageSize);
      
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

  const handleDeleteDiscount = async (discountId: number) => {
    try {
      const response = await discountAPI.deleteDiscount(discountId);
      const isSuccess = !response?.error && response?.success !== false;
      if (isSuccess) {
        message.success('Discount deleted successfully');
        await loadDiscounts();
      } else {
        message.error(response?.error || 'Failed to delete discount');
        throw new Error('Delete failed');
      }
    } catch (error: any) {
      console.error('Error deleting discount:', error);
      message.error(error.message || 'Failed to delete discount');
      throw error;
    }
  };

  const handleEditDiscount = (discount: any) => {
    setEditingDiscount({
      id: discount.id,
      title: discount.title,
      vendorId: discount.vendorId,
      vendorName: discount.vendorName,
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
      <AdminSidebar
        activeKey="discounts"
        mobileVisible={mobileSidebarVisible}
        onMobileToggle={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      <Layout className="standard-main-content">
        <Header className="discounts-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Discounts</Title>
            <Text type="secondary" className="discounts-count">
              {totalDiscounts} Discounts Found
            </Text>
          </div>
          <div className="header-right">
            <Button
              type="primary"
              icon={<GiftOutlined />}
              size="large"
              onClick={handleAddDiscount}
              className="add-discount-btn"
            >
              Add Discount
            </Button>
          </div>
        </Header>

        <Content className="discounts-content">
          <div className="content-wrapper">
            <DashboardSection
              title="Discount Highlights"
              subtitle="Marketplace health and what's resonating with donors"
              icon={<TrophyOutlined />}
            >
              <DiscountHighlights data={highlights} />
            </DashboardSection>

            <DashboardSection
              title="All Discounts"
              subtitle="Search, filter, and manage discount offers"
              icon={<GiftOutlined />}
            >
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-section">
                <Search
                  placeholder="Search Discount Name or Code"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="discount-search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={() => loadDiscounts()}
                />
              </div>
              <div className="filter-section">
                <Text strong className="filter-label">Filters</Text>
                <div className="filter-dropdowns">
                  <Select
                    placeholder="Filter by Vendor"
                    className="filter-dropdown"
                    size="large"
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
                  <Select
                    placeholder="Filter by Type"
                    className="filter-dropdown"
                    size="large"
                    allowClear
                    value={selectedType}
                    onChange={(value) => setSelectedType(value)}
                  >
                    <Option value="percentage">Percentage</Option>
                    <Option value="fixed">Fixed Amount</Option>
                    <Option value="bogo">Buy 1 Get 1</Option>
                    <Option value="free">Free</Option>
                  </Select>
                </div>
              </div>
            </div>

          {/* Discounts Table */}
          <div className="discounts-table-section">
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={discountsData}
                pagination={false}
                scroll={{ x: 1200 }}
                rowKey="key"
                className="discounts-table"
                locale={{
                  emptyText: error ? `Error: ${error}` : 'No discounts found'
                }}
              />
            </Spin>
            <div className="pagination-section">
              <Pagination
                current={currentPage}
                total={totalDiscounts}
                pageSize={pageSize}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  if (size) setPageSize(size);
                }}
                showSizeChanger={false}
                showQuickJumper={false}
                className="discounts-pagination"
              />
            </div>
          </div>
            </DashboardSection>
          </div>
        </Content>
      </Layout>

      {/* Add/Edit Discount Modal */}
      <AddDiscountModal
        visible={isAddModalVisible}
        vendorId={editingDiscount?.vendorId || (selectedVendor ? parseInt(selectedVendor) : 0)}
        vendorName={editingDiscount?.vendorName}
        vendorOptions={vendorsData.map((vendor: any) => ({
          id: vendor.id,
          name: vendor.name
        }))}
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
