import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Space, Avatar, Button, Input, Select, Table, Pagination, Tabs, Tag, Modal, message, Spin, Empty, Tooltip, Collapse } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import UserProfile from './UserProfile';
import DashboardSection from './DashboardSection';
import PendingApprovalsHighlights from './PendingApprovalsHighlights';
import CharityAccessRequests from './CharityAccessRequests';
import CharityAppPreview from './CharityAppPreview';
import { usePendingApprovalsCount, notifyApprovalsChanged } from '../hooks/usePendingApprovalsCount';
import { approvalsAPI, beneficiaryAPI, vendorAPI } from '../services/api';
import {
  DashboardOutlined, UserOutlined, SettingOutlined,
  CrownOutlined, ExclamationCircleOutlined,
  MenuOutlined, MoreOutlined, SearchOutlined,
  SortAscendingOutlined, CheckCircleOutlined, CloseCircleOutlined,
  EyeOutlined, ShopOutlined, HeartOutlined, TeamOutlined, GlobalOutlined,
  CalculatorOutlined, MailOutlined, TrophyOutlined
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
  createdAt: number | null;
  documentsSubmitted: string;
  verificationStatus: string;
  active: boolean;
  enabled: boolean;
  avatar: string;
  itemType: 'vendor' | 'beneficiary';
  /** Registered but never submitted for review — nothing to judge yet. */
  isIncomplete?: boolean;
  // Everything the reviewer actually judges. The modal renders the images
  // through CharityAppPreview, which answers "does this look right in the
  // app" far faster than reading URLs.
  ein?: string | null;
  website?: string | null;
  category?: string | null;
  about?: string | null;
  logoUrl?: string | null;
  highlightUrl?: string | null;
  coverUrl?: string | null;
  vettingLinks?: string[];
}

