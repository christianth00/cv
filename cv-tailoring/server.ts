import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// --- PROMPT TEMPLATE CONSTANTS ---
const JOB_PARSING_PROMPT = `You are an expert executive recruiter, ATS optimization specialist, and rigorous recruiting calibration specialist in quantitative finance, trading, software engineering, and analytical sectors.
Evaluate the candidate's Master CV against the Job Description under a strict TRUTHFULNESS mandate.

Your grading and analysis must follow these steps:
1. Extract the most repeated and most important requirements from the job description.
2. Group them into Core technical requirements, Domain/industry requirements, Seniority/leadership requirements, and Communication/stakeholder requirements.
3. Map each requirement against the candidate's actual evidence from the provided Master CV.
4. Label each mapped requirement as:
   - "Direct evidence" (candidate has explicitly and factually proven this exact capability/metric/asset)
   - "Adjacent transferable evidence" (candidate has related, transferable skills and experiences, positioned commercially and honestly)
   - "No evidence" (no mention of this capability at all)
5. Identify the Top 10 target keywords.
6. Record keywords intentionally NOT used on the CV due to lack of evidence from the master profile.
7. Outline Notes on where the CV remains weaker than the ideal candidate.

Scoring Rules (Overall Score strictly from 0 to 100):
Compute the following scoring dimensions:
- Technical skill alignment: Max 25 points.
- Relevant domain exposure: Max 20 points.
- Seniority and ownership: Max 20 points.
- Evidence strength and credibility: Max 20 points.
- ATS keyword alignment: Max 15 points.

CRITICAL SCORING MANDATES:
- Do NOT score based on optimism. Favour critical realism.
- Severely penalize missing must-have specifications.
- Reward adjacent evidence, but with fewer points than direct evidence.
- Do not mistake keyword presence for actual capability. If the resume lists a keyword but has no applied scenario or context (or you suspect fabrication based on overall profile details), reduce the credibility score.
- Convert overall score and recommend an apply Category: "Strong apply", "Reasonable apply", "Stretch apply", or "Low-fit apply".
- Provide a robust, cohesive and objective 3-sentence explanation suitable for display in the client UI.`;

const CV_TAILORING_PROMPT = `You are a professional career coach specializing in quantitative trading, asset management, and adjacent high-stakes technology sectors.
Your goal is to tailor the candidate's existing work bullets for the target job description.
CRITICAL CONSTRAINT: NEVER invent or fabricate experiences, credentials, degrees, titles, years of experience, or metrics.
Reframing guidelines:
1. Re-prioritize or rewrite existing bullet points using stronger quantitative keywords or action verbs matching the target job representation.
2. Keep the core achievements authentic and factual.
3. For each changed bullet, explain why the changes improve the signal-to-noise ratio in ATS scanning or manager screening.
4. Output a tailored candidate profile summary and a thorough, critical skills gap analysis indicating requirements that are missing or weak in our comparison.`;

const COVER_LETTER_PROMPT = `You are a professional executive counselor drafting high-impact front-office introduction materials.
Generate a tailored cover letter from the CV profile and target job description.
Tone Guidelines: Sharp, professional, direct, evidence-focused. Eliminate generic corporate fluff or flowery pleasantries. Speak with quiet, grounded competence.
Style styles:
- short: Bullet-focused pitch suited for email intro (2 shorter paragraphs).
- standard: Traditional, elegant cover letter (3 paragraphs).
- high-conviction: Thorough alignment highlighting advanced motivation of technical/ESG/quant topics (3 rich paragraphs).
Include a checklist of statements containing numbers or custom calculations that require user manual verification.`;

const TRUTHFULNESS_CHECK = `TRUTHFULNESS DIRECTIVES:
- Do not fabricate years of experience.
- Do not inflate positions (e.g. do not elevate an Analyst to Director).
- Do not fabricate portfolio scale or numbers.
- Ensure any matching points strictly adhere to user-disclosed technologies.`;

const CV_PARSING_PROMPT = `You are an expert recruitment ATS and parsing intelligence. 
Analyze the provided resume / CV plain text.
Extract information into the required JSON schema structure for MasterCV.
Only extract information that is present in the text. Do not invent any historical positions, education degrees, or credentials. Keep achievements realistic and truthful.`;

// --- GEMINI LAZY INITIALIZATION ---
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): { client: GoogleGenAI | null; mode: "live" | "mock" } {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    return { client: null, mode: "mock" };
  }
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
      return { client: null, mode: "mock" };
    }
  }
  return { client: aiClient, mode: "live" };
}

// --- API ENDPOINTS ---

// Health & Mode check
app.get("/api/health", (req, res) => {
  const { mode } = getGeminiClient();
  res.json({
    status: "ok",
    aiMode: mode,
    localTime: new Date().toISOString(),
  });
});

// Prompt query
app.get("/api/prompts", (req, res) => {
  res.json({
    jobParsing: JOB_PARSING_PROMPT,
    cvTailoring: CV_TAILORING_PROMPT,
    coverLetter: COVER_LETTER_PROMPT,
    truthfulnessCheck: TRUTHFULNESS_CHECK,
  });
});

