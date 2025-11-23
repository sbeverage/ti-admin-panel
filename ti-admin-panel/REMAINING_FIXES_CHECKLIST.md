# 🔧 Remaining Fixes Checklist

**Based on Comprehensive Audit**  
**Date:** 2025-01-23  
**Status:** In Progress

---

## ✅ Already Fixed

1. ✅ **Beneficiary Field Mappings** - Fixed to use exact database field names
2. ✅ **Beneficiary Profile Display** - Fixed to fetch and display all fields
3. ✅ **Discount Field Mappings** - Fixed to send both snake_case and camelCase
4. ✅ **Events Removal** - Completely removed from admin panel
5. ✅ **Discounts Page** - Fully implemented with CRUD operations

---

## 🔴 Critical Issues (High Priority)

### 1. **Image Upload Backend Endpoints** ⚠️
**Status:** Backend needs to implement

**Issue:** Frontend uses `/api/admin/storage/upload` and `/api/admin/storage/delete` endpoints which may not exist.

**Impact:** Image uploads for beneficiaries, vendors, and discounts won't work.

**Fix Required:**
- [ ] Implement `/api/admin/storage/upload` endpoint (see `SUPABASE_STORAGE_BACKEND_ENDPOINTS.md`)
- [ ] Implement `/api/admin/storage/delete` endpoint
- [ ] Test image uploads for:
  - [ ] Beneficiary main image
  - [ ] Beneficiary logo
  - [ ] Beneficiary additional images
  - [ ] Vendor logo
  - [ ] Vendor product images
  - [ ] Form 990 uploads

**Documentation:** `SUPABASE_STORAGE_BACKEND_ENDPOINTS.md` has full specifications

---

### 2. **Donor Address Structure** ⚠️
**Status:** Needs verification

**Issue:** Frontend sends `address` as object with `city`, `state`, `zipCode`, but backend may expect different structure.

**Current Frontend Code:**
```typescript
// InviteDonorModal.tsx sends:
{
  city: values.city,
  state: values.state,
  zipCode: values.zipCode,
  cityState: `${city}, ${state} ${zipCode}`,
  location: cityState
}
```

**Fix Required:**
- [ ] Verify backend `users` table schema for address fields
- [ ] Check if backend expects:
  - Separate fields: `city`, `state`, `zip_code`
  - JSON object: `address: {city, state, zipCode}`
  - Single field: `address` or `location`
- [ ] Update `InviteDonorModal.tsx` to match backend structure
- [ ] Update `EditDonorModal.tsx` to match backend structure
- [ ] Test donor creation and update

---

### 3. **Profile Links Format** ⚠️
**Status:** Needs verification

**Issue:** Frontend sends `profile_links` as array `[{channel, username}]`, but backend may expect JSON string.

**Current Frontend Code:**
```typescript
// InviteBeneficiaryModal.tsx sends:
profile_links: [
  {channel: 'facebook', username: 'username'},
  {channel: 'twitter', username: 'username'}
]
```

**Fix Required:**
- [ ] Verify backend `charities` table schema for `profile_links` column type
- [ ] Check if backend expects:
  - Array: `[{channel, username}]`
  - JSON string: `'[{"channel":"facebook","username":"user"}]'`
  - Separate columns: `profile_link_1`, `profile_link_2`, etc.
- [ ] Update `InviteBeneficiaryModal.tsx` to match backend format
- [ ] Update `BeneficiaryProfile.tsx` to handle backend format
- [ ] Test profile links save and display

---

### 4. **Tenants Invite Modal** ⚠️
**Status:** Missing component

**Issue:** Audit found no `InviteTenantModal.tsx` component, but Tenants page may need invite functionality.

**Fix Required:**
- [ ] Check if Tenants page has invite button
- [ ] Verify if tenants are created through another method
- [ ] If invite modal needed:
  - [ ] Create `InviteTenantModal.tsx`
  - [ ] Add invite button to `Tenants.tsx`
  - [ ] Implement tenant creation API call
  - [ ] Verify backend endpoint exists: `POST /api/admin/tenants`

---

### 5. **Geocoding for Beneficiaries** ⚠️
**Status:** Backend should handle

**Issue:** Frontend sets `latitude` and `longitude` to `null` because geocoding has CORS issues.

**Impact:** Beneficiaries won't show on maps in the app.

**Current Frontend Code:**
```typescript
// InviteBeneficiaryModal.tsx sets:
latitude: null,
longitude: null
```

**Fix Required:**
- [ ] Backend should implement geocoding from address
- [ ] Backend should geocode when creating/updating beneficiary
- [ ] Or create backend endpoint: `POST /api/admin/geocode` that frontend can call
- [ ] Update backend to populate `latitude` and `longitude` from `city`, `state`, `zip_code`, `location`
- [ ] Test beneficiary creation with address → verify coordinates populated

---

## ⚠️ Warning Issues (Medium Priority)

### 6. **Beneficiary Field Name Verification** ⚠️
**Status:** Fixed but needs testing

**Issue:** We fixed field mappings, but need to verify backend actually accepts the field names we're sending.

**Fix Required:**
- [ ] Test beneficiary creation with all fields
- [ ] Verify backend saves all fields correctly
- [ ] Check backend response to ensure all fields are returned
- [ ] Verify beneficiary profile displays all saved data
- [ ] Test beneficiary update with all fields

---

### 7. **Discount Field Name Verification** ⚠️
**Status:** Fixed but needs testing