const PendingApprovals: React.FC = () => {
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  // An approval queue should show everything waiting, including submissions
  // older than a month — those are the ones most in need of attention. The
  // 30-day default was hiding them while still counting them in the tab badge.
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('vendors');
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  // Profile detail an admin fills in while approving a donor-suggested
  // charity. Sent with the approve call so the cause lands in the app with a
  // real profile instead of the placeholder it carried while pending.
  const [charityProfile, setCharityProfile] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedDocumentFilter, setSelectedDocumentFilter] = useState('all');
  const [approvalsData, setApprovalsData] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalApprovals, setTotalApprovals] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const pendingCounts = usePendingApprovalsCount();

  // Load pending approvals from API
  // Gracefully handles missing endpoint / empty data - shows empty state instead of errors
  const loadApprovals = async () => {
    setLoading(true);
    
    try {
      // Which queue to fetch. Without this the Beneficiaries tab silently
      // showed the vendor list filtered to nothing.
      const response = await approvalsAPI.getPendingApprovals(
        currentPage,
        pageSize,
        activeTab === 'vendors' ? 'vendor' : 'beneficiary',
      );
      
      if (response?.success && Array.isArray(response.data)) {
        const transformedData = response.data.map((approval: any) => ({
          key: approval.id.toString(),
          name: approval.name || 'Unknown',
          contactPerson: approval.contact_person || 'N/A',
          email: approval.email || 'N/A',
          phone: approval.phone || 'N/A',
          type: approval.type || 'vendor',
          location: approval.location || 'N/A',
          // submitted_at is when the item entered the queue; created_at is when
          // the underlying row was first created. For a charity those differ —
          // /charities/suggest reuses an existing row when the EIN matches — so
          // filtering on created_at hid recent submissions behind the 30-day
          // filter while still counting them in the tab badge.
          registrationDate: (approval.submitted_at || approval.created_at)
            ? new Date(approval.submitted_at || approval.created_at).toLocaleDateString()
            : 'N/A',
          createdAt: (approval.submitted_at || approval.created_at)
            ? new Date(approval.submitted_at || approval.created_at).getTime()
            : null,
          documentsSubmitted: approval.documents_submitted || 'N/A',
          verificationStatus: approval.verification_status || 'pending',
          active: approval.is_active || false,
          enabled: approval.is_enabled || false,
          avatar: approval.name ? approval.name.charAt(0).toUpperCase() : 'A',
          itemType: (approval.type === 'beneficiary' ? 'beneficiary' : 'vendor') as 'vendor' | 'beneficiary',
          isIncomplete:
            approval.is_incomplete === true || approval.submission_state === 'incomplete',
          ein: approval.ein ?? null,
          website: approval.website ?? null,
          category: approval.category ?? null,
          about: approval.about ?? approval.description ?? null,
          logoUrl: approval.logo_url ?? null,
          highlightUrl: approval.highlight_url ?? null,
          coverUrl: approval.image_url ?? null,
          vettingLinks: Array.isArray(approval.vetting_links) ? approval.vetting_links : [],
        }));
        
        setApprovalsData(transformedData);
        setTotalApprovals(response.pagination?.total ?? transformedData.length);
      } else {
        // No error state - treat as empty (endpoint may not exist yet)
        setApprovalsData([]);
        setTotalApprovals(0);
      }
    } catch {
      // Gracefully handle API errors - show empty state, no error message
      setApprovalsData([]);
      setTotalApprovals(0);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when page changes
  useEffect(() => {
    loadApprovals();
  }, [currentPage, pageSize, activeTab]);

  const handleToggleChange = async (key: string, field: 'active' | 'enabled') => {
    const item = approvalsData.find((i) => i.key === key);
    if (!item) return;
    const id = parseInt(key, 10);
    if (isNaN(id)) return;
    const nextVal = !item[field];
    try {
      if (item.itemType === 'beneficiary') {
        const payload = field === 'active'
          ? { is_active: nextVal, isActive: nextVal }
          : { is_enabled: nextVal, isEnabled: nextVal };
        const response = await beneficiaryAPI.updateBeneficiary(id, payload);
        if (response?.success !== false) {
          setApprovalsData(prev =>
            prev.map(i => (i.key === key ? { ...i, [field]: nextVal } : i))
          );
          message.success('Status updated');
          loadApprovals(); // Refresh from server
          notifyApprovalsChanged();
        } else {
          message.error('Failed to update');
        }
      } else {
        if (field === 'active') {
          const nextStatus = nextVal ? 'active' : 'inactive';
          const response = await vendorAPI.updateVendorStatus(id, nextStatus);
          if (response?.success !== false) {
            setApprovalsData(prev =>
              prev.map(i =>
                i.key === key
                  ? { ...i, active: nextVal, enabled: nextVal }
                  : i
              )
            );
            message.success('Status updated');
            loadApprovals(); // Refresh from server
          notifyApprovalsChanged();
          } else {
            message.error('Failed to update');
          }
        } else {
          const response = await vendorAPI.updateVendor(id, { is_enabled: nextVal });
          if (response?.success !== false) {
            setApprovalsData(prev =>
              prev.map(i => (i.key === key ? { ...i, enabled: nextVal } : i))
            );
            message.success('Status updated');
            loadApprovals(); // Refresh from server
          notifyApprovalsChanged();
          } else {
            message.error('Failed to update');
          }
        }
      }
    } catch (err: any) {
      console.error('Toggle error:', err);
      message.error(err?.message || 'Failed to update');
    }
  };

  const handleTimeFilterChange = (key: string) => {
    setSelectedTimeFilter(key);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
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

  // Counted by the API, not derived from approvalsData. That array only ever
  // holds the active tab's queue, so deriving from it made the inactive tab
  // read (0) until it was clicked.
  const { vendors: vendorCount, charities: beneficiaryCount } = pendingCounts;

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
          {/* The name opens the same review panel as the View Details
              button. Reviewing starts by looking at one of these, so the
              thing the eye lands on first should be the way in. Kept as a
              button for keyboard and screen reader users; the row itself is
              not clickable because it carries its own toggles. */}
          <Text
            strong
            role="button"
            tabIndex={0}
            onClick={() => handleViewDetails(record)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleViewDetails(record);
              }
            }}
            style={{ cursor: 'pointer', color: '#21555b' }}
            className="approval-name-link"
          >
            {text}
          </Text>
          {/* Registered through the portal but never submitted for review.
              There is nothing to approve yet — these need chasing, not a
              decision, so the tag says so rather than looking like a normal
              pending application. */}
          {record.isIncomplete && (
            <Tooltip title="Signed up but hasn't submitted their profile for review yet — follow up with them.">
              <Tag color="orange">Incomplete</Tag>
            </Tooltip>
          )}
        </Space>
      ),
      fixed: 'left' as const,
      width: 260,
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

  /**
   * Which of the fields the approve form can set are still empty on the
   * charity itself. Drives whether that form opens or stays folded away: a
   * portal charity fills its own profile in, so for most of them this is
   * empty and nine blank inputs would be the first thing a reviewer sees.
   */
  const missingProfileFields = selectedItem
    ? ([
        ['Category', selectedItem.category],
        ['About', selectedItem.about],
        ['Cover image', selectedItem.coverUrl],
        ['Logo', selectedItem.logoUrl],
        ['Website', selectedItem.website],
        ['Contact', selectedItem.contactPerson === 'N/A' ? '' : selectedItem.contactPerson],
        ['Phone', selectedItem.phone === 'N/A' ? '' : selectedItem.phone],
        ['Location', selectedItem.location === 'N/A' ? '' : selectedItem.location],
      ] as [string, unknown][])
        .filter(([, v]) => !String(v ?? '').trim())
        .map(([label]) => label)
    : [];

  const handleViewDetails = (record: ApprovalItem) => {
    setSelectedItem(record);
    setApprovalModalVisible(true);
  };

  const handleApprove = async (record: ApprovalItem) => {
    try {
      // Only non-empty fields, so a blank input can't overwrite detail the
      // charity already has.
      const profile = Object.fromEntries(
        Object.entries(charityProfile).filter(([, v]) => String(v || '').trim() !== ''),
      );
      const response = await approvalsAPI.approveItem(
        parseInt(record.key),
        record.itemType,
        record.itemType === 'beneficiary' ? profile : undefined,
      );
      
      if (response.success) {
        const r: any = response;
        const missing: string[] = Array.isArray(r.missingFields) ? r.missingFields : [];

        if (record.itemType !== 'vendor' && r.isComplete === false) {
          // Approved, but held back from donors until the profile is filled
          // in. Hand straight off to the profile editor rather than dropping
          // the admin back on a queue with no hint of what to do next —
          // saving that profile is what publishes the charity.
          message.success({
            content: `${record.name} approved. Complete the profile to make it visible to donors${
              missing.length ? ` — still needed: ${missing.join(', ')}` : ''
            }.`,
            duration: 8,
          });
          setApprovalModalVisible(false);
          navigate('/beneficiaries', {
            state: {
              openBeneficiaryId: record.key,
              completeProfileFor: record.name,
              missingFields: missing,
            },
          });
          return;
        }

        message.success(`${record.itemType === 'vendor' ? 'Vendor' : 'Charity'} approved successfully!`);
        // Refresh the approvals list
        loadApprovals();
        notifyApprovalsChanged();
      } else {
        message.error('Failed to approve item');
      }
    } catch (error) {
      console.error('Error approving item:', error);
      message.error('Failed to approve item. Please try again.');
    }
  };

  const handleReject = async (record: ApprovalItem) => {
    try {
      const response = await approvalsAPI.rejectItem(parseInt(record.key), record.itemType, 'Rejected by admin');
      
      if (response.success) {
        message.error(`${record.itemType === 'vendor' ? 'Vendor' : 'Charity'} rejected.`);
        // Refresh the approvals list
        loadApprovals();
        notifyApprovalsChanged();
      } else {
        message.error('Failed to reject item');
      }
    } catch (error) {
      console.error('Error rejecting item:', error);
      message.error('Failed to reject item. Please try again.');
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const getCurrentData = (): ApprovalItem[] => {
    const baseData = approvalsData.filter((item) =>
      activeTab === 'vendors' ? item.itemType === 'vendor' : item.itemType === 'beneficiary'
    );

    const filteredByStatus =
      selectedStatusFilter === 'all'
        ? baseData
        : baseData.filter((item) => item.verificationStatus?.toLowerCase() === selectedStatusFilter);

    const filteredByDocuments =
      selectedDocumentFilter === 'all'
        ? filteredByStatus
        : filteredByStatus.filter((item) => {
            const docStatus = item.documentsSubmitted?.toLowerCase();
            if (selectedDocumentFilter === 'complete') return docStatus === 'complete';
            if (selectedDocumentFilter === 'incomplete') return docStatus === 'incomplete';
            if (selectedDocumentFilter === 'pending-review') return docStatus === 'pending review' || docStatus === 'pending-review';
            return true;
          });

    const filteredByTime =
      selectedTimeFilter === 'all'
        ? filteredByDocuments
        : filteredByDocuments.filter((item) => {
            if (!item.createdAt) return true;
            const diffDays = (Date.now() - item.createdAt) / (1000 * 60 * 60 * 24);
            if (selectedTimeFilter === '7-days') return diffDays <= 7;
            if (selectedTimeFilter === '30-days') return diffDays <= 30;
            if (selectedTimeFilter === '90-days') return diffDays <= 90;
            if (selectedTimeFilter === '1-year') return diffDays <= 365;
            return true;
          });

    if (!searchQuery.trim()) {
      return filteredByTime;
    }

    return filteredByTime.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
      <AdminSidebar
        activeKey="pending-approvals"
        mobileVisible={mobileSidebarVisible}
        onMobileToggle={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      {/* Main Content */}
      <Layout className="main-content">
        <Header className="donors-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Pending Approvals</Title>
            <Text type="secondary" className="approvals-count">
              {getTotalCount()} {activeTab === 'vendors' ? 'Vendors' : 'Charities'} Pending Approval
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
            {/* Renders nothing unless someone is waiting, so it stays out of
                the way until there is a decision to make. Sits above the tabs
                because it answers a different question from them: who may
                edit a charity, not whether a charity should be visible. */}
            <CharityAccessRequests />

            <DashboardSection
              title="Approval Queue Highlights"
              subtitle="What's waiting on your review"
              icon={<TrophyOutlined />}
            >
              <PendingApprovalsHighlights approvals={approvalsData} />
            </DashboardSection>

            <DashboardSection
              title="Pending Approvals"
              subtitle="Verify and approve new charities and vendors"
              icon={<ExclamationCircleOutlined />}
            >
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
                        Vendors ({vendorCount})
                      </span>
                    ),
                  },
                  {
                    key: 'beneficiaries',
                    label: (
                      <span>
                        <HeartOutlined />
                        Beneficiaries ({beneficiaryCount})
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
                  placeholder={`Search ${activeTab === 'vendors' ? 'Vendors' : 'Charities'}`}
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
              <Spin spinning={loading}>
                <Table
                  dataSource={getCurrentData()}
                  columns={approvalColumns}
                  pagination={false}
                  size="middle"
                  className="approvals-table"
                rowClassName="approval-row"
                scroll={{ x: 1800 }}
                bordered={false}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span>
                          No pending {activeTab === 'vendors' ? 'vendors' : 'beneficiaries'} yet.
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            When vendors and charities have their own admin panels and create accounts, they will appear here for approval.
                          </Text>
                        </span>
                      }
                    />
                  )
                }}
              />
              </Spin>
              
              {/* Pagination */}
              <div className="pagination-section">
                <Pagination
                  current={currentPage}
                  total={totalApprovals}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  onChange={handlePageChange}
                  className="approvals-pagination"
                />
              </div>
            </div>
            </DashboardSection>
          </div>
        </Content>
      </Layout>

      {/* Approval Details Modal */}
      <Modal
        title={
          <div className="modal-header">
            <ExclamationCircleOutlined className="modal-icon" />
            {/* Colour lives in PendingApprovals.css, not here: index.css
                sets `.ant-typography { color: ... !important }` globally, and
                an inline style cannot beat an important rule. */}
            <Title level={3} style={{ margin: 0 }}>
              {selectedItem?.name}
            </Title>
          </div>
        }
        open={approvalModalVisible}
        onCancel={() => {
          setApprovalModalVisible(false);
          setCharityProfile({});
        }}
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
              setCharityProfile({});
            }
          }}>
            Approve
          </Button>,
        ]}
        width={selectedItem?.itemType === 'beneficiary' ? 1140 : 760}
        className="approval-details-modal"
      >
        {selectedItem && (
          <div className="approval-details">
          <div className={`approval-columns${selectedItem.itemType === 'beneficiary' ? '' : ' single'}`}>
          <div className="approval-main">
        {selectedItem?.itemType === 'beneficiary' && (
          /* Donor-suggested charities arrive with only what the IRS registry
             gave us: name, EIN, city. Approving one of those without filling
             this in leaves it live with placeholder art and no story.
             A charity that registered through the portal fills its own
             profile in, so for those this is usually nine empty boxes and
             pure noise. Hence collapsed unless something is actually
             missing, with the count on the header so it is obvious either
             way. Blank fields are dropped on save, never written as empty. */
          <Collapse
            style={{ marginBottom: 24 }}
            defaultActiveKey={missingProfileFields.length > 0 ? ['fill'] : []}
            items={[{
              key: 'fill',
              label: (
                <Space size={8}>
                  <Text strong>Fill in anything missing</Text>
                  {missingProfileFields.length > 0 ? (
                    <Tag color="orange">{missingProfileFields.length} blank</Tag>
                  ) : (
                    <Tag color="green">Nothing missing</Tag>
                  )}
                </Space>
              ),
              children: (
                <>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
                    Saved when you approve. Anything you leave blank keeps the
                    value the charity already has, so you only need to touch
                    what is wrong or empty.
                  </Text>
                  <div className="approval-fill-grid">
              <Input
                placeholder="Category (e.g. Hunger Relief)"
                value={charityProfile.category || ''}
                onChange={(e) => setCharityProfile((p) => ({ ...p, category: e.target.value }))}
              />
              <Input
                className="full-width"
                placeholder="Short description, the one line shown on the card"
                value={charityProfile.description || ''}
                onChange={(e) => setCharityProfile((p) => ({ ...p, description: e.target.value }))}
              />
              <Input.TextArea
                className="full-width"
                rows={3}
                placeholder="About: who they are and what they do"
                value={charityProfile.about || ''}
                onChange={(e) => setCharityProfile((p) => ({ ...p, about: e.target.value }))}
              />
              <Input
                placeholder="Hero image URL"
                value={charityProfile.imageUrl || ''}
                onChange={(e) => setCharityProfile((p) => ({ ...p, imageUrl: e.target.value }))}
              />
              <Input
                placeholder="Logo URL"
                value={charityProfile.logoUrl || ''}
                onChange={(e) => setCharityProfile((p) => ({ ...p, logoUrl: e.target.value }))}
              />
              <Input
                placeholder="Website"
                value={charityProfile.website || ''}
                onChange={(e) => setCharityProfile((p) => ({ ...p, website: e.target.value }))}
              />
              <Input
                placeholder="Contact name"
                value={charityProfile.contactName || ''}
                onChange={(e) => setCharityProfile((p) => ({ ...p, contactName: e.target.value }))}
              />
              <Input
                placeholder="Phone"
                value={charityProfile.phone || ''}
                onChange={(e) => setCharityProfile((p) => ({ ...p, phone: e.target.value }))}
              />
              <Input
                className="full-width"
                placeholder="Full address, used to place them on the donor map"
                value={charityProfile.location || ''}
                onChange={(e) => setCharityProfile((p) => ({ ...p, location: e.target.value }))}
              />
                  </div>
                </>
              ),
            }]}
          />
        )}

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
                {selectedItem.itemType === 'beneficiary' && (
                  <>
                    <div className="detail-item">
                      <Text strong>EIN:</Text>
                      <Text>{selectedItem.ein || 'Not given'}</Text>
                    </div>
                    <div className="detail-item">
                      <Text strong>Category:</Text>
                      <Text>{selectedItem.category || 'Not given'}</Text>
                    </div>
                    <div className="detail-item">
                      <Text strong>Website:</Text>
                      {selectedItem.website ? (
                        <a href={selectedItem.website} target="_blank" rel="noreferrer noopener">
                          {selectedItem.website}
                        </a>
                      ) : (
                        <Text type="secondary">Not given</Text>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {selectedItem.itemType === 'beneficiary' && (
              <div className="detail-section">
                <Title level={4}>Independent vetting</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
                  The charity had to provide these before it could submit. Open
                  them and check the organisation is listed and in good standing.
                </Text>
                {(selectedItem.vettingLinks || []).length > 0 ? (
                  <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    {(selectedItem.vettingLinks || []).map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer noopener"
                         style={{ wordBreak: 'break-all' }}>
                        {url}
                      </a>
                    ))}
                  </Space>
                ) : (
                  // Pre-dates the requirement, or was added by an admin rather
                  // than through the portal. Worth saying so rather than
                  // showing an empty space that reads as "nothing to check".
                  <Tag color="orange">
                    None on file. This one predates the vetting requirement.
                  </Tag>
                )}
              </div>
            )}

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
            </div>{/* /approval-main */}

            {selectedItem.itemType === 'beneficiary' && (
              <aside className="approval-preview detail-section">
                <Title level={4}>How this looks in the app</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
                  Exactly what a donor would see if you approve it. Judge the
                  crops here rather than from the image links.
                </Text>
                <div style={{ padding: 16, background: '#EFF5F7', border: '1px solid #D9E7EC', borderRadius: 12, overflowX: 'auto' }}>
                  <CharityAppPreview
                    data={{
                      name: selectedItem.name,
                      category: selectedItem.category,
                      location: selectedItem.location,
                      logoUrl: selectedItem.logoUrl,
                      highlightUrl: selectedItem.highlightUrl,
                      coverUrl: selectedItem.coverUrl,
                    }}
                  />
                </div>
                {selectedItem.about && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>What they do</Text>
                    <Text style={{ fontSize: 13 }}>{selectedItem.about}</Text>
                  </div>
                )}
              </aside>
            )}
            </div>{/* /approval-columns */}
            
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default PendingApprovals; 