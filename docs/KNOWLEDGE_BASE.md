# ResumeMatch — Knowledge Base Documentation

## 1. Purpose & Design Principles
The `/knowledge/` repository contains human-readable, auditable JSON files storing domain taxonomies, synonyms, hierarchies, and linguistic dictionaries.

### Principles:
1. **Decoupled Architecture**: Domain knowledge is separated from code logic. Adding a new skill alias or job title does not require recompiling or redeploying code.
2. **Canonical Mapping**: Every skill, title, and credential has a single authoritative `canonical` representation with associated aliases.
3. **Hierarchy & Clustering**: Groupings allow Level 6 (Taxonomy-Based Related Matching) when candidates possess adjacent tools in the same functional family.

---

## 2. Directory Schema

### 2.1 `skills.json` & `skill_aliases.json`
- Stores core technical and soft skills, their domain category, and normalized alias variations.
- Example:
```json
{
  "canonical": "FP&A",
  "aliases": ["fp&a", "fp and a", "financial planning and analysis", "financial planning & analysis"],
  "category": "finance"
}
```

### 2.2 `technologies.json`
- Tech stacks categorized into:
  - `database`: PostgreSQL, MySQL, Oracle, MongoDB, Snowflake, BigQuery.
  - `bi_tools`: Power BI, Tableau, Looker, Qlik, MicroStrategy.
  - `erp_systems`: SAP ERP, SAP S/4HANA, NetSuite, Oracle ERP Cloud, Workday.
  - `languages`: Python, TypeScript, JavaScript, SQL, Java, C++, Go.
  - `cloud`: AWS, GCP, Microsoft Azure, Kubernetes, Docker.

### 2.3 `job_titles.json` & `title_hierarchy.json`
- Defines standard job titles and tracks seniority tiers from 1 (Intern/Entry) through 8 (C-Suite/VP).
- Tracks:
  - Finance / Accounting (Analyst $\to$ Senior Analyst $\to$ Manager $\to$ Director $\to$ VP)
  - Software Engineering (Junior $\to$ Mid $\to$ Senior $\to$ Staff/Principal $\to$ VP/CTO)
  - Data / Analytics (Data Analyst $\to$ Data Scientist $\to$ Analytics Manager)

### 2.4 `certifications.json`
- Financial, project management, IT, and engineering certifications (CFA, CPA, PMP, AWS Certified Solutions Architect, CSCP, FRM, Six Sigma Black Belt).

### 2.5 `education_fields.json`
- Academic degrees, hierarchical equivalents (High School < Associate < Bachelor's < Master's/MBA < PhD), and field categorization.

### 2.6 `industries.json`
- Vertical taxonomy: Finance, Banking, SaaS, Healthcare, Manufacturing, Automotive, Logistics/Supply Chain, Energy, Semiconductors.

### 2.7 `action_verbs.json` & `requirement_keywords.json`
- Strong action verbs categorized by operational impact (`leadership`, `execution`, `analysis`, `creation`, `optimization`).
- Modality indicators for classifying statements as `REQUIRED`, `PREFERRED`, `RESPONSIBILITY`, or `CONSTRAINT`.
