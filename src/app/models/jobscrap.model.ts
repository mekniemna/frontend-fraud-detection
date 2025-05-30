export interface JobScrap {
  id: number;
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  posted_date: string;
  source: string;
  url: string;
  isVerified?: boolean;
  isVerifying?: boolean;
  benefits?: string[];
}
