/**
 * Charity/Beneficiary Categories
 * 
 * This list matches the backend's accepted categories.
 * Backend accepts any category string - this is a recommended list for frontend dropdown.
 */

export interface BeneficiaryCategory {
  value: string;
  label: string;
  description: string;
}

export const BENEFICIARY_CATEGORIES: BeneficiaryCategory[] = [
  {
    value: "Animal Welfare",
    label: "Animal Welfare",
    description: "Animal rescue, shelters, wildlife conservation"
  },
  {
    value: "Arts & Culture",
    label: "Arts & Culture",
    description: "Arts education, cultural programs, museums"
  },
  {
    value: "Childhood Illness",
    label: "Childhood Illness",
    description: "Supporting children with diseases, cancer, medical conditions"
  },
  {
    value: "Disabilities",
    label: "Disabilities",
    description: "Support for people with disabilities"
  },
  {
    value: "Disaster Relief",
    label: "Disaster Relief",
    description: "Emergency response, disaster recovery"
  },
  {
    value: "Education",
    label: "Education",
    description: "Schools, literacy programs, educational support"
  },
  {
    value: "Elderly Care",
    label: "Elderly Care",
    description: "Senior services, elder care, aging support"
  },
  {
    value: "Environment",
    label: "Environment",
    description: "Climate change, conservation, sustainability"
  },
  {
    value: "Healthcare",
    label: "Healthcare",
    description: "Medical care, health services, mental health"
  },
  {
    value: "Homelessness",
    label: "Homelessness",
    description: "Homeless shelters, housing programs"
  },
  {
    value: "Hunger Relief",
    label: "Hunger Relief",
    description: "Food assistance, meal programs, nutrition"
  },
  {
    value: "International Aid",
    label: "International Aid",
    description: "Global poverty, international development"
  },
  {
    value: "Low Income Families",
    label: "Low Income Families",
    description: "Food banks, housing assistance, financial support"
  },
  {
    value: "Veterans",
    label: "Veterans",
    description: "Support for military veterans and their families"
  },
  {
    value: "Youth Development",
    label: "Youth Development",
    description: "After-school programs, mentoring, youth services"
  }
];

/**
 * Get category label by value
 */
export const getCategoryLabel = (value: string): string => {
  const category = BENEFICIARY_CATEGORIES.find(cat => cat.value === value);
  return category?.label || value;
};

/**
 * Get category description by value
 */
export const getCategoryDescription = (value: string): string => {
  const category = BENEFICIARY_CATEGORIES.find(cat => cat.value === value);
  return category?.description || '';
};

