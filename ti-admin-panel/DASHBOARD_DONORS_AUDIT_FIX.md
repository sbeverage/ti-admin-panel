# Dashboard & Donors Audit & Fix Plan

## Issues Found

### Dashboard:
1. ❌ Not using `dashboardAPI.getDashboardStats()` - calculating from individual endpoints
2. ❌ Missing card next to "Total Donation" (row 2 only has 2 cards)
3. ❌ Newsfeed section still present (should be removed for MVP)
4. ❌ Pending approvals not loaded from API
5. ❌ Recent approvals data is empty array
6. ❌ Hyperlink colors not using brand color (#DB8633)
7. ❌ Hardcoded growth percentages (should come from backend)

### Donors:
1. ❌ Filters have hardcoded data (beneficiaries, cities)
2. ❌ Filters don't actually filter the data when selected
3. ❌ Duration filter missing 9 months and 12 months
4. ❌ No coworking filter (yes/no)
5. ❌ Search doesn't work

## Fix Plan

### Dashboard Fixes:
1. Use `dashboardAPI.getDashboardStats()` for all stats
2. Load pending approvals from `approvalsAPI.getPendingApprovals()`
3. Load recent approvals (beneficiaries and vendors) from API
4. Remove Newsfeed section completely
5. Add missing card in row 2 (Total Beneficiaries or similar)
6. Update hyperlink colors to #DB8633
7. Remove hardcoded growth percentages or get from backend

### Donors Fixes:
1. Load beneficiaries list from `beneficiaryAPI.getBeneficiaries()` for filter
2. Extract unique cities/states from donor data for location filter
3. Make all filters functional - filter data when selected
4. Add 9 months and 12 months to duration filter
5. Add coworking filter (Yes/No)
6. Make search functional

