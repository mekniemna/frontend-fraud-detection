export interface Job {
  id?: string | number;
  title: string;
  description: string;
  location: string;
  industry: string;
  companyProfile: string;
  requirements: string;
  createdAt?: string | Date;
  benefits?: string[] | string;
  employmentType?: string;
  requiredExperience?: number | string;
  requiredEducation?: string;
  department?: string;
  salary?: string;
  salaryRange?: string;
  telecommuting?: boolean;
  hasCompanyLogo?: boolean;
  companyLogo?: string;
  company?: string;
  hasQuestions?: boolean;
  function?: string;
  postedDate?: Date;
  isVerifying?: boolean;
  isVerified?: boolean;
  verificationDate?: Date;
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface JobVerificationResult {
  isFake: boolean;
  message: string;
  details?: string[];
}
