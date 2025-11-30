# 📊 Impact Data Flow Report - Admin to App

**Date:** 2025-01-23  
**Status:** ✅ Complete Documentation

---

## 🎯 Overview

This report documents how **Impact Info**, **Impact Metrics**, and **Impact Statements** flow from the admin panel through the backend to the mobile app. It includes field names, payload structures, API endpoints, and database schema.

---

## 📋 Table of Contents

1. [Field Mappings](#field-mappings)
2. [Data Flow Diagram](#data-flow-diagram)
3. [API Endpoints](#api-endpoints)
4. [Payload Structures](#payload-structures)
5. [Database Schema](#database-schema)
6. [How to Pull Data](#how-to-pull-data)
7. [How to Push Data](#how-to-push-data)
8. [Field Name Variations](#field-name-variations)

---

## 🔄 Field Mappings

### Impact & Story Fields

| Frontend Form Field | Admin Panel State | API Payload (camelCase) | API Payload (snake_case) | Database Column | Type |
|-------------------|-------------------|------------------------|-------------------------|----------------|------|
| `whyThisMatters` | `impactStory.whyThisMatters` | `whyThisMatters` | `why_this_matters` | `why_this_matters` | TEXT |
| `successStory` | `impactStory.successStory` | `successStory` | `success_story` | `success_story` | TEXT |
| `storyAuthor` | `impactStory.storyAuthor` | `storyAuthor` | `story_author` | `story_author` | VARCHAR(50) |

### Impact Metrics Fields

| Frontend Form Field | Admin Panel State | API Payload (camelCase) | API Payload (snake_case) | Database Column | Type |
|-------------------|-------------------|------------------------|-------------------------|----------------|------|
| `livesImpacted` | `impactStory.livesImpacted` | `livesImpacted` | `lives_impacted` | `lives_impacted` | TEXT |
| `programsActive` | `impactStory.programsActive` | `programsActive` | `programs_active` | `programs_active` | TEXT |
| `directToProgramsPercentage` | `impactStory.directToProgramsPercentage` | `directToProgramsPercentage` | `direct_to_programs_percentage` | `direct_to_programs_percentage` | TEXT |

**Note:** Impact Metrics are stored as **TEXT** (not numbers) to support full sentences like:
- `livesImpacted`: "Over 10,000 children have received life-saving treatment"
- `programsActive`: "We operate 25 programs across 10 states"
- `directToProgramsPercentage`: "95% of all donations go directly to programs"

### Impact Statements Fields

| Frontend Form Field | Admin Panel State | API Payload (camelCase) | API Payload (snake_case) | Database Column | Type |
|-------------------|-------------------|------------------------|-------------------------|----------------|------|
| `impactStatement1` | `impactStory.impactStatement1` | `impactStatement1` | `impact_statement_1` | `impact_statement_1` | TEXT |
| `impactStatement2` | `impactStory.impactStatement2` | `impactStatement2` | `impact_statement_2` | `impact_statement_2` | TEXT |

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL (Frontend)                       │
│                                                                 │
│  Step 1: User fills form                                        │
│  ├─ whyThisMatters: "This cause matters because..."            │
│  ├─ successStory: "A family received..."                        │
│  ├─ storyAuthor: "Sarah M."                                    │
│  ├─ livesImpacted: "Over 10,000 children..."                   │
│  ├─ programsActive: "We operate 25 programs..."                │
│  ├─ directToProgramsPercentage: "95% of donations..."         │
│  ├─ impactStatement1: "Every $25 provides..."                  │
│  └─ impactStatement2: "Every $100 helps..."                    │
│                                                                 │
│  Step 2: Form validation & state management                     │
│  └─ Data stored in: impactStory state object                    │
│                                                                 │
│  Step 3: Payload construction (handleSubmit)                    │
│  └─ Sends BOTH camelCase AND snake_case versions               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST/PUT
                            │ JSON Payload
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Supabase Edge Function)         │
│                                                                 │
│  Endpoint: POST /charities                                      │
│  Endpoint: PUT /charities/:id                                   │
│                                                                 │
│  Backend accepts:                                               │
│  ├─ whyThisMatters OR why_this_matters                          │
│  ├─ successStory OR success_story                               │
│  ├─ storyAuthor OR story_author                                 │
│  ├─ livesImpacted OR lives_impacted                             │
│  ├─ programsActive OR programs_active                            │
│  ├─ directToProgramsPercentage OR direct_to_programs_percentage │
│  ├─ impactStatement1 OR impact_statement_1                      │
│  └─ impactStatement2 OR impact_statement_2                      │
│                                                                 │
│  Backend saves to database (snake_case columns)                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ SQL INSERT/UPDATE
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (Supabase PostgreSQL)               │
│                                                                 │
│  Table: charities                                               │
│                                                                 │
│  Columns:                                                       │
│  ├─ why_this_matters (TEXT)                                    │
│  ├─ success_story (TEXT)                                        │
│  ├─ story_author (VARCHAR(50))                                  │
│  ├─ lives_impacted (TEXT)                                      │
│  ├─ programs_active (TEXT)                                     │
│  ├─ direct_to_programs_percentage (TEXT)                       │
│  ├─ impact_statement_1 (TEXT)                                  │
│  └─ impact_statement_2 (TEXT)                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ SQL SELECT
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (GET Response)                   │
│                                                                 │
│  Endpoint: GET /charities                                       │
│  Endpoint: GET /charities/:id                                   │
│                                                                 │
│  Returns (camelCase):                                           │
│  ├─ whyThisMatters                                              │
│  ├─ successStory                                                │
│  ├─ storyAuthor                                                 │
│  ├─ livesImpacted                                               │
│  ├─ programsActive                                              │
│  ├─ directToProgramsPercentage                                  │
│  ├─ impactStatement1                                           │
│  └─ impactStatement2                                           │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP GET Response
                            │ JSON Data
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MOBILE APP (Frontend)                        │
│                                                                 │
│  Fetches data from: GET /charities                             │
│                                                                 │
│  Receives:                                                      │
│  ├─ whyThisMatters: "This cause matters because..."             │
│  ├─ successStory: "A family received..."                        │
│  ├─ storyAuthor: "Sarah M."                                    │
│  ├─ livesImpacted: "Over 10,000 children..."                   │
│  ├─ programsActive: "We operate 25 programs..."                │
│  ├─ directToProgramsPercentage: "95% of donations..."           │
│  ├─ impactStatement1: "Every $25 provides..."                   │
│  └─ impactStatement2: "Every $100 helps..."                   │
│                                                                 │
│  Displays in: Impact & Story section of charity profile        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌐 API Endpoints

### Base URL
```
https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin
```

**Note:** The base URL already includes `/api/admin`, so the full endpoint paths are:
- `POST /charities` (not `/api/admin/charities`)
- `PUT /charities/:id` (not `/api/admin/charities/:id`)
- `GET /charities` (not `/api/admin/charities`)

### 1. Create Beneficiary (POST)

**Endpoint:** `POST /charities`  
**Full URL:** `https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/charities`

**Request Headers:**
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_SUPABASE_ANON_KEY"
}
```

**Request Body:** See [Payload Structures](#payload-structures) below

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Charity Name",
    "whyThisMatters": "This cause matters because...",
    "successStory": "A family received...",
    "storyAuthor": "Sarah M.",
    "livesImpacted": "Over 10,000 children...",
    "programsActive": "We operate 25 programs...",
    "directToProgramsPercentage": "95% of donations...",
    "impactStatement1": "Every $25 provides...",
    "impactStatement2": "Every $100 helps..."
  }
}
```

### 2. Update Beneficiary (PUT)

**Endpoint:** `PUT /charities/:id`  
**Full URL:** `https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/charities/:id`

**Request Headers:** Same as POST

**Request Body:** See [Payload Structures](#payload-structures) below

**Response:** Same format as POST response

### 3. Get All Beneficiaries (GET)

**Endpoint:** `GET /charities?page=1&limit=20`  
**Full URL:** `https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/charities?page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "name": "Charity Name",
      "whyThisMatters": "This cause matters because...",
      "successStory": "A family received...",
      "storyAuthor": "Sarah M.",
      "livesImpacted": "Over 10,000 children...",
      "programsActive": "We operate 25 programs...",
      "directToProgramsPercentage": "95% of donations...",
      "impactStatement1": "Every $25 provides...",
      "impactStatement2": "Every $100 helps..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### 4. Get Single Beneficiary (GET)

**Endpoint:** `GET /charities/:id`  
**Full URL:** `https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/charities/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Charity Name",
    "whyThisMatters": "This cause matters because...",
    "successStory": "A family received...",
    "storyAuthor": "Sarah M.",
    "livesImpacted": "Over 10,000 children...",
    "programsActive": "We operate 25 programs...",
    "directToProgramsPercentage": "95% of donations...",
    "impactStatement1": "Every $25 provides...",
    "impactStatement2": "Every $100 helps..."
  }
}
```

---

## 📦 Payload Structures

### Create Beneficiary (POST) Payload

**Location:** `src/components/InviteBeneficiaryModal.tsx` → `handleSubmit()`

```javascript
{
  // Core required fields
  "name": "Charity Name",
  "beneficiaryName": "Charity Name",
  "charityName": "Charity Name",
  
  // Impact & Story - BOTH formats sent
  "why_this_matters": "This cause matters because...",
  "whyThisMatters": "This cause matters because...",
  "success_story": "A family received...",
  "successStory": "A family received...",
  "story_author": "Sarah M.",
  "storyAuthor": "Sarah M.",
  
  // Impact Metrics - BOTH formats sent (only if non-empty)
  "livesImpacted": "Over 10,000 children have received life-saving treatment",
  "lives_impacted": "Over 10,000 children have received life-saving treatment",
  "programsActive": "We operate 25 programs across 10 states",
  "programs_active": "We operate 25 programs across 10 states",
  "directToProgramsPercentage": "95% of all donations go directly to programs",
  "direct_to_programs_percentage": "95% of all donations go directly to programs",
  
  // Impact Statements - BOTH formats sent (null if empty)
  "impact_statement_1": "Every $25 provides a family with essential supplies for one week",
  "impactStatement1": "Every $25 provides a family with essential supplies for one week",
  "impact_statement_2": "Every $100 helps provide emergency housing for families in crisis",
  "impactStatement2": "Every $100 helps provide emergency housing for families in crisis",
  
  // Other fields...
  "category": "Childhood Illness",
  "type": "Medium",
  "about": "Organization description...",
  "city": "Irvine",
  "state": "CA",
  "zip_code": "92618",
  "location": "Irvine, CA",
  "phone": "555-1234",
  "contact_name": "John Doe",
  "email": "contact@charity.org",
  "ein": "12-3456789",
  "website": "https://charity.org",
  "is_active": true,
  "isActive": true
}
```

**Key Points:**
- ✅ **Both camelCase and snake_case** versions are sent for all impact fields
- ✅ **Impact Statements** send `null` if empty (not empty string)
- ✅ **Impact Metrics** only included if they have non-empty values
- ✅ **Impact & Story** fields send empty string `""` if not provided

### Update Beneficiary (PUT) Payload

**Location:** `src/components/BeneficiaryProfile.tsx` → `handleSave()`

```javascript
{
  // Core required fields
  "name": "Charity Name",
  "beneficiaryName": "Charity Name",
  "charityName": "Charity Name",
  
  // Impact & Story - BOTH formats sent
  "why_this_matters": "This cause matters because...",
  "whyThisMatters": "This cause matters because...",
  "success_story": "A family received...",
  "successStory": "A family received...",
  "story_author": "Sarah M.",
  "storyAuthor": "Sarah M.",
  
  // Impact Metrics - BOTH formats sent (null if empty)
  "livesImpacted": "Over 10,000 children have received life-saving treatment",
  "lives_impacted": "Over 10,000 children have received life-saving treatment",
  "programsActive": "We operate 25 programs across 10 states",
  "programs_active": "We operate 25 programs across 10 states",
  "directToProgramsPercentage": "95% of all donations go directly to programs",
  "direct_to_programs_percentage": "95% of all donations go directly to programs",
  
  // Impact Statements - BOTH formats sent (null if empty)
  "impact_statement_1": "Every $25 provides a family with essential supplies for one week",
  "impactStatement1": "Every $25 provides a family with essential supplies for one week",
  "impact_statement_2": "Every $100 helps provide emergency housing for families in crisis",
  "impactStatement2": "Every $100 helps provide emergency housing for families in crisis",
  
  // Other fields...
  "category": "Childhood Illness",
  "type": "Medium",
  "about": "Organization description...",
  "city": "Irvine",
  "state": "CA",
  "zip_code": "92618",
  "location": "Irvine, CA",
  "phone": "555-1234",
  "contact_name": "John Doe",
  "email": "contact@charity.org",
  "ein": "12-3456789",
  "website": "https://charity.org",
  "is_active": true,
  "isActive": true
}
```

**Key Points:**
- ✅ Same structure as POST payload
- ✅ **Impact Metrics** send `null` if empty (not empty string)
- ✅ **Impact Statements** send `null` if empty (not empty string)
- ✅ **Impact & Story** fields send empty string `""` if not provided

---

## 🗄️ Database Schema

### Table: `charities`

```sql
-- Impact & Story fields
why_this_matters TEXT,
success_story TEXT,
story_author VARCHAR(50),

-- Impact Metrics (stored as TEXT to support full sentences)
lives_impacted TEXT,
programs_active TEXT,
direct_to_programs_percentage TEXT,

-- Impact Statements
impact_statement_1 TEXT,
impact_statement_2 TEXT,
```

**Column Details:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `why_this_matters` | TEXT | YES | NULL | Why this cause is important (min 200 chars) |
| `success_story` | TEXT | YES | NULL | Compelling story showing impact (min 150 chars) |
| `story_author` | VARCHAR(50) | YES | NULL | Author of the success story |
| `lives_impacted` | TEXT | YES | NULL | Full sentence describing lives impacted |
| `programs_active` | TEXT | YES | NULL | Full sentence describing active programs |
| `direct_to_programs_percentage` | TEXT | YES | NULL | Full sentence describing percentage |
| `impact_statement_1` | TEXT | YES | NULL | First impact statement (e.g., "Every $25...") |
| `impact_statement_2` | TEXT | YES | NULL | Second impact statement (e.g., "Every $100...") |

---

## 📥 How to Pull Data

### From Admin Panel (Frontend)

**File:** `src/components/BeneficiaryProfile.tsx`

```typescript
// Fetch single beneficiary
const response = await beneficiaryAPI.getBeneficiary(beneficiaryId);

// Response structure
const data = response.data; // or response if no wrapper

// Access impact fields
const whyThisMatters = data.whyThisMatters || data.why_this_matters;
const successStory = data.successStory || data.success_story;
const storyAuthor = data.storyAuthor || data.story_author;
const livesImpacted = data.livesImpacted || data.lives_impacted;
const programsActive = data.programsActive || data.programs_active;
const directToProgramsPercentage = data.directToProgramsPercentage || data.direct_to_programs_percentage;
const impactStatement1 = data.impactStatement1 || data.impact_statement_1;
const impactStatement2 = data.impactStatement2 || data.impact_statement_2;
```

### From Mobile App (Frontend)

**API Call:**
```javascript
// Fetch all charities
const response = await fetch('https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/charities', {
  headers: {
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY',
    'X-Admin-Secret': 'YOUR_ADMIN_SECRET',
    'apikey': 'YOUR_SUPABASE_ANON_KEY'
  }
});

const data = await response.json();

// Access impact fields (backend returns camelCase)
data.data.forEach(charity => {
  console.log(charity.whyThisMatters);
  console.log(charity.successStory);
  console.log(charity.storyAuthor);
  console.log(charity.livesImpacted);
  console.log(charity.programsActive);
  console.log(charity.directToProgramsPercentage);
  console.log(charity.impactStatement1);
  console.log(charity.impactStatement2);
});
```

### From Backend (Direct Database Query)

```sql
SELECT 
  id,
  name,
  why_this_matters,
  success_story,
  story_author,
  lives_impacted,
  programs_active,
  direct_to_programs_percentage,
  impact_statement_1,
  impact_statement_2
FROM charities
WHERE id = :charity_id;
```

---

## 📤 How to Push Data

### From Admin Panel (Create New Beneficiary)

**File:** `src/components/InviteBeneficiaryModal.tsx`

**Step 1:** User fills form in Step 1 (Impact & Story)

**Step 2:** Data stored in state:
```typescript
const [impactStory, setImpactStory] = useState<any>({});

// After validation
setImpactStory({
  whyThisMatters: "This cause matters because...",
  successStory: "A family received...",
  storyAuthor: "Sarah M.",
  livesImpacted: "Over 10,000 children...",
  programsActive: "We operate 25 programs...",
  directToProgramsPercentage: "95% of donations...",
  impactStatement1: "Every $25 provides...",
  impactStatement2: "Every $100 helps..."
});
```

**Step 3:** Payload construction in `handleSubmit()`:
```typescript
const beneficiaryData = {
  // Impact & Story - BOTH formats
  why_this_matters: allData.whyThisMatters || '',
  whyThisMatters: allData.whyThisMatters || '',
  success_story: allData.successStory || '',
  successStory: allData.successStory || '',
  story_author: allData.storyAuthor || '',
  storyAuthor: allData.storyAuthor || '',
  
  // Impact Metrics - BOTH formats (only if non-empty)
  ...(allData.livesImpacted && allData.livesImpacted.trim() ? {
    livesImpacted: allData.livesImpacted.trim(),
    lives_impacted: allData.livesImpacted.trim()
  } : {}),
  ...(allData.programsActive && allData.programsActive.trim() ? {
    programsActive: allData.programsActive.trim(),
    programs_active: allData.programsActive.trim()
  } : {}),
  ...(allData.directToProgramsPercentage && allData.directToProgramsPercentage.trim() ? {
    directToProgramsPercentage: allData.directToProgramsPercentage.trim(),
    direct_to_programs_percentage: allData.directToProgramsPercentage.trim()
  } : {}),
  
  // Impact Statements - BOTH formats (null if empty)
  impact_statement_1: (allData.impactStatement1 && allData.impactStatement1.trim()) || null,
  impactStatement1: (allData.impactStatement1 && allData.impactStatement1.trim()) || null,
  impact_statement_2: (allData.impactStatement2 && allData.impactStatement2.trim()) || null,
  impactStatement2: (allData.impactStatement2 && allData.impactStatement2.trim()) || null
};
```

**Step 4:** API call:
```typescript
const response = await beneficiaryAPI.createBeneficiary(beneficiaryData);
```

### From Admin Panel (Update Existing Beneficiary)

**File:** `src/components/BeneficiaryProfile.tsx`

**Step 1:** User edits form fields

**Step 2:** Data stored in `formData` state:
```typescript
const [formData, setFormData] = useState<any>({});

// On input change
handleInputChange('whyThisMatters', e.target.value);
handleInputChange('successStory', e.target.value);
handleInputChange('storyAuthor', e.target.value);
handleInputChange('livesImpacted', e.target.value);
handleInputChange('programsActive', e.target.value);
handleInputChange('directToProgramsPercentage', e.target.value);
handleInputChange('impactStatement1', e.target.value);
handleInputChange('impactStatement2', e.target.value);
```

**Step 3:** Payload construction in `handleSave()`:
```typescript
const updateData = {
  // Impact & Story - BOTH formats
  why_this_matters: (formData.whyThisMatters && formData.whyThisMatters.trim()) || '',
  whyThisMatters: (formData.whyThisMatters && formData.whyThisMatters.trim()) || '',
  success_story: (formData.successStory && formData.successStory.trim()) || '',
  successStory: (formData.successStory && formData.successStory.trim()) || '',
  story_author: (formData.storyAuthor && formData.storyAuthor.trim()) || '',
  storyAuthor: (formData.storyAuthor && formData.storyAuthor.trim()) || '',
  
  // Impact Metrics - BOTH formats (null if empty)
  livesImpacted: formData.livesImpacted && formData.livesImpacted.trim() ? formData.livesImpacted.trim() : null,
  lives_impacted: formData.livesImpacted && formData.livesImpacted.trim() ? formData.livesImpacted.trim() : null,
  programsActive: formData.programsActive && formData.programsActive.trim() ? formData.programsActive.trim() : null,
  programs_active: formData.programsActive && formData.programsActive.trim() ? formData.programsActive.trim() : null,
  directToProgramsPercentage: formData.directToProgramsPercentage && formData.directToProgramsPercentage.trim() ? formData.directToProgramsPercentage.trim() : null,
  direct_to_programs_percentage: formData.directToProgramsPercentage && formData.directToProgramsPercentage.trim() ? formData.directToProgramsPercentage.trim() : null,
  
  // Impact Statements - BOTH formats (null if empty)
  impact_statement_1: (formData.impactStatement1 && formData.impactStatement1.trim()) || null,
  impactStatement1: (formData.impactStatement1 && formData.impactStatement1.trim()) || null,
  impact_statement_2: (formData.impactStatement2 && formData.impactStatement2.trim()) || null,
  impactStatement2: (formData.impactStatement2 && formData.impactStatement2.trim()) || null
};
```

**Step 4:** API call:
```typescript
const response = await beneficiaryAPI.updateBeneficiary(beneficiaryId, updateData);
```

### From Mobile App (Direct API Call)

```javascript
// Update charity impact data
const updateData = {
  whyThisMatters: "This cause matters because...",
  successStory: "A family received...",
  storyAuthor: "Sarah M.",
  livesImpacted: "Over 10,000 children...",
  programsActive: "We operate 25 programs...",
  directToProgramsPercentage: "95% of donations...",
  impactStatement1: "Every $25 provides...",
  impactStatement2: "Every $100 helps..."
};

const response = await fetch(`https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/charities/${charityId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY',
    'X-Admin-Secret': 'YOUR_ADMIN_SECRET',
    'apikey': 'YOUR_SUPABASE_ANON_KEY'
  },
  body: JSON.stringify(updateData)
});

const result = await response.json();
```

---

## 🔤 Field Name Variations

### Why We Send Both Formats

The admin panel sends **both camelCase and snake_case** versions of all impact fields to ensure backend compatibility:

```javascript
{
  // camelCase (JavaScript convention)
  whyThisMatters: "...",
  successStory: "...",
  storyAuthor: "...",
  livesImpacted: "...",
  programsActive: "...",
  directToProgramsPercentage: "...",
  impactStatement1: "...",
  impactStatement2: "...",
  
  // snake_case (Database convention)
  why_this_matters: "...",
  success_story: "...",
  story_author: "...",
  lives_impacted: "...",
  programs_active: "...",
  direct_to_programs_percentage: "...",
  impact_statement_1: "...",
  impact_statement_2: "..."
}
```

**Reason:** The backend accepts both formats and maps them to the same database columns (snake_case).

### Backend Response Format

The backend **always returns camelCase** in API responses:

```json
{
  "whyThisMatters": "...",
  "successStory": "...",
  "storyAuthor": "...",
  "livesImpacted": "...",
  "programsActive": "...",
  "directToProgramsPercentage": "...",
  "impactStatement1": "...",
  "impactStatement2": "..."
}
```

---

## ✅ Key Takeaways

1. **Field Names:** Always check for both camelCase and snake_case when reading data
2. **Empty Values:** Impact Statements and Metrics send `null` if empty (not empty string)
3. **Impact & Story:** Send empty string `""` if not provided
4. **Both Formats:** Admin panel sends both camelCase and snake_case for compatibility
5. **Backend Returns:** Backend always returns camelCase in API responses
6. **Database:** Database stores all fields in snake_case columns
7. **Type:** Impact Metrics are TEXT (not numbers) to support full sentences

---

## 🐛 Troubleshooting

### Issue: Data not saving

**Check:**
1. Are both camelCase and snake_case versions in the payload?
2. Are Impact Statements sending `null` (not empty string) if empty?
3. Are Impact Metrics only included if they have non-empty values?
4. Check browser Network tab to verify payload structure

### Issue: Data not appearing in app

**Check:**
1. Is the backend returning camelCase fields in GET responses?
2. Is the mobile app reading from the correct field names?
3. Check API response in browser Network tab

### Issue: Field name mismatch

**Solution:** Always check for both formats:
```javascript
const value = data.whyThisMatters || data.why_this_matters;
```

---

## 📝 Code References

### Admin Panel Files

- **Create Form:** `src/components/InviteBeneficiaryModal.tsx`
  - Payload construction: `handleSubmit()` (line ~367)
  - Impact fields: Step 1 form (line ~913-1034)
  
- **Edit Form:** `src/components/BeneficiaryProfile.tsx`
  - Payload construction: `handleSave()` (line ~360)
  - Impact fields: `renderImpactStory()` (line ~1094-1238)

- **API Service:** `src/services/api.ts`
  - Create: `createBeneficiary()` (line ~1595)
  - Update: `updateBeneficiary()` (line ~1611)
  - Get: `getBeneficiary()` (line ~1573)

---

**End of Report**

