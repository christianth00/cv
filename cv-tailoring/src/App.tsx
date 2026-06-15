import React, { useState, useEffect } from "react";
import {
  Briefcase,
  FileText,
  Plus,
  Search,
  Building,
  MapPin,
  Sparkles,
  AlertTriangle,
  Trash2,
  Layers,
  ArrowRight,
  Check,
  ExternalLink,
  Clipboard,
  Info,
  Filter,
  CheckSquare,
  AlertCircle,
  Download,
  Eye,
  Edit2,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  ChevronRight,
  User,
  ArrowLeft
} from "lucide-react";
import { MasterCV, Job, ChecklistItem, TailoredCV, TailoredCoverLetter, WorkExperience, Education } from "./types";
import { DEFAULT_MASTER_CV, DEFAULT_JOBS } from "./sampleData";

const TEMPLATE_SERIF = `<!-- Elegant Executive Serif Template -->
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <style type="text/css">
    @import url(https://themes.googleusercontent.com/fonts/css?kit=fpjTOVmNbO4Lz34iLyptLTi9jKYd1gJzj5O2gWsEpXol-nTHck7FFkZplK5meosG);
    ol { margin:0; padding:0 }
    table td, table th { padding:0 }
    ul, ol { margin:0; padding:0; }
    .c11 { margin-top:6pt; padding-top:1px; border-bottom-color:#000000; border-bottom-width:0.5pt; padding-bottom:1px; margin-bottom:2px; line-height:1.0; border-bottom-style:solid; text-align:left; page-break-after:avoid; }
    .c5 { margin-left:14.4pt; padding-top:0pt; padding-left:0pt; padding-bottom:0pt; line-height:1.15; text-align:left }
    .c2 { color:#000000; font-weight:400; text-decoration:none; vertical-align:baseline; font-size:11pt; font-family:"Cambria"; font-style:normal }
    .c15 { margin-top:0px; margin-bottom:2px; padding:0; line-height:1.15; text-align:left }
    .c8 { margin-top:0px; margin-bottom:2px; padding:0; line-height:1.15; text-align:left }
    .c17 { margin-top:1pt; margin-bottom:2px; padding:0; line-height:1.15; text-align:center }
    .c12 { margin-top:1px; margin-bottom:2px; padding:0; line-height:1.15; text-align:left }
    .c16 { margin-top:0px; margin-bottom:2px; padding:0; line-height:1.15; text-align:left }
    .c10 { -webkit-text-decoration-skip:none; font-weight:400; text-decoration:underline; text-decoration-skip-ink:none; font-size:9pt; font-style:normal }
    .c14 { margin-top:0px; margin-bottom:2px; padding:0; line-height:1.15; text-align:center }
    .c1 { margin-top:1px; margin-bottom:2px; padding:0; line-height:1.15; text-align:left }
    .c9 { font-size:9.5pt; font-style:normal; font-weight:400; text-decoration:none }
    .c13 { font-size:15pt; font-style:normal; font-weight:700; text-decoration:none }
    .c0 { font-size:9pt; font-style:normal; font-weight:400; text-decoration:none }
    .c4 { font-size:9.5pt; font-style:normal; font-weight:700; text-decoration:none }
    .c18 { font-size:9pt; font-style:italic; font-weight:400; text-decoration:none }
    .c3 { background-color:#ffffff; max-width:525.6pt; padding:20pt 40pt 20pt 40pt; font-family:"Cambria", "Times New Roman", serif; }
    .c6 { color:#000000; vertical-align:baseline; font-family:"Cambria", "Times New Roman", serif; }
    .c7 { padding:0; margin:0 }
    li { color:#000000; font-size:9pt; font-family:"Cambria", "Times New Roman", serif; margin-bottom: 1px; }
    p { margin:0; margin-bottom:2px; padding:0; color:#000000; font-size:9pt; font-family:"Cambria", "Times New Roman", serif }
  </style>
</head>
<body class="c3 doc-content">
  <p class="c14"><span class="c13">{{fullName}}</span></p>
  <p class="c17"><span class="c0">{{location}} &nbsp;| &nbsp;{{email}} &nbsp;| &nbsp;{{phone}} &nbsp;| &nbsp;{{linkedin}} &nbsp;| &nbsp;{{website}}</span></p>
  
  <p class="c11" style="margin-top:5pt;"><span class="c4">PROFESSIONAL SUMMARY</span></p>
  <p class="c12"><span class="c0">{{summary}}</span></p>
  
  <p class="c11"><span class="c4">EXPERIENCE</span></p>
  {{experience}}
  
  <p class="c11"><span class="c4">EDUCATION &amp; QUALIFICATIONS</span></p>
  {{education}}
  
  <p class="c11"><span class="c4">SKILLS</span></p>
  <p class="c15"><span class="c0">{{skills_comma}}</span></p>
  
  <p class="c11"><span class="c4">LANGUAGE</span></p>
  <p class="c15"><span class="c0">{{languages}}</span></p>
</body>
</html>`;

function getProfileDisplayName(cv: any): string {
  if (!cv) return "Profile";
  const id = (cv.id || "").toLowerCase();
  const label = (cv.label || "").toLowerCase();
  const summary = (cv.summary || "").toLowerCase();
  const skills = (cv.skills || []).map((s: string) => s.toLowerCase());
  const experienceText = (cv.experience || []).flatMap((e: any) => [
    (e.role || "").toLowerCase(),
    (e.company || "").toLowerCase(),
    ...(e.bullets || []).map((b: any) => typeof b === "string" ? b.toLowerCase() : "")
  ]).join(" ");

  const cvText = [id, label, summary, ...skills, experienceText].join(" ");

  const countOccurrences = (text: string, sub: string) => {
    let count = 0;
    let pos = text.indexOf(sub);
    while (pos !== -1) {
      count++;
      pos = text.indexOf(sub, pos + sub.length);
    }
    return count;
  };

  // 1. ESG Classification Score
  let esgScore = 0;
  if (id.includes("esg")) esgScore += 400; // heavy weight on ID
  if (label.includes("esg") || label.includes("sustainability") || label.includes("environmental")) esgScore += 200;
  
  const esgKeywords = [
    "esg", "sustainability", "carbon", "greenhouse", "climate", "environmental", 
    "green", "emissions", "wri", "ghg", "sasb", "tcfd", "sustainable", "ecology",
    "renewables", "clean tech"
  ];
  for (const kw of esgKeywords) {
    esgScore += countOccurrences(cvText, kw) * 25;
  }

  // 2. Risk / Data Science Classification Score
  let riskScore = 0;
  if (id.includes("ds") || id.includes("risk")) riskScore += 400;
  if (label.includes("risk") || label.includes("machine") || label.includes("science") || label.includes("predic") || label.includes("forecasting")) riskScore += 200;

  const riskKeywords = [
    "risk", "machine learning", "neural", "pytorch", "tensorflow", "forecasting", 
    "predictive", "time-series", "scikit", "regression", "deep learning", 
    "bayesian", "probability", "aws certified", "frm", "model validation", "fastapi"
  ];
  for (const kw of riskKeywords) {
    riskScore += countOccurrences(cvText, kw) * 25;
  }

  // 3. Quant / Trader Classification Score
  let quantScore = 0;
  if (id.includes("quant")) quantScore += 400;
  if (label.includes("quant") || label.includes("quantitative") || label.includes("trading") || label.includes("alpha")) quantScore += 200;

  const quantKeywords = [
    "quant", "quantitative", "trading", "derivative", "hedging", "options pricing", 
    "stochastic", "calculus", "arbitrage", "black-scholes", "mathematical", "algorithmic", 
    "high-frequency", "hft", "systematic", "backtest", "ocaml", "c++"
  ];
  for (const kw of quantKeywords) {
    quantScore += countOccurrences(cvText, kw) * 25;
  }

  // Direct overrides based on ID/label strictly first before score comparisons to avoid overlap
  if (id === "cv-esg" || id.includes("esg") || (esgScore > riskScore && esgScore > quantScore)) {
    return "ESG";
  }
  if (id === "cv-ds" || id === "cv-risk" || id.includes("ds") || id.includes("risk") || (riskScore > esgScore && riskScore > quantScore)) {
    return "Risk";
  }
  if (id === "cv-quant" || id.includes("quant") || (quantScore > esgScore && quantScore > riskScore)) {
    return "Quant";
  }

  // Fallbacks
  if (esgScore > 0) return "ESG";
  if (riskScore > 0) return "Risk";
  if (quantScore > 0) return "Quant";

  return cv.label ? cv.label.split(" ")[0] : "Profile";
}

