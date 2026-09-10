# ResumeMatch — Product Specification

## 1. Executive Summary & Product Objective
**ResumeMatch** is an explainable, deterministic, zero-LLM Resume and Job Description (JD) matching intelligence platform. 

Recruiting engines and applicant tracking systems (ATS) often rely either on brittle, naive keyword counters or opaque, non-deterministic large language models (LLMs) that hallucinate, introduce latency and privacy leaks, and fail to provide auditable justification for why a candidate was ranked.

ResumeMatch provides:
- **100% Deterministic Evaluation**: Given the exact same resume and job description, it yields the exact same score, match breakdown, and evidence every single run.
- **Strictly Local & Privacy-Preserving**: No candidate or company data leaves the local execution boundary. No third-party LLMs or vector databases are invoked.
- **Explainable Evidence-Based Scoring (0–100)**: Evaluates evidence quality across 9 weighted categories with configurable penalties for missing hard requirements.
- **Multi-Level Skill Matching**: Distinguishes between exact matches, canonical aliases, abbreviations/expansions, fuzzy string variations, and taxonomy-based relationships.
- **Explicit Separation of Match Score vs. Callback Probability**: Version 1 provides an objective Match Score (0–100). It strictly does NOT manufacture a fake "chance of callback". A future calibrated statistical model (e.g., Logistic Regression / XGBoost) may compute historical callback probability once verified empirical outcomes are collected.

---

## 2. Core Functional Requirements

### 2.1 Inputs & Formats
- **Resume Formats**: PDF, DOCX, Plain Text (TXT), direct paste.
- **Job Description Formats**: PDF, DOCX, Plain Text (TXT), direct paste.
- **Interaction**: Drag-and-drop file upload zones with quick sample loaders for immediate testing.

### 2.2 Document Parsing
- **Resume Profile Extraction**:
  - Candidate contact information (name, email, phone, location, LinkedIn/GitHub links).
  - Summary / Objective.
  - Core skills and technical tools.
  - Work experience (roles, employers, start/end dates, normalized durations in months, bullet-point responsibilities, detected skills/technologies per role).
  - Education (institution, degree level, field of study, graduation year).
  - Certifications (credential name, issuing authority, active status).
  - Projects and domain/industry tags.
- **Job Description Extraction**:
  - Title and detected seniority level.
  - Requirement classification: `REQUIRED`, `PREFERRED`, `RESPONSIBILITY`, `CONTEXT`, `CONSTRAINT`.
  - Required and preferred skills, tools, and technical competencies.
  - Required and preferred experience durations (e.g., "5+ years FP&A").
  - Education and certification prerequisites.
  - Work arrangements (remote, hybrid, on-site, visa/work authorization constraints).

### 2.3 Knowledge Base & Taxonomy
- Modular JSON dictionaries decoupling domain data from code logic:
  - `skills.json` (canonical skills with categories).
  - `skill_aliases.json` (synonyms, common misspellings, variant names).
  - `technologies.json` (frameworks, databases, cloud providers, ERP systems).
  - `job_titles.json` & `title_hierarchy.json` (standard title tracks and seniority levels).
  - `certifications.json` (professional credentials and their canonical acronyms).
  - `education_fields.json` (academic disciplines and degree level equivalents).
  - `industries.json` (industry verticals and semantic tags).
  - `action_verbs.json` (strong action verbs classified by functional impact).
  - `requirement_keywords.json` (modality indicators: required vs. preferred vs. constraint).

### 2.4 Multi-Level Matching Engines
1. **Skill Matching Engine (Levels 1–6)**:
   - Level 1: Exact Match (1.0 weight)
   - Level 2: Canonical Alias Match (1.0 weight)
   - Level 3: Abbreviation / Expansion Match (0.95 weight)
   - Level 4: Fuzzy String Match (Jaro-Winkler / Levenshtein $\ge 0.85$, $0.70$–$0.85$ weight)
   - Level 5: Substring / Token Phrase Similarity ($0.65$–$0.80$ weight)
   - Level 6: Taxonomy-Based Related Match (e.g., SAP S/4HANA $\to$ SAP ERP, $0.50$–$0.65$ weight)
2. **Experience Engine**:
   - Computes non-overlapping calendar intervals to prevent double-counting concurrent roles.
   - Calculates total professional tenure, relevant domain tenure, and skill-specific exposure.
   - Compares detected vs. required duration and classifies: `EXCEEDS`, `MEETS`, `SLIGHTLY_BELOW`, `SIGNIFICANTLY_BELOW`.
3. **Job Title & Seniority Engine**:
   - Analyzes title semantic alignment and seniority ladder compatibility (Intern $\to$ Associate $\to$ Mid $\to$ Senior $\to$ Lead $\to$ Manager $\to$ Director $\to$ VP $\to$ C-Level).
   - Detects overqualification or underqualification risks.
4. **Responsibility Matching Engine**:
   - Analyzes action verbs + object/domain noun phrases + frequency/context.
   - Leverages BM25 / TF-IDF cosine similarity across responsibility statements.
5. **Education & Certification Engine**:
   - Evaluates minimum degree level threshold and discipline alignment.
   - Validates mandatory licenses/certifications (e.g., CPA, CFA, PMP, PE).
6. **ATS Compatibility Engine**:
   - Standalone ATS score (0–100) assessing header hygiene, section standard naming, multi-column risks, contact extractability, table clutter, and date parseability.

### 2.5 Explainability & Audit Output
- **Match Score (0–100)** with category-level radar/bar distribution.
- **Skill Matrix**: Tabular breakdown with interactive filters (`All`, `Required`, `Preferred`, `Matched`, `Partial`, `Missing`).
- **Experience Matrix**: Required tenure vs. detected non-overlapping tenure.
- **Risk Flags & Deductions**: Itemized point deductions for missing hard constraints.
- **Application Recommendation**:
  - `HIGH PRIORITY APPLICATION` ($\ge 85$ with no critical gaps)
  - `GOOD APPLICATION` ($70$–$84$)
  - `BORDERLINE` ($55$–$69$)
  - `LOW PRIORITY` ($< 55$ or critical constraint failure)