// 1. Process Job Description
app.post("/api/parse-job", async (req, res) => {
  const { jdText, masterCv } = req.body;
  if (!jdText) {
    return res.status(400).json({ error: "Missing job description text" });
  }

  const { client, mode } = getGeminiClient();

  // Helper inside to generate consistent, realistic mock analyses aligned with inputs
  const getOfflineCalibration = (text: string, cv: any) => {
    const textLower = text.toLowerCase();
    const isQuant = textLower.includes("quant") || textLower.includes("trading") || textLower.includes("alpha") || textLower.includes("street");
    const isEsg = textLower.includes("esg") || textLower.includes("sustainability") || textLower.includes("climate") || textLower.includes("macquarie");

    if (isEsg) {
      return {
        matchCategory: "Strong apply",
        matchScore: 94,
        fitReasoning: "Excellent convergence with physical options calculations and ESG sustainability metrics. Candidate already builds emission dashboards under WRI GHG protocol at Apex, which directly supports Macquarie CGM's regulatory compliance needs.",
        skillsGap: ["MiFID II regulatory limits", "European carbon offsets standards"],
        technicalScore: 23,
        domainScore: 19,
        seniorityScore: 18,
        credibilityScore: 19,
        atsScore: 15,
        strengths: [
          "CFA Certificate in ESG Investing & Certified FRM holding",
          "Built carbon emission trackers adhering strictly to WRI GHG Protocol",
          "Options pricing models optimization reducing latency calculations by 32%"
        ],
        concerns: [
          "No direct experience in structural EU Power Grid limits or live MiFID II carbon limits auditing",
          "Location sponsorship required for UK relocation logistics support"
        ],
        missingMustHaves: [
          "Direct European Union carbon derivative compliance certification"
        ],
        unusedKeywords: ["MIFID II", "EMEA division", "European Carbon Offsets"],
        weaknessNotes: "The candidate's profile is exceptionally strong on mathematical commodity models and actual carbon footprint ledger engineering. Gaps in localized European metrics are minor.",
        evidenceMapping: [
          {
            requirement: "Familiarity with standard ESG reporting frameworks (GHG Protocol, TCFD)",
            group: "Domain/industry",
            evidenceType: "Direct evidence",
            candidateEvidence: "Constructed carbon emissions tracker conforming to WRI GHG Protocol; summary specifies SASB & TCFD exposure."
          },
          {
            requirement: "Support physical options and analytical portfolios",
            group: "Core technical",
            evidenceType: "Direct evidence",
            candidateEvidence: "Developed and maintained critical physical options forecasting engines in Python; MSc specialized in stochastic options modeling."
          },
          {
            requirement: "Minimum 2 years inside a commodities trading desk or risk advisory team",
            group: "Seniority/leadership",
            evidenceType: "Direct evidence",
            candidateEvidence: "4+ years combined tenure: Associate Quantitative Developer at Apex Commodities (2022-Present) and Junior Risk Analyst (2020-2022)."
          },
          {
            requirement: "Strong SQL database operations and Python scripting mastery",
            group: "Core technical",
            evidenceType: "Direct evidence",
            candidateEvidence: "Highly proficient in high-throughput database systems and daily streaming sensor pipelines handling 5M+ sensor events."
          },
          {
            requirement: "Audit carbon offsets compliance against EU regulatory structures",
            group: "Communication/stakeholder",
            evidenceType: "Adjacent transferable evidence",
            candidateEvidence: "Led state sustainability calibrations under US/Canadian protocols; no direct EU carbon tracking on-site."
          }
        ]
      };
    } else if (isQuant) {
      return {
        matchCategory: "Reasonable apply",
        matchScore: 88,
        fitReasoning: "Strong computational profile backed by an MSc in Quantitative Finance and multithreaded C++ performance tuning. Experienced in high-volume tick feeds, but lacks live desk HFT alpha models and OCaml experience.",
        skillsGap: ["OCaml programming language", "Direct systematic alpha strategies design", "High-frequency live microstructures pipeline"],
        technicalScore: 21,
        domainScore: 17,
        seniorityScore: 18,
        credibilityScore: 19,
        atsScore: 13,
        strengths: [
          "MSc in Quantitative Finance from Waterloo (3.95 GPA) with specialty in Heston volatility modeling and market microstructures",
          "Deep software efficiency gains (32% computational speedup on options simulation decks)",
          "Advanced concurrent programming (C++17, STL multithreading, Boost) and high-volume data loaders (5M+ tick updates)"
        ],
        concerns: [
          "Zero exposure to functional program suites like OCaml specified in Jane Street's core JD",
          "Has not owned live trading floor systematic alpha strategies directly (focused on supporting analytics models)"
        ],
        missingMustHaves: [
          "OCaml framework proficiency",
          "Production-grade live HFT systematic trading design"
        ],
        unusedKeywords: ["OCaml", "Systematic Alpha", "CUDA acceleration"],
        weaknessNotes: "The profile shows high-tier quantitative execution talent. Gaps operate in functional languages (OCaml) and direct deployment of rapid systematic alphas on active trading desks.",
        evidenceMapping: [
          {
            requirement: "Proficiency in Python (Pandas/NumPy) and C++ (Multithreading/Boost)",
            group: "Core technical",
            evidenceType: "Direct evidence",
            candidateEvidence: "Extensive exposure in listed tools: C++17, Boost, STL multithreading, and PyTorch/Pandas on 5M+ continuous tick models."
          },
          {
            requirement: "Design, build, and optimize systematic alpha strategies",
            group: "Core technical",
            evidenceType: "Adjacent transferable evidence",
            candidateEvidence: "Maintained Physical options forecasting engines decreasing mathematical overhead; corrected key risk leaks on pricing vectors."
          },
          {
            requirement: "High-speed execution layers and tick data pipelines",
            group: "Core technical",
            evidenceType: "Direct evidence",
            candidateEvidence: "Engineered real-time streaming loaders processing up to 5M+ daily tick readings from grid sensors."
          },
          {
            requirement: "Academic grounding in mathematics or quantitative finance",
            group: "Domain/industry",
            evidenceType: "Direct evidence",
            candidateEvidence: "Holds MSc in Quantitative Finance from Waterloo (3.95/4.0 GPA) with specialized focus in Monte Carlo & stochastic PDE frameworks."
          },
          {
            requirement: "Highly collaborative coordination with researchers and traders",
            group: "Communication/stakeholder",
            evidenceType: "Direct evidence",
            candidateEvidence: "Liaised directly with commodities Desk Managers to audit historical systems and correct model leakage parameters."
          }
        ]
      };
    } else {
      return {
        matchCategory: "Stretch apply",
        matchScore: 68,
        fitReasoning: "Grounded technical analyst with solid Python background but lacks industry-specific frameworks required by this particular job profile.",
        skillsGap: ["Role-specific frameworks", "Target industry workflow exposure"],
        technicalScore: 18,
        domainScore: 12,
        seniorityScore: 14,
        credibilityScore: 14,
        atsScore: 10,
        strengths: [
          "Highly polished Python & SQL software engineering standards",
          "Strong academic credentials (GPA 3.9+)"
        ],
        concerns: [
          "Unproven tenure with the specialized software toolsets outlined in the JD",
          "Minimal senior leadership indicators for this specific grade"
        ],
        missingMustHaves: [
          "Target specialized frameworks certification or active project history"
        ],
        unusedKeywords: ["Specialized target platform", "Senior oversight"],
        weaknessNotes: "The profile demonstrates general computational intelligence and good data engineering foundations, but misses localized domain exposure of this job's core mandate.",
        evidenceMapping: [
          {
            requirement: "Practical Python and data storage analytics",
            group: "Core technical",
            evidenceType: "Direct evidence",
            candidateEvidence: "Highly proficient in Python, SQL, C++, and Git with extensive background in distributed data grids."
          },
          {
            requirement: "Related industrial or company domain familiarity",
            group: "Domain/industry",
            evidenceType: "No evidence",
            candidateEvidence: "No relevant work experience or coursework matches this particular industrial vertical."
          }
        ]
      };
    }
  };

  if (mode === "mock" || !client) {
    const textLower = jdText.toLowerCase();
    const company = extractCompanyName(jdText);
    const roleTitle = extractRoleTitle(jdText);
    const isQuant = textLower.includes("quant") || textLower.includes("trading") || textLower.includes("alpha");
    const isEsg = textLower.includes("esg") || textLower.includes("sustainability") || textLower.includes("climate");
    const isCommodities = textLower.includes("commodities") || textLower.includes("gas") || textLower.includes("oil");

    const requiredSkills = getMockSkills(textLower, isQuant, isEsg, isCommodities, true);
    const preferredSkills = getMockSkills(textLower, isQuant, isEsg, isCommodities, false);
    const calibratedMatch = getOfflineCalibration(jdText, masterCv);

    const mockResponse = {
      parsed: {
        company,
        roleTitle,
        location: textLower.includes("london") ? "London, UK" : textLower.includes("york") ? "New York, NY" : textLower.includes("singapore") ? "Singapore" : "Hybrid / London, UK",
        seniority: textLower.includes("senior") || textLower.includes("lead") ? "Senior" : textLower.includes("junior") || textLower.includes("intern") ? "Junior" : "Mid",
        requiredSkills,
        preferredSkills,
        responsibilities: [
          "Deliver rigorous analytics supporting critical front-office workflow.",
          "Analyze complex statistical and numerical datasets.",
          "Partner with engineering and operations counterparts to integrate systems safely."
        ],
        keywords: calibratedMatch.strengths.map(s => s.split(" ")[0]).concat(["Python", "C++", "SQL"]),
        likelyAtsTerms: ["Data structures", "Python", "Quantitative assessment", "Software lifecycle"],
        redFlags: textLower.includes("rapidly changing") ? ["Vague scope or high context switching expected"] : ["May require substantial on-call trading hour alignment"]
      },
      match: calibratedMatch,
      isMockMode: true
    };

    return res.json(mockResponse);
  }

  try {
    const prompt = `Analyze this Job Description:
    
    """
    ${jdText}
    """
    
    And Candidate Master CV:
    """
    ${masterCv ? JSON.stringify(masterCv) : "None provided"}
    """
    
    Extract the company, roleTitle, location, seniority, requiredSkills, preferredSkills, responsibilities, keywords, likelyAtsTerms, and redFlags.
    
    Perform a robust recruiter-level ATS calibration match of the candidate against this target role. Group extraction checkpoints, calculate the strictly honest scoring breakdowns (out of dimensions: 25 technical, 20 domain, 20 seniority, 20 credibility, 15 ats), evaluate specific strengths, warnings, and missing must-haves, identify unused keywords due to zero candidate evidence, write a detailed weakness note, and map requirements sequentially.

    Output the clean JSON representation fitting the required schema exactly. Ensure absolute truthfulness: do not fabricate achievements, do not exaggerate candidate certifications.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: JOB_PARSING_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            parsed: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                roleTitle: { type: Type.STRING },
                location: { type: Type.STRING },
                seniority: { type: Type.STRING },
                requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                preferredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                likelyAtsTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
                redFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["company", "roleTitle", "location", "seniority", "requiredSkills", "responsibilities"]
            },
            match: {
              type: Type.OBJECT,
              properties: {
                matchCategory: { type: Type.STRING, description: "Strong apply, Reasonable apply, Stretch apply, or Low-fit apply" },
                matchScore: { type: Type.INTEGER, description: "Overall integer match score from 0 to 100" },
                fitReasoning: { type: Type.STRING, description: "Detailed 3-sentence explanation grounding credentials suitability" },
                skillsGap: { type: Type.ARRAY, items: { type: Type.STRING } },
                technicalScore: { type: Type.INTEGER, description: "Logical rating inside 0-25 boundaries" },
                domainScore: { type: Type.INTEGER, description: "Logical rating inside 0-20 boundaries" },
                seniorityScore: { type: Type.INTEGER, description: "Logical rating inside 0-20 boundaries" },
                credibilityScore: { type: Type.INTEGER, description: "Logical rating inside 0-20 boundaries" },
                atsScore: { type: Type.INTEGER, description: "Logical rating inside 0-15 boundaries" },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Clear key strength indicators" },
                concerns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Objective warnings and concerns" },
                missingMustHaves: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Strictly absent credentials required in JD" },
                evidenceMapping: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      requirement: { type: Type.STRING },
                      group: { type: Type.STRING, description: "Core technical, Domain/industry, Seniority/leadership, or Communication/stakeholder" },
                      evidenceType: { type: Type.STRING, description: "Direct evidence, Adjacent transferable evidence, or No evidence" },
                      candidateEvidence: { type: Type.STRING }
                    },
                    required: ["requirement", "group", "evidenceType", "candidateEvidence"]
                  }
                },
                unusedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords present in JD but we have zero evidence to claim" },
                weaknessNotes: { type: Type.STRING }
              },
              required: [
                "matchCategory", "matchScore", "fitReasoning", "skillsGap",
                "technicalScore", "domainScore", "seniorityScore", "credibilityScore", "atsScore",
                "strengths", "concerns", "missingMustHaves", "evidenceMapping", "unusedKeywords", "weaknessNotes"
              ]
            }
          },
          required: ["parsed", "match"]
        }
      }
    });

    const outputText = response.text || "{}";
    const data = JSON.parse(outputText.trim());
    return res.json({ ...data, isMockMode: false });
  } catch (error: any) {
    console.error("Gemini parse-job error:", error);
    const calibratedMatch = getOfflineCalibration(jdText, masterCv);
    const textLower = jdText.toLowerCase();
    const company = extractCompanyName(jdText);
    const roleTitle = extractRoleTitle(jdText);
    const isQuant = textLower.includes("quant") || textLower.includes("trading") || textLower.includes("alpha");
    const isEsg = textLower.includes("esg") || textLower.includes("sustainability") || textLower.includes("climate");
    const isCommodities = textLower.includes("commodities") || textLower.includes("gas") || textLower.includes("oil");

    const mockResponse = {
      parsed: {
        company,
        roleTitle,
        location: textLower.includes("london") ? "London, UK" : textLower.includes("york") ? "New York, NY" : textLower.includes("singapore") ? "Singapore" : "Hybrid / London, UK",
        seniority: textLower.includes("senior") || textLower.includes("lead") ? "Senior" : textLower.includes("junior") || textLower.includes("intern") ? "Junior" : "Mid",
        requiredSkills: getMockSkills(textLower, isQuant, isEsg, isCommodities, true),
        preferredSkills: getMockSkills(textLower, isQuant, isEsg, isCommodities, false),
        responsibilities: [
          "Deliver rigorous analytics supporting critical front-office workflow.",
          "Analyze complex statistical and numerical datasets.",
          "Partner with engineering and operations counterparts to integrate systems safely."
        ],
        keywords: calibratedMatch.strengths.map(s => s.split(" ")[0]).concat(["Python", "C++", "SQL"]),
        likelyAtsTerms: ["Data structures", "Python", "Quantitative assessment", "Software lifecycle"],
        redFlags: textLower.includes("rapidly changing") ? ["Vague scope or high context switching expected"] : ["May require substantial on-call trading hour alignment"]
      },
      match: calibratedMatch,
      isMockMode: true,
      errorMsg: error.message
    };

    return res.json(mockResponse);
  }
});

// 2. Tailor CV Assistant
app.post("/api/tailor-cv", async (req, res) => {
  const { jdText, masterCv, toneMode } = req.body;
  if (!jdText || !masterCv) {
    return res.status(400).json({ error: "Missing required job description or CV data" });
  }

  const { client, mode } = getGeminiClient();

  if (mode === "mock" || !client) {
    // Implement standard high fidelity mock tailoring
    const company = extractCompanyName(jdText);
    const skillsList = masterCv.skills || [];
    const isPython = skillsList.some((s: string) => s.toLowerCase().includes("python"));
    
    // Tailor experience bullets
    const tailoredExp = masterCv.experience.map((exp: any, index: number) => {
      const bullets = exp.bullets.map((b: string, bIdx: number) => {
        // Adjust tone slightly of the bullets or add keywords without fabricating content
        let mod = b;
        let reasoning = "Aligned with action verbs preferred in quantitative assessments.";
        if (bIdx === 0) {
          mod = mod.replace(/Developed/i, "Engineered and optimized");
          mod = `${mod} to support real-time quantitative analytical metrics.`;
          reasoning = `Swapped passive construction 'Developed' with active 'Engineered and optimized', highlighting quantitative alignment requested in JD.`;
        } else if (bIdx === 1 && isPython) {
          mod = `${mod} leveraging optimized Python pipelines.`;
          reasoning = `Explicitly highlighted Python proficiency as required by ${company} requirements catalog.`;
        }
        return {
          id: `b-${index}-${bIdx}`,
          originalBullet: b,
          modifiedBullet: mod,
          reasoning
        };
      });
      return {
        id: exp.id,
        company: exp.company,
        role: exp.role,
        bullets
      };
    });

    const mockResponse = {
      tailored: {
        summary: `Refined engineering professional aiming to leverage advanced data analytics, Python mastery, and quantitative analysis alignment to support key strategic models at ${company}. Under absolute truthfulness constraints, optimized current experience highlights without fabricating credentials.`,
        skillsGapAnalysis: `Identified minor exposure differentials in specialized libraries like PyTorch or custom trade desks, which are noted as target extension points. Recommendations for rapid onboarding are tracked.`,
        experience: tailoredExp
      },
      isMockMode: true
    };

    return res.json(mockResponse);
  }

  try {
    const prompt = `Adapt the Work Experience section of the Master CV for this Job Description.
    
    Master CV Profile:
    ${JSON.stringify(masterCv)}
    
    Target Job Description:
    ${jdText}
    
    Selected Tone Mode: ${toneMode || "confident"}
    
    TRUTHFULNESS MANDATE:
    1. Only rephrase, prioritize, and focus current bullets.
    2. NEVER invent experience, companies, years, metrics, tools, or projects.
    3. If there is a missing technology stack, do NOT pretend the candidate knows it—discuss it as a gap in skillsGapAnalysis.
    
    Return tailored summary, skillsGapAnalysis, and tailored Experience lists matching the JSON Schema. Ensure experience maps directly to existing WorkExperience IDs.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `${CV_TAILORING_PROMPT}\n${TRUTHFULNESS_CHECK}`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tailored: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                skillsGapAnalysis: { type: Type.STRING, description: "Analytical evaluation of which credentials or techs are missing and which are strong" },
                experience: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      company: { type: Type.STRING },
                      role: { type: Type.STRING },
                      bullets: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            originalBullet: { type: Type.STRING },
                            modifiedBullet: { type: Type.STRING },
                            reasoning: { type: Type.STRING }
                          },
                          required: ["id", "originalBullet", "modifiedBullet", "reasoning"]
                        }
                      }
                    },
                    required: ["id", "company", "role", "bullets"]
                  }
                }
              },
              required: ["summary", "skillsGapAnalysis", "experience"]
            }
          },
          required: ["tailored"]
        }
      }
    });

    const outputText = response.text || "{}";
    const data = JSON.parse(outputText.trim());
    return res.json({ ...data, isMockMode: false });
  } catch (error: any) {
    console.error("Gemini tailor-cv error:", error);
    // Fallback to high fidelity mock tailoring
    const company = extractCompanyName(jdText);
    const skillsList = masterCv.skills || [];
    const isPython = skillsList.some((s: string) => s.toLowerCase().includes("python"));
    
    // Tailor experience bullets
    const tailoredExp = masterCv.experience.map((exp: any, index: number) => {
      const bullets = exp.bullets.map((b: string, bIdx: number) => {
        let mod = b;
        let reasoning = "Aligned with action verbs preferred in quantitative assessments.";
        if (bIdx === 0) {
          mod = mod.replace(/Developed/i, "Engineered and optimized");
          mod = `${mod} to support real-time quantitative analytical metrics.`;
          reasoning = `Swapped passive construction 'Developed' with active 'Engineered and optimized', highlighting quantitative alignment requested in JD.`;
        } else if (bIdx === 1 && isPython) {
          mod = `${mod} leveraging optimized Python pipelines.`;
          reasoning = `Explicitly highlighted Python proficiency as required by ${company} requirements catalog.`;
        }
        return {
          id: `b-${index}-${bIdx}`,
          originalBullet: b,
          modifiedBullet: mod,
          reasoning
        };
      });
      return {
        id: exp.id,
        company: exp.company,
        role: exp.role,
        bullets
      };
    });

    const mockResponse = {
      tailored: {
        summary: `Refined engineering professional aiming to leverage advanced data analytics, Python mastery, and quantitative analysis alignment to support key strategic models at ${company}. Under absolute truthfulness constraints, optimized current experience highlights without fabricating credentials.`,
        skillsGapAnalysis: `Identified minor exposure differentials in specialized libraries like PyTorch or custom trade desks, which are noted as target extension points. Recommendations for rapid onboarding are tracked.`,
        experience: tailoredExp
      },
      isMockMode: true,
      errorMsg: error.message
    };

    return res.json(mockResponse);
  }
});

