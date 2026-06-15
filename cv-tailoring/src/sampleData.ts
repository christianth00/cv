import { MasterCV, Job } from "./types";

export const DEFAULT_MASTER_CV: MasterCV = {
  fullName: "Alexander Vance",
  email: "alexander.vance@uwaterloo.ca",
  phone: "+1 (416) 555-0189",
  location: "Toronto, ON (Open to Relocation: London, NYC)",
  linkedin: "linkedin.com/in/alexander-vance-quant",
  website: "github.com/alex-vance-codes",
  summary: "Quantitative developer and systems analyst with 4+ years of front-office execution and risk model support. Academic training includes an MSc in Quantitative Finance and a BSc in Computer Science. Demonstrated competence in optimizing real-time high-throughput data processing algorithms using Python and C++, modeling pricing frameworks for physical commodities portfolios, and reporting greenhouse gas compliance metrics under standard ESG methodologies.",
  skills: [
    "Python (Pandas, NumPy, Statmodels, SciPy, PyTorch)",
    "C++ (C++17, STL, Multithreading, Boost)",
    "SQL (PostgreSQL, Optimizing Complex Queries)",
    "Git",
    "Time-Series Forecasting",
    "Stochastic Calculus & PDE Pricing",
    "Commodities Risk Frameworks",
    "Carbon Accounting & GHG Protocols",
    "Docker & Kubernetes",
    "Linux Systems & Shell Scripting"
  ],
  certifications: [
    "CFA Certificate in ESG Investing",
    "Financial Risk Manager (FRM) - Certified"
  ],
  education: [
    {
      id: "edu-1",
      school: "University of Waterloo",
      degree: "MSc in Quantitative Finance (Honours)",
      duration: "2020 - 2022",
      gpa: "3.95/4.0",
      details: "Specialization in high-frequency trading market microstructures, Monte Carlo pricing simulations, and stochastic volatility modeling under Heston frameworks."
    },
    {
      id: "edu-2",
      school: "McGill University",
      degree: "BSc in Computer Science & Major Mathematics",
      duration: "2016 - 2020",
      gpa: "3.88/4.0",
      details: "Core focus on Linear Algebra, Complex analysis, Parallel computing, and Distributed Databases."
    }
  ],
  experience: [
    {
      id: "exp-1",
      company: "Apex Commodities & Algorithmic Trading",
      role: "Associate Quantitative Developer & Commodities Analyst",
      location: "Toronto, ON",
      duration: "2022 - Present",
      bullets: [
        "Developed and maintained critical physical options forecasting engines in Python, lowering runtime calculations latency by 32% across multi-asset commodities decks.",
        "Engineered real-time data ingestion pipelines handling 5M+ continuous tick updates daily from physical LNG and power grid sensors.",
        "Constructed an internal carbon emissions compliance reporting metric tracker adhering strictly to state sustainability frameworks (aligned under WRI GHG Protocol).",
        "Collaborated with trading desk managers to audit historical arbitrage models, correcting a risk-leaking pricing discrepancy on physical pipeline parameters."
      ]
    },
    {
      id: "exp-2",
      company: "Stratum Risk Advising & Solutions",
      role: "Junior Risk Analyst & Systems Engineer",
      location: "Montreal, QC",
      duration: "2020 - 2022",
      bullets: [
        "Audited complex multi-criteria risk exposure reports using high-volume SQL databases, automating validation check cycles for the advisory desk.",
        "Refactored legacy VBA pricing scripts into streamlined, maintainable CLI Python tools, cutting monthly team hours spent on manual correction processes by 15 hours.",
        "Documented mathematical model validation parameters and compiled structured risk summaries for submission to regulatory governance boards."
      ]
    }
  ]
};

