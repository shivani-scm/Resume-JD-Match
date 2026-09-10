/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SamplePair {
  id: string;
  name: string;
  category: string;
  expectedScore: string;
  description: string;
  resumeText: string;
  jdText: string;
}

export const SAMPLE_DATA_PAIRS: SamplePair[] = [
  {
    id: 'fpa-senior',
    name: 'Senior FP&A Analyst vs. Senior Financial Analyst',
    category: 'Finance & Analytics',
    expectedScore: '~87 / 100 (Strong Match)',
    description: 'Exact match on SQL, Power BI, Financial Modeling; alias match on FP&A; meets 5-year tenure; missing Adaptive Planning.',
    resumeText: `JANE DOE, CFA
San Francisco, CA | (555) 234-5678 | jane.doe@email.com | linkedin.com/in/janedoe-finance

PROFESSIONAL SUMMARY
Results-driven Senior FP&A professional with 6 years of progressive experience delivering corporate financial planning, variance analysis, and long-range forecasting. Expert in building dynamic three-statement financial models, dashboarding in Power BI, and querying relational data with SQL.

CORE SKILLS & TECHNOLOGIES
- Financial Planning and Analysis (FP&A), Variance Analysis, Budgeting & Forecasting
- Financial Modeling, DCF Valuation, Capital Budgeting, Scenario Analysis
- Tools: Microsoft Excel (VBA, Power Query), Power BI, SQL (PostgreSQL), SAP ERP, Hyperion
- Industry: SaaS, Enterprise Technology, Corporate Finance

WORK EXPERIENCE

Senior FP&A Analyst | CloudScale Systems, Inc. | San Francisco, CA
January 2021 – Present
- Spearheaded annual operating budget ($140M OPEX) across 12 business units, driving 98.5% forecast accuracy.
- Engineered automated executive dashboard in Power BI backed by SQL queries, eliminating 14 hours of manual monthly consolidation.
- Partnered with Department Heads to perform monthly budget-vs-actual variance analysis and risk mitigation.
- Constructed multi-scenario revenue forecasting models incorporating churn, ARR expansion, and CAC trends.

Financial Analyst | Apex Global Partners | San Jose, CA
June 2018 – December 2020
- Developed complex 3-statement financial models and discounted cash flow (DCF) analyses for strategic M&A evaluations.
- Prepared monthly management reporting packages presented directly to CFO and Executive Leadership team.
- Streamlined capital expenditure allocation tracking in SAP ERP, identifying $1.2M in annual cost efficiencies.

EDUCATION
Bachelor of Science in Finance & Economics
University of California, Berkeley | Graduated May 2018 | Magna Cum Laude

CERTIFICATIONS & CREDENTIALS
- CFA (Chartered Financial Analyst) Charterholder, CFA Institute
- FMVA (Financial Modeling & Valuation Analyst), Corporate Finance Institute`,
    jdText: `Senior Financial Analyst - Strategic FP&A
TechCorp Global | San Francisco, CA | Full-time | Hybrid

About the Role:
TechCorp is seeking a high-performing Senior Financial Analyst to join our Global FP&A team. You will lead corporate budgeting, strategic long-range planning, and executive business partnering.

Key Responsibilities:
- Direct annual budgeting, quarterly rolling forecasts, and monthly variance reporting across international subsidiaries.
- Build, maintain, and stress-test comprehensive three-statement financial models and strategic investment analyses.
- Synthesize complex datasets into actionable executive dashboards using Power BI and SQL.
- Serve as primary finance business partner to product and engineering leadership to evaluate OPEX efficiency.
- Lead adoption of cloud planning tools and automated reporting systems.

Required Qualifications:
- Bachelor's degree in Finance, Accounting, Economics, or related quantitative field.
- Minimum 5+ years of relevant experience in FP&A, corporate finance, or investment banking.
- Advanced proficiency in financial modeling and corporate budgeting methodologies.
- Demonstrated mastery of Microsoft Excel, Power BI, and relational database querying with SQL.
- Strong executive presentation skills and ability to translate data into strategic recommendations.

Preferred Qualifications:
- Active CFA or CPA designation is strongly preferred.
- Experience with Adaptive Planning (Workday) or Anaplan is a strong plus.
- Prior background in SaaS or recurring-revenue business models.`,
  },
  {
    id: 'swe-fullstack',
    name: 'Senior Full-Stack Engineer vs. Lead Software Engineer',
    category: 'Software Engineering',
    expectedScore: '~91 / 100 (Exceptional Match)',
    description: 'Direct alignment on TypeScript, React, Node.js, AWS, PostgreSQL, Docker, Microservices; exceeds experience tenure.',
    resumeText: `ALEX RIVERA
Seattle, WA | (555) 876-5432 | alex.rivera@devmail.io | github.com/alexrivera-code | linkedin.com/in/alexriveradev

PROFESSIONAL SUMMARY
Senior Software Engineer with 7+ years of experience architecting and building high-scale distributed systems and modern web applications. Deep expertise in TypeScript, React, Node.js, GraphQL, PostgreSQL, and AWS cloud infrastructure. Passionate about developer tooling, API performance, and microservices architecture.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
- Frontend: React, Next.js, Redux Toolkit, Tailwind CSS, Webpack, Vite
- Backend & Cloud: Node.js, Express, REST APIs, GraphQL, AWS (ECS, Lambda, S3, RDS), Docker, Kubernetes
- Databases: PostgreSQL, Redis, MongoDB
- Practices: CI/CD (GitHub Actions), TDD (Jest, Cypress), Agile, Microservices Architecture

WORK EXPERIENCE

Lead Software Engineer | DataStream Cloud | Seattle, WA
March 2021 – Present
- Architected enterprise microservices platform handling 45,000 requests/sec with 99.99% availability using TypeScript, Node.js, and AWS ECS.
- Led team of 6 engineers redesigning customer portal in React and Next.js, cutting p95 load times from 2.8s to 650ms.
- Implemented distributed Redis caching layer, decreasing PostgreSQL database load by 40% during peak hours.
- Established automated CI/CD deployment pipelines using GitHub Actions and Docker, reducing release cycles from weekly to multi-daily.

Senior Software Engineer | FinTech Velocity | Bellevue, WA
August 2018 – February 2021
- Developed mission-critical transaction processing API in Node.js and PostgreSQL processing $80M+ daily volume.
- Created reusable component library adopted by 5 internal engineering squads, accelerating feature delivery velocity by 35%.
- Authored comprehensive test suites achieving 92% code coverage using Jest and Cypress.

Software Engineer | NextGen Apps | Seattle, WA
July 2016 – July 2018
- Built customer-facing dashboard features using React, Redux, and Express.
- Optimized slow SQL queries and database indexes, improving report query execution speeds by 3x.

EDUCATION
Bachelor of Science in Computer Science
University of Washington | Graduated 2016

CERTIFICATIONS
- AWS Certified Solutions Architect - Associate`,
    jdText: `Lead Software Engineer (Full-Stack)
CloudScale Platform Inc. | Remote / Hybrid (Seattle, WA)

Role Overview:
We are looking for a Lead Software Engineer to direct the architecture and development of our next-generation cloud analytics suite. You will partner with product management and lead a team of talented engineers building responsive web applications and reliable microservices.

Core Responsibilities:
- Lead the technical design, development, and deployment of scalable web applications using TypeScript, React, and Node.js.
- Architect resilient microservices and REST/GraphQL APIs deployed on AWS.
- Mentor junior and mid-level engineers, conduct code reviews, and drive engineering excellence.
- Collaborate with product designers to implement intuitive user experiences using modern design systems.
- Monitor production system health, latency, and reliability metrics.

Minimum Requirements:
- Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience.
- 6+ years of professional software engineering experience.
- Expert knowledge of modern JavaScript/TypeScript, React, and Node.js ecosystems.
- Proven track record with relational databases (PostgreSQL preferred) and caching solutions (Redis).
- Hands-on experience with Docker, container orchestration, and AWS cloud services.

Preferred Qualifications:
- Experience with Kubernetes and Infrastructure as Code (Terraform).
- AWS Certified Solutions Architect or equivalent certification.
- Background designing high-throughput distributed systems.`,
  },
  {
    id: 'junior-mismatch',
    name: 'Junior Associate vs. Principal Architect (Mismatch Case)',
    category: 'Negative / Boundary Test',
    expectedScore: '~42 / 100 (Poor Match / Stretch)',
    description: 'Tenure gap (1.5 yrs vs 8+ yrs required), missing mandatory certifications, seniority gap of 4 tiers; triggers multiple penalty deductions.',
    resumeText: `SAMUEL CHEN
Austin, TX | (555) 432-1098 | sam.chen@email.com | linkedin.com/in/samchen-tech

SUMMARY
Motivated Junior Web Developer with 1.5 years of experience building simple websites and personal projects. Eager to expand into enterprise cloud architecture and distributed engineering.

SKILLS
- HTML, CSS, JavaScript, Basic Python
- React, Bootstrap, Git
- SQLite, Firebase

EXPERIENCE
Junior Web Developer | Local Marketing Studio | Austin, TX
November 2022 – Present
- Maintained WordPress and static landing pages for local small businesses.
- Created responsive HTML/CSS email templates with 100% client satisfaction.
- Assisted lead developer with basic bug fixes in JavaScript.

Web Intern | Freelance Collective | Austin, TX
June 2022 – October 2022
- Created mockups in Figma and converted them to basic HTML5/CSS3 layouts.

EDUCATION
Associate of Applied Science in Web Technologies
Austin Community College | Graduated May 2022`,
    jdText: `Principal Cloud Solutions Architect
Enterprise Infrastructure Corp | Austin, TX

About the Position:
Enterprise Infrastructure Corp is looking for a Principal Cloud Solutions Architect to guide the global cloud transformation of our Fortune 500 enterprise clients.

Core Responsibilities:
- Define global cloud enterprise architecture across multi-cloud environments (AWS and Azure).
- Direct multi-million dollar cloud migration initiatives and complex containerization strategies.
- Interface with C-suite executives (CTO, CIO) to align cloud strategy with corporate objectives.
- Establish enterprise security compliance, disaster recovery, and infrastructure governance.

Mandatory Requirements:
- Minimum 8+ years of experience in enterprise cloud architecture and distributed systems.
- Master's degree in Computer Science, Systems Engineering, or equivalent.
- Mandatory: AWS Certified Solutions Architect - Professional or Google Cloud Certified Fellow.
- Deep expertise in Kubernetes, Terraform, microservices governance, and multi-region failover.
- Proven leadership of senior engineering teams and enterprise technology roadmaps.`,
  },
];
