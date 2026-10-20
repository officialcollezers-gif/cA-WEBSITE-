
export const blogsData = [
  {
    id: 1,
    slug: "income-tax-return-filing-guide",
    title: "Income Tax Return Filing: A Practical Guide",
    category: "Income Tax",
    excerpt:
      "Understand the essentials of income tax return filing, documents to prepare and common mistakes to avoid.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=85",
    author: "FinCore Editorial Team",
    date: "2026-10-10",
    readTime: "6 min read",
    featured: true,
    sections: [
      {
        heading: "Understanding Income Tax Return Filing",
        paragraphs: [
          "Income tax return filing is an important part of maintaining financial compliance. The applicable requirements depend on your income, taxpayer category and relevant tax provisions.",
          "Preparing accurate records in advance can make the filing process more organised.",
        ],
      },
      {
        heading: "Documents to Prepare",
        paragraphs: [
          "Common documents include PAN details, Form 16 where applicable, income statements, bank information and supporting deduction records.",
          "Additional documentation may be required depending on the sources of income and the return form.",
        ],
      },
      {
        heading: "Common Mistakes to Avoid",
        paragraphs: [
          "Review income disclosures, bank details, applicable deductions and tax credits before submitting the return.",
          "Taxpayers should also check the relevant filing deadline and complete verification as required.",
        ],
      },
    ],
  },
  {
    id: 2,
    slug: "gst-registration-for-small-businesses",
    title: "GST Registration for Small Businesses",
    category: "GST",
    excerpt:
      "Learn when GST registration may be required and what businesses should prepare before applying.",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85",
    author: "FinCore Editorial Team",
    date: "2026-10-08",
    readTime: "5 min read",
    sections: [
      {
        heading: "What Is GST Registration?",
        paragraphs: [
          "GST registration identifies a business under the Goods and Services Tax framework. Registration requirements depend on factors such as turnover, activities and applicable statutory provisions.",
        ],
      },
      {
        heading: "Preparing for Registration",
        paragraphs: [
          "Businesses should organise their identity, address, constitution and banking information, along with other documents relevant to their business structure.",
        ],
      },
    ],
  },
  {
    id: 3,
    slug: "bookkeeping-tips-for-business-owners",
    title: "Essential Bookkeeping Tips for Business Owners",
    category: "Accounting",
    excerpt:
      "Practical ways to organise financial records, reconcile transactions and improve visibility into business finances.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
    author: "FinCore Editorial Team",
    date: "2026-10-05",
    readTime: "7 min read",
    sections: [
      {
        heading: "Why Bookkeeping Matters",
        paragraphs: [
          "Reliable bookkeeping helps businesses monitor income, expenses, outstanding balances and cash flow.",
        ],
      },
      {
        heading: "Maintain a Regular Routine",
        paragraphs: [
          "Record transactions consistently, retain supporting invoices and reconcile bank statements periodically.",
        ],
      },
    ],
  },
  {
    id: 4,
    slug: "private-limited-company-registration",
    title: "Private Limited Company Registration: Key Considerations",
    category: "Business Setup",
    excerpt:
      "Explore important considerations before incorporating a private limited company in India.",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
    author: "FinCore Editorial Team",
    date: "2026-10-02",
    readTime: "6 min read",
    sections: [
      {
        heading: "Choosing a Business Structure",
        paragraphs: [
          "The right business structure depends on ownership, compliance obligations, funding requirements and long-term plans.",
        ],
      },
      {
        heading: "Preparing for Incorporation",
        paragraphs: [
          "Promoters should review proposed company names, director details, registered office documentation and incorporation requirements.",
        ],
      },
    ],
  },
  {
    id: 5,
    slug: "business-compliance-checklist",
    title: "A Practical Business Compliance Checklist",
    category: "Compliance",
    excerpt:
      "Build a structured approach to statutory filings, recordkeeping and recurring compliance responsibilities.",
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=85",
    author: "FinCore Editorial Team",
    date: "2026-09-28",
    readTime: "5 min read",
    sections: [
      {
        heading: "Why Compliance Planning Matters",
        paragraphs: [
          "A compliance calendar helps businesses identify recurring filing and documentation responsibilities.",
        ],
      },
      {
        heading: "Create a Review Process",
        paragraphs: [
          "Assign responsibilities, maintain relevant records and review deadlines against applicable legal requirements.",
        ],
      },
    ],
  },
  {
    id: 6,
    slug: "cash-flow-management-strategies",
    title: "Cash Flow Management Strategies for Growing Businesses",
    category: "Financial Advisory",
    excerpt:
      "Learn how cash flow planning and regular financial reviews can support informed business decisions.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
    author: "FinCore Editorial Team",
    date: "2026-09-25",
    readTime: "8 min read",
    sections: [
      {
        heading: "Understanding Cash Flow",
        paragraphs: [
          "Cash flow reflects the movement of money into and out of a business. Monitoring these movements supports short-term financial planning.",
        ],
      },
      {
        heading: "Improving Visibility",
        paragraphs: [
          "Regular forecasting, receivables monitoring and expense reviews can help businesses identify potential cash shortfalls.",
        ],
      },
    ],
  },
];

export const getBlogBySlug = (slug) =>
  blogsData.find((blog) => blog.slug === slug);

export const blogCategories = [
  "All Articles",
  ...new Set(blogsData.map((blog) => blog.category)),
];
