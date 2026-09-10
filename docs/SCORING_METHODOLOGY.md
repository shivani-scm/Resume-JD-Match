# ResumeMatch — Scoring Methodology & Mathematical Specification

## 1. Overview
The ResumeMatch scoring methodology generates an explainable, audit-traceable match score ranging from **0 to 100**.

Scoring follows a two-stage evaluation:
1. **Base Category Weighted Scoring**: Aggregates 9 distinct evidence categories, each normalized to $[0, 1.0]$ and weighted according to `scoring_config.json`.
2. **Hard Requirement Penalty Deductions**: Explicit point deductions applied when mandatory, non-negotiable job requirements are violated (e.g., missing critical license, mandatory degree deficiency, or severe experience gap).

---

## 2. Mathematical Formulation

### 2.1 Category Weights ($W_i$)
The default category weights sum to $1.00$ ($100\%$):

| Category ($i$) | Weight ($W_i$) | Focus Area |
|---|---|---|
| Required Skills | 0.25 (25%) | Exact, alias, abbreviation, or fuzzy match of mandatory skills |
| Preferred Skills | 0.10 (10%) | Nice-to-have or bonus technical & domain competencies |
| Relevant Experience | 0.20 (20%) | Detected tenure vs. required tenure in relevant job functions |
| Responsibilities | 0.15 (15%) | BM25 / TF-IDF action-object overlap across duties |
| Title / Seniority | 0.10 (10%) | Job title similarity and hierarchical seniority progression |
| Education | 0.05 (5%) | Degree level threshold and field of study alignment |
| Certifications | 0.05 (5%) | Relevant professional licenses and certifications |
| Industry / Domain | 0.05 (5%) | Business vertical and industry ecosystem alignment |
| ATS / Keyword Coverage | 0.05 (5%) | Document parseability, structural hygiene & lexical richness |
| **Total** | **1.00 (100%)** | |

### 2.2 Base Score Calculation
Let $S_i \in [0.0, 1.0]$ be the normalized match score for category $i$.
The unpenalized Base Score $S_{base}$ is defined as:

$$S_{base} = 100 \times \sum_{i=1}^{9} (W_i \times S_i)$$

---

## 3. Skill Match Scoring Levels (Levels 1–6)
When matching candidate skills against JD requirements, each requirement is assigned a match quality score based on the highest level satisfied:

| Level | Type | Description | Match Score ($M$) |
|---|---|---|---|
| Level 1 | Exact Match | Exact case-insensitive string equality (e.g. `Power BI` = `Power BI`) | 1.00 |
| Level 2 | Canonical Alias | Matches recognized synonyms in `skill_aliases.json` (e.g. `FP&A` = `Financial Planning & Analysis`) | 1.00 |
| Level 3 | Abbreviation | Standard acronym expansion or contraction (e.g. `SQL` = `Structured Query Language`) | 0.95 |
| Level 4 | Fuzzy Match | Jaro-Winkler distance $\ge 0.88$ or Levenshtein similarity $\ge 0.85$ | 0.75 – 0.85 |
| Level 5 | Substring / Phrase | Multi-word phrase overlap (e.g. `Data Warehousing` $\subset$ `Enterprise Data Warehousing`) | 0.70 |
| Level 6 | Taxonomy Related | Shared parent cluster in `technologies.json` (e.g. `SAP S/4HANA` $\approx$ `SAP ERP`) | 0.50 – 0.65 |
| Missing | Not Found | No corresponding skill found in resume | 0.00 |

---

## 4. Experience Tenure Calculation
Experience tenure is computed using **disjoint calendar intervals** to prevent double-counting concurrent or overlapping roles:

1. Let each role $k$ have interval $[start_k, end_k]$.
2. The union interval set $\mathcal{U} = \bigcup_k [start_k, end_k]$ is calculated.
3. Total tenure $T = \sum_{u \in \mathcal{U}} \text{duration}(u)$.
4. Let $R_{years}$ be the required years of experience:
   - If $T \ge R_{years}$: $\text{Status} = \text{MEETS or EXCEEDS}$, $S_{exp} = 1.0$ (up to $1.1$ bonus cap).
   - If $0.8 \times R_{years} \le T < R_{years}$: $\text{Status} = \text{SLIGHTLY\_BELOW}$, $S_{exp} = \frac{T}{R_{years}} \times 0.85$.
   - If $T < 0.8 \times R_{years}$: $\text{Status} = \text{SIGNIFICANTLY\_BELOW}$, $S_{exp} = \frac{T}{R_{years}} \times 0.60$.

---

## 5. Hard Requirement Penalty Model
Penalties are only applied when requirements are explicitly tagged as **MANDATORY** in the JD:

$$\text{Total Deductions } P = \sum_{j} \text{Penalty}_j$$

Default Penalty Configurations:
- `missing_critical_skill`: $-8.0$ points per missing mandatory core skill (capped at $-24.0$)
- `mandatory_certification_missing`: $-10.0$ points (e.g. CPA required for Controller role)
- `major_experience_gap`: $-10.0$ points (detected tenure $< 50\%$ of mandatory minimum)
- `mandatory_degree_missing`: $-7.0$ points (e.g. Bachelor's required, only High School detected)
- `major_seniority_mismatch`: $-7.0$ points (e.g. Entry level candidate applying for VP)

The final score $S_{final}$ is bounded:

$$S_{final} = \max(0, \min(100, S_{base} - P))$$

---

## 6. Score Interpretation & Application Recommendations

### 6.1 Score Bands
- **90 – 100**: `Exceptional Match` (Meets or exceeds all required & preferred criteria)
- **80 – 89**: `Strong Match` (Meets all mandatory criteria; strong candidate)
- **70 – 79**: `Good Match` (Meets core requirements with minor peripheral gaps)
- **60 – 69**: `Moderate Match` (Some gaps in experience or specialized tools)
- **50 – 59**: `Weak Match` (Multiple missing core requirements)
- **0 – 49**: `Poor Match` (Substantial misalignment with role prerequisites)

### 6.2 Application Recommendation Logic
1. **HIGH PRIORITY APPLICATION**: Score $\ge 82$ AND $P = 0$ (no hard requirement violations).
2. **GOOD APPLICATION**: Score $\ge 70$ AND $P \le 8$ (at most 1 minor penalty).
3. **BORDERLINE**: Score between $55$ and $69$.
4. **LOW PRIORITY**: Score $< 55$ OR critical constraint violation (e.g. citizenship/visa constraint).
