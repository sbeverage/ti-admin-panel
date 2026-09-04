import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Dropdown, Button, Card, Row, Col, Statistic, Badge, Tabs, Table, Input, List, Tag, Spin, message, DatePicker, Modal, Empty} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import { dashboardAPI } from '../services/api';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  RiseOutlined,
  SettingOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  MenuOutlined,
  ShoppingOutlined,
  BankOutlined,
  GiftOutlined,
  DollarOutlined,
  CheckCircleFilled,
  DownOutlined,
  TeamOutlined,
  GlobalOutlined,
  ReloadOutlined,
  CalculatorOutlined,
  MailOutlined
} from '@ant-design/icons';
import NotificationsDropdown from './NotificationsDropdown';
// The four analytics sections built 2026-05-29. They survived the 09-03 merge
// as files but nothing imported them, so the work sat unrendered in the repo.
import DonorOverviewSection from './DonorOverviewSection';
import DonorChartsSection from './DonorChartsSection';
import DonationOverviewSection from './DonationOverviewSection';
import SavingsOverviewSection from './SavingsOverviewSection';
import './Dashboard.css';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;


const Dashboard: React.FC = () => {
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [selectedTimeFilterKey, setSelectedTimeFilterKey] = useState('1 Month');
  const [selectedTimeFilterLabel, setSelectedTimeFilterLabel] = useState('1 Month');
  const [donorChartFilter, setDonorChartFilter] = useState('1 Month');
  const [donationChartFilter, setDonationChartFilter] = useState('1 Month');
  const [donorChartStats, setDonorChartStats] = useState<{ total: number; active: number; inactive: number; isPeriodScoped?: boolean } | null>(null);
  const [donationChartStats, setDonationChartStats] = useState<{ total: number } | null>(null);
  // Weekly series behind the chart. Previously there was none: the chart was a
  // static CSS bar pinned at top: 50% with hardcoded $0-$1000 axis labels, so
  // it drew an identical flat line regardless of the numbers.
  const [donationSeries, setDonationSeries] = useState<{ label: string; value: number }[]>([]);
  const [donorChartLoading, setDonorChartLoading] = useState(false);
  const [donationChartLoading, setDonationChartLoading] = useState(false);
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<any>(null);
  const [activeApprovalTab, setActiveApprovalTab] = useState('beneficiaries');
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data for the four analytics sections. Each renders from a single nullable
  // prop and shows its own empty state, so a failed fetch degrades to a quiet
  // section rather than breaking the page.
  const [donorOverview, setDonorOverview] = useState<any>(null);
  const [donorCharts, setDonorCharts] = useState<any>(null);
  const [donationOverview, setDonationOverview] = useState<any>(null);
  const [savingsOverview, setSavingsOverview] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Money for a metric card. The previous inline
  // `$${(v / 1000).toFixed(0)}K` rendered every figure below $500 as "$0K" —
  // with real totals in the hundreds that is what made Total Donation and
  // Total Revenue look blank. Abbreviate only once a figure is large enough
  // for the abbreviation to carry information.
  const formatMoney = (value: unknown): string => {
    const n = Number(value ?? 0);
    if (!Number.isFinite(n) || n === 0) return '--';
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const filterLabelToPeriod = (label: string): string => {
    switch (label) {
      case 'All': return 'all';
      case '1 Week': return '7d';
      case '15 Days': return '15d';
      case '1 Month': return '30d';
      case '3 Months': return '90d';
      case '6 Months': return '180d';
      case 'One Year': return '365d';
      default: return '30d';
    }
  };

  const getSelectedPeriod = () => filterLabelToPeriod(selectedTimeFilterKey);

  // Load donor chart data independently
  const loadDonorChartData = async (period: string) => {
    setDonorChartLoading(true);
    try {
      const { donorAPI } = await import('../services/api');
      const resp = await donorAPI.getDonors(1, 1000);
      const donors: any[] = resp.data || [];
      let filtered = donors;
      if (period !== 'all') {
        const days = parseInt(period.replace('d', ''), 10) || 30;
        const start = new Date();
        start.setDate(start.getDate() - days);
        filtered = donors.filter((d: any) => {
          const created = d.created_at ? new Date(d.created_at) : null;
          return created && !isNaN(created.getTime()) && created >= start;
        });
      }
      // Same fault the Active Donors card had: these three fields don't exist
      // on the donors response. It returns subscription_status, a string — so
      // active was always 0 and the donut read "0 Active / 5 In-Active" while
      // the card above it said 7 active.
      const ACTIVE = ['active', 'trialing'];
      let active = 0, inactive = 0;
      filtered.forEach((d: any) => {
        const status = String(d.subscription_status || '').toLowerCase();
        if (ACTIVE.includes(status)) active++; else inactive++;
      });
      // `filtered` is donors who JOINED in the window, so calling it "Total
      // Donors" contradicted the Total Donors card (23). Flagged so the label
      // can say what it actually is.
      setDonorChartStats({ total: filtered.length, active, inactive, isPeriodScoped: period !== 'all' });
    } catch {
      // keep existing stats on error
    } finally {
      setDonorChartLoading(false);
    }
  };

  // Load donation chart data independently
  const loadDonationChartData = async (period: string) => {
    setDonationChartLoading(true);
    try {
      // This only refreshed the headline total, leaving the series from the
      // page-level load in place — so picking "6 Months" showed a 6-month total
      // above a 30-day, five-week line. Both now come from the same period.
      const { dashboardAPI } = await import('../services/api');
      const [statsResp, chartResp] = await Promise.all([
        dashboardAPI.getDashboardStats(period),
        dashboardAPI.getChartData('donations', period).catch(() => null as any),
      ]);
      const total = statsResp?.data?.totalDonations || statsResp?.data?.totalRevenue || 0;
      setDonationChartStats({ total });
      if (Array.isArray(chartResp?.data?.series)) {
        setDonationSeries(chartResp.data.series);
        setDashboardStats((prev: any) => ({
          ...(prev || {}),
          donationsAverage: chartResp.data.average ?? chartResp.data.weeklyAverage ?? 0,
          donationsTrend: chartResp.data.trend ?? chartResp.data.growthPercentage ?? null,
          // Buckets adapt to the period, so the average is per bucket — saying
          // "/week" for a six-month view (30-day buckets) would be wrong.
          donationsBucketUnit: chartResp.data.bucketUnit || 'week',
        }));
      }
    } catch {
      // keep existing stats on error
    } finally {
      setDonationChartLoading(false);
    }
  };

  // Get start date for period filtering (records created on or after this date)
  const getPeriodStartDate = (): Date | null => {
    const period = getSelectedPeriod();
    if (period === 'all') return null;
    const now = new Date();
    const days = parseInt(period.replace('d', ''), 10) || 30;
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    return start;
  };

  // Filter records by created_at/createdAt within the selected period
  const filterByPeriod = <T extends { created_at?: string; createdAt?: string }>(items: T[]): T[] => {
    const start = getPeriodStartDate();
    if (!start || !items?.length) return items || [];
    return items.filter((item) => {
      const dateStr = (item as any).created_at ?? (item as any).createdAt;
      const created = dateStr ? new Date(dateStr) : null;
      return created && !isNaN(created.getTime()) && created >= start;
    });
  };

  // Load dashboard data from API
  /**
   * Fetch the four analytics sections.
   *
   * Kept separate from loadDashboardData and never awaited by it: these are
   * four independent queries and a slow or failing one must not hold up the
   * cards at the top of the page. Each failure resolves to null, which the
   * section renders as its own empty state.
   */
  const loadAnalyticsSections = async () => {
    const [overview, charts, donations, savings] = await Promise.all([
      dashboardAPI.getDonorOverview().catch(() => null),
      dashboardAPI.getDonorCharts().catch(() => null),
      dashboardAPI.getDonationOverview().catch(() => null),
      dashboardAPI.getSavingsOverview().catch(() => null),
    ]);
    setDonorOverview(overview?.success ? overview.data : null);
    setDonorCharts(charts?.success ? charts.data : null);
    setDonationOverview(donations?.success ? donations.data : null);
    setSavingsOverview(savings?.success ? savings.data : null);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    // Fire-and-forget so the sections fill in as they arrive.
    loadAnalyticsSections();
    
    try {
      const selectedPeriod = getSelectedPeriod();
      
      // Import API functions
      const { dashboardAPI, approvalsAPI, vendorAPI, beneficiaryAPI, donorAPI } = await import('../services/api');
      const { getChartData } = dashboardAPI;
      
      // Load dashboard stats, approvals, chart data; fetch full lists for period filtering
      const [statsResponse, approvalsResponse, vendorsResponse, beneficiariesResponse, donorsResponse, donationsChartData] = await Promise.all([
        dashboardAPI.getDashboardStats(selectedPeriod).catch(() => ({ success: false, data: null })),
        approvalsAPI.getPendingApprovals(1, 10).catch(() => ({ success: false, data: [], pagination: { total: 0 } })),
        vendorAPI.getVendors(1, 1000).catch(() => ({ success: false, data: [], pagination: { total: 0 } })),
        beneficiaryAPI.getBeneficiaries(1, 1000, { includeInactive: true }).catch(() => ({ success: false, data: [], pagination: { total: 0 } })),
        donorAPI.getDonors(1, 1000).catch(() => ({ success: false, data: [], pagination: { total: 0 } })),
        getChartData('donations', selectedPeriod).catch(() => ({ success: false, data: null }))
      ]);
      
      // Apply period filter to counts (when period !== 'all')
      const donorsInPeriod = filterByPeriod(donorsResponse.data || []);
      const vendorsInPeriod = filterByPeriod(vendorsResponse.data || []);
      const beneficiariesInPeriod = filterByPeriod(beneficiariesResponse.data || []);

      // Active vs inactive donors. This used to test donor.monthly_donation
      // ?.active / donor.subscription?.active / donor.has_active_subscription —
      // none of which the donors API returns. It returns subscription_status,
      // a string. So the count was always 0 and the Active Donors card rendered
      // "--" on every period except "all".
      const ACTIVE_SUB_STATUSES = ['active', 'trialing'];
      let activeDonorsCount = 0;
      let inactiveDonorsCount = 0;
      (donorsResponse.data || []).forEach((donor: any) => {
        const status = String(donor.subscription_status || '').toLowerCase();
        if (ACTIVE_SUB_STATUSES.includes(status)) activeDonorsCount++;
        else inactiveDonorsCount++;
      });

      const periodFiltered = selectedPeriod !== 'all';
      const totalDonorsCount = periodFiltered ? donorsInPeriod.length : (donorsResponse.pagination?.total ?? donorsResponse.data?.length ?? 0);
      const totalVendorsCount = periodFiltered ? vendorsInPeriod.length : (vendorsResponse.pagination?.total ?? vendorsResponse.data?.length ?? 0);
      const totalBeneficiariesCount = periodFiltered ? beneficiariesInPeriod.length : (beneficiariesResponse.pagination?.total ?? beneficiariesResponse.data?.length ?? 0);

      // The stats endpoint is period-aware, so use it whenever it responded —
      // the old `&& !periodFiltered` meant that on the default "1 Month" view
      // every figure only it can supply (donations, revenue, one-time gifts,
      // active discounts) was dropped and rendered "--".
      let stats: any = {};
      if (statsResponse.success && statsResponse.data) {
        stats = {
          totalVendors: statsResponse.data.totalVendors ?? totalVendorsCount,
          // Every donor account regardless of subscription state, from the
          // endpoint. Falls back to the local count only if absent.
          totalDonors: statsResponse.data.totalDonors ?? totalDonorsCount,
          newDonorsInPeriod: statsResponse.data.newDonorsInPeriod ?? donorsInPeriod.length,
          totalBeneficiaries: statsResponse.data.totalBeneficiaries ?? totalBeneficiariesCount,
          totalTenants: statsResponse.data.totalTenants || 0,
          totalRevenue: statsResponse.data.totalRevenue || statsResponse.data.totalDonations || 0,
          totalDonations: statsResponse.data.totalDonations || statsResponse.data.totalRevenue || 0,
          totalOneTimeGift: statsResponse.data.totalOneTimeGift || 0,
          activeDonors: statsResponse.data.activeDonors ?? activeDonorsCount,
          inactiveDonors: statsResponse.data.inactiveDonors ?? inactiveDonorsCount,
          // The endpoint counts vendors AND beneficiaries awaiting a decision.
          // approvalsResponse is the vendor-only queue, so it undercounted.
          pendingApprovals:
            statsResponse.data.pendingApprovals ?? (approvalsResponse.pagination?.total || 0),
          activeDiscounts: statsResponse.data.activeDiscounts || 0,
          donationsAverage: donationsChartData.data?.average || donationsChartData.data?.weeklyAverage || 0,
          // trend can legitimately be null (no prior period to compare), which
          // is different from 0% — keep the distinction.
          donationsTrend:
            donationsChartData.data?.trend ?? donationsChartData.data?.growthPercentage ?? null,
          donationsBucketUnit: donationsChartData.data?.bucketUnit || 'week',
        };
      } else {
        stats = {
          totalVendors: totalVendorsCount,
          totalDonors: totalDonorsCount,
          totalBeneficiaries: totalBeneficiariesCount,
          totalTenants: 0,
          totalRevenue: statsResponse.data?.totalRevenue || statsResponse.data?.totalDonations || 0,
          totalDonations: statsResponse.data?.totalDonations || statsResponse.data?.totalRevenue || 0,
          totalOneTimeGift: statsResponse.data?.totalOneTimeGift || 0,
          activeDonors: activeDonorsCount,
          inactiveDonors: inactiveDonorsCount,
          pendingApprovals: approvalsResponse.pagination?.total || 0,
          activeDiscounts: statsResponse.data?.activeDiscounts || 0,
          donationsAverage: donationsChartData.data?.average || donationsChartData.data?.weeklyAverage || 0,
          donationsTrend: donationsChartData.data?.trend || donationsChartData.data?.growthPercentage || 0,
        };
      }
      
      setDashboardStats(stats);
      setDonationSeries(
        Array.isArray((donationsChartData as any)?.data?.series)
          ? (donationsChartData as any).data.series
          : [],
      );
      
      // Load recent approvals data with proper city/state parsing and logos
      const recentBeneficiaries = beneficiariesResponse.data?.slice(0, 5).map((b: any) => {
        let cityState = 'N/A';
        if (b.address) {
          const city = b.address.city || '';
          const state = b.address.state || '';
          if (city && state) {
            cityState = `${city}, ${state}`;
          } else if (city) {
            cityState = city;
          } else if (state) {
            cityState = state;
          }
        }
        
        return {
          id: b.id,
          key: b.id?.toString() || Math.random().toString(),
          beneficiary: b.name || 'Unknown',
          email: b.email || 'N/A',
          cityState: cityState,
          cause: b.category || 'N/A',
          active: b.is_active !== false,
          enabled: b.is_enabled !== false,
          logo: b.logo_url || b.logo || null,
        };
      }) || [];
      
      const recentVendors = vendorsResponse.data?.slice(0, 5).map((v: any) => {
        let cityState = 'N/A';
        if (v.address) {
          const city = v.address.city || '';
          const state = v.address.state || '';
          if (city && state) {
            cityState = `${city}, ${state}`;
          } else if (city) {
            cityState = city;
          } else if (state) {
            cityState = state;
          }
        }
        
        return {
          id: v.id,
          key: v.id?.toString() || Math.random().toString(),
          beneficiary: v.name || 'Unknown',
          email: v.email || 'N/A',
          cityState: cityState,
          cause: v.category || 'N/A',
          active: v.is_active !== false,
          enabled: v.is_enabled !== false,
          logo: v.logo_url || v.logo || null,
        };
      }) || [];
      
      setApprovalsData(activeApprovalTab === 'beneficiaries' ? recentBeneficiaries : recentVendors);
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      setDashboardStats({
        totalVendors: 0,
        totalDonors: 0,
        totalBeneficiaries: 0,
        totalTenants: 0,
        totalRevenue: 0,
        totalDonations: 0,
        totalOneTimeGift: 0,
        activeDonors: 0,
        pendingApprovals: 0,
        activeDiscounts: 0,
      });
      setApprovalsData([]);
    } finally {
      setLoading(false);
    }
  };


  // Load data on component mount and when navigating back to dashboard
  
  // Refresh dashboard data when the page becomes visible (e.g., after creating a vendor)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const [approvalsData, setApprovalsData] = useState<any[]>([]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleTimeFilterChange = (key: string) => {
    if (key === 'Custom Date') {
      setCustomDateOpen(true);
      return;
    }

    setSelectedTimeFilterKey(key);
    setSelectedTimeFilterLabel(key);
  };

  const handleCustomDateApply = () => {
    if (customDateRange?.[0] && customDateRange?.[1]) {
      const start = customDateRange[0].format('MM/DD/YYYY');
      const end = customDateRange[1].format('MM/DD/YYYY');
      setSelectedTimeFilterKey('Custom Date');
      setSelectedTimeFilterLabel(`${start} - ${end}`);
      // Custom date range not supported by backend yet; data shows latest period
    }
    setCustomDateOpen(false);
  };

  const handleToggleChange = async (record: any, field: 'active' | 'enabled') => {
    const nextValue = !record[field];
    const targetId = Number(record.id ?? record.key ?? record.rawData?.id);
    if (!targetId || isNaN(targetId)) {
      message.error('Invalid record ID.');
      return;
    }

    setApprovalsData(prevData =>
      prevData.map(item =>
        item.key === record.key
          ? { ...item, [field]: nextValue }
          : item
      )
    );

    try {
      const { vendorAPI, beneficiaryAPI } = await import('../services/api');

      if (activeApprovalTab === 'beneficiaries') {
        // Backend expects isActive (camelCase); charities only have is_active (both toggles map to it)
        const payload = { is_active: nextValue, isActive: nextValue };
        const response = await beneficiaryAPI.updateBeneficiary(targetId, payload);
        if (response?.success === false) {
          throw new Error(response?.error || 'Failed to update beneficiary');
        }
      } else {
        let response;
        if (field === 'active') {
          response = await vendorAPI.updateVendorStatus(targetId, nextValue ? 'active' : 'inactive');
        } else {
          response = await vendorAPI.updateVendor(targetId, { is_enabled: nextValue });
        }
        if (response?.success === false) {
          throw new Error(response?.error || 'Failed to update vendor');
        }
      }

      const label = activeApprovalTab === 'beneficiaries' ? 'Beneficiary' : 'Vendor';
      const statusText = field === 'active'
        ? (nextValue ? 'activated' : 'deactivated')
        : (nextValue ? 'enabled' : 'disabled');
      message.success(`${label} ${statusText}.`);
      // Refresh from server to ensure UI stays in sync
      loadApprovalsData();
    } catch (error: any) {
      console.error('Toggle update error:', error);
      setApprovalsData(prevData =>
        prevData.map(item =>
          item.key === record.key
            ? { ...item, [field]: !nextValue }
            : item
        )
      );
      message.error(error?.message || `Failed to update ${field} status.`);
    }
  };

  const handleViewAllBeneficiaries = () => {
    navigate('/beneficiaries');
  };

  // Load approvals data when tab changes or dashboard stats load
  useEffect(() => {
    if (dashboardStats) {
      loadApprovalsData();
    }
  }, [activeApprovalTab, dashboardStats]);

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeFilterKey]);

  useEffect(() => {
    loadDonorChartData(filterLabelToPeriod(donorChartFilter));
  }, [donorChartFilter]);

  useEffect(() => {
    loadDonationChartData(filterLabelToPeriod(donationChartFilter));
  }, [donationChartFilter]);

  const loadApprovalsData = async () => {
    try {
      const { vendorAPI, beneficiaryAPI } = await import('../services/api');
      
      if (activeApprovalTab === 'beneficiaries') {
        const response = await beneficiaryAPI.getBeneficiaries(1, 5, { includeInactive: true }).catch(() => ({ success: false, data: [] }));
        if (response.success && response.data) {
          const data = response.data.map((b: any) => {
            let cityState = 'N/A';
            if (b.address) {
              const city = b.address.city || '';
              const state = b.address.state || '';
              if (city && state) {
                cityState = `${city}, ${state}`;
              } else if (city) {
                cityState = city;
              } else if (state) {
                cityState = state;
              }
            }
            
            return {
              id: b.id,
              key: b.id?.toString() || Math.random().toString(),
              beneficiary: b.name || 'Unknown',
              email: b.email || 'N/A',
              cityState: cityState,
              cause: b.category || 'N/A',
              active: (b.is_active ?? b.isActive) !== false,
              enabled: (b.is_enabled ?? b.isEnabled ?? b.is_active ?? b.isActive) !== false,
              logo: b.logo_url || b.logo || null,
            };
          });
          setApprovalsData(data);
        }
      } else {
        const response = await vendorAPI.getVendors(1, 5).catch(() => ({ success: false, data: [] }));
        if (response.success && response.data) {
          const data = response.data.map((v: any) => {
            let cityState = 'N/A';
            if (v.address) {
              const city = v.address.city || '';
              const state = v.address.state || '';
              if (city && state) {
                cityState = `${city}, ${state}`;
              } else if (city) {
                cityState = city;
              } else if (state) {
                cityState = state;
              }
            }
            
            return {
              id: v.id,
              key: v.id?.toString() || Math.random().toString(),
              beneficiary: v.name || 'Unknown',
              email: v.email || 'N/A',
              cityState: cityState,
              cause: v.category || 'N/A',
              active: v.is_active !== false,
              enabled: v.is_enabled !== false,
              logo: v.logo_url || v.logo || null,
            };
          });
          setApprovalsData(data);
        }
      }
    } catch (error) {
      console.error('Error loading approvals data:', error);
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
    } else if (key === 'discounts') {
      navigate('/discounts');
    } else if (key === 'pending-approvals') {
      navigate('/pending-approvals');
    } else if (key === 'invitations') {
      navigate('/invitations');
    } else if (key === 'referral-analytics') {
      navigate('/referral-analytics');
    } else if (key === 'geographic-analytics') {
      navigate('/geographic-analytics');
    } else if (key === 'reporting') {
      navigate('/reporting');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  const timeFilterOptions = [
    'All',
    '1 Week',
    '15 Days',
    '1 Month',
    '3 Months',
    '6 Months',
    'One Year',
    'Custom Date'
  ];

  const timeFilterMenu = {
    selectedKeys: [selectedTimeFilterKey],
    items: timeFilterOptions.map((option) => ({
      key: option,
      label: option,
      icon: selectedTimeFilterKey === option
        ? <CheckCircleFilled style={{ color: '#DB8633' }} />
        : undefined,
      onClick: () => handleTimeFilterChange(option)
    }))
  };

  const donorChartFilterMenu = {
    selectedKeys: [donorChartFilter],
    items: timeFilterOptions.filter(o => o !== 'Custom Date').map((option) => ({
      key: option,
      label: option,
      icon: donorChartFilter === option
        ? <CheckCircleFilled style={{ color: '#DB8633' }} />
        : undefined,
      onClick: () => setDonorChartFilter(option)
    }))
  };

  const donationChartFilterMenu = {
    selectedKeys: [donationChartFilter],
    items: timeFilterOptions.filter(o => o !== 'Custom Date').map((option) => ({
      key: option,
      label: option,
      icon: donationChartFilter === option
        ? <CheckCircleFilled style={{ color: '#DB8633' }} />
        : undefined,
      onClick: () => setDonationChartFilter(option)
    }))
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

  const summaryCards = [
    { 
      title: 'Total Donors', 
      value: dashboardStats?.totalDonors || '--', 
      icon: <UserOutlined />, 
      growth: '+92.3' 
    },
    { 
      title: 'Total Vendors', 
      value: dashboardStats?.totalVendors || '--', 
      icon: <ShoppingOutlined />, 
      growth: '+92.3' 
    },
    { 
      title: 'Total Beneficiaries', 
      value: dashboardStats?.totalBeneficiaries || '--', 
      icon: <StarOutlined />, 
      growth: '+92.3' 
    },
    { 
      title: 'Active Users', 
      value: dashboardStats?.activeUsers || '--', 
      icon: <TeamOutlined />, 
      growth: '+92.3' 
    },
    { 
      title: 'Monthly Donations', 
      value: formatMoney(dashboardStats?.monthlyDonations), 
      icon: <GiftOutlined />, 
      growth: '+92.3' 
    },
    { 
      title: 'Total Donations', 
      value: formatMoney(dashboardStats?.totalDonations), 
      icon: <DollarOutlined />, 
      growth: '+92.3' 
    },
  ];

  const recentApprovals: any[] = [];

  const beneficiaryColumns = [
    {
      title: 'Beneficiary name',
      dataIndex: 'beneficiary',
      key: 'beneficiary',
      render: (text: string, record: any) => (
        <Space>
          {record.logo ? (
            <Avatar src={record.logo} size={32} shape="square" />
          ) : (
            <Avatar size={32} style={{ backgroundColor: '#DB8633' }}>
              {text ? text.charAt(0).toUpperCase() : 'B'}
            </Avatar>
          )}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Emails',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'City, State',
      dataIndex: 'cityState',
      key: 'cityState',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Beneficiary cause',
      dataIndex: 'cause',
      key: 'cause',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Active/De-active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: any) => (
        <div className="toggle-switch">
          <div 
            className={`toggle ${active ? 'active' : 'inactive'}`}
            onClick={() => handleToggleChange(record, 'active')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Enable/Disable',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: any) => (
        <div className="toggle-switch">
          <div 
            className={`toggle ${enabled ? 'active' : 'inactive'}`}
            onClick={() => handleToggleChange(record, 'enabled')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
    },
  ];

  const vendorColumns = [
    {
      title: 'Vendor name',
      dataIndex: 'beneficiary',
      key: 'beneficiary',
      render: (text: string, record: any) => (
        <Space>
          {record.logo ? (
            <Avatar src={record.logo} size={32} shape="square" />
          ) : (
            <Avatar size={32} style={{ backgroundColor: '#DB8633' }}>
              {text ? text.charAt(0).toUpperCase() : 'V'}
            </Avatar>
          )}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Emails',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'City, State',
      dataIndex: 'cityState',
      key: 'cityState',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Vendor type',
      dataIndex: 'cause',
      key: 'cause',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Active/De-active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: any) => (
        <div className="toggle-switch">
          <div 
            className={`toggle ${active ? 'active' : 'inactive'}`}
            onClick={() => handleToggleChange(record, 'active')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Enable/Disable',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: any) => (
        <div className="toggle-switch">
          <div 
            className={`toggle ${enabled ? 'active' : 'inactive'}`}
            onClick={() => handleToggleChange(record, 'enabled')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
    },
  ];


  const columns = [
    {
      title: 'Beneficiary name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Emails',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'City, State',
      dataIndex: 'cityState',
      key: 'cityState',
    },
    {
      title: 'Beneficiary cause',
      dataIndex: 'cause',
      key: 'cause',
    },
    {
      title: 'Active/De-active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Badge
          status={active ? 'success' : 'default'}
          text={active ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      title: 'Enable/Disable',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Badge
          status={enabled ? 'success' : 'default'}
          text={enabled ? 'Enabled' : 'Disabled'}
        />
      ),
    },
  ];

  const toggleMobileSidebar = () => {
    setMobileSidebarVisible(!mobileSidebarVisible);
  };

  return (
    <Layout className="donors-layout">
      {/* Mobile Menu Button - Right Side */}
      <Button
        className="mobile-menu-btn-right"
        icon={<MenuOutlined />}
        onClick={toggleMobileSidebar}
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
        width={280}
        className={`standard-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
        trigger={null}
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
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[location.pathname === '/dashboard' ? 'dashboard' : '']}
          items={menuItems}
          className="standard-menu"
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      {/* Main Content */}
      <Layout className="standard-main-content">
        <Header className="dashboard-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
            {dashboardStats && (
              <Text type="secondary" style={{ marginLeft: 16 }}>
                {dashboardStats.totalVendors} Vendors • {dashboardStats.totalDonors} Donors • {dashboardStats.totalBeneficiaries} Beneficiaries
              </Text>
            )}
          </div>
          <div className="header-actions">
            <Button 
              type="text" 
              icon={<ReloadOutlined spin={loading} />}
              onClick={() => {
                message.info('Refreshing dashboard...');
                loadDashboardData();
              }}
              title="Refresh Dashboard"
            >
              Refresh
            </Button>
            <NotificationsDropdown />
          </div>
        </Header>

        <Content className="dashboard-content">
          <Spin spinning={loading}>
            {/* Top Section - 3 Rows of Summary Cards */}
            <div className="summary-section">
              <div className="summary-header">
                <Typography.Title level={2} className="summary-title">Dashboard Overview</Typography.Title>
                <Dropdown
                  menu={timeFilterMenu}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button className="time-filter-button">
                    <CalendarOutlined />
                    <span>{selectedTimeFilterLabel}</span>
                    <DownOutlined />
                  </Button>
                </Dropdown>
              </div>

              <Row gutter={[16, 16]} className="summary-cards">
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total Donors"
                      value={dashboardStats?.totalDonors || '--'}
                      prefix={<UserOutlined style={{ color: '#DB8633' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total Vendors"
                      value={dashboardStats?.totalVendors || '--'}
                      prefix={<ShoppingOutlined style={{ color: '#DB8633' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total Beneficiaries"
                      value={dashboardStats?.totalBeneficiaries || '--'}
                      prefix={<StarOutlined style={{ color: '#DB8633' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Card className="summary-card">
                    <Statistic
                      title="Active Donors"
                      value={dashboardStats?.activeDonors || '--'}
                      prefix={<UserOutlined style={{ color: '#DB8633' }} />}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="summary-cards">
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total Donation"
                      value={formatMoney(dashboardStats?.totalDonations)}
                      prefix={<DollarOutlined style={{ color: '#DB8633' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total Revenue"
                      value={formatMoney(dashboardStats?.totalRevenue)}
                      prefix={<DollarOutlined style={{ color: '#DB8633' }} />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Pending Approvals"
                      value={dashboardStats?.pendingApprovals || '--'}
                      prefix={<ExclamationCircleOutlined style={{ color: '#DB8633' }} />}
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Analytics sections, built 2026-05-29 and restored 2026-09-04.
                These replace the Insights block that sat here: Insights was
                originally removed in May for being donut and line-chart
                placeholders, rebuilt on 09-01 against live data, and is now
                retired again in favour of these four, which cover the same
                ground plus donor sources, location breakdowns, recurring vs
                one-time, and savings by vendor.

                Recent Approvals below is deliberately kept — May removed it,
                Stephanie wants it for now. */}
            <DonorOverviewSection overview={donorOverview} />
            <DonorChartsSection data={donorCharts} />
            <DonationOverviewSection data={donationOverview} />
            <SavingsOverviewSection data={savingsOverview} />

            {/* Recent Approvals - Full Width Section */}
            <Row className="approvals-section">
              <Col span={24}>
                <Card className="approvals-card">
                  <div className="tab-header">
                    <Typography.Title level={2}>Recent Approvals</Typography.Title>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => activeApprovalTab === 'beneficiaries' ? navigate('/beneficiaries') : navigate('/vendor')}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          (activeApprovalTab === 'beneficiaries' ? navigate('/beneficiaries') : navigate('/vendor'));
                        }
                      }}
                      className="view-all-link"
                      style={{ color: '#DB8633' }}
                    >
                      View all {activeApprovalTab === 'beneficiaries' ? 'Beneficiaries' : 'Vendors'}
                    </span>
                  </div>
                  <Tabs 
                    activeKey={activeApprovalTab} 
                    onChange={setActiveApprovalTab} 
                    className="approvals-tabs"
                    style={{
                      '--ant-tabs-ink-bar-color': 'transparent',
                    } as React.CSSProperties}
                    tabBarStyle={{
                      marginBottom: '24px',
                    }}
                    items={[
                      {
                        key: 'beneficiaries',
                        label: (
                          <span style={{ color: '#DB8633' }}>
                            Beneficiaries
                          </span>
                        ),
                        children: (
                          <Table
                            dataSource={approvalsData}
                            columns={beneficiaryColumns}
                            pagination={false}
                            size="small"
                            className="approvals-table"
                          />
                        )
                      },
                      {
                        key: 'vendors', 
                        label: (
                          <span style={{ color: '#DB8633' }}>
                            Vendors
                          </span>
                        ),
                        children: (
                          <Table
                            dataSource={approvalsData}
                            columns={vendorColumns}
                            pagination={false}
                            size="small"
                            className="approvals-table"
                          />
                        )
                      }
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          </Spin>
        </Content>
      </Layout>

      <Modal
        title="Select Custom Date Range"
        open={customDateOpen}
        onCancel={() => setCustomDateOpen(false)}
        onOk={handleCustomDateApply}
        okText="Apply"
      >
        <DatePicker.RangePicker
          style={{ width: '100%' }}
          onChange={(range) => setCustomDateRange(range)}
          value={customDateRange}
        />
      </Modal>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarVisible && (
        <div className="mobile-sidebar-overlay" onClick={toggleMobileSidebar} />
      )}
    </Layout>
  );
};

export default Dashboard; // Dashboard update: Tue Oct 21 09:59:30 EDT 2025