export const DEFAULT_JOBS: Job[] = [
  {
    id: "job-1",
    company: "Jane Street Capital LLC",
    roleTitle: "Quantitative Trader / Quantitative Developer",
    location: "London, UK",
    workplaceType: "on-site",
    salary: "£180,000 - £220,000 + Bonus",
    sector: "Quantitative Trading",
    seniority: "Associate",
    sponsorship: "Yes",
    status: "Tailor CV",
    tags: ["quant", "trading", "Python", "Associate"],
    deadline: "2026-07-15",
    link: "www.janestreet.com/careers/quant-trader",
    dateCreated: "2026-06-01T10:00:00Z",
    originalJD: `Jane Street is looking for a Quantitative Trader / Developer to join our London algorithmic desk. Our trading is fast-paced, highly collaborative, and mathematically rigorous.

Key Responsibilities:
- Design, build, and optimize systematic alpha strategies.
- Maintain high-speed execution layers and data pipelines in Python, C++, or OCaml.
- Evaluate model prediction thresholds and dynamic risk limitations.
- Liaise closely with quantitative researchers to backtest execution performance.

Required Qualifications:
- Extreme proficiency in Python (Pandas/NumPy) and C++.
- Strong academic grounding in mathematics, physical sciences, or quantitative finance.
- Clear passion for high-frequency pricing, system microstructures, and data structures.
- Exceptional ability to formulate and explain complex hypothesis and statistical tests.`,
    parsedJobJson: {
      company: "Jane Street Capital LLC",
      roleTitle: "Quantitative Trader / Quantitative Developer",
      location: "London, UK",
      seniority: "Associate / Mid",
      requiredSkills: ["Python", "C++", "Systematic Alpha Strategies", "High-frequency pricing models", "Data structures"],
      preferredSkills: ["OCaml", "Boost", "CUDA Acceleration", "Heston PDE framework"],
      responsibilities: [
        "Design, build, and optimize systematic alpha strategies.",
        "Maintain high-speed execution layers and data pipelines.",
        "Backtest execution performance with complex tick datasets."
      ],
      keywords: ["Jane Street", "Quantitative", "High-frequency", "Alpha", "Backtesting", "OCaml", "C++"],
      likelyAtsTerms: ["Data structures", "Python", "Algorithmic execution", "PDE framework"],
      redFlags: ["High continuous on-call trading cycle alignment expected", "Extremely competitive onboarding filters"]
    },
    match: {
      matchCategory: "Strong match",
      matchScore: 88,
      fitReasoning: "Alexander Vance holds an MSc in Quantitative Finance and has 3+ years experience with high-throughput tick environments in Python & C++. Direct pipeline engineering fits their algorithmic core.",
      skillsGap: ["OCaml", "High-frequency systematic Alpha design"]
    },
    checklist: [
      { id: "c-1", label: "Confirm absolute truthfulness of modified option metrics", checked: true },
      { id: "c-2", label: "Verify company name 'Jane Street Capital LLC' consistency", checked: false },
      { id: "c-3", label: "Provide specific MSc Quantitative coursework summary in gap remarks", checked: false }
    ],
    tailoredCV: {
      summary: "Quantitative and algorithmic systems analyst with 4+ years of front-office execution. MSc in Quantitative Finance (UWaterloo, GPA 3.95/4.0). Strongly experienced in optimizing high-throughput options engines, multithreaded pipelines, and real-time data structures using Python and C++.",
      skillsGapAnalysis: "The candidate lacks OCaml experience. However, their C++ STL multithreading foundations and MSc coursework covering stochastic equations provide quick-ramp capacities for Jane Street's algorithmic stack.",
      experience: [
        {
          id: "exp-1",
          company: "Apex Commodities & Algorithmic Trading",
          role: "Associate Quantitative Developer & Commodities Analyst",
          bullets: [
            {
              id: "b-1-1",
              originalBullet: "Developed and maintained critical physical options forecasting engines in Python, lowering runtime calculations latency by 32% across multi-asset commodities decks.",
              modifiedBullet: "Engineered and optimized options trading forecasting models in Python & C++, decreasing latency of calculations by 32% for front-office systematic trading desks.",
              reasoning: "Aligned with 'optimize trading strategies' wording in JD, changing 'Developed' to 'Engineered' to state deeper algorithmic intent."
            },
            {
              id: "b-1-2",
              originalBullet: "Engineered real-time data ingestion pipelines handling 5M+ continuous tick updates daily from physical LNG and power grid sensors.",
              modifiedBullet: "Designed real-time systematic data ingestion tick loaders scaling to 5M+ daily database modifications supporting live algorithmic analysis.",
              reasoning: "Highlights 'real-time systems ingest' using precise quantitative terminology matches."
            }
          ]
        }
      ]
    },
    tailoredCoverLetter: {
      content: `Dear Jane Street London Desk Team,

I am writing with exceptional conviction to express my interest in the Quantitative Trader / Developer position at your London office. Backed by an MSc in Quantitative Finance from the University of Waterloo (3.95 GPA) and 3+ years of professional engineering experience within data-intense commodity systems, my profile aligns closely with the rigorous computational challenges tackled on your trading desks.

In my current capacity at Apex, I engineered continuous options forecasting models in Python that successfully reduced runtime calculation latency by 32% across complex active portfolios. Furthermore, I built real-time streaming loaders processing over 5 million daily tick updates from high-velocity grid data structures. These initiatives taught me high-signal architecture hygiene and required deep, daily application of optimal data structures, C++ concurrency, and memory considerations.

Jane Street's mathematical purity and highly collaborative culture are world-class benchmarks. Rather than using legacy templates, I offer a grounded, truthful commitment to quantitative modeling, ready to ramp rapidly onto your algorithmic stacks (including OCaml or CUDA environments). I trust my technical discipline and quantitative mindset will add measurable depth to your strategies. 

Sincerely,
Alexander Vance`,
      verificationRules: [
        { statement: "reduced runtime calculation latency by 32%", reason: "Confirm actual performance log figures are accurate at Apex Commodities." },
        { statement: "MSc in Quantitative Finance from the University of Waterloo (3.95 GPA)", reason: "Confirm certificate transcripts have been uploaded/validated." }
      ]
    },
    notes: "Follow up with Waterloo advisor. They have contacts at Jane Street London in the options core.",
    statusHistory: [
      { status: "To Review", date: "2026-06-01T10:00:00Z" },
      { status: "Tailor CV", date: "2026-06-03T11:20:00Z" }
    ]
  },
  {
    id: "job-2",
    company: "Macquarie Group",
    roleTitle: "Commodities & ESG Risk Quantitative Associate",
    location: "London, UK",
    workplaceType: "hybrid",
    salary: "Base £110k + dynamic equity bonus",
    sector: "Commodities & Finance",
    seniority: "Associate",
    sponsorship: "Yes",
    status: "To Review",
    tags: ["ESG", "commodities", "risk", "Python", "associate"],
    deadline: "2026-08-30",
    link: "macquarie.com/careers/commodities-esg-analyst",
    dateCreated: "2026-06-04T14:10:00Z",
    originalJD: `Macquarie's Commodities and Global Markets (CGM) team is seeking an ESG and Risk Associate to join our EMEA division. This is a front-office adjacent analyst role focusing on energy markets compliance, physical gas shipping portfolio optimization, and scope emissions audits.

What You'll Do:
- Support physical options quantitative testing models.
- Track carbon offset certificates compliance and audit scope reports against European regulators.
- Work with SQL databases and clean code Python stacks to design compliance analytics platforms.

Requirements:
- Minimum 2 years inside a commodities, trading desk, or heavy risk consultancy.
- Practical familiarity with ESG reporting frameworks (GHG Protocol, TCFD, or physical risk indexing).
- Practical Python scripting knowledge and advanced database retrieval strategies.`,
    parsedJobJson: {
      company: "Macquarie Group",
      roleTitle: "Commodities & ESG Risk Quantitative Associate",
      location: "London, UK",
      seniority: "Associate",
      requiredSkills: ["Commodity Risk Tracker Analysis", "ESG reporting (GHG / TCFD)", "Python", "SQL database design"],
      preferredSkills: ["Physical gas shipping trading rules", "Carbon offset derivatives knowledge"],
      responsibilities: [
        "Support physical options options testing models.",
        "Track carbon offset compliance and run EU greenhouse gas reporting audits.",
        "Design compliance analytics platforms."
      ],
      keywords: ["Macquarie", "EMEA CGM", "ESG Compliance", "GHG emissions", "TCFD", "Python"],
      likelyAtsTerms: ["GHG Protocol", "Carbon certificate tracking", "Commodities risk management", "Python analytics"],
      redFlags: ["Substantial reporting volume in quarterly carbon audits during winter trading season"]
    },
    match: {
      matchCategory: "Strong match",
      matchScore: 94,
      fitReasoning: "Strong convergence here! Alexander already tracks carbon compliance inside state sustainability structures and builds option forecasting engines at Apex. Direct hit.",
      skillsGap: ["EU trading rules specifics (MIFID II compliance limits)"]
    },
    checklist: [
      { id: "mc-1", label: "Update UK/EU carbon metric alignments", checked: false },
      { id: "mc-2", label: "Include FRM (Financial Risk Manager) designation prominent in headers", checked: true }
    ],
    notes: "Super nice alignment with current role carbon computations. Highly likely interview invitation. Keep focus strictly factual on WRI GHG and physical options optimizations.",
    statusHistory: [
      { status: "To Review", date: "2026-06-04T14:10:00Z" }
    ]
  }
];