// 3. Cover Letter Generator
app.post("/api/generate-cl", async (req, res) => {
  const { jdText, masterCv, letterStyle } = req.body;
  if (!jdText || !masterCv) {
    return res.status(400).json({ error: "Missing required job description or CV data" });
  }

  const { client, mode } = getGeminiClient();

  if (mode === "mock" || !client) {
    const company = extractCompanyName(jdText);
    const role = extractRoleTitle(jdText);
    
    let content = "";
    if (letterStyle === "short") {
      content = `Dear Hiring Team at ${company},

I am writing to express my strong, analytical interest in your ${role} position. Backed by solid metrics in quantitative computing, algorithm efficiency, and clean data modeling, I align closely with your requirement for a disciplined professional. 

In my master CV, my work is characterized by optimizing pipelines and designing models in structured environments. I hope to apply this exact technical discipline to ${company}'s operational benchmarks, and look forward to detailing my quantitative credentials.

Sincerely,
${masterCv.fullName}`;
    } else {
      content = `Dear ${company} Recruitment Team,

I am writing with high conviction regarding the ${role} opening at ${company}. My background in quantitative analysis, complex software pipelines, and data systems offers a strong foundation to support the challenges of your front-office ecosystem.

Within my previous roles, I have dedicated significant effort to optimizing computational speed, auditing system accuracy, and crafting maintainable analytical dashboards. These initiatives were consistently grounded in collaborative technical objectives. I recognize ${company}'s commitment to excellence and analytical integrity, particularly inside this division.

By joining your team, I aim to bring strict attention to detail and rigorous quantitative testing parameters. Thank you for studying my credentials, and I look forward to exploring how I can contribute immediately.

Sincerely,
${masterCv.fullName}`;
    }

    const mockResponse = {
      coverLetter: {
        content,
        verificationRules: [
          {
            statement: `Dear Hiring Team at ${company}`,
            reason: "Confirm contact details and actual hiring manager name if accessible."
          },
          {
            statement: `I hope to apply this exact technical discipline to ${company}'s operational benchmarks`,
            reason: "Ensure Company motivation details match actual strategic divisions."
          }
        ]
      },
      isMockMode: true
    };

    return res.json(mockResponse);
  }

  try {
    const prompt = `Write a clean tailored cover letter for:
    Role: ${extractRoleTitle(jdText)} @ ${extractCompanyName(jdText)}
    
    Candidate profile context:
    ${JSON.stringify(masterCv)}
    
    Job description requirements context:
    ${jdText}
    
    Style Select: ${letterStyle || "standard"}
    
    Remember: Write in markdown. Eliminate boilerplate flowery marketing fluff. Speak directly. Output JSON matching the schema.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: COVER_LETTER_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coverLetter: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING },
                verificationRules: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      statement: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ["statement", "reason"]
                  }
                }
              },
              required: ["content", "verificationRules"]
            }
          },
          required: ["coverLetter"]
        }
      }
    });

    const outputText = response.text || "{}";
    const data = JSON.parse(outputText.trim());
    return res.json({ ...data, isMockMode: false });
  } catch (error: any) {
    console.error("Gemini generate-cl error:", error);
    // Fallback to high-fidelity offline cover letter generation
    const company = extractCompanyName(jdText);
    const role = extractRoleTitle(jdText);
    
    let content = "";
    if (letterStyle === "short") {
      content = `Dear Hiring Team at ${company},

I am writing to express my strong, analytical interest in your ${role} position. Backed by solid metrics in quantitative computing, algorithm efficiency, and clean data modeling, I align closely with your requirement for a disciplined professional. 

In my master CV, my work is characterized by optimizing pipelines and designing models in structured environments. I hope to apply this exact technical discipline to ${company}'s operational benchmarks, and look forward to detailing my quantitative credentials.

Sincerely,
${masterCv.fullName}`;
    } else {
      content = `Dear ${company} Recruitment Team,

I am writing with high conviction regarding the ${role} opening at ${company}. My background in quantitative analysis, complex software pipelines, and data systems offers a strong foundation to support the challenges of your front-office ecosystem.

Within my previous roles, I have dedicated significant effort to optimizing computational speed, auditing system accuracy, and crafting maintainable analytical dashboards. These initiatives were consistently grounded in collaborative technical objectives. I recognize ${company}'s commitment to excellence and analytical integrity, particularly inside this division.

By joining your team, I aim to bring strict attention to detail and rigorous quantitative testing parameters. Thank you for studying my credentials, and I look forward to exploring how I can contribute immediately.

Sincerely,
${masterCv.fullName}`;
    }

    const mockResponse = {
      coverLetter: {
        content,
        verificationRules: [
          {
            statement: `Dear Hiring Team at ${company}`,
            reason: "Confirm contact details and actual hiring manager name if accessible."
          },
          {
            statement: `I hope to apply this exact technical discipline to ${company}'s operational benchmarks`,
            reason: "Ensure Company motivation details match actual strategic divisions."
          }
        ]
      },
      isMockMode: true,
      errorMsg: error.message
    };

    return res.json(mockResponse);
  }
});

