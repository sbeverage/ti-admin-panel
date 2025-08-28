-- =====================================================
-- DATABASE SCHEMA UPDATE FOR BENEFICIARY ADMIN PANEL
-- =====================================================
-- This file contains all the necessary database changes
-- to support the new beneficiary fields in the admin panel
-- =====================================================

-- Add new fields to the beneficiaries table
-- These fields support the enhanced beneficiary detail cards

-- 1. Basic Information Updates
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS about TEXT,
ADD COLUMN IF NOT EXISTS main_image_url VARCHAR(500);

-- 2. New "Why This Matters" Section
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS why_this_matters TEXT;

-- 3. New "Success Story" Section
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS success_story TEXT,
ADD COLUMN IF NOT EXISTS story_author VARCHAR(50);

-- 4. New "Impact Metrics" Section
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS families_helped VARCHAR(100),
ADD COLUMN IF NOT EXISTS communities_served INTEGER,
ADD COLUMN IF NOT EXISTS direct_to_programs INTEGER CHECK (direct_to_programs >= 0 AND direct_to_programs <= 100);

-- 5. New "Your Impact" Section
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS impact_statement_1 TEXT,
ADD COLUMN IF NOT EXISTS impact_statement_2 TEXT;

-- 6. New "Trust & Transparency" Section
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS ein VARCHAR(20),
ADD COLUMN IF NOT EXISTS website VARCHAR(500),
ADD COLUMN IF NOT EXISTS verification_status BOOLEAN DEFAULT FALSE;

-- 7. New "Get Involved" Section (Volunteer Tab)
ALTER TABLE beneficiaries 
ADD COLUMN IF NOT EXISTS volunteer_info TEXT;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_beneficiaries_category ON beneficiaries(category);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_location ON beneficiaries(location);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_verification_status ON beneficiaries(verification_status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_direct_to_programs ON beneficiaries(direct_to_programs);

-- =====================================================
-- CONSTRAINTS AND VALIDATIONS
-- =====================================================

-- Add constraints for data integrity
ALTER TABLE beneficiaries 
ADD CONSTRAINT chk_about_length CHECK (LENGTH(about) >= 200),
ADD CONSTRAINT chk_why_this_matters_length CHECK (LENGTH(why_this_matters) >= 200),
ADD CONSTRAINT chk_success_story_length CHECK (LENGTH(success_story) >= 150),
ADD CONSTRAINT chk_story_author_length CHECK (LENGTH(story_author) <= 50),
ADD CONSTRAINT chk_volunteer_info_length CHECK (LENGTH(volunteer_info) >= 100),
ADD CONSTRAINT chk_direct_to_programs_range CHECK (direct_to_programs >= 0 AND direct_to_programs <= 100);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Example of how to populate the new fields for existing beneficiaries
-- (Uncomment and modify as needed for your specific use case)

/*
UPDATE beneficiaries 
SET 
  about = 'This organization provides essential services to families in need, focusing on immediate relief and long-term solutions. Our mission is to create lasting positive change in communities across the region.',
  why_this_matters = 'Every donation directly supports families in need, providing immediate relief and long-term solutions. Your generosity creates real change in our community and helps build a stronger future for everyone.',
  success_story = 'Thanks to generous donors like you, we were able to provide emergency housing for the Johnson family during their crisis. Your support makes these miracles possible and transforms lives every day.',
  story_author = 'Sarah M., Program Director',
  families_helped = '10,000+',
  communities_served = 25,
  direct_to_programs = 95,
  impact_statement_1 = 'Every $25 provides a family with essential supplies for one week',
  impact_statement_2 = 'Every $100 helps provide emergency housing for families in crisis',
  ein = '12-3456789',
  website = 'https://example.org',
  verification_status = TRUE,
  volunteer_info = 'Beyond financial support, there are many ways to make a difference: volunteer at events, spread awareness, join committees. Contact us to learn more about volunteer opportunities.'
WHERE id = 1;
*/

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================

/*
-- To rollback these changes, uncomment and run:

-- Remove constraints first
ALTER TABLE beneficiaries 
DROP CONSTRAINT IF EXISTS chk_about_length,
DROP CONSTRAINT IF EXISTS chk_why_this_matters_length,
DROP CONSTRAINT IF EXISTS chk_success_story_length,
DROP CONSTRAINT IF EXISTS chk_story_author_length,
DROP CONSTRAINT IF EXISTS chk_volunteer_info_length,
DROP CONSTRAINT IF EXISTS chk_direct_to_programs_range;

-- Remove columns
ALTER TABLE beneficiaries 
DROP COLUMN IF EXISTS about,
DROP COLUMN IF EXISTS main_image_url,
DROP COLUMN IF EXISTS why_this_matters,
DROP COLUMN IF EXISTS success_story,
DROP COLUMN IF EXISTS story_author,
DROP COLUMN IF EXISTS families_helped,
DROP COLUMN IF EXISTS communities_served,
DROP COLUMN IF EXISTS direct_to_programs,
DROP COLUMN IF EXISTS impact_statement_1,
DROP COLUMN IF EXISTS impact_statement_2,
DROP COLUMN IF EXISTS ein,
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS verification_status,
DROP COLUMN IF EXISTS volunteer_info;

-- Remove indexes
DROP INDEX IF EXISTS idx_beneficiaries_category;
DROP INDEX IF EXISTS idx_beneficiaries_location;
DROP INDEX IF EXISTS idx_beneficiaries_verification_status;
DROP INDEX IF EXISTS idx_beneficiaries_direct_to_programs;
*/

-- =====================================================
-- NOTES
-- =====================================================

/*
IMPORTANT NOTES:

1. Run this script in a test environment first
2. Backup your database before running in production
3. Test the application thoroughly after applying changes
4. Consider running during low-traffic periods
5. Monitor performance after adding new indexes

FIELD DESCRIPTIONS:

- about: Detailed description of the beneficiary organization (min 200 chars)
- why_this_matters: Explanation of why the cause is important (min 200 chars)
- success_story: Compelling story showing impact of donations (min 150 chars)
- story_author: Who is telling the success story (max 50 chars)
- families_helped: Number of families helped (e.g., "10,000+")
- communities_served: Number of communities served
- direct_to_programs: Percentage of funds going directly to programs (0-100)
- impact_statement_1: First impact statement (e.g., "Every $25 provides...")
- impact_statement_2: Second impact statement (e.g., "Every $100 helps...")
- ein: Employer Identification Number
- website: Organization website URL
- verification_status: Whether verified as 501(c)(3) nonprofit
- volunteer_info: Information about volunteer opportunities (min 100 chars)

These fields support the new beneficiary detail cards with:
- About tab content
- Why This Matters section
- Impact Metrics
- Success Stories
- Your Impact statements
- Trust & Transparency information
- Get Involved (Volunteer) tab content
*/
