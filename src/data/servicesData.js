
/*
  RAHUL G & ASSOCIATES
  Central service data

  6 categories
  36 sub-services
  36 individual image assignments
*/

const photo = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

const imageLibrary = {
  taxDesk: photo("photo-1554224155-6726b3ff858f"),
  taxReview: photo("photo-1454165804606-c3d57bc86b40"),
  accounting: photo("photo-1554224154-26032ffc0d07"),
  office: photo("photo-1497366754035-f200968a6e72"),
  planner: photo("photo-1506784983877-45594efa4cbe"),
  analytics: photo("photo-1460925895917-afdab827c52f"),
  meeting: photo("photo-1521737711867-e3b97375f902"),
  laptop: photo("photo-1498050108023-c5249f4df085"),
  workspace: photo("photo-1497366811353-6870744d04b2"),
  teamwork: photo("photo-1522071820081-009f0129c71c"),
  strategy: photo("photo-1552664730-d307ca884978"),
  documents: photo("photo-1586281380349-632531db7ed4"),
  computer: photo("photo-1516321318423-f06f85e504b3"),
  business: photo("photo-1486406146926-c627a92ad1ab"),
  calculator: photo("photo-1554224155-8d04cb21cd6c"),
  notebook: photo("photo-1455390582262-044cdead277a"),
  finance: photo("photo-1444653614773-995cb1ef9efa"),
  charts: photo("photo-1543286386-713bdd548da4"),
  presentation: photo("photo-1556761175-b413da4baf72"),
  laptopDesk: photo("photo-1519389950473-47ba0277781c"),
  reports: photo("photo-1434030216411-0b793f4b4173"),
  officeTeam: photo("photo-1524758631624-e2822e304c36"),
  contract: photo("photo-1450101499163-c8848c66ca85"),
  desk: photo("photo-1484480974693-6ca0a78fb36b"),
  growth: photo("photo-1535320903710-d993d3d77d29"),
  graphs: photo("photo-1611974789855-9c2a0a7236a3"),
  notes: photo("photo-1501504905252-473c47e087f8"),
  cityOffice: photo("photo-1497366858526-0766cadbe8fa"),
  discussion: photo("photo-1556761175-5973dc0f32e7"),
  digital: photo("photo-1460925895917-afdab827c52f"),
  planning: photo("photo-1517245386807-bb43f82c33c4"),
  paperwork: photo("photo-1554224154-22dec7ec8818"),
  compliance: photo("photo-1507679799987-c73779587ccf"),
  startup: photo("photo-1556761175-4b46a572b786"),
  teamworkDesk: photo("photo-1522202176988-66273c2fd55f"),
  data: photo("photo-1551288049-bebda4e38f71"),
};

/*
  Each sub-service has:
  - Unique slug
  - Title
  - Description
  - Image
  - Image alt text
  - Overview
  - Inclusions
  - Documents
  - FAQs

  Service-specific details can be expanded
  without changing the React page components.
*/

function makeService(
  slug,
  title,
  description,
  image,
  inclusions = [],
  documents = []
) {
  return {
    slug,
    title,
    description,
    image,
    imageAlt: `${title} - professional financial advisory service`,

    overview: `${description} At RAHUL G & ASSOCIATES, we begin by understanding your requirements, reviewing the available information and identifying the appropriate scope of professional assistance.`,

    inclusions:
      inclusions.length > 0
        ? inclusions
        : [
            "Initial consultation and requirement assessment",
            `Review of requirements related to ${title.toLowerCase()}`,
            "Guidance on applicable procedures",
            "Relevant documentation support",
            "Assistance within the agreed scope",
            "Follow-up guidance and next steps",
          ],

    documents:
      documents.length > 0
        ? documents
        : [
            "Basic applicant or business information",
            "Relevant financial or statutory records",
            "Supporting documents applicable to the service",
            "Additional information identified during review",
          ],

    faqs: [
      {
        question: `What is included in ${title.toLowerCase()}?`,
        answer:
          "The scope depends on your requirements and circumstances. We discuss the work involved and the applicable deliverables before proceeding.",
      },
      {
        question: "How can I get started?",
        answer:
          "Submit the enquiry form on this page. We can then discuss your requirements and the information needed.",
      },
      {
        question: "Which documents are required?",
        answer:
          "Documentation varies according to the service and your circumstances. We will confirm the relevant checklist during the initial assessment.",
      },
      {
        question: "How much time will the service take?",
        answer:
          "Timelines depend on document readiness, complexity, applicable procedures and, where relevant, processing by authorities.",
      },
      {
        question: "Can the service be handled remotely?",
        answer:
          "Many consultation, review and documentation activities can be coordinated remotely, subject to applicable requirements.",
      },
    ],
  };
}