export default function App() {
  // --- STATE MANAGEMENT ---
  const [masterCvs, setMasterCvs] = useState<MasterCV[]>(() => {
    const saved = localStorage.getItem("app_copilot_master_cvs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse saved master cvs:", err);
      }
    }
    // Deep copies/varied profiles for Alexander Vance
    return [
      {
        ...DEFAULT_MASTER_CV,
        id: "cv-quant",
        label: "Quantitative Developer Profile"
      },
      {
        id: "cv-esg",
        label: "ESG Specialist Profile",
        fullName: "Alexander Vance",
        email: "alexander.vance@uwaterloo.ca",
        phone: "+1 (416) 555-0189",
        location: "Toronto, ON (Open to Relocation: London, EU)",
        linkedin: "linkedin.com/in/alexander-vance-quant",
        website: "github.com/alex-vance-codes",
        summary: "Sustainability systems analyst and environmental risk coordinator with 3+ years experience auditing greenhouse gas emissions compliance metrics, reporting under WRI GHG protocols, and developing green commodity risk mitigation models. Skilled in SASB, TCFD reporting guidelines, and Carbon valuation frameworks.",
        skills: [
          "Carbon Accounting & GHG Protocols",
          "ESG Risk scoring (SASB, TCFD standards)",
          "Python (Pandas, NumPy, Matplotlib)",
          "SQL (PostgreSQL query optimizations)",
          "Corporate Sustainability Metrics",
          "Environmental Policy Advocacy",
          "Risk Analysis Frameworks",
          "Climate Data Modelling"
        ],
        certifications: [
          "CFA Certificate in ESG Investing",
          "Sustainability and Climate Risk (SCR) Credential"
        ],
        education: [
          {
            id: "edu-esg-1",
            school: "University of Waterloo",
            degree: "MSc in Sustainability Management & Quantitative Risk",
            duration: "2020 - 2022",
            gpa: "3.91/4.0",
            details: "Specialization in Green Bond auditing, corporate governance analytics, and carbon emissions allowance portfolios."
          }
        ],
        experience: [
          {
            id: "exp-esg-1",
            company: "Apex Commodities & Algorithmic Trading",
            role: "ESG Risk Specialist & Carbon Compliance Analyst",
            location: "Toronto, ON",
            duration: "2022 - Present",
            bullets: [
              "Constructed an internal carbon emissions compliance reporting tracker adhering strictly to WRI GHG Protocols, reducing audit prep cycles by 40%.",
              "Designed automated pipeline validating Scope 1 and Scope 2 environmental data from multi-site physical energy sensors across the EU.",
              "Prepared executive summaries outlining carbon offset certificate pricing trends and regulatory emissions ceilings for senior commodities desks."
            ]
          }
        ]
      },
      {
        id: "cv-ds",
        label: "Risk Profile",
        fullName: "Alexander Vance",
        email: "alexander.vance@uwaterloo.ca",
        phone: "+1 (416) 555-0189",
        location: "Toronto, ON (Open to Relocation: San Francisco, NYC)",
        linkedin: "linkedin.com/in/alexander-vance-quant",
        website: "github.com/alex-vance-codes",
        summary: "Machine Learning engineer with a strong mathematical background specializing in time-series forecasting, neural network model deployment, and high-performance pipeline architecture. Expert in PyTorch, Python, computer science algorithms, and scaling analytics across cloud environments.",
        skills: [
          "Machine Learning (Neural Networks, PyTorch, Scikit-learn)",
          "Time-Series Forecasting & Predictive Modelling",
          "Python (Pandas, NumPy, SciPy, FastAPI)",
          "Distributed Computing & Kubernetes",
          "Data Engineering (Spark, SQL, Airflow)",
          "High-performance numerical processing",
          "Algorithms & Data Structures",
          "Git & CI/CD Pipelines"
        ],
        certifications: [
          "TensorFlow Developer Certificate",
          "AWS Certified Machine Learning - Specialty"
        ],
        education: [
          {
            id: "edu-ds-1",
            school: "University of Waterloo",
            degree: "MSc in Quantitative Finance & Computing (Honours)",
            duration: "2020 - 2022",
            gpa: "3.95/4.0",
            details: "Specialized in reinforcement learning for market execution patterns, neural network forecasting, and parallel algorithm optimization."
          }
        ],
        experience: [
          {
            id: "exp-ds-1",
            company: "Apex Commodities & Algorithmic Trading",
            role: "Machine Learning Developer (Trading Systems Focus)",
            location: "Toronto, ON",
            duration: "2022 - Present",
            bullets: [
              "Built and scaled a deep learning predict-ahead trading engine in PyTorch, increasing systematic prediction margins by 14% on complex portfolios.",
              "Refactored heavy training pipelines to leverage distributed parallel nodes, reducing epoch training time by 45 hours monthly.",
              "Designed and implemented high-coverage automation test suites for machine learning microservices served via FastAPI."
            ]
          }
        ]
      }
    ];
  });

  const [selectedMasterCvId, setSelectedMasterCvId] = useState<string>(() => {
    const savedId = localStorage.getItem("app_copilot_selected_cv_id");
    return savedId || "cv-quant";
  });

  const masterCv = masterCvs.find((c) => c.id === selectedMasterCvId) || masterCvs[0];

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem("app_copilot_jobs");
    return saved ? JSON.parse(saved) : DEFAULT_JOBS;
  });

  const [selectedJobId, setSelectedJobId] = useState<string | null>(() => {
    return jobs.length > 0 ? jobs[0].id : null;
  });

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;

  // Tabs navigation state: "jobs" | "workspace" | "cv" | "protocol"
  const [navTab, setNavTab] = useState<"workspace" | "jobs" | "cv" | "protocol">("jobs");
  
  // Workspace views sub-tab: "alignment" | "cv" | "cl"
  const [workspaceTab, setWorkspaceTab] = useState<"alignment" | "cv" | "cl">("alignment");

  const [apiMode, setApiMode] = useState<"live" | "mock">("mock");
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // States for Adding New Jobs manually
  const [isAddingJob, setIsAddingJob] = useState<boolean>(false);
  const [newJobCompany, setNewJobCompany] = useState<string>("");
  const [newJobTitle, setNewJobTitle] = useState<string>("");
  const [newJobLocation, setNewJobLocation] = useState<string>("Hybrid / London, UK");
  const [newJobSalary, setNewJobSalary] = useState<string>("");
  const [newJobJD, setNewJDText] = useState<string>("");
  const [newJobUrl, setNewJobUrl] = useState<string>("");
  const [newJobSector, setNewJobSector] = useState<string>("Quantitative Trading");
  const [newJobSeniority, setNewJobSeniority] = useState<string>("Associate");
  const [newJobWorktype, setNewJobWorktype] = useState<"remote" | "hybrid" | "on-site">("hybrid");
  const [isQuickExtracting, setIsQuickExtracting] = useState<boolean>(false);

  // States for profile editing
  const [profileEditMode, setProfileEditMode] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editLocation, setEditLocation] = useState<string>("");
  const [editLinkedin, setEditLinkedin] = useState<string>("");
  const [editSummary, setEditSummary] = useState<string>("");
  const [editSkills, setEditSkills] = useState<string>("");

  // States for CV Tailoring configuration
  const [cvTone, setCvTone] = useState<"executive" | "technical">("executive");
  const [selectedTemplatePreset, setSelectedTemplatePreset] = useState<"serif" | "classic" | "tech">("serif");

  // States for CL Tailoring Configuration
  const [coverStyle, setCoverStyle] = useState<"standard" | "short" | "high-conviction">("standard");

  // Filter state for positions tracker
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // --- SAVE STATE PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("app_copilot_master_cvs", JSON.stringify(masterCvs));
  }, [masterCvs]);

  useEffect(() => {
    localStorage.setItem("app_copilot_selected_cv_id", selectedMasterCvId);
  }, [selectedMasterCvId]);

  useEffect(() => {
    localStorage.setItem("app_copilot_jobs", JSON.stringify(jobs));
  }, [jobs]);

  // Check backend health
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setApiMode(data.aiMode || "mock");
      })
      .catch((err) => {
        console.error("Health check error:", err);
        setApiMode("mock");
      });
  }, []);

  // Update Edit Profile fields whenever the selected Master CV changes
  useEffect(() => {
    if (masterCv) {
      setEditFullName(masterCv.fullName || "");
      setEditEmail(masterCv.email || "");
      setEditPhone(masterCv.phone || "");
      setEditLocation(masterCv.location || "");
      setEditLinkedin(masterCv.linkedin || "");
      setEditSummary(masterCv.summary || "");
      setEditSkills((masterCv.skills || []).join("\n"));
    }
  }, [selectedMasterCvId, masterCv]);

  // Automatically select first job if selectedJobId is invalid
  useEffect(() => {
    if (jobs.length > 0 && (!selectedJobId || !jobs.some(j => j.id === selectedJobId))) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  // --- HANDLERS ---

  // Trigger server-side JD parsing or offline mock fallback
  const handleParseJob = async (jobId: string) => {
    const jobToParse = jobs.find((j) => j.id === jobId);
    if (!jobToParse) return;

    setIsLoadingApi(true);
    setApiError(null);

    try {
      const res = await fetch("/api/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText: jobToParse.originalJD,
          masterCv
        })
      });

      if (!res.ok) {
        throw new Error(`Parse failed with status ${res.status}`);
      }

      const responseData = await res.json();
      
      setJobs((prev) =>
        prev.map((j) => {
          if (j.id === jobId) {
            const checkItems: ChecklistItem[] = [
              { id: "check-1", label: "Verify experience correctness & metrics truthfulness", checked: true },
              { id: "check-2", label: "Inspect preferred qualifications alignments", checked: false },
              { id: "check-3", label: "Cross-reference Red Flags highlighted by AI scanner", checked: false },
              { id: "check-4", label: "Audit grammar and format of the output CV", checked: false }
            ];

            return {
              ...j,
              parsedJobJson: responseData.parsed || null,
              match: responseData.match ? { ...responseData.match, profileId: selectedMasterCvId } : null,
              checklist: checkItems,
              notes: responseData.isMockMode
                ? "Analyzed with localized heuristic algorithms."
                : "Parsed with Google Gemini AI system."
            };
          }
          return j;
        })
      );
    } catch (err: any) {
      console.error("GD Parsing error:", err);
      setApiError(err.message || "Failed to query the parsing endpoint.");
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Trigger server-side CV bullet refactoring
  const handleTailorCv = async (jobId: string) => {
    const jobToTailor = jobs.find((j) => j.id === jobId);
    if (!jobToTailor) return;

    setIsLoadingApi(true);
    setApiError(null);

    try {
      const res = await fetch("/api/tailor-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText: jobToTailor.originalJD,
          masterCv,
          toneMode: cvTone
        })
      });

      if (!res.ok) {
        throw new Error(`CV Tailoring failed with status ${res.status}`);
      }

      const responseData = await res.json();
      const rawTailoredData = responseData.tailored || responseData.tailoredCV;

      setJobs((prev) =>
        prev.map((j) => {
          if (j.id === jobId) {
            return {
              ...j,
              tailoredCV: rawTailoredData ? { ...rawTailoredData, profileId: selectedMasterCvId } : null,
              status: j.status === "To Review" ? "Tailor CV" : j.status
            };
          }
          return j;
        })
      );
    } catch (err: any) {
      console.error("CV Tailoring error:", err);
      setApiError(err.message || "Failed to tailor CV.");
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Trigger server-side Cover Letter generation
  const handleGenerateCoverLetter = async (jobId: string) => {
    const jobToCL = jobs.find((j) => j.id === jobId);
    if (!jobToCL) return;

    setIsLoadingApi(true);
    setApiError(null);

    try {
      const res = await fetch("/api/generate-cl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText: jobToCL.originalJD,
          masterCv,
          letterStyle: coverStyle
        })
      });

      if (!res.ok) {
        throw new Error(`Cover Letter creation failed with status ${res.status}`);
      }

      const responseData = await res.json();
      const rawCoverLetter = responseData.coverLetter || responseData.tailoredCoverLetter;

      setJobs((prev) =>
        prev.map((j) => {
          if (j.id === jobId) {
            return {
              ...j,
              tailoredCoverLetter: rawCoverLetter ? { ...rawCoverLetter, profileId: selectedMasterCvId } : null,
              status: j.status === "Tailor CV" ? "Draft Cover Letter" : j.status
            };
          }
          return j;
        })
      );
    } catch (err: any) {
      console.error("CL Generation error:", err);
      setApiError(err.message || "Failed to generate cover letter.");
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Combine Master CV and tailored bullets into HTML Doc/Print template
  const renderCvTemplate = (
    preset: "serif" | "classic" | "tech",
    profile: any,
    summaryText: string,
    experienceList: any[],
    educationList: any[]
  ) => {
    let output = TEMPLATE_SERIF;
    const fullNameVal = profile.fullName || "";
    const emailVal = profile.email || "";
    const phoneVal = profile.phone || "";
    const locationVal = profile.location || "";
    const linkedinVal = profile.linkedin || "";
    const websiteVal = profile.website || "";

    output = output.replace(/\{\{fullName\}\}/g, fullNameVal);
    output = output.replace(/\{\{email\}\}/g, emailVal);
    output = output.replace(/\{\{phone\}\}/g, phoneVal);
    output = output.replace(/\{\{location\}\}/g, locationVal);
    output = output.replace(/\{\{linkedin\}\}/g, linkedinVal);
    output = output.replace(/\{\{website\}\}/g, websiteVal);
    output = output.replace(/\{\{summary\}\}/g, summaryText || "");

    // Clean duplicate dividers
    output = output.replace(/(&nbsp;)*\|(&nbsp;|\s)*\|/g, " &nbsp;|");
    output = output.replace(/(&nbsp;|\s)*\|(&nbsp;|\s)*<\/span>/g, "</span>");

    const skillsCommaHtml = (profile.skills || []).join(", ");
    output = output.replace(/\{\{skills_comma\}\}/g, skillsCommaHtml);

    // Build experience block
    const expHtml = experienceList.map((exp: any, index: number) => {
      const bulletsHtml = (exp.bullets || []).map((b: any) => {
        const bText = typeof b === "string" ? b : (b.modifiedBullet || b.originalBullet || "");
        return `<li class="li-bullet-0" style="margin-left: 0; text-align: justify; margin-bottom: 1px; padding: 0; line-height: 1.15;"><span class="c0 c6">${bText}</span></li>`;
      }).join("");

      const marginTop = index === 0 ? "1px" : "4px";
      return `<table style="width: 100%; border-collapse: collapse; border: none; margin-top: ${marginTop}; margin-bottom: 1px; padding: 0; line-height: 1.15;"><tr style="border: none;"><td style="text-align: left; padding: 0; border: none; margin: 0;"><span class="c4">${exp.role} &mdash; ${exp.company}</span></td><td style="text-align: right; padding: 0; border: none; margin: 0; white-space: nowrap; padding-left: 20px;"><span class="c9">${exp.duration || ""}</span></td></tr></table><ul class="c7 lst-kix_list_1-0" style="list-style-type: disc; padding-left: 12pt; margin-left: 0; margin-top: 1px; padding-top: 0px; margin-bottom: 2px;">${bulletsHtml}</ul>`;
    }).join("");

    output = output.replace(/\{\{experience\}\}/g, expHtml);

    // Build education block
    const eduItems = educationList.map((edu: any, index: number) => {
      const marginTop = index === 0 ? "1px" : "4px";
      return `<table style="width: 100%; border-collapse: collapse; border: none; margin-top: ${marginTop}; margin-bottom: 1px; padding: 0; line-height: 1.15;"><tr style="border: none;"><td style="text-align: left; padding: 0; border: none; margin: 0;"><span class="c4">${edu.degree}</span></td><td style="text-align: right; padding: 0; border: none; margin: 0; white-space: nowrap; padding-left: 20px;"><span class="c9">${edu.duration}</span></td></tr></table><p class="c16" style="margin-top: 1px; margin-bottom: 2px;"><span class="c0">${edu.school}${edu.gpa ? ` &nbsp;&bull;&nbsp; GPA: ${edu.gpa}` : ""}</span></p>${edu.details ? `<p class="c8" style="margin-top: 1px; margin-bottom: 2px;"><span class="c18">${edu.details}</span></p>` : ""}`;
    }).join("");

    const certsItems = (profile.certifications || []).map((cert: string) => `
      <p class="c15" style="margin-top: 1px; margin-bottom: 2px;"><span class="c0">&bull;&nbsp; ${cert}</span></p>
    `).join("");

    const eduHtml = `
      ${eduItems}
      ${certsItems ? `
        <div style="margin-top: 4px; border-top: 0.5px dashed #ccc; padding-top: 2px;">
          <p class="c15" style="font-weight: bold; font-family: 'Cambria', serif; font-size: 9.5pt; margin-bottom: 2px;"><span class="c4">Certifications &amp; Accreditations</span></p>
          ${certsItems}
        </div>
      ` : ""}
    `;

    output = output.replace(/\{\{education\}\}/g, eduHtml);

    const languagesVal = profile.languages || "English (Fluent)";
    output = output.replace(/\{\{languages\}\}/g, languagesVal);

    return output;
  };

  // Exporter triggers
  const handleExportTailoredCv = (format: "doc" | "md" | "print") => {
    if (!activeJob) {
      alert("Please select a job first.");
      return;
    }

    // Fall back to Master CV dimensions if no tailored CV has been generated yet
    const summary = activeJob.tailoredCV ? activeJob.tailoredCV.summary : masterCv.summary;
    const experience = activeJob.tailoredCV ? activeJob.tailoredCV.experience : null;

    // Merge Master profile dimensions with tailored text points if they exist, otherwise use master bullets
    const mergedExperience = masterCv.experience.map((mExp) => {
      const tExp = experience?.find(
        (te: any) => te.id === mExp.id || (te.company && te.company.toLowerCase() === mExp.company.toLowerCase())
      );

      if (tExp) {
        const mergedBullets = mExp.bullets.map((mb, bIdx) => {
          const tb = (tExp.bullets || [])[bIdx] || (tExp.bullets || []).find((b: any) => b.originalBullet === mb);
          return {
            originalBullet: mb,
            modifiedBullet: tb ? (tb.modifiedBullet ?? mb) : mb
          };
        });

        return {
          ...mExp,
          bullets: mergedBullets
        };
      }

      return {
        ...mExp,
        bullets: mExp.bullets.map((mb) => ({ originalBullet: mb, modifiedBullet: mb }))
      };
    });

    if (format === "md") {
      let mdContent = `# ${masterCv.fullName}\n`;
      mdContent += `${masterCv.location} | ${masterCv.phone} | ${masterCv.email} | ${masterCv.linkedin}\n\n`;
      mdContent += `## Professional Summary\n${summary}\n\n`;
      mdContent += `## Core Skills\n${masterCv.skills.map(s => `- ${s}`).join("\n")}\n\n`;
      mdContent += `## Experience\n\n`;

      mergedExperience.forEach((exp) => {
        mdContent += `### ${exp.company} — ${exp.role}\n`;
        mdContent += `*${exp.location} | ${exp.duration}*\n\n`;
        exp.bullets.forEach((b) => {
          mdContent += `- ${b.modifiedBullet}\n`;
        });
        mdContent += `\n`;
      });

      mdContent += `## Education\n\n`;
      masterCv.education.forEach((edu) => {
        mdContent += `### ${edu.school}\n`;
        mdContent += `*${edu.degree} (${edu.duration})${edu.gpa ? `, GPA: ${edu.gpa}` : ""}*\n`;
        if (edu.details) mdContent += `${edu.details}\n`;
        mdContent += `\n`;
      });

      const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${activeJob.company.replace(/\s+/g, '_')}_Tailored_CV.md`;
      link.click();
    } else if (format === "doc") {
      const docHtml = renderCvTemplate(selectedTemplatePreset, masterCv, summary, mergedExperience, masterCv.education);
      const blob = new Blob([docHtml], { type: "application/msword;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${activeJob.company.replace(/\s+/g, '_')}_Tailored_CV.doc`;
      link.click();
    } else if (format === "print") {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Popup window was blocked by the browser! Please enable popups to trigger print preview layouts.");
        return;
      }
      const rawLayout = renderCvTemplate(selectedTemplatePreset, masterCv, summary, mergedExperience, masterCv.education);
      printWindow.document.write(rawLayout);
      printWindow.document.close();
    }
  };

  // Add new Job listing manually
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobCompany || !newJobTitle || !newJobJD) {
      alert("Please provide at least Company Name, Job Title, and Listing description rules.");
      return;
    }

    const newId = `job-${Date.now()}`;
    const newJobRecord: Job = {
      id: newId,
      company: newJobCompany,
      roleTitle: newJobTitle,
      location: newJobLocation || "Hybrid / London, UK",
      workplaceType: newJobWorktype,
      seniority: newJobSeniority,
      sector: newJobSector,
      sponsorship: "Yes",
      salary: newJobSalary || undefined,
      status: "To Review",
      tags: [newJobSector.split(" ")[0].toLowerCase(), newJobSeniority.toLowerCase()],
      originalJD: newJobJD,
      dateCreated: new Date().toISOString(),
      link: newJobUrl || undefined,
      notes: "Newly integrated listing record."
    };

    setJobs((prev) => [newJobRecord, ...prev]);
    setSelectedJobId(newId);
    setIsAddingJob(false);
    
    // Cleanup inputs
    setNewJobCompany("");
    setNewJobTitle("");
    setNewJDText("");
    setNewJobUrl("");
    setNewJobSalary("");

    // Automatically navigate and parse
    setNavTab("workspace");
    setWorkspaceTab("alignment");
    setTimeout(() => {
      handleParseJob(newId);
    }, 150);
  };

  // 1-Click AI Auto Extract of JD
  const handleQuickAiExtractAndImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobJD) {
      alert("Please paste the Listing Text / Job Description first.");
      return;
    }

    setIsQuickExtracting(true);
    setIsLoadingApi(true);
    setApiError(null);

    try {
      const res = await fetch("/api/parse-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText: newJobJD,
          masterCv
        })
      });

      if (!res.ok) {
        throw new Error(`Auto-extraction failed with status ${res.status}`);
      }

      const responseData = await res.json();
      const parsed = responseData.parsed || {};
      const match = responseData.match || null;

      const newId = `job-${Date.now()}`;
      const checkItems: ChecklistItem[] = [
        { id: "check-1", label: "Verify experience correctness & metrics truthfulness", checked: true },
        { id: "check-2", label: "Inspect preferred qualifications alignments", checked: false },
        { id: "check-3", label: "Cross-reference Red Flags highlighted by AI scanner", checked: false },
        { id: "check-4", label: "Audit grammar and format of the output CV", checked: false }
      ];

      const newJobRecord: Job = {
        id: newId,
        company: parsed.company || "Extracted Company",
        roleTitle: parsed.roleTitle || "Extracted Role",
        location: parsed.location || "Hybrid / London, UK",
        workplaceType: parsed.location?.toLowerCase().includes("remote") ? "remote" : parsed.location?.toLowerCase().includes("hybrid") ? "hybrid" : "on-site",
        seniority: parsed.seniority || "Associate",
        sector: newJobSector || "Quantitative Trading",
        sponsorship: "Yes",
        status: "To Review",
        tags: ["AI-Extract", (parsed.seniority || "Associate").toLowerCase()],
        originalJD: newJobJD,
        parsedJobJson: parsed,
        match: match,
        checklist: checkItems,
        dateCreated: new Date().toISOString(),
        link: newJobUrl || undefined,
        notes: "Automatically parsed and registered via Gemini AI extraction."
      };

      setJobs((prev) => [newJobRecord, ...prev]);
      setSelectedJobId(newId);
      setIsAddingJob(false);
      setNewJDText("");
      setNewJobUrl("");
      setNavTab("workspace");
      setWorkspaceTab("alignment");
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to auto-extract with Gemini.");
      alert(err.message || "Failed to auto-extract. Falling back to manual details entry.");
    } finally {
      setIsQuickExtracting(false);
      setIsLoadingApi(false);
    }
  };

  // Keep manual editing overrides on tailored Bullets active in local-state
  const handleEditTailoredBullet = (expId: string, bulletId: string, newText: string) => {
    if (!activeJob || !activeJob.tailoredCV) return;

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === selectedJobId && j.tailoredCV) {
          const updatedExp = j.tailoredCV.experience.map((exp) => {
            if (exp.id === expId) {
              const updatedBullets = exp.bullets.map((b) =>
                b.id === bulletId ? { ...b, modifiedBullet: newText } : b
              );
              return { ...exp, bullets: updatedBullets };
            }
            return exp;
          });
          return {
            ...j,
            tailoredCV: { ...j.tailoredCV, experience: updatedExp }
          };
        }
        return j;
      })
    );
  };

  // Toggle checklist task status
  const toggleChecklistItem = (jobId: string, itemId: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId && j.checklist) {
          return {
            ...j,
            checklist: j.checklist.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            )
          };
        }
        return j;
      })
    );
  };

  // Update pipeline state
  const updateJobStatus = (jobId: string, newStatus: Job["status"]) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return { ...j, status: newStatus };
        }
        return j;
      })
    );
  };

  // Deep deletion
  const handleDeleteJob = (jobId: string) => {
    const remaining = jobs.filter((j) => j.id !== jobId);
    setJobs(remaining);
    if (selectedJobId === jobId) {
      setSelectedJobId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Save master CV modifications
  const handleSaveCvEdit = () => {
    setMasterCvs((prev) =>
      prev.map((c) =>
        c.id === selectedMasterCvId
          ? {
              ...c,
              fullName: editFullName,
              email: editEmail,
              phone: editPhone,
              location: editLocation,
              linkedin: editLinkedin,
              summary: editSummary,
              skills: editSkills.split("\n").map(s => s.trim()).filter(Boolean)
            }
          : c
      )
    );
    setProfileEditMode(false);
  };

  // Filter calculations
  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.originalJD.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-[#09090b] text-[#f4f4f5] min-h-screen flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Application Header */}
      <header className="border-b border-[#27272a] bg-[#09090b] sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-[#10b981] p-1.5 bg-[#18181b] rounded-lg border border-[#27272a]">
            <Briefcase size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight text-white">Application Copilot</h1>
              <span className="text-[10px] bg-[#18181b] border border-[#27272a] text-zinc-400 px-1.5 py-0.5 rounded font-mono font-medium">v2.0-Sleek</span>
            </div>
            <p className="text-xs text-zinc-500 font-medium">CV & Cover Letter Tailoring Engine</p>
          </div>
        </div>

        {/* Global profile selection & Status indicators */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2 text-xs bg-[#18181b] border border-[#27272a] px-3 py-1.5 rounded-lg text-zinc-300">
            <span className="text-zinc-500 font-sans font-medium">Master Profile:</span>
            <select
              value={selectedMasterCvId}
              onChange={(e) => setSelectedMasterCvId(e.target.value)}
              className="bg-transparent border-none text-white font-bold max-w-[160px] focus:outline-none focus:ring-0 cursor-pointer"
            >
              {masterCvs.map(cv => (
                <option key={cv.id} value={cv.id} className="bg-[#0b0f19] text-white font-sans text-xs">{getProfileDisplayName(cv)} Profile</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-[#18181b] border border-[#27272a] px-3 py-1.5 rounded-lg text-xs">
            <span className={`h-1.5 w-1.5 rounded-full mr-2 ${apiMode === "live" ? "bg-[#10b981]" : "bg-amber-500"}`}></span>
            <span className="text-zinc-300 font-mono text-[11px] font-semibold">
              AI: {apiMode === "live" ? "Gemini-3.5-Live" : "Offline-Engine"}
            </span>
          </div>

          <button
            onClick={() => setIsAddingJob(true)}
            className="bg-[#f4f4f5] hover:bg-white text-black font-semibold text-xs py-1.5 px-3.5 rounded-lg transition-colors flex items-center space-x-1"
          >
            <Plus size={14} />
            <span>Add Position</span>
          </button>
        </div>
      </header>

      {/* Main Grid Scaffold */}
      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 bg-[#09090b] border-r border-[#27272a] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-3 mb-3">Sections</p>
              <div className="space-y-1">
                
                {/* 1. Job Tracker Tab link */}
                <button
                  onClick={() => setNavTab("jobs")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                    navTab === "jobs"
                      ? "bg-[#18181b] border border-[#27272a] text-white font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-[#18181b]/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Briefcase size={15} />
                    <span>Jobs Tracker Board</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold bg-[#18181b] px-1.5 py-0.2 rounded-md">
                    {jobs.length}
                  </span>
                </button>

                {/* 2. Tailor Workspace link (Disabled of zero positions) */}
                <button
                  onClick={() => {
                    if (jobs.length === 0) {
                      alert("Please add an active position first before loading the tailoring workspace!");
                      return;
                    }
                    setNavTab("workspace");
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                    navTab === "workspace"
                      ? "bg-[#18181b] border border-[#27272a] text-white font-semibold"
                      : jobs.length === 0
                      ? "text-zinc-600 cursor-not-allowed opacity-50"
                      : "text-zinc-400 hover:text-white hover:bg-[#18181b]/50"
                  }`}
                >
                  <Layers size={15} />
                  <span>CV & CL Tailoring Workspace</span>
                </button>

                {/* 3. Master CV version setup */}
                <button
                  onClick={() => setNavTab("cv")}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                    navTab === "cv"
                      ? "bg-[#18181b] border border-[#27272a] text-white font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-[#18181b]/50"
                  }`}
                >
                  <FileText size={15} />
                  <span>My Grounding Profiles ({masterCvs.length})</span>
                </button>

                {/* 4. Calibration Board Setup */}
                <button
                  onClick={() => setNavTab("protocol")}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                    navTab === "protocol"
                      ? "bg-[#18181b] border border-[#27272a] text-white font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-[#18181b]/50"
                  }`}
                >
                  <SlidersHorizontal size={15} />
                  <span>Calibration Board &amp; Rules</span>
                </button>

              </div>
            </div>

            {/* Target position context tracker links */}
            {jobs.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase px-3 mb-2">Tracked Listings</p>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setNavTab("workspace");
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-all flex items-center justify-between text-zinc-400 hover:text-white hover:bg-[#111113] ${
                        selectedJobId === job.id && navTab === "workspace"
                          ? "bg-[#18181b] text-[#10b981] font-semibold border border-[#27272a]/80"
                          : ""
                      }`}
                    >
                      <div className="truncate mr-2 text-left">
                        <div className="font-semibold text-zinc-200 truncate">{job.company}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{job.roleTitle}</div>
                      </div>
                      {job.match && (
                        <span className="text-[10px] font-semibold font-mono text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded-md">
                          {job.match.matchScore}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#27272a] pt-4 px-2 space-y-1">
            <div className="text-[10px] text-zinc-500 font-mono">Selected Base CV Profile:</div>
            <div className="text-xs font-bold text-zinc-200 truncate">{getProfileDisplayName(masterCv)} Profile</div>
          </div>
        </nav>

        {/* Content View viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Active API Global Loadings Banner */}
          {isLoadingApi && (
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3 flex items-center justify-between shadow-sm animate-pulse">
              <div className="flex items-center space-x-2 text-xs text-zinc-300">
                <RefreshCw size={14} className="animate-spin text-[#10b981]" />
                <span>AI Process actively optimizing, generating letters, and synthesizing data...</span>
              </div>
            </div>
          )}

          {apiError && (
            <div className="bg-rose-950/20 border border-rose-900/55 rounded-lg p-3.5 flex items-center space-x-3 text-xs text-rose-200">
              <AlertCircle size={15} className="shrink-0 text-rose-500" />
              <span>{apiError}</span>
            </div>
          )}

          {/* 1. SECTION: LISTS OF TRACKED POSITIONS */}
          {navTab === "jobs" && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Tracker stats overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-1">
                  <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">Total Tracked</div>
                  <div className="text-2xl font-extrabold text-white">{jobs.length}</div>
                </div>
                <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-1">
                  <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">Applied</div>
                  <div className="text-2xl font-extrabold text-[#10b981]">{jobs.filter(j => j.status === "Applied").length}</div>
                </div>
                <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-1">
                  <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">Interviews Active</div>
                  <div className="text-2xl font-extrabold text-[#10b981]">{jobs.filter(j => j.status === "Interviewing").length}</div>
                </div>
                <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-1">
                  <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">Strong Matches</div>
                  <div className="text-2xl font-extrabold text-white">
                    {jobs.filter(j => j.match && j.match.matchScore >= 80).length}
                  </div>
                </div>
              </div>

              {/* Positions Database */}
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 md:p-6 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Positions Database Tracker</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Edit tracking statuses, check alignment score gaps, and launch CV/CL tailoring.</p>
                  </div>
                  
                  {/* List controllers */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-[#09090b] border border-[#27272a] px-2 py-1.5 rounded-lg items-center space-x-1.5 flex-1 min-w-[200px] md:max-w-xs">
                      <Search size={14} className="text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search company or role title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent text-xs w-full focus:outline-none text-zinc-200"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-[#09090b] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="To Review">To Review</option>
                      <option value="Tailor CV">Tailor CV</option>
                      <option value="Draft Cover Letter">Draft Cover Letter</option>
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Grid of job cards */}
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-[#27272a] rounded-lg space-y-2">
                    <AlertTriangle className="mx-auto text-zinc-600" size={24} />
                    <p className="text-xs text-zinc-400">No tracked positions matching the criteria discovered.</p>
                    <button
                      onClick={() => setIsAddingJob(true)}
                      className="text-xs underline text-[#10b981]"
                    >
                      Import new JD to start
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredJobs.map((job) => (
                      <div
                        key={job.id}
                        className={`bg-[#09090b] border rounded-xl p-5 hover:border-zinc-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                          selectedJobId === job.id ? "border-[#10b981]/60" : "border-[#27272a]"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono uppercase bg-[#18181b] border border-[#27272a] text-zinc-400 px-1.5 py-0.5 rounded">
                              {job.sector}
                            </span>
                            
                            <select
                              value={job.status}
                              onChange={(e) => updateJobStatus(job.id, e.target.value as any)}
                              className="bg-[#18181b] border border-[#27272a] rounded text-[10px] px-1.5 py-0.5 focus:outline-none font-semibold text-[#10b981] cursor-pointer"
                            >
                              <option value="To Review">To Review</option>
                              <option value="Tailor CV">Tailor CV</option>
                              <option value="Draft Cover Letter">Draft Cover Letter</option>
                              <option value="Applied">Applied</option>
                              <option value="Interviewing">Interviewing</option>
                              <option value="Offer">Offer</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>

                          <div>
                            <h4 className="text-sm font-extrabold text-white truncate">{job.company}</h4>
                            <p className="text-xs text-zinc-400 truncate">{job.roleTitle}</p>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-2 text-[10px] text-zinc-500">
                            <span className="flex items-center space-x-0.5">
                              <MapPin size={11} />
                              <span className="truncate max-w-[120px]">{job.location}</span>
                            </span>
                            {job.salary && <span>• {job.salary}</span>}
                          </div>
                        </div>

                        {job.match ? (
                          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-2.5 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">ATS Score</div>
                              <div className="font-semibold text-zinc-300 truncate max-w-[190px]">{job.match.matchCategory}</div>
                            </div>
                            <span className="text-base font-bold font-mono text-[#10b981]">
                              {job.match.matchScore}%
                            </span>
                          </div>
                        ) : (
                          <div className="bg-[#18181b]/50 border border-dashed border-[#27272a] rounded-lg p-2.5 flex items-center justify-between text-[11px] text-zinc-400">
                            <span>Analysis not loaded</span>
                            <button
                              onClick={() => handleParseJob(job.id)}
                              className="text-[10px] px-2 py-0.5 bg-[#f4f4f5] hover:bg-white text-black font-semibold rounded cursor-pointer"
                            >
                              Scan Alignment
                            </button>
                          </div>
                        )}

                        <div className="border-t border-[#27272a] pt-3 flex justify-between items-center text-xs">
                          <button
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setNavTab("workspace");
                              setWorkspaceTab("alignment");
                            }}
                            className="text-[#10b981] hover:underline font-bold flex items-center space-x-1"
                          >
                            <span>Open Workspace</span>
                            <ChevronRight size={13} />
                          </button>

                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                            title="Delete Position Records"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. SECTION: ACTIVE TAILORING WORKSPACE */}
          {navTab === "workspace" && activeJob && (
            <div className="space-y-6">
              
              {/* Workspace Job description overview card */}
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 md:p-6 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500">
                      <span>Workspace Context</span>
                      <ChevronRight size={11} />
                      <span className="font-bold text-[#10b981]">{activeJob.company}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">
                      {activeJob.roleTitle} &mdash; <span className="text-zinc-400">{activeJob.company}</span>
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Grounding calculations against active profile: <span className="font-bold text-[#10b981]">{getProfileDisplayName(masterCv)}</span></p>
                  </div>

                  <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="text-xs">
                      <span className="text-zinc-500">Pipeline Status:</span>
                      <select
                        value={activeJob.status}
                        onChange={(e) => updateJobStatus(activeJob.id, e.target.value as any)}
                        className="ml-2 bg-[#09090b] border border-[#27272a] rounded-lg px-2.5 py-1 font-bold text-[#10b981] cursor-pointer focus:outline-none"
                      >
                        <option value="To Review">To Review</option>
                        <option value="Tailor CV">Tailor CV</option>
                        <option value="Draft Cover Letter">Draft Cover Letter</option>
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleParseJob(activeJob.id)}
                      className="bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-white p-1.5 rounded-lg text-xs"
                      title="Run Full Job Diagnostics and ATS Match Analysis"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>

                {/* Sub-tabs switchers in workspace */}
                <div className="flex border-b border-[#27272a] pt-2">
                  <button
                    onClick={() => setWorkspaceTab("alignment")}
                    className={`pb-2.5 px-4 text-xs font-semibold tracking-wide border-b-2 transition-all ${
                      workspaceTab === "alignment"
                        ? "border-[#10b981] text-[#10b981]"
                        : "border-transparent text-zinc-400 hover:text-white"
                    }`}
                  >
                    1. Alignments & Diagnostics
                  </button>
                  
                  <button
                    onClick={() => setWorkspaceTab("cv")}
                    className={`pb-2.5 px-4 text-xs font-semibold tracking-wide border-b-2 transition-all ${
                      workspaceTab === "cv"
                        ? "border-[#10b981] text-[#10b981]"
                        : "border-transparent text-zinc-400 hover:text-white"
                    }`}
                  >
                    2. Tailored CV Builder
                  </button>

                  <button
                    onClick={() => setWorkspaceTab("cl")}
                    className={`pb-2.5 px-4 text-xs font-semibold tracking-wide border-b-2 transition-all ${
                      workspaceTab === "cl"
                        ? "border-[#10b981] text-[#10b981]"
                        : "border-transparent text-zinc-400 hover:text-white"
                    }`}
                  >
                    3. Tailored Cover Letter
                  </button>
                </div>
              </div>

              {/* 2.A VIEW: ALIGNMENTS & DIAGNOSTICS */}
              {workspaceTab === "alignment" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Selector panel for cross-referencing grounding profiles */}
                  <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1.5 max-w-lg">
                      <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cross-Check Target Profile</h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Choose which Master Grounding Profile to cross-reference and analyze against this job description to recalibrate the candidate score.
                      </p>
                      <div className="flex bg-[#09090b] border border-[#27272a] p-1 rounded-lg w-fit mt-1">
                        {masterCvs.map((cv) => (
                          <button
                            key={cv.id}
                            onClick={() => setSelectedMasterCvId(cv.id!)}
                            className={`px-3 py-1.5 rounded-md font-semibold font-sans text-[10.5px] transition-all cursor-pointer ${
                              selectedMasterCvId === cv.id
                                ? "bg-[#10b981] text-white font-bold shadow-md shadow-emerald-900/20"
                                : "text-zinc-400 hover:text-zinc-250"
                            }`}
                          >
                            {getProfileDisplayName(cv)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleParseJob(activeJob.id)}
                        disabled={isLoadingApi}
                        className={`font-semibold font-sans text-xs px-4 py-2.5 rounded-xl border transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                          isLoadingApi
                            ? "bg-[#18181b] border-[#27272a] text-zinc-500 cursor-not-allowed"
                            : "bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981] hover:text-white hover:border-[#10b981] shadow-lg shadow-emerald-990/10 active:scale-[0.98]"
                        }`}
                      >
                        {isLoadingApi ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Recalibrating...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>Recalibrate Match &amp; Score</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Parsed Metadata & Match metrics */}
                  <div className="lg:col-span-7 space-y-6">
                    {activeJob.match ? (
                      <div className="space-y-6">
                        {/* Overall Calibration Score Card */}
                        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 md:p-6 space-y-5">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#09090b] border border-[#27272a] p-5 rounded-xl gap-4">
                            <div>
                              <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest font-mono">Senior Recruiter Calibration Grade</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm font-bold text-white tracking-tight">{activeJob.match.matchCategory}</span>
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  activeJob.match.matchCategory?.toLowerCase().includes("strong")
                                    ? "bg-emerald-500"
                                    : activeJob.match.matchCategory?.toLowerCase().includes("reasonable")
                                    ? "bg-teal-500"
                                    : activeJob.match.matchCategory?.toLowerCase().includes("stretch")
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`} />
                              </div>
                              <p className="text-xs text-zinc-300 leading-relaxed mt-1">{activeJob.match.fitReasoning}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-4xl font-black font-mono tracking-tight text-[#10b981]">{activeJob.match.matchScore}%</div>
                              <div className="text-[9px] text-zinc-500 font-bold font-mono uppercase tracking-wider mt-0.5">ATS Weighted Congruence</div>
                            </div>
                          </div>

                          {/* 5-Dimension Recruiter Breakout Progress Bars */}
                          <div className="space-y-3.5 border-t border-[#27272a] pt-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Factual Recruiter Weighted Scores</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                              {/* 1. Technical */}
                              <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg space-y-1.5">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span className="text-zinc-400">Technical Alignment</span>
                                  <span className="text-white font-bold">{activeJob.match.technicalScore ?? 22}/25</span>
                                </div>
                                <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${((activeJob.match.technicalScore ?? 22) / 25) * 100}%` }} />
                                </div>
                              </div>
                              {/* 2. Domain */}
                              <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg space-y-1.5">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span className="text-zinc-400">Domain Exposure</span>
                                  <span className="text-white font-bold">{activeJob.match.domainScore ?? 16}/20</span>
                                </div>
                                <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${((activeJob.match.domainScore ?? 16) / 20) * 100}%` }} />
                                </div>
                              </div>
                              {/* 3. Seniority */}
                              <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg space-y-1.5">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span className="text-zinc-400">Seniority &amp; Scale</span>
                                  <span className="text-white font-bold">{activeJob.match.seniorityScore ?? 18}/20</span>
                                </div>
                                <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${((activeJob.match.seniorityScore ?? 18) / 20) * 100}%` }} />
                                </div>
                              </div>
                              {/* 4. Credibility */}
                              <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg space-y-1.5">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span className="text-zinc-400">Evidence Integrity</span>
                                  <span className="text-white font-bold">{activeJob.match.credibilityScore ?? 19}/20</span>
                                </div>
                                <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${((activeJob.match.credibilityScore ?? 19) / 20) * 100}%` }} />
                                </div>
                              </div>
                              {/* 5. ATS Keyword */}
                              <div className="bg-[#09090b] border border-[#27272a] p-3 rounded-lg space-y-1.5">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span className="text-zinc-400">ATS Optimization</span>
                                  <span className="text-white font-bold">{activeJob.match.atsScore ?? 13}/15</span>
                                </div>
                                <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-[#10b981] h-full rounded-full" style={{ width: `${((activeJob.match.atsScore ?? 13) / 15) * 100}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Profiles Relocation Alert Warning */}
                        {activeJob.match.profileId && activeJob.match.profileId !== selectedMasterCvId && (
                          <div className="bg-[#451a03]/50 border border-[#78350f]/60 p-3.5 rounded-xl text-[11px] text-[#fcd34d] flex items-start space-x-2 leading-relaxed animate-fade-in">
                            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                            <div>
                              <span>
                                Score assessment calculated using <strong>{getProfileDisplayName(masterCvs.find(c => c.id === activeJob.match.profileId) || { id: activeJob.match.profileId, label: "Another Profile", summary: "" })}</strong> master profile.
                              </span>
                              <p className="mt-1 text-zinc-400">
                                Click <strong className="text-white font-semibold">Recalibrate Match &amp; Score</strong> button above to realign against active <strong className="text-[#10b981] font-semibold">{getProfileDisplayName(masterCv)}</strong>.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Top Strengths & Key Concerns Double Column */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Strengths Card */}
                          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 md:p-6 space-y-4">
                            <h4 className="text-xs font-bold text-[#10b981] uppercase tracking-wider font-mono flex items-center space-x-1.5">
                              <CheckCircle2 size={14} />
                              <span>Verified Top Strengths</span>
                            </h4>
                            <ul className="space-y-2.5">
                              {(activeJob.match.strengths ?? ["Fully matches academic training targets."]).map((s, idx) => (
                                <li key={idx} className="text-xs text-zinc-300 flex items-start space-x-2">
                                  <span className="text-[#10b981] font-mono tracking-widest shrink-0 mt-0.5">✓</span>
                                  <span className="leading-relaxed">{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Concerns Card */}
                          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 md:p-6 space-y-4">
                            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                              <AlertTriangle size={14} />
                              <span>Key Concerns &amp; Warning Flags</span>
                            </h4>
                            <ul className="space-y-2.5">
                              {(activeJob.match.concerns ?? ["None flagged under active criteria."]).map((s, idx) => (
                                <li key={idx} className="text-xs text-zinc-300 flex items-start space-x-2">
                                  <span className="text-amber-500 font-mono tracking-widest shrink-0 mt-0.5">⚠</span>
                                  <span className="leading-relaxed">{s}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Unused Keywords & Weakness Notes Double Column */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Unused Keywords Card */}
                          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 md:p-6 space-y-4">
                            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                              <AlertCircle size={14} />
                              <span>Grounded Gaps: Unused Keywords</span>
                            </h4>
                            <p className="text-[11px] text-zinc-400 leading-normal">
                              We intentionally omit these keywords from the rewritten CV to preserve truthfulness, because the candidate has zero evidence matching them.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(activeJob.match.unusedKeywords && activeJob.match.unusedKeywords.length > 0) ? (
                                activeJob.match.unusedKeywords.map((tag, idx) => (
                                  <span key={idx} className="text-[10px] font-mono bg-rose-950/20 border border-rose-900/30 text-rose-300 px-2.5 py-0.5 rounded-md">
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-zinc-500 italic">No keywords intentionally omitted.</span>
                              )}
                            </div>
                          </div>

                          {/* Weakness Notes Card */}
                          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 md:p-6 space-y-4">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center space-x-1.5">
                              <SlidersHorizontal size={13} />
                              <span>Recruiter Calibration Notes</span>
                            </h4>
                            <div className="bg-[#09090b] border border-[#27272a] p-4 rounded-lg">
                              <p className="text-xs text-zinc-300 leading-relaxed italic text-justify">
                                "{activeJob.match.weaknessNotes ?? "Candidate presents general target qualifications, with no severe industrial vulnerabilities noted."}"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Evidence Mapping Verification Table Matrix */}
                        {activeJob.match.evidenceMapping && activeJob.match.evidenceMapping.length > 0 && (
                          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 md:p-6 space-y-4 overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272a] pb-3">
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                                  Evidence Matching Matrix Protocol
                                </h4>
                                <p className="text-[10.5px] text-zinc-400 mt-0.5">
                                  Meticulous calibration mapping JD requirements straight against Master Profile facts.
                                </p>
                              </div>
                              <span className="text-[9px] font-mono bg-[#09090b] text-zinc-500 border border-[#27272a] px-2 py-0.5 rounded-md self-start sm:self-center">
                                Grounded Truth Audit
                              </span>
                            </div>

                            <div className="overflow-x-auto border border-[#27272a] rounded-lg">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-[#09090b] border-b border-[#27272a]">
                                    <th className="px-3.5 py-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono w-28">Category Group</th>
                                    <th className="px-3.5 py-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono w-1/3">Target Job Requirement</th>
                                    <th className="px-3.5 py-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono w-32">Evidence Integrity</th>
                                    <th className="px-3.5 py-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Demonstrated Candidate Evidence</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272a] bg-[#111113]">
                                  {activeJob.match.evidenceMapping.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-[#18181b]/50 transition-colors">
                                      {/* Category Group */}
                                      <td className="px-3.5 py-3 text-[10px] font-mono text-zinc-400 align-top leading-tight">
                                        {item.group}
                                      </td>
                                      {/* Requirement */}
                                      <td className="px-3.5 py-3 text-xs text-white font-medium align-top leading-normal">
                                        {item.requirement}
                                      </td>
                                      {/* Evidence Type badge */}
                                      <td className="px-3.5 py-3 align-top">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                          item.evidenceType?.includes("Direct")
                                            ? "bg-emerald-950/40 border border-emerald-900/50 text-emerald-400"
                                            : item.evidenceType?.includes("Adjacent")
                                            ? "bg-amber-950/40 border border-amber-900/50 text-amber-400"
                                            : "bg-rose-950/40 border border-rose-900/50 text-rose-400"
                                        }`}>
                                          {item.evidenceType}
                                        </span>
                                      </td>
                                      {/* Candidate Evidence */}
                                      <td className="px-3.5 py-3 text-xs text-zinc-300 align-top leading-relaxed text-justify">
                                        {item.candidateEvidence}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-10 text-center space-y-3">
                        <Info className="mx-auto text-zinc-500" size={28} />
                        <h4 className="text-sm font-bold text-white">Diagnostics not yet computed</h4>
                        <p className="text-xs text-zinc-400 max-w-sm mx-auto">Click Scan below to let Gemini analyze requirements against Master CV skills.</p>
                        <button
                          onClick={() => handleParseJob(activeJob.id)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-1.5 px-4 rounded-lg"
                        >
                          Execute Analysis Scan
                        </button>
                      </div>
                    )}

                    {/* Parsed Job attributes details */}
                    {activeJob.parsedJobJson && (
                      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 md:p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Job Requirements Index</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-bold text-zinc-400">Required Skillsets</h4>
                            <ul className="text-xs space-y-1 list-disc pl-4 text-zinc-300">
                              {activeJob.parsedJobJson.requiredSkills?.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-xs font-bold text-[#10b981]">Preferred Qualifications</h4>
                            <ul className="text-xs space-y-1 list-disc pl-4 text-zinc-300">
                              {activeJob.parsedJobJson.preferredSkills?.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                        </div>

                        {activeJob.parsedJobJson.redFlags && activeJob.parsedJobJson.redFlags.length > 0 && (
                          <div className="border-t border-[#27272a] pt-3.5 space-y-1.5">
                            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center space-x-1">
                              <AlertTriangle size={13} />
                              <span>Heuristics Risks & Red Flags Detector</span>
                            </h4>
                            <ul className="text-xs text-zinc-300 pl-4 list-disc space-y-1">
                              {activeJob.parsedJobJson.redFlags.map((flag, i) => (
                                <li key={i} className="text-amber-300/90 font-medium">{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Job original text */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Original JD text */}
                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 space-y-2.5">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Original Listing description Text</h3>
                      <textarea
                        readOnly
                        value={activeJob.originalJD}
                        className="w-full text-zinc-300 h-96 font-mono text-[10.5px] p-3 rounded-lg border border-[#27272a] bg-[#09090b] focus:outline-none"
                      />
                    </div>

                  </div>
                </div>
              </div>
            )}

              {/* 2.B VIEW: TAILORED CV BUILDER */}
              {workspaceTab === "cv" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Selector panel for tailoring target grounding profile */}
                  <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <Sparkles size={14} className="text-[#10b981]" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Select Base Profile to Tailor</h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Select the grounding master profile to target for tailoring and align for the job description requirements.</p>
                    </div>
                    <div className="flex bg-[#09090b] border border-[#27272a] p-1 rounded-lg shrink-0">
                      {masterCvs.map((cv) => (
                        <button
                          key={cv.id}
                          onClick={() => setSelectedMasterCvId(cv.id!)}
                          className={`px-3 py-1.5 rounded-md font-semibold font-sans text-[10.5px] transition-all cursor-pointer ${
                            selectedMasterCvId === cv.id
                              ? "bg-[#10b981] text-white font-bold shadow-md shadow-emerald-900/20"
                              : "text-zinc-400 hover:text-zinc-250"
                          }`}
                        >
                          {getProfileDisplayName(cv)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* CV Tailoring Operations */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 md:p-6 space-y-4">
                      <h3 className="text-sm font-bold text-white">Optimize CV Accomplishments</h3>
                      <p className="text-xs text-zinc-400">Reframes work experiences for targeted ATS keywords. Does not fabricate anything.</p>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Tone Preset</span>
                          <div className="grid grid-cols-2 gap-1 bg-[#09090b] border border-[#27272a] p-1 rounded-lg">
                            <button
                              onClick={() => setCvTone("executive")}
                              className={`text-[11px] font-bold py-1.5 px-3 rounded-md transition-all ${
                                cvTone === "executive" ? "bg-[#18181b] text-white" : "text-zinc-400"
                              }`}
                            >
                              Executive (Concise)
                            </button>
                            <button
                              onClick={() => setCvTone("technical")}
                              className={`text-[11px] font-bold py-1.5 px-3 rounded-md transition-all ${
                                cvTone === "technical" ? "bg-[#18181b] text-white" : "text-zinc-400"
                              }`}
                            >
                              Technical (Explicit)
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleTailorCv(activeJob.id)}
                          disabled={isLoadingApi}
                          className={`w-full font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition-all text-white ${
                            isLoadingApi
                              ? "bg-[#18181b] border border-[#27272a] text-zinc-500 cursor-not-allowed"
                              : "bg-[#10b981] hover:bg-[#059669] cursor-pointer"
                          }`}
                        >
                          {isLoadingApi ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Refining Experience &amp; Aligning...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={13} />
                              <span>Tailor &amp; Align CV Bullet Points</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Compilation details and templates */}
                    {activeJob.tailoredCV && activeJob.tailoredCV.profileId === selectedMasterCvId ? (
                      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 space-y-4">
                        <h4 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Interactive Achievements Editor</h4>
                        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                          {activeJob.tailoredCV.experience?.map((exp, expIdx) => (
                            <div key={exp.id || `tailored-exp-${expIdx}`} className="space-y-2 border-l border-zinc-700 pl-3">
                              <div className="text-[11px] font-bold text-white">{exp.role} <span className="text-zinc-500">@ {exp.company}</span></div>
                              
                              <div className="space-y-3">
                                {exp.bullets?.map((bullet, bullIdx) => (
                                  <div key={bullet.id || `tailored-bullet-${expIdx}-${bullIdx}`} className="space-y-1 bg-[#09090b] border border-[#27272a] p-2 rounded-lg">
                                    <div className="text-[10px] text-[#10b981] font-bold">Refined Bullet:</div>
                                    <textarea
                                      value={bullet.modifiedBullet}
                                      onChange={(e) => handleEditTailoredBullet(exp.id, bullet.id, e.target.value)}
                                      className="w-full text-zinc-200 bg-transparent text-[10.5px] border-none focus:outline-none focus:ring-0 leading-normal resize-y min-h-[50px]"
                                    />
                                    {bullet.reasoning && (
                                      <div className="text-[9px] text-zinc-500 leading-normal border-t border-[#27272a] pt-1">
                                        <span className="font-bold text-zinc-400">ATS Tweak Reasoning:</span> {bullet.reasoning}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#18181b] border border-[#27272a] p-5 rounded-xl space-y-3">
                        <div className="flex items-center space-x-2">
                          <AlertCircle size={15} className="text-amber-500" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Alignment Status</h4>
                        </div>
                        {activeJob.tailoredCV && activeJob.tailoredCV.profileId !== selectedMasterCvId ? (
                          <div className="space-y-3">
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              This job has a tailored CV generated for the <span className="text-amber-500 font-semibold">{getProfileDisplayName(masterCvs.find(c => c.id === activeJob.tailoredCV.profileId) || { label: activeJob.tailoredCV.profileId })}</span> profile. 
                            </p>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              To edit tailored highlights for your current profile (<span className="text-white font-semibold">{getProfileDisplayName(masterCv)}</span>), please click <span className="text-[#10b981] font-semibold">Tailor &amp; Align CV Bullet Points</span> above.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              Experience bullets for your active profile (<span className="text-white font-semibold">{getProfileDisplayName(masterCv)}</span>) are currently in their raw master state.
                            </p>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              Click <span className="text-[#10b981] font-semibold">Tailor &amp; Align CV Bullet Points</span> to optimize them against the job description keywords using compliance instructions.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Real-time PDF layout view column */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-zinc-500 font-bold">Template Preset:</span>
                        <select
                          value={selectedTemplatePreset}
                          onChange={(e) => setSelectedTemplatePreset(e.target.value as any)}
                          className="bg-[#09090b] border border-[#27272a] text-xs text-white rounded px-2 py-0.5 cursor-pointer font-sans"
                        >
                          <option value="serif">Times New Serif (Classic)</option>
                          <option value="classic">Standard Georgia (Classic)</option>
                          <option value="tech">Modern Computer Sans (Tech)</option>
                        </select>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleExportTailoredCv("doc")}
                          className="bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-zinc-300 font-semibold text-[10.5px] px-2 py-1.5 rounded flex items-center space-x-1"
                        >
                          <Download size={12} className="text-zinc-400" />
                          <span>Export Word (.doc)</span>
                        </button>
                        <button
                          onClick={() => handleExportTailoredCv("md")}
                          className="bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-zinc-300 font-semibold text-[10.5px] px-2 py-1.5 rounded flex items-center space-x-1"
                        >
                          <FileText size={12} className="text-zinc-400" />
                          <span>Export Markdown (.md)</span>
                        </button>
                        <button
                          onClick={() => handleExportTailoredCv("print")}
                          className="bg-zinc-100 hover:bg-white text-black font-semibold text-[10.5px] px-2 py-1.5 rounded flex items-center space-x-1 transform transition shadow-sm font-bold"
                        >
                          <Eye size={12} className="text-black" />
                          <span>Draft Print Overlay</span>
                        </button>
                      </div>
                    </div>

                    {/* Preview Document Stage */}
                    <div className="bg-white text-black max-w-full rounded-xl overflow-hidden p-8 border border-zinc-250 leading-relaxed shadow-lg max-h-[720px] overflow-y-auto">
                      <div className="text-center font-serif">
                        <h1 className="text-xl font-bold text-black uppercase tracking-wide leading-none">{masterCv.fullName}</h1>
                        <p className="text-[10px] text-zinc-600 mt-1.5">
                          {masterCv.location} &nbsp;|&nbsp; {masterCv.email} &nbsp;|&nbsp; {masterCv.phone}
                        </p>
                      </div>

                      <div className="mt-4 border-b border-black pb-0.5 text-[10.5px] font-bold tracking-wider font-serif uppercase">
                        Executive Summary
                      </div>
                      <p className="text-[11px] text-zinc-800 leading-relaxed text-justify mt-1 font-serif">
                        {activeJob.tailoredCV && activeJob.tailoredCV.profileId === selectedMasterCvId
                          ? activeJob.tailoredCV.summary
                          : masterCv.summary}
                      </p>

                      <div className="mt-4 border-b border-black pb-0.5 text-[10.5px] font-bold tracking-wider font-serif uppercase">
                        Core Experience
                      </div>

                      <div className="mt-1.5 space-y-2.5">
                        {masterCv.experience.map((exp, expIdx) => {
                          // Extract tailored bullets if matched and belongs to the selected profile
                          const tailoredExp = activeJob.tailoredCV && activeJob.tailoredCV.profileId === selectedMasterCvId
                            ? activeJob.tailoredCV.experience?.find(
                                (te: any) => te.id === exp.id || te.company?.toLowerCase() === exp.company?.toLowerCase()
                              )
                            : null;

                          return (
                            <div key={exp.id || `master-exp-${expIdx}`} className="text-[11px] font-serif leading-tight">
                              <div className="flex justify-between font-bold">
                                <span>{exp.role} — {exp.company}</span>
                                <span className="font-normal font-sans text-[10px]">{exp.duration}</span>
                              </div>
                              <ul className="list-disc pl-4 space-y-0.5 mt-0.5 font-serif text-[11px] text-zinc-800">
                                {exp.bullets.map((mb, bIdx) => {
                                  // Resilient matching fallback: matching indices or text content
                                  const tb = tailoredExp?.bullets?.[bIdx] || tailoredExp?.bullets?.find((b: any) => b.originalBullet === mb);
                                  const textVal = tb && typeof tb === "object" ? tb.modifiedBullet : (typeof tb === "string" ? tb : mb);
                                  return <li key={bIdx}>{textVal}</li>;
                                })}
                              </ul>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 border-b border-black pb-0.5 text-[10.5px] font-bold tracking-wider font-serif uppercase">
                        Education & Qualifications
                      </div>
                      <div className="mt-1.5 space-y-2 font-serif text-[11px] text-zinc-800 leading-tight">
                        {masterCv.education.map((edu, eduIdx) => (
                          <div key={edu.id || `master-edu-${eduIdx}`}>
                            <div className="flex justify-between font-bold">
                              <span>{edu.degree}</span>
                              <span className="font-normal font-sans text-[10px]">{edu.duration}</span>
                            </div>
                            <p className="italic text-zinc-650 font-sans text-[9.5px] mt-0.5">{edu.school} {edu.gpa ? `— GPA: ${edu.gpa}` : ""}</p>
                            {edu.details && <p className="text-[9.5px] text-zinc-500 mt-0.5">{edu.details}</p>}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 border-b border-black pb-0.5 text-[10.5px] font-bold tracking-wider font-serif uppercase">
                        Skills Inventory
                      </div>
                      <p className="text-[10.5px] text-zinc-800 font-serif leading-relaxed mt-1">
                        {masterCv.skills.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* 2.C VIEW: TAILORED COVER LETTER */}
              {workspaceTab === "cl" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                  
                  {/* Operations Controller Column */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 md:p-6 space-y-4">
                      <h3 className="text-sm font-bold text-white">Generate Cover Letter</h3>
                      <p className="text-xs text-zinc-400">Synthesizes evidence-focused pitch letter aligned with genuine qualifications of active Master bio.</p>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Letter Format Presets</span>
                          <div className="bg-[#09090b] border border-[#27272a] p-1 rounded-lg space-y-1">
                            <button
                              onClick={() => setCoverStyle("standard")}
                              className={`w-full text-left font-bold text-xs py-1.5 px-2.5 rounded transition-all flex justify-between items-center ${
                                coverStyle === "standard" ? "bg-[#18181b] text-white" : "text-zinc-400"
                              }`}
                            >
                              <span>Standard (3 paragraphs)</span>
                              {coverStyle === "standard" && <Check size={11} className="text-[#10b981]" />}
                            </button>
                            
                            <button
                              onClick={() => setCoverStyle("short")}
                              className={`w-full text-left font-bold text-xs py-1.5 px-2.5 rounded transition-all flex justify-between items-center ${
                                coverStyle === "short" ? "bg-[#18181b] text-white" : "text-zinc-400"
                              }`}
                            >
                              <span>Short Mail Pitch (2 paragraphs)</span>
                              {coverStyle === "short" && <Check size={11} className="text-[#10b981]" />}
                            </button>

                            <button
                              onClick={() => setCoverStyle("high-conviction")}
                              className={`w-full text-left font-bold text-xs py-1.5 px-2.5 rounded transition-all flex justify-between items-center ${
                                coverStyle === "high-conviction" ? "bg-[#18181b] text-white" : "text-zinc-400"
                              }`}
                            >
                              <span>High-Conviction Audit Pitch</span>
                              {coverStyle === "high-conviction" && <Check size={11} className="text-[#10b981]" />}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleGenerateCoverLetter(activeJob.id)}
                          disabled={isLoadingApi}
                          className={`w-full font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center space-x-1 transition-all text-white ${
                            isLoadingApi
                              ? "bg-[#18181b] border border-[#27272a] text-zinc-500 cursor-not-allowed"
                              : "bg-[#10b981] hover:bg-[#059669] cursor-pointer"
                          }`}
                        >
                          {isLoadingApi ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Drafting Cover Letter...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={13} />
                              <span>Generate Cover Letter</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Numeric Assertions checks panel */}
                    {activeJob.tailoredCoverLetter?.verificationRules && activeJob.tailoredCoverLetter.verificationRules.length > 0 && activeJob.tailoredCoverLetter.profileId === selectedMasterCvId && (
                      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 space-y-3">
                        <h4 className="text-xs font-bold uppercase text-amber-500 tracking-wider flex items-center space-x-1">
                          <AlertTriangle size={13} />
                          <span>Assertion Verification Audit</span>
                        </h4>
                        <div className="space-y-2">
                          {activeJob.tailoredCoverLetter.verificationRules.map((rule, idx) => (
                            <div key={idx} className="bg-[#09090b] border border-[#27272a] p-2.5 rounded-lg space-y-1 text-[11px] leading-relaxed">
                              <div className="font-bold text-zinc-300">"{rule.statement}"</div>
                              <p className="text-zinc-500 text-[10px] mt-0.5">{rule.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pitch render viewport panel */}
                  <div className="lg:col-span-8 space-y-4">
                    {activeJob.tailoredCoverLetter && activeJob.tailoredCoverLetter.profileId && activeJob.tailoredCoverLetter.profileId !== selectedMasterCvId && (
                      <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl text-amber-300 text-xs flex items-start space-x-2 animate-fade-in">
                        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
                        <div>
                          <h5 className="font-bold text-white">Cover Letter Profile Mismatch</h5>
                          <p className="mt-1 leading-relaxed text-zinc-300">
                            This cover letter was drafted using the <span className="text-white font-mono font-bold">{getProfileDisplayName(masterCvs.find(c => c.id === activeJob.tailoredCoverLetter.profileId) || { label: activeJob.tailoredCoverLetter.profileId })}</span> profile, which differs from your active <span className="text-white font-mono font-bold">{getProfileDisplayName(masterCv)}</span> profile.
                          </p>
                          <p className="mt-1 leading-relaxed text-zinc-300">
                            To ensure high-fidelity alignments, please click <strong className="text-[#10b981]">Generate Cover Letter</strong> to draft a new customized pitch grounded in the experiences of the active profile.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeJob.tailoredCoverLetter ? (
                      <div className="space-y-4">
                        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex justify-between items-center">
                          <span className="text-xs text-zinc-400">Grounded against {activeJob.tailoredCoverLetter.profileId ? getProfileDisplayName(masterCvs.find(c => c.id === activeJob.tailoredCoverLetter.profileId) || masterCv) : "Master CV"} credentials.</span>
                          
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(activeJob.tailoredCoverLetter?.content || "");
                              alert("Cover letter text content successfully copied to clipboard!");
                            }}
                            className="bg-[#18181b] border border-[#27272a] hover:bg-[#27272a] text-zinc-300 text-xs py-1 px-3 rounded flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Clipboard size={12} />
                            <span>Copy Letter Text</span>
                          </button>
                        </div>

                        {/* Letter paper mock */}
                        <div className="bg-white text-black p-8 md:p-10 rounded-xl max-w-full border border-zinc-250 leading-relaxed shadow-lg max-h-[620px] overflow-y-auto">
                          <div className="text-right font-serif text-[10.5px] text-zinc-500 space-y-0.5">
                            <div>Alexander Vance</div>
                            <div>{masterCv.email}</div>
                            <div>{masterCv.phone}</div>
                          </div>

                          <div className="mt-8 font-serif text-[11px] leading-relaxed text-zinc-800 space-y-4 whitespace-pre-wrap text-justify">
                            {activeJob.tailoredCoverLetter.content}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-16 text-center space-y-3">
                        <FileText className="mx-auto text-zinc-500" size={32} />
                        <h4 className="text-sm font-bold text-white">No Cover Letter drafted yet</h4>
                        <p className="text-xs text-zinc-400 max-w-sm mx-auto">Click generate on the side controller to synthesize a compelling introduction pitch.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 3. SECTION: MASTER CV GROUNDING PROFILES */}
          {navTab === "cv" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">My Master Grounding Profiles</h2>
                  <p className="text-xs text-zinc-500 mt-1">Configure and manage Alexander Vance's 3 distinct professional personas.</p>
                </div>
                <div className="text-xs bg-[#18181b] border border-[#27272a] p-1 rounded-lg flex space-x-1">
                  {masterCvs.map((cv) => (
                    <button
                      key={cv.id}
                      onClick={() => setSelectedMasterCvId(cv.id!)}
                      className={`px-3 py-1.5 rounded-md font-semibold font-sans text-xs transition-all ${
                        selectedMasterCvId === cv.id
                          ? "bg-white text-black text-bold font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {getProfileDisplayName(cv)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit form / View form */}
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-[#27272a] pb-4">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-[#10b981]" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{getProfileDisplayName(masterCv)} Settings</h3>
                  </div>

                  <button
                    onClick={() => {
                      if (profileEditMode) {
                        handleSaveCvEdit();
                      } else {
                        setProfileEditMode(true);
                      }
                    }}
                    className={`text-xs font-bold py-1 px-3 rounded-lg flex items-center space-x-1 ${
                      profileEditMode ? "bg-[#10b981] hover:bg-[#059669] text-white" : "bg-[#27272a] hover:bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    <Edit2 size={12} />
                    <span>{profileEditMode ? "Save Profile Changes" : "Edit Profile Details"}</span>
                  </button>
                </div>

                {profileEditMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-400">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="font-bold block uppercase tracking-wider text-[10px] text-zinc-500">Candidate Full Name</label>
                        <input
                          type="text"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 focus:outline-none focus:border-[#10b981]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold block uppercase tracking-wider text-[10px] text-zinc-500">Primary Email</label>
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 focus:outline-none focus:border-[#10b981]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold block uppercase tracking-wider text-[10px] text-zinc-500">Contact Number</label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 focus:outline-none focus:border-[#10b981]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold block uppercase tracking-wider text-[10px] text-zinc-500">Relocation / Location Bio</label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 focus:outline-none focus:border-[#10b981]"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="font-bold block uppercase tracking-wider text-[10px] text-zinc-500">Summary Biography</label>
                        <textarea
                          value={editSummary}
                          onChange={(e) => setEditSummary(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 h-24 focus:outline-none focus:border-[#10b981] font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold block uppercase tracking-wider text-[10px] text-zinc-500">Core Technical Skills (one per line)</label>
                        <textarea
                          value={editSkills}
                          onChange={(e) => setEditSkills(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 h-20 focus:outline-none focus:border-[#10b981] font-mono leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* View Details cards */}
                    <div className="lg:col-span-4 bg-[#09090b] border border-[#27272a] p-5 rounded-xl space-y-4">
                      <div className="space-y-0.5">
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Candidate Name</div>
                        <div className="text-sm font-semibold text-white">{masterCv.fullName}</div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Email Address</div>
                        <div className="text-xs text-zinc-200 truncate">{masterCv.email}</div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Contact Number</div>
                        <div className="text-xs text-zinc-200">{masterCv.phone}</div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Geographic Status</div>
                        <div className="text-xs text-zinc-200 leading-relaxed">{masterCv.location}</div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">CFA Credentials</div>
                        <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-4">
                          {masterCv.certifications?.map((cert, idx) => <li key={idx}>{cert}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* Biography & Skills Timeline view */}
                    <div className="lg:col-span-8 space-y-5">
                      <div className="bg-[#09090b] border border-[#27272a] p-5 rounded-xl space-y-2">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Master Bio Executive Summary</h4>
                        <p className="text-xs text-zinc-300 leading-relaxed text-justify">{masterCv.summary}</p>
                      </div>

                      <div className="bg-[#09090b] border border-[#27272a] p-5 rounded-xl space-y-3">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Base Core Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {masterCv.skills.map((s, i) => (
                            <span key={i} className="text-xs font-mono bg-[#18181b] border border-[#27272a] text-zinc-300 px-2 py-0.5 rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. SECTION: CALIBRATION REGISTRY & BRAND BOOK */}
          {navTab === "protocol" && (
            <div className="space-y-6 animate-fade-in text-xs select-none">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#27272a] pb-4 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Scoring Protocol &amp; Brand System</h2>
                  <p className="text-xs text-zinc-550 mt-1">Textual and mechanical breakdown of our factual calibration logic and serious design standards.</p>
                </div>
                <span className="text-[10px] font-mono bg-[#18181b] border border-[#27272a] text-zinc-500 px-2.5 py-1 rounded-md">
                  Version 2.4 Active
                </span>
              </div>

              {/* Grid 1: The 5-Dimension Calibration Model */}
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">1. Five-Part Scoring Diagnostics Protocol</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Our system rejects optimistic score fabrication. To ensure maximum trust and credible ATS pass-rates, we calibrate candidate suitability across five distinct recruitment measures:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-[#09090b] border border-[#27272a] p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>Technical Alignment</span>
                      <span className="text-[#10b981] font-mono text-[10px]">25/100 Pts</span>
                    </div>
                    <p className="text-[11px] text-zinc-450 leading-relaxed">
                      Strict mapping of must-have toolsets and infrastructure. Non-negotiables must be fully satisfied; gaps trigger severe point deduction alerts.
                    </p>
                  </div>

                  <div className="bg-[#09090b] border border-[#27272a] p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>Domain Exposure</span>
                      <span className="text-[#10b981] font-mono text-[10px]">20/100 Pts</span>
                    </div>
                    <p className="text-[11px] text-zinc-450 leading-relaxed">
                      Evaluates vertical sector familiarity (e.g., ESG metrics, quantitative pricing, high-volume transactions, buy-side microstructures).
                    </p>
                  </div>

                  <div className="bg-[#09090b] border border-[#27272a] p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>Seniority &amp; Scale</span>
                      <span className="text-[#10b981] font-mono text-[10px]">20/100 Pts</span>
                    </div>
                    <p className="text-[11px] text-zinc-450 leading-relaxed">
                      Weights actual team sizes, project financial scope, and years of autonomous oversight. Demotes junior profiles seeking executive slots.
                    </p>
                  </div>

                  <div className="bg-[#09090b] border border-[#27272a] p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>Evidence Strength</span>
                      <span className="text-[#10b981] font-mono text-[10px]">20/100 Pts</span>
                    </div>
                    <p className="text-[11px] text-zinc-450 leading-relaxed">
                      Checks for quantitative metrics. Over-stuffed, unapplied JDs are heavily penalized, preserving realistic candidate expectations.
                    </p>
                  </div>

                  <div className="bg-[#09090b] border border-[#27272a] p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>ATS Keyword Fit</span>
                      <span className="text-[#10b981] font-mono text-[10px]">15/100 Pts</span>
                    </div>
                    <p className="text-[11px] text-zinc-450 leading-relaxed">
                      Density mapping of relevant terminology. Selects key terms and lists unused keywords discarded due to complete absence of evidence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid 2: Real-time Premium Brand Palette & Typography Book */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Brand Colors Card */}
                <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">2. Core Color Tokens (Premium Recruiter Asset Palette)</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Designed around serious, minimalist finance and talent acquisition principles. We strictly avoid playful neon gradients or saturated layouts:
                  </p>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2 bg-[#09090b] rounded border border-[#27272a]">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded bg-[#09090b] border border-zinc-700" />
                        <div>
                          <span className="text-xs font-bold text-white block">Deep Obsidian Background</span>
                          <span className="text-[10px] text-zinc-500 font-mono">#09090b</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Dark Canvas</span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-[#09090b] rounded border border-[#27272a]">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded bg-[#18181b] border border-zinc-700" />
                        <div>
                          <span className="text-xs font-bold text-white block">Muted Zinc Surface</span>
                          <span className="text-[10px] text-zinc-500 font-mono">#18181b</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Card Wrapper</span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-[#09090b] rounded border border-[#27272a]">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded bg-[#27272a] border border-zinc-700" />
                        <div>
                          <span className="text-xs font-bold text-white block">Charcoal Steel Border</span>
                          <span className="text-[10px] text-zinc-500 font-mono">#27272a</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Fine Grids</span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-[#09090b] rounded border border-[#27272a]">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded bg-[#10b981]" />
                        <div>
                          <span className="text-xs font-bold text-white block">Sovereign Emerald Accent</span>
                          <span className="text-[10px] text-zinc-500 font-mono">#10b981</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Action Point</span>
                    </div>
                  </div>
                </div>

                {/* Do's and Don'ts Card */}
                <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">3. Aesthetic Standards Safeguards</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Recruiters represent institutional elite trust. This playbook ensures our product always looks trustworthy and premium:
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-400 block border-b border-emerald-950 pb-1 font-mono">✓ System Design DOs</span>
                      <ul className="text-[10.5px] text-zinc-350 space-y-1.5 list-disc pl-3">
                        <li>Factual multi-tier tables over colorful badges</li>
                        <li>JetBrains Mono for status weights</li>
                        <li>Clean spacing systems with generous margins</li>
                        <li>Defensive candidate experience truth checks</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-rose-450 block border-b border-rose-950 pb-1 font-mono">✗ System Design DONTs</span>
                      <ul className="text-[10.5px] text-zinc-350 space-y-1.5 list-disc pl-3">
                        <li>Avoid purplish glow effects or visual AI slop</li>
                        <li>Never use toy-like rounded controls</li>
                        <li>No mock telemetry ports or network pings</li>
                        <li>Never synthesize fake experience metrics</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* Manual Add Job Modal Overlay */}
      {isAddingJob && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-2xl w-full p-6 space-y-5 select-none text-xs">
            
            <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Initialize Target Listing</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Pasting a full Job Description processes matching statistics.</p>
              </div>
              <button
                onClick={() => setIsAddingJob(false)}
                className="text-zinc-500 hover:text-white font-extrabold cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500">Company Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Jane Street"
                    value={newJobCompany}
                    onChange={(e) => setNewJobCompany(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2 focus:outline-none focus:border-zinc-500 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500">Position Role Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Associate Quantitative Dev"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2 focus:outline-none focus:border-zinc-500 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500">Workplace</label>
                  <select
                    value={newJobWorktype}
                    onChange={(e) => setNewJobWorktype(e.target.value as any)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2 focus:outline-none text-white cursor-pointer"
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                    <option value="on-site">On-Site</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500">Seniority</label>
                  <select
                    value={newJobSeniority}
                    onChange={(e) => setNewJobSeniority(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2 focus:outline-none text-white cursor-pointer"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Associate">Associate</option>
                    <option value="Senior">Senior</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-500">Salary Target (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. £150K / yr"
                    value={newJobSalary}
                    onChange={(e) => setNewJobSalary(e.target.value)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2 focus:outline-none text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-500">Pasted Listing text / Job Description *</label>
                <textarea
                  required
                  placeholder="Paste direct job advertisement requirements details here..."
                  value={newJobJD}
                  onChange={(e) => setNewJDText(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 h-36 font-mono text-[10.5px] focus:outline-none text-white leading-relaxed"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isQuickExtracting}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer text-center"
                >
                  Insert Manually
                </button>
                
                <button
                  type="button"
                  onClick={handleQuickAiExtractAndImport}
                  disabled={isQuickExtracting}
                  className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-bold py-2 px-4 rounded-lg cursor-pointer text-center flex items-center justify-center space-x-1"
                >
                  <Sparkles size={13} className="animate-pulse" />
                  <span>{isQuickExtracting ? "Extracting..." : "1-Click AI Extract & Create"}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