**Issue:** We're sending both snake_case and camelCase, but need to verify backend accepts them.

**Fix Required:**
- [ ] Test discount creation
- [ ] Verify backend saves discount correctly
- [ ] Check which field names backend actually uses
- [ ] Remove unnecessary field names if backend only accepts one format
- [ ] Test discount update

---

### 8. **Vendor Image Uploads** ⚠️
**Status:** Needs testing

**Issue:** Vendor invite modal has image uploads, but need to verify they work with backend endpoints.

**Fix Required:**
- [ ] Test vendor logo upload
- [ ] Test vendor product images upload
- [ ] Verify images display in vendor profile
- [ ] Test image deletion

---

### 9. **Form 990 Upload** ⚠️
**Status:** Needs testing

**Issue:** Beneficiary invite form has Form 990 upload, but need to verify it saves correctly.

**Fix Required:**
- [ ] Test Form 990 file upload
- [ ] Verify backend saves file correctly
- [ ] Check if file is stored in Supabase Storage or database
- [ ] Verify file can be downloaded/viewed later

---

## 📋 Data Flow Verification Needed

### Create Flow Testing
- [ ] **Beneficiaries:** Create → Verify all fields saved → View profile → Verify all fields display
- [ ] **Donors:** Create → Verify address saved correctly → View profile → Verify all fields display
- [ ] **Vendors:** Create → Verify images upload → View profile → Verify all data displays
- [ ] **Discounts:** Create → Verify all fields saved → View in table → Verify displays correctly
- [ ] **Tenants:** Create (if modal exists) → Verify all fields saved

### Update Flow Testing
- [ ] **Beneficiaries:** Edit profile → Save → Verify changes persist → Refresh → Verify still saved
- [ ] **Donors:** Edit profile → Save → Verify changes persist
- [ ] **Vendors:** Edit profile → Save → Verify changes persist
- [ ] **Discounts:** Edit discount → Save → Verify changes persist

### Delete Flow Testing
- [ ] **Beneficiaries:** Delete → Verify removed from list
- [ ] **Donors:** Delete → Verify removed from list
- [ ] **Vendors:** Delete → Verify removed from list
- [ ] **Discounts:** Delete → Verify removed from list

---

## 🔍 Backend Verification Needed

### API Endpoints to Verify
- [ ] `POST /api/admin/storage/upload` - Image upload
- [ ] `DELETE /api/admin/storage/delete` - Image deletion
- [ ] `POST /api/admin/charities` - Verify accepts all field names we send
- [ ] `PUT /api/admin/charities/:id` - Verify accepts all field names we send
- [ ] `GET /api/admin/charities/:id` - Verify returns all fields
- [ ] `POST /api/admin/donors` - Verify address structure
- [ ] `PUT /api/admin/donors/:id` - Verify address structure
- [ ] `POST /api/admin/discounts` - Verify accepts both field name formats
- [ ] `POST /api/admin/tenants` - Verify exists and works

### Database Schema Verification
- [ ] Verify `charities` table has all columns we're sending
- [ ] Verify `users` table address structure matches what we send
- [ ] Verify `discounts` table field names match what we send
- [ ] Verify `profile_links` column type (array vs JSON string)
- [ ] Verify image storage columns exist

---

## 📊 Priority Summary

### Must Fix (Blocking)
1. **Image Upload Endpoints** - Images won't upload without this
2. **Donor Address Structure** - Donors may not save correctly
3. **Profile Links Format** - Profile links may not save correctly

### Should Fix (Important)
4. **Geocoding** - Beneficiaries won't show on maps
5. **Tenants Invite Modal** - If tenants need to be created
6. **Field Name Verification** - Ensure all data saves correctly

### Nice to Have (Low Priority)
7. **Form 990 Upload Testing** - Verify it works
8. **Vendor Image Upload Testing** - Verify it works
9. **Comprehensive CRUD Testing** - Ensure all operations work

---

## 🧪 Testing Checklist

### Beneficiaries
- [ ] Create beneficiary with all fields
- [ ] Upload main image
- [ ] Upload logo
- [ ] Upload additional images
- [ ] Add profile links
- [ ] Upload Form 990
- [ ] View profile - verify all fields display
- [ ] Edit profile - verify changes save
- [ ] Verify coordinates populated (if backend geocodes)

### Donors
- [ ] Create donor with address
- [ ] Verify address saves correctly
- [ ] View donor profile
- [ ] Edit donor - verify address updates
- [ ] Verify address structure matches backend

### Vendors
- [ ] Create vendor
- [ ] Upload logo
- [ ] Upload product images
- [ ] View vendor profile
- [ ] Verify images display
- [ ] Edit vendor - verify changes save

### Discounts
- [ ] Create discount
- [ ] Verify all fields save
- [ ] View in discounts table
- [ ] Edit discount
- [ ] Delete discount
- [ ] Verify displays in vendor profile

### Tenants
- [ ] Check if invite modal exists
- [ ] Create tenant (if possible)
- [ ] Verify all fields save
- [ ] View tenant profile

---

## 📝 Next Steps

1. **Immediate:** Verify backend image upload endpoints exist
2. **Immediate:** Test donor address structure
3. **Immediate:** Test profile links format
4. **Short-term:** Implement geocoding in backend
5. **Short-term:** Create tenants invite modal (if needed)
6. **Ongoing:** Comprehensive testing of all CRUD operations

---

**End of Checklist**