export const servicesData = [
  // =========================================
  // 01. INCOME TAX ADVISORY
  // =========================================

  {
    slug: "income-tax-advisory",
    number: "01",
    category: "Direct taxation",
    title: "Income Tax Advisory",
    subtitle: "Tax compliance, return filing and planning.",
    description:
      "Practical assistance with income tax compliance, return filing, tax planning and related advisory requirements.",
    image: imageLibrary.taxDesk,

    subServices: [
      makeService(
        "individual-income-tax-return-filing",
        "Individual Income Tax Return Filing",
        "Assistance with preparing and filing income tax returns for eligible individual taxpayers.",
        imageLibrary.taxDesk,
        [
          "Review of income sources",
          "Assessment of applicable return requirements",
          "Review of deductions and eligible claims",
          "Income tax return preparation assistance",
          "Return filing and acknowledgement guidance",
          "Post-filing clarification support",
        ],
        [
          "PAN and basic taxpayer details",
          "Form 16, if applicable",
          "Form 26AS and AIS information",
          "Bank and investment income details",
          "Applicable deduction and tax payment records",
        ]
      ),

      makeService(
        "business-income-tax-return-filing",
        "Business Income Tax Return Filing",
        "Income tax return preparation and filing assistance for businesses and professionals.",
        imageLibrary.taxReview,
        [
          "Business income review",
          "Financial statement coordination",
          "Review of applicable tax provisions",
          "Return preparation assistance",
          "Tax computation review",
          "Filing and acknowledgement support",
        ],
        [
          "Business PAN and registration details",
          "Profit and loss statement",
          "Balance sheet",
          "Tax payment and TDS records",
          "Relevant financial and business records",
        ]
      ),

      makeService(
        "income-tax-planning",
        "Income Tax Planning",
        "Tax planning guidance to help individuals and businesses evaluate available options under applicable law.",
        imageLibrary.accounting,
        [
          "Review of current tax position",
          "Income and deduction analysis",
          "Assessment of applicable tax regimes",
          "Advance tax planning",
          "Tax-efficient financial planning guidance",
          "Periodic tax review support",
        ]
      ),

      makeService(
        "tds-return-filing",
        "TDS Return Filing",
        "Assistance with TDS compliance, return preparation and periodic filing requirements.",
        imageLibrary.office,
        [
          "TDS applicability review",
          "Deduction data verification",
          "TDS return preparation",
          "Challan reconciliation assistance",
          "Quarterly filing support",
          "Correction statement guidance",
        ],
        [
          "TAN details",
          "Deductor information",
          "Deductee PAN information",
          "TDS deduction records",
          "Challan and payment details",
        ]
      ),

      makeService(
        "income-tax-notice-assistance",
        "Income Tax Notice Assistance",
        "Professional support in understanding income tax notices and preparing appropriate responses.",
        imageLibrary.planner,
        [
          "Initial notice review",
          "Identification of response requirements",
          "Supporting document assessment",
          "Draft response assistance",
          "Submission guidance",
          "Follow-up communication support",
        ],
        [
          "Copy of the notice",
          "Relevant assessment year details",
          "Previously filed tax returns",
          "Supporting financial records",
          "Relevant correspondence",
        ]
      ),

      makeService(
        "tax-audit-assistance",
        "Tax Audit Assistance",
        "Assistance with tax audit preparation, records and coordination under applicable requirements.",
        imageLibrary.analytics,
        [
          "Applicability assessment",
          "Financial record review",
          "Audit documentation preparation",
          "Ledger and reconciliation support",
          "Coordination with the appointed auditor",
          "Compliance follow-up assistance",
        ]
      ),
    ],
  },

  // =========================================
  // 02. GST SERVICES
  // =========================================

  {
    slug: "gst-services",
    number: "02",
    category: "Indirect taxation",
    title: "GST Services",
    subtitle: "Registration, returns and GST compliance.",
    description:
      "Support for GST registration, return filing, reconciliation and ongoing compliance for businesses.",
    image: imageLibrary.meeting,

    subServices: [
      makeService(
        "gst-registration",
        "GST Registration",
        "Assistance with GST registration applications and relevant documentation.",
        imageLibrary.laptop,
        [
          "GST registration applicability review",
          "Applicant and business detail verification",
          "Document checklist assistance",
          "Registration application preparation",
          "Application submission support",
          "Clarification and status follow-up",
        ],
        [
          "Applicant or business PAN",
          "Identity details of relevant persons",
          "Business constitution documents, if applicable",
          "Principal place of business address proof",
          "Authorised signatory information, if applicable",
        ]
      ),

      makeService(
        "gst-return-filing",
        "GST Return Filing",
        "Support with periodic GST return preparation and filing.",
        imageLibrary.workspace,
        [
          "GST filing requirement assessment",
          "Sales and purchase data review",
          "Output tax and input tax credit review",
          "Return preparation assistance",
          "Filing coordination",
          "Compliance follow-up support",
        ]
      ),

      makeService(
        "gst-reconciliation",
        "GST Reconciliation",
        "Assistance with reconciling GST records, invoices and return information.",
        imageLibrary.teamwork,
        [
          "Purchase register review",
          "Sales register review",
          "Input tax credit reconciliation",
          "Identification of mismatches",
          "Reconciliation reporting",
          "Corrective action guidance",
        ]
      ),

      makeService(
        "gst-annual-return",
        "GST Annual Return",
        "Assistance with GST annual return preparation and related reconciliation requirements.",
        imageLibrary.strategy,
        [
          "Annual filing applicability review",
          "Yearly return data compilation",
          "Financial and GST record reconciliation",
          "Annual return preparation",
          "Submission support",
          "Post-filing guidance",
        ]
      ),

      makeService(
        "gst-notice-assistance",
        "GST Notice Assistance",
        "Guidance on GST notices, documentation and response preparation.",
        imageLibrary.documents,
        [
          "GST notice review",
          "Identification of relevant issues",
          "Supporting record assessment",
          "Response drafting assistance",
          "Submission guidance",
          "Follow-up support",
        ]
      ),

      makeService(
        "gst-refund-assistance",
        "GST Refund Assistance",
        "Support with reviewing GST refund eligibility and preparing applicable applications.",
        imageLibrary.computer,
        [
          "Refund eligibility review",
          "Refund calculation assistance",
          "Supporting document preparation",
          "Application filing support",
          "Clarification response assistance",
          "Application tracking guidance",
        ]
      ),
    ],
  },

  // =========================================
  // 03. ACCOUNTING & BOOKKEEPING
  // =========================================

  {
    slug: "accounting-bookkeeping",
    number: "03",
    category: "Financial records",
    title: "Accounting & Bookkeeping",
    subtitle: "Reliable records and financial visibility.",
    description:
      "Organised accounting support to help businesses maintain reliable records and better financial visibility.",
    image: imageLibrary.accounting,

    subServices: [
      makeService(
        "monthly-bookkeeping",
        "Monthly Bookkeeping",
        "Ongoing support with maintaining and organising monthly financial records.",
        imageLibrary.business,
        [
          "Monthly transaction recording",
          "Ledger maintenance",
          "Expense classification",
          "Bank and account review",
          "Monthly closing assistance",
          "Accounting record organisation",
        ]
      ),

      makeService(
        "financial-statement-preparation",
        "Financial Statement Preparation",
        "Assistance with preparing financial statements from available accounting records.",
        imageLibrary.calculator,
        [
          "Accounting data compilation",
          "Ledger balance review",
          "Profit and loss statement preparation",
          "Balance sheet preparation",
          "Supporting schedules",
          "Financial statement review assistance",
        ]
      ),

      makeService(
        "bank-reconciliation",
        "Bank Reconciliation",
        "Support with reconciling bank statements and accounting records.",
        imageLibrary.notebook,
        [
          "Bank statement review",
          "Transaction matching",
          "Identification of unmatched entries",
          "Reconciliation statement preparation",
          "Correction recommendations",
          "Periodic reconciliation assistance",
        ]
      ),

      makeService(
        "accounts-payable-receivable",
        "Accounts Payable & Receivable",
        "Assistance with tracking business payments, invoices and outstanding balances.",
        imageLibrary.finance,
        [
          "Vendor ledger review",
          "Customer ledger review",
          "Invoice tracking",
          "Outstanding balance reports",
          "Payment reconciliation",
          "Receivables and payables monitoring",
        ]
      ),

      makeService(
        "mis-reporting",
        "MIS Reporting",
        "Management information reporting to help businesses monitor financial performance.",
        imageLibrary.charts,
        [
          "Financial data consolidation",
          "Revenue and expense reporting",
          "Periodic performance summaries",
          "Key financial indicator reporting",
          "Management dashboard assistance",
          "Reporting format improvement",
        ]
      ),

      makeService(
        "accounting-system-setup",
        "Accounting System Setup",
        "Guidance on establishing accounting workflows, records and reporting processes.",
        imageLibrary.presentation,
        [
          "Current process assessment",
          "Chart of accounts planning",
          "Accounting workflow setup",
          "Opening balance assistance",
          "Reporting configuration",
          "Basic process documentation",
        ]
      ),
    ],
  },

  // =========================================
  // 04. BUSINESS REGISTRATION
  // =========================================

  {
    slug: "business-registration",
    number: "04",
    category: "Business setup",
    title: "Business Registration",
    subtitle: "Structured assistance for new ventures.",
    description:
      "Guidance on selecting an appropriate business structure and completing applicable registration formalities.",
    image: imageLibrary.office,

    subServices: [
      makeService(
        "private-limited-company-incorporation",
        "Private Limited Company Incorporation",
        "Assistance with incorporating a private limited company under applicable requirements.",
        imageLibrary.laptopDesk,
        [
          "Company structure discussion",
          "Proposed name and activity review",
          "Director and shareholder information review",
          "Incorporation documentation support",
          "Application coordination",
          "Post-incorporation guidance",
        ]
      ),

      makeService(
        "llp-registration",
        "LLP Registration",
        "Support with Limited Liability Partnership registration and related formalities.",
        imageLibrary.reports,
        [
          "LLP structure guidance",
          "Partner information review",
          "Name application assistance",
          "Registration document preparation",
          "Filing coordination",
          "Initial compliance guidance",
        ]
      ),

      makeService(
        "partnership-firm-registration",
        "Partnership Firm Registration",
        "Assistance with partnership firm setup, documentation and applicable registration procedures.",
        imageLibrary.officeTeam,
        [
          "Partnership structure discussion",
          "Partner information review",
          "Partnership deed coordination",
          "Applicable registration guidance",
          "Documentation support",
          "Initial compliance overview",
        ]
      ),

      makeService(
        "proprietorship-setup",
        "Proprietorship Setup",
        "Guidance on starting a sole proprietorship and identifying relevant registrations.",
        imageLibrary.contract,
        [
          "Business activity review",
          "Registration applicability assessment",
          "Business document guidance",
          "Relevant registration assistance",
          "Basic compliance orientation",
          "Setup follow-up support",
        ]
      ),

      makeService(
        "msme-udyam-registration",
        "MSME Udyam Registration",
        "Assistance with Udyam registration for eligible micro, small and medium enterprises.",
        imageLibrary.desk,
        [
          "MSME classification guidance",
          "Applicant information review",
          "Registration data preparation",
          "Udyam application assistance",
          "Registration confirmation guidance",
          "Record update support",
        ]
      ),

      makeService(
        "startup-india-recognition",
        "Startup India Recognition",
        "Support with understanding eligibility and preparing Startup India recognition applications.",
        imageLibrary.growth,
        [
          "Eligibility review",
          "Business profile assessment",
          "Supporting document guidance",
          "Application preparation assistance",
          "Submission coordination",
          "Follow-up support",
        ]
      ),
    ],
  },

  // =========================================
  // 05. COMPLIANCE SERVICES
  // =========================================

  {
    slug: "compliance-services",
    number: "05",
    category: "Regulatory support",
    title: "Compliance Services",
    subtitle: "Organised filings and regulatory support.",
    description:
      "Structured assistance with recurring filings, documentation and applicable business compliance requirements.",
    image: imageLibrary.planner,

    subServices: [
      makeService(
        "roc-annual-filing",
        "ROC Annual Filing",
        "Assistance with applicable annual filings for companies.",
        imageLibrary.graphs,
        [
          "Annual filing applicability review",
          "Corporate information collection",
          "Financial record coordination",
          "Annual form preparation support",
          "Filing assistance",
          "Compliance record maintenance",
        ]
      ),

      makeService(
        "company-secretarial-compliance",
        "Company Secretarial Compliance",
        "Support with applicable company secretarial documentation and compliance processes.",
        imageLibrary.notes,
        [
          "Compliance requirement review",
          "Corporate records assistance",
          "Meeting documentation coordination",
          "Statutory register support",
          "Filing coordination",
          "Periodic compliance guidance",
        ]
      ),

      makeService(
        "llp-annual-compliance",
        "LLP Annual Compliance",
        "Assistance with annual compliance and filing requirements applicable to LLPs.",
        imageLibrary.cityOffice,
        [
          "LLP annual requirement assessment",
          "Partner and business detail review",
          "Financial record coordination",
          "Annual form preparation assistance",
          "Filing support",
          "Compliance follow-up",
        ]
      ),

      makeService(
        "director-kyc-assistance",
        "Director KYC Assistance",
        "Guidance on applicable director KYC formalities and documentation.",
        imageLibrary.discussion,
        [
          "Director KYC applicability review",
          "Identification detail verification",
          "Document checklist support",
          "Form preparation assistance",
          "Submission coordination",
          "Status follow-up guidance",
        ]
      ),

      makeService(
        "compliance-calendar-management",
        "Compliance Calendar Management",
        "Support with organising and tracking recurring business compliance deadlines.",
        imageLibrary.digital,
        [
          "Compliance requirement mapping",
          "Deadline calendar preparation",
          "Recurring filing tracking",
          "Document readiness reminders",
          "Status reporting",
          "Periodic compliance reviews",
        ]
      ),

      makeService(
        "statutory-documentation-support",
        "Statutory Documentation Support",
        "Assistance with organising and preparing relevant statutory records and documentation.",
        imageLibrary.planning,
        [
          "Document requirement assessment",
          "Existing record review",
          "Documentation preparation support",
          "Record organisation",
          "Compliance documentation coordination",
          "Follow-up assistance",
        ]
      ),
    ],
  },

  // =========================================
  // 06. FINANCIAL ADVISORY
  // =========================================

  {
    slug: "financial-advisory",
    number: "06",
    category: "Business advisory",
    title: "Financial Advisory",
    subtitle: "Better insight for business decisions.",
    description:
      "Financial insight and practical advisory support to help businesses assess decisions with greater clarity.",
    image: imageLibrary.analytics,

    subServices: [
      makeService(
        "cash-flow-planning",
        "Cash Flow Planning",
        "Assistance with understanding, monitoring and planning business cash flows.",
        imageLibrary.paperwork,
        [
          "Cash inflow and outflow review",
          "Working cash position assessment",
          "Cash flow projection assistance",
          "Payment cycle analysis",
          "Liquidity planning guidance",
          "Periodic cash flow monitoring",
        ]
      ),

      makeService(
        "financial-budgeting-forecasting",
        "Financial Budgeting & Forecasting",
        "Support with financial budgets, projections and business planning assumptions.",
        imageLibrary.compliance,
        [
          "Historical performance review",
          "Revenue assumption assessment",
          "Expense budgeting",
          "Forecast preparation",
          "Budget variance review",
          "Scenario planning assistance",
        ]
      ),

      makeService(
        "business-financial-review",
        "Business Financial Review",
        "Financial review support to help business owners better understand their current position.",
        imageLibrary.startup,
        [
          "Financial statement review",
          "Revenue and expense assessment",
          "Key ratio analysis",
          "Trend identification",
          "Financial observation summary",
          "Improvement discussion",
        ]
      ),

      makeService(
        "working-capital-advisory",
        "Working Capital Advisory",
        "Guidance on reviewing working capital requirements and operational cash cycles.",
        imageLibrary.teamworkDesk,
        [
          "Current asset and liability review",
          "Inventory and receivables assessment",
          "Payables cycle analysis",
          "Working capital estimation",
          "Liquidity improvement guidance",
          "Monitoring recommendations",
        ]
      ),

      makeService(
        "profitability-analysis",
        "Profitability Analysis",
        "Support with analysing revenue, costs and business profitability.",
        imageLibrary.data,
        [
          "Revenue stream review",
          "Cost classification",
          "Gross and net margin analysis",
          "Product or service profitability assessment",
          "Cost optimisation observations",
          "Profitability reporting",
        ]
      ),

      makeService(
        "financial-reporting-advisory",
        "Financial Reporting Advisory",
        "Guidance on improving financial reporting and management information.",
        imageLibrary.finance,
        [
          "Existing report review",
          "Reporting requirement assessment",
          "Financial statement presentation guidance",
          "Management report structure",
          "Financial indicator reporting",
          "Reporting improvement recommendations",
        ]
      ),
    ],
  },
];

// ==========================================
// LOOKUP FUNCTIONS
// ==========================================

export const getServiceCategory = (slug) =>
  servicesData.find((category) => category.slug === slug);

export const getSubService = (categorySlug, serviceSlug) =>
  getServiceCategory(categorySlug)?.subServices.find(
    (service) => service.slug === serviceSlug
  );
