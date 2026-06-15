export interface MasterCV {
  id?: string;
  label?: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications?: string[];
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  duration: string;
  bullets: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  duration: string;
  gpa?: string;
  details?: string;
}

export interface EvidenceMappingItem {
  requirement: string;
  group: "Core technical" | "Domain/industry" | "Seniority/leadership" | "Communication/stakeholder";
  evidenceType: "Direct evidence" | "Adjacent transferable evidence" | "No evidence";
  candidateEvidence: string;
}

export interface MatchSummary {
  matchCategory: string; // e.g., "Strong apply" | "Reasonable apply" | "Stretch apply" | "Low-fit apply"
  matchScore: number; // Percentage out of 100
  fitReasoning: string;
  skillsGap: string[];
  
  // Recruiter calibration scoring breakouts
  technicalScore?: number; // max 25
  domainScore?: number; // max 20
  seniorityScore?: number; // max 20
  credibilityScore?: number; // max 20
  atsScore?: number; // max 15
  
  strengths?: string[];
  concerns?: string[];
  missingMustHaves?: string[];
  evidenceMapping?: EvidenceMappingItem[];
  unusedKeywords?: string[];
  weaknessNotes?: string;
}

export interface ParsedJob {
  company: string;
  roleTitle: string;
  location: string;
  seniority: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  keywords: string[];
  likelyAtsTerms: string[];
  redFlags: string[];
}

export interface TailoredCVBullet {
  id: string;
  originalBullet: string;
  modifiedBullet: string;
  reasoning: string;
}

export interface TailoredCVExperience {
  id: string;
  company: string;
  role: string;
  bullets: TailoredCVBullet[];
}

export interface TailoredCV {
  experience: TailoredCVExperience[];
  skillsGapAnalysis: string;
  summary: string;
}

export interface VerificationStatement {
  statement: string;
  reason: string;
}

export interface TailoredCoverLetter {
  content: string; // The markdown contents of the letter
  verificationRules: VerificationStatement[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Job {
  id: string;
  company: string;
  roleTitle: string;
  location: string;
  workplaceType: "remote" | "hybrid" | "on-site";
  salary?: string;
  sector: string;
  seniority: string;
  sponsorship: "Yes" | "No" | "Negotiable";
  status: "To Review" | "Tailor CV" | "Draft Cover Letter" | "Applied" | "Interviewing" | "Rejected" | "Offer";
  tags: string[];
  deadline?: string;
  link?: string;
  originalJD: string;
  parsedJobJson?: ParsedJob;
  match?: MatchSummary;
  notes?: string;
  checklist?: ChecklistItem[];
  tailoredCV?: TailoredCV;
  tailoredCoverLetter?: TailoredCoverLetter;
  statusHistory?: { status: string; date: string }[];
  dateCreated: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    sector?: string;
    workplaceType?: string;
    seniority?: string;
    matchCategory?: string;
  };
}
