# ResumeMatch — Architecture Document

## 1. Architectural Philosophy & Constraints
1. **Zero External Inference**: All algorithms execute synchronously and locally without network dependencies, external LLM APIs, or cloud vector embeddings.
2. **Determinism**: Given document inputs $D_{resume}$ and $D_{jd}$, the function $f(D_{resume}, D_{jd})$ produces bit-for-bit identical scores, deductions, and match tables every execution.
3. **Transparency & Explainability**: Every numeric value in the final score is broken down into category weights, baseline matches, and itemized penalty deductions.
4. **Data Isolation**: Resume and JD contents reside solely in runtime memory, preventing PII leaks or unintended data retention.

---

## 2. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 USER INTERFACE                                    |
|   React 19 + Tailwind CSS + Lucide Icons + Motion (Desktop-First, Accessible)    |
|   - Resume & JD Upload Dropzone (PDF/DOCX/TXT/Paste) + Interactive Samples        |
|   - Match Score & Category Visualizer                                             |
|   - Tabs: Overview, Skill Matrix, Experience, Responsibilities, Education, ATS,  |
|           Risk Flags, Score Audit, Future Callback Model Architecture             |
+-----------------------------------------------------------------------------------+
                                         │
                   HTTP REST / In-Memory Deterministic Engine
                                         ▼
+-----------------------------------------------------------------------------------+
|                           DETERMINISTIC ANALYSIS ENGINE                           |
+-----------------------------------------------------------------------------------+
|  [Document Parsing Layer]                                                         |
|  - PlainText / PDF Stream Text Extractor / DOCX XML Extractor                     |
|  - Section Heading Segmenter (Fuzzy dictionary of 80+ common section variants)    |
|  - Contact & PII Extractor (Regex for RFC-compliant Email, Phone, URLs)          |
|  - Date Interval & Employment Timeline Parser (Chronological normalization)       |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|  [Classification & Structuring Layer]                                             |
|  - JD Modality Classifier: Rule-based regex for REQUIRED, PREFERRED, CONSTRAINT  |
|  - Experience Interval Aggregator: Disjoint calendar union (no double counting)   |
|  - Responsibility Tokenizer: Action Verb + Noun Phrase Object + Modifier triples  |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|  [Knowledge Base & Multi-Level Matchers]                                          |
|  - Canonical Skill Index (Level 1: Exact, Level 2: Alias, Level 3: Abbreviation)  |
|  - String Distance Metric: Levenshtein + Jaro-Winkler (Level 4: Fuzzy >= 0.85)   |
|  - Information Retrieval: BM25 + TF-IDF Cosine Similarity (Level 5: Responsib.)  |
|  - Taxonomy Hierarchy: Domain & Seniority distance matrices (Level 6: Related)    |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|  [Scoring & Penalty Engine]                                                       |
|  - Configurable Weighted Scoring Model (scoring_config.json)                      |
|  - Hard Requirement Penalty Evaluator (penalties_config.json)                     |
|  - Score Clamping & Normalization [0, 100]                                        |
|  - Audit Trace Generator (Formula trace, itemized additions and subtractions)     |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼
+-----------------------------------------------------------------------------------+
|  [ATS Compatibility Analyzer]                                                     |
|  - Layout Complexity, Header Hygiene, Section Legibility, Contact Extractability  |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Flow

1. **Document Ingestion**:
   - Resumes & JDs are parsed into raw textual strings preserving line breaks and structural indentation.
2. **Structural Segmentation**:
   - The document segmenter identifies standard heading patterns (e.g., `EXPERIENCE`, `WORK HISTORY`, `EDUCATION`, `SKILLS & TOOLS`).
   - Text is partitioned into structured sections.
3. **Information Extraction**:
   - `ResumeProfile`: contact, skills list, job history intervals, degrees, certs, projects.
   - `JobProfile`: title, seniority, requirement list tagged with `REQUIRED` / `PREFERRED` / `CONSTRAINT`.
4. **Matching & Comparison**:
   - The Skill Matcher iterates through all JD requirements, testing candidate skills through Levels 1–6.
   - The Experience Engine computes union intervals across relevant positions.
   - The Responsibility Matcher runs BM25 & TF-IDF vector comparisons across bullet points.
   - The Education/Certification Matcher checks minimum level thresholds and discipline relevance.
5. **Scoring Compilation**:
   - Computes weighted sum of category matches $[0, 1] \times W_{category}$.
   - Checks hard requirement violations and subtracts corresponding penalties.
   - Generates recommendation category based on score and critical constraints.

---

## 4. Extensibility & Future Callback Model Interface
The system isolates the deterministic matching engine from statistical callback prediction:
- Interface `ICallbackProbabilityModel`:
  - Input: `AnalysisResult`, `candidateMetadata`, `historicalHiringFeatures`.
  - Output: Calibrated probability $[0.0, 1.0]$ with confidence intervals.
  - Pluggable implementations: Logistic Regression, Random Forest, or XGBoost.