// 4. Parse CV Build Profile
app.post("/api/parse-cv", async (req, res) => {
  const { cvText } = req.body;
  if (!cvText || cvText.trim() === "") {
    return res.status(400).json({ error: "Missing CV text content" });
  }

  const { client, mode } = getGeminiClient();

  if (mode === "mock" || !client) {
    const parsed = parseCvOffline(cvText);
    return res.json({ parsedCv: parsed, isMockMode: true });
  }

  try {
    const prompt = `Parse the following raw CV text into a structured profile:
    
    """
    ${cvText}
    """
    
    Follow the schema strictly. Do not make up achievements. Ensure you extract what is truthfully present.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: CV_PARSING_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            parsedCv: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                website: { type: Type.STRING },
                summary: { type: Type.STRING },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                education: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      school: { type: Type.STRING },
                      degree: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      gpa: { type: Type.STRING },
                      details: { type: Type.STRING }
                    },
                    required: ["school", "degree", "duration"]
                  }
                },
                experience: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      company: { type: Type.STRING },
                      role: { type: Type.STRING },
                      location: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["company", "role", "duration", "bullets"]
                  }
                }
              },
              required: ["fullName", "email", "phone", "location", "summary", "skills", "experience", "education"]
            }
          },
          required: ["parsedCv"]
        }
      }
    });

    const outputText = response.text || "{}";
    const data = JSON.parse(outputText.trim());
    return res.json({ ...data, isMockMode: false });
  } catch (error: any) {
    console.error("Gemini parse-cv error:", error);
    // Fallback to high-fidelity offline parsing if network or schema fails
    const parsed = parseCvOffline(cvText);
    return res.json({ parsedCv: parsed, isMockMode: true, errorMsg: error.message });
  }
});

function parseCvOffline(cvText: string): any {
  const lines = cvText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  const emailMatch = cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "candidate@example.com";
  
  const phoneMatch = cvText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : "+1 (416) 555-0100";
  
  let fullName = "Alexander Vance";
  for (const line of lines) {
    if (!line.includes("@") && !line.includes(":") && !line.includes("/") && line.length < 40 && !["experience", "education", "skills", "resume", "cv", "summary", "contact"].includes(line.toLowerCase())) {
      fullName = line;
      break;
    }
  }

  // Location heuristics
  let location = "Toronto, ON";
  const commonCities = ["Toronto", "London", "New York", "NYC", "Chicago", "Paris", "Berlin", "San Francisco", "Boston", "Montreal", "Vancouver", "Waterloo"];
  for (const city of commonCities) {
    if (cvText.toLowerCase().includes(city.toLowerCase())) {
      location = city === "NYC" ? "New York, NY" : city;
      break;
    }
  }

  // LinkedIn & Website
  const linkedinMatch = cvText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : "linkedin.com/in/candidate";
  
  const githubMatch = cvText.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  const website = githubMatch ? githubMatch[0] : "github.com/candidate-codes";

  // Quick section extraction
  let summary = "Experienced professional seeking a high impact position. Demonstrated technical skill in operations, system optimization, and analytics.";
  let skills = ["Python", "SQL", "Git", "Project Management"];
  let experienceList: any[] = [];
  let educationList: any[] = [];
  let certifications: string[] = [];

  // Parse lines for sections
  let currentSection = "";
  let tempBullets: string[] = [];
  let currentCompany = "";
  let currentRole = "";
  let currentDuration = "";

  // Standard terms for split
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    
    if (lineLower.includes("summary") || lineLower.includes("profile") || lineLower.includes("objective")) {
      currentSection = "summary";
      continue;
    } else if (lineLower.includes("experience") || lineLower.includes("employment") || lineLower.includes("work history")) {
      currentSection = "experience";
      continue;
    } else if (lineLower.includes("education") || lineLower.includes("academic")) {
      currentSection = "education";
      continue;
    } else if (lineLower.includes("skills") || lineLower.includes("technologies") || lineLower.includes("languages")) {
      currentSection = "skills";
      continue;
    } else if (lineLower.includes("certification") || lineLower.includes("license")) {
      currentSection = "certifications";
      continue;
    }

    if (currentSection === "summary") {
      summary = line;
      currentSection = ""; // Reset
    } else if (currentSection === "skills") {
      // Split by comma or add directly
      if (line.includes(",")) {
        skills = skills.concat(line.split(",").map(s => s.trim()));
      } else {
        skills.push(line);
      }
    } else if (currentSection === "certifications") {
      certifications.push(line);
    } else if (currentSection === "experience") {
      if (line.startsWith("-") || line.startsWith("*") || line.startsWith("•")) {
        tempBullets.push(line.replace(/^[-*•]\s*/, ""));
      } else if (line.includes("-") && (lineLower.includes("20") || lineLower.includes("present") || lineLower.includes("201") || lineLower.includes("202"))) {
        // Probably dates/job heading
        if (currentCompany && tempBullets.length > 0) {
          experienceList.push({
            id: `exp-${Date.now()}-${experienceList.length}`,
            company: currentCompany,
            role: currentRole || "Consultant",
            location: location,
            duration: currentDuration || "2022 - Present",
            bullets: tempBullets
          });
          tempBullets = [];
        }
        currentDuration = line;
        // Guess company & role from nearby or current line
        const parts = line.split(/[|,-]/);
        currentCompany = parts[0]?.trim() || "Technology Corp";
        currentRole = parts[1]?.trim() || "Analyst";
      } else {
        if (!currentCompany) {
          currentCompany = line;
        } else if (!currentRole) {
          currentRole = line;
        }
      }
    } else if (currentSection === "education") {
      if (line.includes("University") || line.includes("College") || line.includes("School")) {
        const school = line;
        const degree = lines[i+1] || "Bachelor of Science";
        const duration = lines[i+2] || "2018 - 2022";
        educationList.push({
          id: `edu-${Date.now()}-${educationList.length}`,
          school,
          degree,
          duration,
          details: "Grade: GPA 3.9/4.0"
        });
        i += 2; // skip parsed
      }
    }
  }

  // Flush remaining experience
  if (currentCompany && (tempBullets.length > 0 || experienceList.length === 0)) {
    if (tempBullets.length === 0) {
      tempBullets = ["Optimized pipeline throughput and coordinated critical technical assessments.", "Refactored databases to handle heavy real-time daily modifications."];
    }
    experienceList.push({
      id: `exp-${Date.now()}-final`,
      company: currentCompany,
      role: currentRole || "Associate Systems Engineer",
      location: location,
      duration: currentDuration || "2022 - Present",
      bullets: tempBullets
    });
  }

  if (experienceList.length === 0) {
    experienceList = [
      {
         id: "exp-mock-1",
         company: "Hedge Analytics Group",
         role: "Senior Quantitative Risk Developer",
         location: location,
         duration: "2022 - Present",
         bullets: [
           "Optimized high-speed multi-threading calculation layer, decreasing latency by 18%.",
           "Designed carbon offset performance tracking engine aligning with state regulatory structures in local databases."
         ]
      }
    ];
  }

  if (educationList.length === 0) {
    educationList = [
      {
         id: "edu-mock-1",
         school: "Imperial College London",
         degree: "MSc in Advanced Mathematics & Computing (Distinction)",
         duration: "2020 - 2021",
         details: "Focused on numerical analysis, stochastic volatility pricing models, and algorithm designs."
      }
    ];
  }

  // Filter skills to be clean
  skills = Array.from(new Set(skills)).filter(s => s.length > 2 && s.length < 50);

  return {
    fullName,
    email,
    phone,
    location,
    linkedin,
    website,
    summary,
    skills,
    certifications: certifications.length > 0 ? certifications : ["FRM certified", "CFA ESG Investing certificate"],
    experience: experienceList,
    education: educationList
  };
}

// 5. LinkedIn Filtered Job Search API
app.post("/api/search-linkedin-jobs", async (req, res) => {
  const { title = "Software Engineer", location = "London", experienceLevel = "Any", workplaceType = "Any" } = req.body;
  
  const { client, mode } = getGeminiClient();
  
  if (mode === "mock" || !client) {
    const jobs = searchLinkedinJobsOffline(title, location, experienceLevel, workplaceType);
    return res.json({ jobs, isMockMode: true });
  }

  try {
    // Stage 1: Call Gemini 3.5 Flash with live Google Search web grounding, but no responseSchema.
    const searchQuery = `Search the live web using your integrated Google Search capabilities to find active, actual open job listings matching the criteria below.
IMPORTANT: You MUST formulate a highly specific search query that returns genuine index listings from LinkedIn or company jobs platforms (lever, greenhouse, workday, etc.).
Search Criteria:
- Job Title Keywords: ${title}
- Location: ${location}
- Experience Level / Seniority: ${experienceLevel}
- Workplace Mode (Remote / Hybrid / On-site): ${workplaceType}

Find and return up to 5 real active job postings. Provide their title, company, location, snippet, relative posting time, and actual URL from grounding metadata.`;

    const searchResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: searchQuery,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const groundedText = searchResponse.text || "No active listings found.";

    // Stage 2: Format the grounded search result text into the strict structured schema.
    const parsePrompt = `You are a meticulous recruiter data entry system. Please parse the following raw web search results into a clean, fully validated JSON object. Ensure you capture the real details (including real URLs from grounding metadata if present under active search outputs).

Search Results:
"""
${groundedText}
"""

Target formatting schema:
- jobs: Array of job objects containing:
  - title: Official full job title
  - company: Company name
  - location: Highly specific location
  - snippet: Key responsibilities, tools requested, or core context
  - url: Genuine post link or application URL
  - postedTime: Relative duration indicator (e.g. '1 day ago', '3 days ago')

Output a clean, valid JSON representation matching the schema strictly.`;

    const parseResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parsePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jobs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  company: { type: Type.STRING },
                  location: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  url: { type: Type.STRING },
                  postedTime: { type: Type.STRING }
                },
                required: ["title", "company", "location", "snippet", "url"]
              }
            }
          },
          required: ["jobs"]
        }
      }
    });

    const outputText = parseResponse.text || "{\"jobs\": []}";
    const data = JSON.parse(outputText.trim());
    
    // Ensure all output URLs are robust, active, non-broken references
    if (data && Array.isArray(data.jobs)) {
      data.jobs = data.jobs.map((job: any) => {
        let finalUrl = job.url;
        // Check for placeholder or dummy links and replace with highly accurate live search targets
        const isPlaceholder = !finalUrl || 
          !finalUrl.startsWith("http") || 
          finalUrl.includes("example.com") || 
          finalUrl.includes("mock") || 
          finalUrl.includes("dummy") || 
          finalUrl.endsWith("/view");
        
        if (isPlaceholder) {
          finalUrl = makeWorkingLinkedinUrl(job.title, job.company, job.location || location);
        }
        return {
          ...job,
          url: finalUrl
        };
      });
    }

    return res.json({ ...data, isMockMode: false });
  } catch (error: any) {
    console.error("Gemini search-linkedin-jobs error:", error);
    // Fallback to offline search as resilient backup
    const jobs = searchLinkedinJobsOffline(title, location, experienceLevel, workplaceType);
    return res.json({ jobs, isMockMode: true, errorMsg: error.message });
  }
});

function makeWorkingLinkedinUrl(title: string, company: string, location: string): string {
  const query = `${company} ${title}`;
  return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
}

function searchLinkedinJobsOffline(
  title: string,
  location: string,
  experienceLevel: string,
  workplaceType: string
): any[] {
  const t = (title || "").toLowerCase();
  const loc = location || "London, UK";
  const exp = experienceLevel || "Mid";
  const wt = workplaceType || "Hybrid";

  // Base dataset of premium benchmark job structures
  const standardJobs = [
    {
      title: "Senior Quantitative Developer - Commodities Desk",
      company: "Citadel Securities",
      location: "London, UK",
      snippet: "Engineered high-performance real-time analytics for physical and financial options pricing. Required: 5+ years with C++ or Python and statistical forecasting under volatile market assumptions.",
      postedTime: "1 day ago"
    },
    {
      title: "Machine Learning & Performance Research Engineer",
      company: "Apex Commodities Ltd",
      location: "Toronto, ON",
      snippet: "Design deep neural model pipelines in PyTorch for high frequency pricing grids. Work on distributed clusters and GPU acceleration techniques. Strong optimization and statistics background.",
      postedTime: "3 days ago"
    },
    {
      title: "ESG Integration & Climate Risk Analyst",
      company: "BlackRock",
      location: "New York, NY",
      snippet: "Audit greenhouse gas metrics using WRI GHG protocols and TCFD compliance guidelines. Translate carbon policy implications into portfolio hazard assessments for senior investment committees.",
      postedTime: "2 hours ago"
    },
    {
      title: "Quantitative Trader - Derivatives Arbitrage",
      company: "Susquehanna International Group (SIG)",
      location: "London, UK",
      snippet: "Run complex risk modeling structures of European option contracts. Collaborate directly with engineers to optimize trade execution latency and system tolerances under volatile market shocks.",
      postedTime: "5 days ago"
    },
    {
      title: "Lead Data Scientist - Portfolio Analytics",
      company: "Man Group",
      location: "London, UK",
      snippet: "Build Python and SQL optimization models to identify systematic signal-to-noise ratios. Standardize risk-weighted performance indicators for international front-office desks.",
      postedTime: "1 week ago"
    }
  ];

  // Adjust titles and build active target URLs that map to LinkedIn live search
  return standardJobs.map((job, idx) => {
    let finalTitle = job.title;
    let finalLocation = loc;
    let finalCompany = job.company;

    if (t) {
      if (idx === 0) {
        finalTitle = `${exp === "Senior" ? "Senior" : exp === "Junior" ? "Associate / Junior" : "Mid-Level"} ${title}`;
      } else if (idx === 1) {
        finalTitle = `${title} (Performance & Pricing Focus)`;
      } else if (idx === 3) {
        finalTitle = `${title} Specialist`;
      }
    }

    const fullLoc = `${finalLocation} (${wt})`;
    return {
      title: finalTitle,
      company: finalCompany,
      location: fullLoc,
      snippet: job.snippet,
      url: makeWorkingLinkedinUrl(finalTitle, finalCompany, finalLocation),
      postedTime: job.postedTime
    };
  });
}


// --- HELPER UTILITIES FOR HEURISTIC LOCAL DEMOS ---

function extractCompanyName(text: string): string {
  const line = text.split("\n")[0] || "";
  const match = text.match(/(?:company|at)\s*:\s*([^\n\r]+)/i) || text.match(/([A-Z][a-zA-Z0-9\s]+ (?:Capital|Group|Securities|Partners|Technologies|Bank|Trading|Management|Ltd|Inc))/);
  if (match && match[1]) return match[1].trim();
  if (line.length > 5 && line.length < 50) return line.trim();
  return "Quantum Front Office Ltd";
}

function extractRoleTitle(text: string): string {
  const match = text.match(/(?:role|title|position)\s*:\s*([^\n\r]+)/i) || text.match(/(?:Senior|Junior|Lead)?\s*(?:Quant|Quantitative|Trader|Analyst|Developer|Engineer|Risk Specialist|Associate)/i);
  if (match && match[0]) return match[0].trim();
  return "Quantitative Analyst";
}

function getMockSkills(text: string, isQuant: boolean, isEsg: boolean, isCommodities: boolean, isRequired: boolean): string[] {
  if (isRequired) {
    const list = ["Python", "SQL", "Quantitative Modeling", "Git"];
    if (isQuant) {
      list.push("C++", "Stochastic Calculus", "Pandas");
    }
    if (isEsg) {
      list.push("Sustainability Metrics", "Emissions Data Processing", "ESG Risk scoring");
    }
    if (isCommodities) {
      list.push("Time-Series Forecasting", "Energy Markets Grid Analytics");
    }
    return list;
  } else {
    const list = ["Docker", "Linux system optimization", "AWS"];
    if (isQuant) {
      list.push("Rust exposure", "CUDA acceleration", "High-frequency pricing models");
    }
    if (isEsg) {
      list.push("CFA ESG certification", "SASB compliance framing");
    }
    if (isCommodities) {
      list.push("VBA optimization", "Physical options pricing");
    }
    return list;
  }
}

// --- INITIALIZE & ATTACH VITE / SPA FALLBACKS ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite Development Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`Serving static production files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Application Copilot Fullstack listening on port ${PORT}`);
  });
}

startServer();
