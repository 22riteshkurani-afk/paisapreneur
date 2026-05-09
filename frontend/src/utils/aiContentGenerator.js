/**
 * AI Content Generator - Creates highly specific, execution-focused business guidance
 * Generates personalized strategies based on user profile analysis
 */

const industryInsights = {
  "SaaS/Software": {
    avgMarketSize: "₹500Cr+",
    timeline: "6-12 months to MVP",
    competition: "High",
    skillFit: "High for technical founders",
  },
  "E-commerce": {
    avgMarketSize: "₹1000Cr+",
    timeline: "3-6 months to launch",
    competition: "Very High",
    skillFit: "Medium",
  },
  "Marketing/Consulting": {
    avgMarketSize: "₹100Cr+",
    timeline: "1-3 months to launch",
    competition: "Medium",
    skillFit: "High for experienced professionals",
  },
  "AI/ML": {
    avgMarketSize: "₹200Cr+",
    timeline: "9-18 months to product",
    competition: "Medium-High",
    skillFit: "Very High for technical founders",
  },
  "Fintech": {
    avgMarketSize: "₹500Cr+",
    timeline: "12-24 months",
    competition: "High",
    skillFit: "Medium",
  },
};

const normalizeText = (text) =>
  typeof text === "string" ? text.toLowerCase().trim() : "";

const parseKeywords = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => normalizeText(item));
  return value
    .split(/[;,|]/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
};

const anyMatch = (value, terms) =>
  terms.some((term) => normalizeText(value).includes(term.toLowerCase()));

const formatBudgetLabel = (budget) => {
  if (budget >= 1000000) return "₹10L+";
  if (budget >= 500000) return `₹${Math.round(budget / 100000) / 10}L`;
  if (budget >= 100000) return `₹${Math.round(budget / 1000)}K`;
  return `₹${Math.round(budget / 1000)}K`;
};

export const generateExecutionFocusedContent = (userProfile) => {
  const {
    experience,
    industry,
    goals,
    timeline,
    budget,
    skills,
    painPoints,
    workStyle,
  } = userProfile;

  // Generate highly specific business opportunities
  const businessOpportunities = generateSpecificOpportunities(
    experience,
    industry,
    budget,
    timeline,
    skills,
    painPoints,
    goals,
    workStyle
  );

  // Generate personalized reasoning for each opportunity
  const opportunitiesWithReasoning = businessOpportunities.map((opp) =>
    addPersonalizedReasoning(opp, userProfile)
  );

  // Generate execution roadmaps
  const executionRoadmaps = opportunitiesWithReasoning.map((opp) =>
    generateExecutionRoadmap(opp, timeline)
  );

  // Generate monetization systems
  const monetizationSystems = executionRoadmaps.map((roadmap, idx) =>
    generateMonetizationSystem(roadmap, budget, opportunitiesWithReasoning[idx])
  );

  // Generate market analysis
  const marketAnalysis = monetizationSystems.map((system, idx) =>
    generateMarketAnalysis(system, industry, opportunitiesWithReasoning[idx])
  );

  // Generate coaching insights
  const coachingInsights = generateCoachingInsights(userProfile, marketAnalysis);

  // Generate progress tracking system
  const progressSystem = generateProgressSystem(executionRoadmaps);

  return {
    businessOpportunities: opportunitiesWithReasoning,
    executionRoadmaps,
    monetizationSystems,
    marketAnalysis,
    coachingInsights,
    progressSystem,
    founderScore: calculateFounderScore(userProfile),
    readinessScore: calculateReadinessScore(userProfile),
  };
};

/**
 * Generate highly specific business opportunities (not generic)
 */
function generateSpecificOpportunities(
  experience,
  industry,
  budget,
  timeline,
  skills,
  painPoints,
  goals,
  workStyle
) {
  const opportunities = [];
  const industryKey = normalizeText(industry);
  const skillTags = parseKeywords(skills).join(" ");
  const painTags = parseKeywords(painPoints).join(" ");
  const goalTags = parseKeywords(goals).join(" ");
  const founderStrengths = parseKeywords(workStyle).join(" ");

  const isTech = industryKey.includes("tech") || industryKey.includes("software") || industryKey.includes("ai");
  const isMarketing = industryKey.includes("marketing") || industryKey.includes("sales") || industryKey.includes("growth");
  const isFinance = industryKey.includes("finance") || industryKey.includes("banking") || industryKey.includes("fintech");
  const isCommerce = industryKey.includes("e-commerce") || industryKey.includes("ecommerce") || industryKey.includes("retail");
  const isService = industryKey.includes("consulting") || industryKey.includes("agency") || founderStrengths.includes("consult") || founderStrengths.includes("client");
  const isAICapable = anyMatch(skillTags, ["ai", "automation", "ml", "data", "nlp"]);

  const commonFields = (id, title, description, specificity, starterBudget, monthlyRunway, timelineLabel, viability, difficulty, skillAlignment, revenueType, timing, targetSegment, coreOffer, painPointFocus, marketTrend, firstRevenueMilestone) => ({
    id,
    title,
    description,
    specificity,
    starterCost: formatBudgetLabel(starterBudget),
    starterBudget,
    monthlyRunway: formatBudgetLabel(monthlyRunway),
    timeline: timelineLabel,
    viability,
    difficulty,
    skillAlignment,
    revenueType,
    timing,
    targetSegment,
    coreOffer,
    painPointFocus,
    marketTrend,
    firstRevenueMilestone,
  });

  if (experience === "5+ years" && budget >= 500000) {
    if (isTech) {
      opportunities.push(
        commonFields(
          "ai-recruitment-automation",
          "AI-powered recruitment automation agency for Indian startups",
          "Help early-stage and growth-stage Indian startups shorten hiring cycles by automating candidate sourcing, screening, and interview coordination with AI workflows.",
          "Target startup recruitment teams that hire 5-25 engineers per quarter, not general HR automation.",
          200000,
          50000,
          "1-3 months to pilot",
          90,
          "Medium",
          92,
          "Retainer + outcome fee",
          "Rapid service launch",
          "Seed-stage founders and HR leads at tech startups",
          "AI candidate screening plus interview-scheduling automation",
          "Slow hiring and poor shortlist quality",
          "Strong demand for faster, recruiter-assisted hires",
          "Secure a paid pilot with one startup in 30 days"
        )
      );

      opportunities.push(
        commonFields(
          "vertical-saas-ops",
          "AI-enabled vertical operations SaaS for a narrow niche",
          `Build a compact, AI-enabled tool that automates one high-value workflow for ${industry} leaders, such as developer onboarding or sales pipeline intelligence.`,
          "Not a broad SaaS platform but a targeted workflow solution for a known customer segment.",
          350000,
          80000,
          "4-6 months to MVP",
          87,
          "Medium-High",
          90,
          "SaaS subscription",
          "Focused product launch",
          "Operations leaders in a defined vertical",
          "Narrow workflow automation tied to measurable KPIs",
          "Time lost in manual processes and fragmented data",
          "Growing demand for vertical SaaS that integrates AI with existing tools",
          "Launch an MVP to 5 pilot users and collect payment in Month 3"
        )
      );
    }

    if (isFinance) {
      opportunities.push(
        commonFields(
          "fintech-automation",
          "B2B fintech workflow automation for mid-market lenders",
          "Deliver AI-driven automation for loan processing, reconciliation, and compliance reporting to reduce manual work for NBFCs and lending teams.",
          "Solve one regulatory or back-office workflow rather than build a full banking platform.",
          220000,
          60000,
          "2-4 months to first client",
          88,
          "Medium",
          87,
          "Project-based + retainer",
          "Client-first service",
          "Operations and finance teams at growing lending firms",
          "Prebuilt automation for reconciliations and KYC process",
          "High operational cost and regulatory complexity",
          "Strong pressure on lenders to automate finance operations",
          "Sign first paying client within 8 weeks"
        )
      );
    }
  }

  if (experience === "2-5 years" && budget >= 200000) {
    if (isMarketing) {
      opportunities.push(
        commonFields(
          "ai-growth-agency",
          "AI-led growth agency for niche D2C brands",
          "Offer campaign optimization, AI creative testing, and sales funnel automation for D2C brands in one vertical.",
          "Focus on one customer segment, such as wellness or fashion, instead of general marketing.",
          180000,
          35000,
          "1-3 months to first retainer",
          84,
          "Low-Medium",
          90,
          "Monthly retainers",
          "Revenue-first agency",
          "SMB D2C founders who need predictable revenue growth",
          "AI-powered ad copy, landing page testing, and email automation",
          "Low conversion from generic growth vendors",
          "High demand for data-driven growth services in niche e-commerce categories",
          "Win three retainers by Week 6"
        )
      );
    }

    if (isTech) {
      opportunities.push(
        commonFields(
          "ai-workflow-tool",
          "Niche AI workflow tool for a specific operational pain point",
          "Launch a compact product that automates one recurring workflow, such as client onboarding, content review, or internal reporting.",
          "Ship a narrow AI tool that solves a defined workflow rather than a broad platform.",
          200000,
          20000,
          "3-4 months to MVP",
          82,
          "Medium",
          88,
          "SaaS subscription + API access",
          "Lean product launch",
          "Small teams or founders who need faster internal processes",
          "Micro-automation for manual workflow steps",
          "Lack of focused AI tools for operations in small teams",
          "Early adopters want quick wins with minimal learning curve",
          "Acquire 5 paid users within the first two months"
        )
      );
    }
  }

  if (experience === "0-2 years" && budget < 200000) {
    if (isTech || isMarketing || isService) {
      opportunities.push(
        commonFields(
          "ai-freelance-niche",
          "AI-powered freelance service for a specific B2B problem",
          "Deliver targeted AI services such as Shopify conversion copy, LinkedIn outreach automation, or email funnel creation for a defined niche.",
          "Avoid generic services; pick one vertical and one high-value deliverable.",
          25000,
          10000,
          "1-2 weeks to first client",
          80,
          "Low",
          87,
          "Project-based",
          "Fast-service launch",
          "Small business owners in a clearly defined niche",
          "Repeatable AI-enabled deliverable with quick payback",
          "No reliable content or sales follow-up",
          "Many small businesses need tailored AI services they can buy immediately",
          "Close first paying client in the first 14 days"
        )
      );

      opportunities.push(
        commonFields(
          "ai-coaching-community",
          "AI coaching program for founders in a focused industry",
          "Build a coaching or community program teaching a narrow set of AI tools for a specific founder type.",
          "Run a cohort with a clear outcome, such as launching an AI-powered campaign or automating one process.",
          15000,
          8000,
          "2-3 weeks to launch",
          76,
          "Low",
          82,
          "Membership/coaching fees",
          "Community-first launch",
          "Early founders who want guided AI adoption",
          "Cohort-based training backed by real execution templates",
          "Confusion about where to start with AI",
          "Growing appetite for practical, cohort-led founder training",
          "Sell 10 seats in the first 30 days"
        )
      );
    }
  }

  if (!opportunities.length) {
    opportunities.push(
      commonFields(
        "ai-strategy-consulting",
        "AI-powered strategy consulting for focused early-stage growth",
        "Help founders map product-market fit, launch pricing, and go-to-market plans using AI research and execution templates.",
        "Use your profile to advise a narrow customer type instead of generic consulting.",
        50000,
        15000,
        "1-2 months to first engagement",
        78,
        "Low-Medium",
        84,
        "Consulting retainers",
        "Strategy-first service",
        "Founders who need a launch plan and immediate revenue steps",
        "Execution-ready launch plans and validation tools",
        "Founders move too slowly from idea to paying customer",
        "Founders pay for execution clarity more than inspiration",
        "Book first paid strategy session in 4 weeks"
      )
    );
  }

  return opportunities;
}

function getDefaultOpportunities() {
  return [
    {
      id: "default-1",
      title: "AI Implementation Consulting",
      description: "Help small businesses implement AI tools and workflows",
      starterCost: "₹1-2L",
      monthlyRunway: "₹10-20K",
      timeline: "1-2 months to first client",
      viability: 80,
      difficulty: "Medium",
      skillAlignment: 85,
      revenueType: "Service-based",
      timing: "Quick wins possible",
    },
  ];
}

/**
 * Add personalized reasoning explaining WHY this opportunity fits the user
 */
function addPersonalizedReasoning(opportunity, userProfile) {
  const {
    experience,
    budget,
    timeline: userTimeline,
    skills,
    painPoints,
    goals,
    workStyle,
  } = userProfile;

  const reasoning = [];
  const skillTags = parseKeywords(skills).join(" ");
  const painTags = parseKeywords(painPoints).join(" ");
  const goalTags = parseKeywords(goals).join(" ");
  const founderStrengths = parseKeywords(workStyle).join(" ");

  if (opportunity.skillAlignment >= 85) {
    reasoning.push(`✓ Your current profile is a strong match for this model.`);
  }

  if (skillTags) {
    reasoning.push(
      `✓ Your existing skills in ${skills} help you own the execution and build credibility quickly.`
    );
  }

  if (painTags) {
    reasoning.push(
      `✓ This targets the pain you described — ${painPoints} — with a real business model that customers will pay for.`
    );
  }

  if (goalTags) {
    reasoning.push(`✓ It aligns with your goals of ${goals} and keeps the path focused.`);
  }

  if (budget >= opportunity.starterBudget) {
    reasoning.push(
      `✓ Starter cost of ${opportunity.starterCost} fits your budget of ${formatBudgetLabel(
        budget
      )}.`
    );
  } else {
    reasoning.push(
      `⚠️ This is an ambitious option for your current budget, but it can still be launched with a lean pilot and early customer pre-sales.`
    );
  }

  if (
    (userTimeline === "1-3 months" && opportunity.timeline.includes("1-3")) ||
    (userTimeline === "3-6 months" && opportunity.timeline.includes("3-6")) ||
    (userTimeline === "6-12 months" && opportunity.timeline.includes("4-6")) ||
    (userTimeline === "6-12 months" && opportunity.timeline.includes("6-"))
  ) {
    reasoning.push(`✓ Timeline matches your ${userTimeline} execution window.`);
  }

  if (opportunity.viability >= 85) {
    reasoning.push(`✓ The business idea is built on a real customer demand signal, not vague inspiration.`);
  }

  if (opportunity.difficulty === "Low" && budget < 300000) {
    reasoning.push(`✓ Low complexity reduces risk and is ideal for a bootstrapped founder.`);
  }

  if (founderStrengths) {
    reasoning.push(`✓ Your preferred work style (${workStyle}) supports beginning with a focused, high-leverage business model.`);
  }

  return {
    ...opportunity,
    personalizedReasoning: reasoning,
    whyThisFits: generateWhyThisFitsStatement(opportunity, userProfile),
  };
}

function generateWhyThisFitsStatement(opportunity, userProfile) {
  const { experience, budget, timeline, skills } = userProfile;
  const budgetLabel = formatBudgetLabel(budget);

  if (opportunity.difficulty === "Low" && opportunity.viability >= 80) {
    return `This is a practical, revenue-first path. With your ${experience} experience and ${budgetLabel} budget, you can validate this idea quickly and lock in first customers within ${opportunity.timeline}.`;
  }

  if (opportunity.difficulty === "Medium" && budget >= 500000) {
    return `This is a strong execution play for your profile. Your budget and experience allow you to move past idea stage into a pilot-ready launch.`;
  }

  if (opportunity.difficulty === "Low") {
    return `This is the fastest route to a customer-paying business. Keep the scope narrow and focus on the first revenue milestone.`;
  }

  return `This opportunity is a balanced strategy: realistic enough to launch, and specific enough to build traction without wasting time.`;
}

/**
 * Generate detailed execution roadmap with specific daily/weekly/monthly tasks
 */
function generateExecutionRoadmap(opportunity, userTimeline) {
  const isService = /\b(service|project|retainer|consulting|membership)\b/i.test(
    opportunity.revenueType
  );
  const offer = opportunity.coreOffer || opportunity.description;
  const targetSegment = opportunity.targetSegment || "target customers";

  const roadmap = {
    opportunityId: opportunity.id,
    title: opportunity.title,
    summary: [
      {
        horizon: "Day 1",
        tasks: [
          `Write a one-sentence offer for ${targetSegment}`,
          "Define the customer outcome and pricing anchor clearly",
          "List the first 10 people or companies to contact",
          "Choose the smallest possible launch asset (page, proposal, pitch deck)",
        ],
      },
      {
        horizon: "Week 1",
        tasks: [
          `Build or document the core ${isService ? "service" : "product"} flow`,
          "Set up a payment or commitment process",
          "Reach out to 25 qualified leads with a clear value proposition",
          "Book 5 validation calls and summarize what matters most to them",
        ],
      },
      {
        horizon: "Month 1",
        tasks: [
          "Secure your first paying customer or pilot agreement",
          "Build the first version of the delivery process",
          "Publish one case study or customer success story",
          "Define the next 3 improvements based on real customer feedback",
        ],
      },
    ],
    firstRevenueMilestones: [
      {
        milestone: opportunity.firstRevenueMilestone || "Get first paying customer",
        target: "30 days",
      },
      {
        milestone: "Validate ability to deliver consistently",
        target: "60 days",
      },
      {
        milestone: "Have a repeatable sales and delivery process",
        target: "90 days",
      },
    ],
    phases: [],
  };

  roadmap.phases.push({
    phase: "Phase 0: Focused Validation",
    duration: "Days 1-7",
    goal: `Confirm demand for ${offer} with ${targetSegment}`,
    tasks: [
      {
        day: 1,
        tasks: [
          `Clarify the customer, outcome, and price for ${offer}`,
          "List the first 10 prospects and the value they want",
          "Prepare concise validation questions",
        ],
        deadline: "EOD",
      },
      {
        day: 2,
        tasks: [
          "Run 5 discovery conversations",
          "Capture common objections and must-have features",
          "Find the strongest pricing option from at least 2 prospects",
        ],
        deadline: "EOD",
      },
      {
        day: 3,
        tasks: [
          "Map the simplest deliverable for a paid pilot",
          "Choose the channel you will use for outreach",
          "Prepare a landing page, proposal, or brief offer note",
        ],
        deadline: "EOD",
      },
      {
        day: 4,
        tasks: [
          "Share the offer with at least 10 qualified leads",
          "Collect commitment signals and feedback",
          "Refine the service/product positioning",
        ],
        deadline: "EOD",
      },
      {
        day: 5,
        tasks: [
          "Turn positive interest into 2-3 firm pilot commitments",
          "Record pricing and delivery commitments",
          "Review competitor offers and adjust your positioning",
        ],
        deadline: "EOD",
      },
      {
        day: 6,
        tasks: [
          "Draft the minimum delivery process or MVP scope",
          "Set up tracking for leads, commitments, and revenue",
          "Prepare the first customer onboarding steps",
        ],
        deadline: "EOD",
      },
      {
        day: 7,
        tasks: [
          "Decide to move to launch or refine the offer",
          "If yes, confirm first revenue milestone and delivery plan",
          "If no, adjust the niche and repeat the validation loop",
        ],
        deadline: "EOD",
      },
    ],
  });

  roadmap.phases.push({
    phase: "Phase 1: Launch & First Revenue",
    duration: "Week 2-4",
    goal: "Secure first paying customer and validate delivery",
    tasks: [
      {
        week: "Week 2",
        tasks: [
          `Deliver the first version of ${offer}`,
          "Collect direct customer feedback after first delivery",
          "Document what can be repeated and what can be automated",
          "Start building a repeatable outreach process",
        ],
        deadline: "End of Week 2",
      },
      {
        week: "Week 3",
        tasks: [
          "Convert at least one validation lead into a paid contract",
          "Publish a short case study or testimonial",
          "Automate one task in your delivery or acquisition flow",
        ],
        deadline: "End of Week 3",
      },
      {
        week: "Week 4",
        tasks: [
          "Reach 3-5 paying customers or signed pilots",
          "Capture the real cost and time required per customer",
          "Plan the first upsell or expansion offer",
        ],
        deadline: "End of Week 4",
      },
    ],
  });

  roadmap.phases.push({
    phase: "Phase 2: Traction & Repeatability",
    duration: "Month 2",
    goal: "Turn the launch into a repeatable business system",
    tasks: [
      {
        week: "Month 2",
        tasks: [
          "Refine pricing based on actual customer feedback",
          "Build repeatable marketing and sales actions",
          "Start tracking unit economics for each customer",
          "Document handoff and delivery steps for future hires or contractors",
        ],
        deadline: "End of Month 2",
      },
    ],
  });

  roadmap.phases.push({
    phase: "Phase 3: Growth & Scaling",
    duration: "Month 3+",
    goal: "Expand from initial customers to a scalable funnel",
    tasks: [
      {
        month: "Month 3",
        tasks: [
          "Identify the highest-performing acquisition channel",
          "Introduce an upsell or premium offer",
          "Set revenue goals for 10 and 25 customers",
          "Plan partnerships, referrals, or paid campaigns for growth",
        ],
        deadline: "End of Month 3",
      },
    ],
  });

  return roadmap;
}

/**
 * Generate custom monetization system with specific pricing and channels
 */
function generateMonetizationSystem(executionRoadmap, userBudget, opportunity) {
  const system = {
    opportunityId: executionRoadmap.opportunityId,
    pricingModels: [],
    acquisitionChannels: [],
    upsellStrategy: [],
    revenueProjections: [],
    aiToolsStack: [],
    launchWorkflow: [],
  };

  const serviceTypes = /(service|project|retainer|consulting|membership)/i;
  const isService = serviceTypes.test(opportunity.revenueType);
  const target = opportunity.targetSegment || "your early customer segment";

  system.pricingModels = isService
    ? [
        {
          model: "Fixed Retainer",
          description: "A predictable monthly fee for a clearly defined scope.",
          pricing: "₹25,000-75,000/month",
          bestFor: "Agencies, consultants, done-for-you service offerings",
          pros: "Stable revenue and easier forecasting",
          cons: "Requires clear scope and delivery discipline",
        },
        {
          model: "Value-Based Project",
          description: "Charge based on the business outcome you deliver.",
          pricing: "₹40,000-1,50,000 per engagement",
          bestFor: "Pilot projects and automation implementations",
          pros: "Higher margins for strong outcomes",
          cons: "Needs strong customer confidence",
        },
        {
          model: "Hybrid Retainer + Success Fee",
          description: "Lower initial monthly fee with a performance bonus.",
          pricing: "₹15,000-30,000/month + success fee",
          bestFor: "Clients seeking low-risk engagement",
          pros: "Easier first sale, aligned incentives",
          cons: "Requires tight measurement",
        },
      ]
    : [
        {
          model: "Tiered Subscription",
          description: "Simple tiers that align with usage and value delivered.",
          pricing: "₹999 / ₹2,999 / ₹9,999",
          bestFor: "Niche SaaS and workflow tools",
          pros: "Captures different customer segments",
          cons: "Needs strong feature packaging",
        },
        {
          model: "Usage-Based",
          description: "Charge based on usage, seats, or transaction volume.",
          pricing: "₹499+ per active seat or workflow",
          bestFor: "Operational tools with repeat usage",
          pros: "Scales as the customer grows",
          cons: "Requires tracking and billing setup",
        },
        {
          model: "Launch-to-Enterprise",
          description: "Start with a low-entry tier and introduce enterprise add-ons.",
          pricing: "₹999 starter to ₹25,000+ enterprise",
          bestFor: "Niche B2B products",
          pros: "Allows fast adoption and growth",
          cons: "Increases complexity later",
        },
      ];

  system.acquisitionChannels = [
    {
      channel: "Targeted LinkedIn Outreach",
      description: `Reach ${target} with personalized messages and value-driven outreach.`,
      effort: "High",
      cost: "₹0-5,000",
      expectedCAC: "₹500-2,000",
      conversionRate: "3-8%",
      timeline: "1-3 weeks",
      priority: "High",
    },
    {
      channel: "Warm Referral Campaigns",
      description: "Tap your existing network and early adopters for introductions.",
      effort: "Medium",
      cost: "₹0",
      expectedCAC: "₹0-1,000",
      conversionRate: "10-25%",
      timeline: "1-4 weeks",
      priority: "Critical for first customers",
    },
    {
      channel: "Niche Content + Case Studies",
      description: `Publish specific content that proves your capability for ${target}.`,
      effort: "Medium",
      cost: "₹0-10,000",
      expectedCAC: "₹1,500-4,000",
      conversionRate: "1-4%",
      timeline: "4-8 weeks",
      priority: "Medium",
    },
    {
      channel: "Community Engagement",
      description: "Join niche forums, Slack groups, and founder communities where your buyers spend time.",
      effort: "Medium",
      cost: "₹0",
      expectedCAC: "₹800-2,000",
      conversionRate: "5-12%",
      timeline: "2-6 weeks",
      priority: "High quality leads",
    },
    {
      channel: "Paid Accelerator Campaign",
      description: "Use low-budget ads only after you have a validated funnel.",
      effort: "Low-Medium",
      cost: userBudget >= 200000 ? "₹10,000-25,000" : "₹2,000-8,000",
      expectedCAC: "₹2,500-8,000",
      conversionRate: "1-3%",
      timeline: "Immediate once launched",
      priority: userBudget >= 200000 ? "Supportive" : "Optional",
    },
  ];

  system.upsellStrategy = [
    {
      stage: "Initial Engagement",
      tactics: [
        "Offer a low-risk pilot that can convert into a retainer.",
        "Use progress reports to demonstrate immediate impact.",
        "Bundle follow-up work into a second-phase package.",
      ],
      expectedConversion: "10-20%",
      timeline: "Week 1-4",
    },
    {
      stage: "Value Expansion",
      tactics: [
        "Offer premium analytics, automation, or premium onboarding.",
        "Recommend a higher tier after customers see results.",
        "Introduce a bundled product-service package.",
      ],
      expectedConversion: "15-30%",
      timeline: "Month 2-3",
    },
    {
      stage: "Scalable Growth",
      tactics: [
        "Create a premium plan for advanced users.",
        "Offer add-ons such as API access or custom integrations.",
        "Use case studies to sell higher-value packages.",
      ],
      expectedConversion: "20-40%",
      timeline: "Month 4+",
    },
  ];

  system.aiToolsStack = [
    {
      tool: "Notion / Airtable",
      use: "Customer discovery, pricing models, project tracking",
      workflow: "Track leads, interviews, pilot commitments, and revenue milestones in one place.",
    },
    {
      tool: "Zapier / Make",
      use: "Automate workflows between forms, email, CRM, and delivery tools",
      workflow: "Connect validation forms to your sales pipeline and customer data sheets.",
    },
    {
      tool: "ChatGPT / Claude / Azure AI",
      use: "Generate landing copy, outreach sequences, pricing proposals, and customer research",
      workflow: "Use prompts to convert customer insights into ready-to-send messaging.",
    },
    {
      tool: "Stripe or Razorpay",
      use: "Accept payments quickly and manage subscriptions",
      workflow: "Set up recurring billing for retainers and simple one-time pilot fees.",
    },
    {
      tool: "Figma / Webflow / Carrd",
      use: "Launch a focused landing page or offer page fast",
      workflow: "Publish a conversion-first page that explains the offer and captures leads.",
    },
  ];

  system.launchWorkflow = [
    `Confirm the first revenue milestone: ${opportunity.firstRevenueMilestone}`,
    "Build the smallest possible validated offer",
    "Reach out to first 25 high-intent prospects",
    "Sign one paid pilot or customer before building more features",
  ];

  if (userBudget >= 500000) {
    system.revenueProjections = [
      {
        month: "Month 1",
        customers: 3,
        ARPU: "₹15,000",
        monthlyRevenue: "₹45,000",
        goal: "Validate the pricing and close the first pilot",
      },
      {
        month: "Month 2",
        customers: 8,
        ARPU: "₹20,000",
        monthlyRevenue: "₹160,000",
        goal: "Build a repeatable sales process",
      },
      {
        month: "Month 3",
        customers: 18,
        ARPU: "₹22,000",
        monthlyRevenue: "₹396,000",
        goal: "Reach steady monthly revenue",
      },
      {
        month: "Month 4-6",
        customers: "40+",
        ARPU: "₹24,000",
        monthlyRevenue: "₹960,000+",
        goal: "Move toward scalable growth",
      },
    ];
  } else {
    system.revenueProjections = [
      {
        month: "Month 1",
        customers: 2,
        ARPU: "₹12,000",
        monthlyRevenue: "₹24,000",
        goal: "Land first customer and prove the offer",
      },
      {
        month: "Month 2",
        customers: 5,
        ARPU: "₹15,000",
        monthlyRevenue: "₹75,000",
        goal: "Build a repeatable lead-to-customer path",
      },
      {
        month: "Month 3",
        customers: 10,
        ARPU: "₹18,000",
        monthlyRevenue: "₹180,000",
        goal: "Cover costs and fund growth",
      },
    ];
  }

  return system;
}

/**
 * Generate market opportunity analysis
 */
function generateMarketAnalysis(monetizationSystem, industry, opportunity) {
  const industrySignal = industryInsights[industry] || {};
  return {
    opportunityId: monetizationSystem.opportunityId,
    demandLevel: calculateDemand(monetizationSystem, opportunity),
    competitionLevel: calculateCompetition(monetizationSystem, opportunity),
    startupDifficulty: calculateDifficulty(monetizationSystem, opportunity),
    scalabilityScore: calculateScalability(monetizationSystem, opportunity),
    marketInsights: generateMarketInsights(monetizationSystem, opportunity, industrySignal),
    competitiveAdvantage: generateCompetitiveAdvantage(monetizationSystem, opportunity),
    risks: identifyRisks(monetizationSystem, opportunity),
    marketSummary: `This opportunity fits a ${industrySignal.timeline || "fast-moving"} market with ${industrySignal.competition || "balanced competition"}. It is designed to lock in revenue and validate demand quickly.`,
    industrySnapshot: {
      marketSize: industrySignal.avgMarketSize || "Emerging segment",
      trend: opportunity.marketTrend || "Execution-focused AI demand",
      fit: industrySignal.skillFit || "Good for focused founders",
    },
  };
}

function calculateDemand(system, opportunity) {
  const base = system.pricingModels?.length ? 7 : 6;
  const bonus = opportunity?.viability >= 88 ? 2 : 0;
  return {
    score: Math.min(10, base + bonus),
    level: base + bonus >= 8 ? "High" : "Medium",
    reasoning: `Demand is driven by a tightly defined niche and practical acquisition channels for ${opportunity?.targetSegment || "early customers"}.`,
    indicators: [
      "Clear buyer segment identified",
      "Multiple routes to first paying customers",
      "Offer solves a real operational pain",
    ],
  };
}

function calculateCompetition(system, opportunity) {
  const base = opportunity?.difficulty === "Low" ? 5 : 6;
  return {
    score: base,
    level: base <= 5 ? "Low" : "Medium",
    reasoning: `Competition is manageable because the offer is vertical and execution-focused rather than generic.`,
    indicators: [
      "Niche specialization reduces direct competitors",
      "High value in tailored execution",
      "Opportunity to own a small but profitable segment",
    ],
  };
}

function calculateDifficulty(system, opportunity) {
  const score = opportunity?.difficulty === "Low" ? 4 : opportunity?.difficulty === "Medium" ? 5 : 7;
  return {
    score,
    level: score <= 4 ? "Low" : score <= 6 ? "Medium" : "High",
    reasoning: `This kind of business is ${score <= 4 ? "accessible" : score <= 6 ? "doable" : "challenging"} for a founder who can keep execution lean.`,
    indicators: [
      "Requires focused execution",
      "Leverage existing skills and tools",
      "Minimal upfront complexity when scoped narrowly",
    ],
  };
}

function calculateScalability(system, opportunity) {
  const score = opportunity?.revenueType?.includes("SaaS") ? 8 : 6;
  return {
    score,
    level: score >= 8 ? "High" : "Medium",
    reasoning: `The model can scale by standardizing delivery and expanding the customer base with repeatable acquisition.`,
    indicators: [
      "Room to add premium tiers or retainers",
      "Opportunity for partnership referrals",
      "Clear path to systematized delivery",
    ],
  };
}

function generateMarketInsights(system, opportunity, industrySignal) {
  return [
    `This is a ${industrySignal.timeline || "fast-moving"} market with room for specific vertical execution.`,
    `The value proposition is built around a measurable pain point: ${opportunity?.painPointFocus || "operational inefficiency"}.`,
    "Early adopters are willing to pay for a concrete outcome rather than broad promises.",
    "A narrow, repeatable offer increases the chance of quick validation and strong margins.",
  ];
}

function generateCompetitiveAdvantage(system, opportunity) {
  return [
    `Specific niche focus: ${opportunity?.targetSegment || "defined early customers"}.`,
    "Execution speed from a narrow offer rather than a broad product.",
    `Built to win on practical delivery instead of feature parity with larger competitors.`,
    "Flexible pricing models allow you to start with services and transition to product offerings.",
  ];
}

function identifyRisks(system, opportunity) {
  return [
    {
      risk: "Niche misalignment",
      probability: "Medium",
      mitigation: "Keep customer interviews continuous and focus on the first 10 paying customers.",
    },
    {
      risk: "Founder burnout",
      probability: "Medium",
      mitigation: "Use the launch workflow and stop adding tasks that don’t move revenue.",
    },
    {
      risk: "Customer acquisition cost",
      probability: "Medium",
      mitigation: "Track cost per channel and double down on the top 1-2 sources.",
    },
    {
      risk: "Delivery drift",
      probability: "Low",
      mitigation: "Document the exact MVP scope and stick to it for the first customers.",
    },
  ];
}

/**
 * Generate founder coaching insights
 */
function generateCoachingInsights(userProfile, marketAnalysis) {
  const insights = [];

  // Based on experience level
  if (userProfile.experience === "0-2 years") {
    insights.push({
      area: "Execution Focus",
      insight:
        "Focus on doing one thing exceptionally well. Resist the urge to add features or pivot. Get to revenue first.",
      actionable: "Define your MVP scope to the absolute minimum needed to solve the core problem.",
    });
  } else if (userProfile.experience === "5+ years") {
    insights.push({
      area: "Leverage Your Experience",
      insight:
        "Your years of experience are your competitive advantage. Use your network and reputation to accelerate customer acquisition.",
      actionable:
        "Map your existing relationships as potential first 10 customers/partners.",
    });
  }

  // Based on timeline
  if (userProfile.timeline === "1-3 months") {
    insights.push({
      area: "Rapid Execution",
      insight:
        "With a compressed timeline, focus on quick wins. Launch a service or MVP immediately, then layer in products.",
      actionable:
        "Choose the highest-conviction opportunity and commit fully to it.",
    });
  }

  // Based on budget
  if (userProfile.budget < 200000) {
    insights.push({
      area: "Bootstrap-First Mindset",
      insight:
        "Use free tools extensively. Your creativity and execution matter more than spending. Build distribution before building product.",
      actionable:
        "Commit to getting 10 customers before spending a rupee on tooling.",
    });
  } else {
    insights.push({
      area: "Smart Spending",
      insight:
        "You have breathing room, but don't waste it. Invest in validated channels and outsource non-core work early.",
      actionable:
        "Spend 80% of resources on traction, 20% on product perfection.",
    });
  }

  // Universal insights
  insights.push({
    area: "Customer Obsession",
    insight:
      "Talk to customers constantly. Every decision should be based on customer feedback, not assumptions.",
    actionable: "Schedule 10 customer interviews this week.",
  });

  insights.push({
    area: "Metrics That Matter",
    insight:
      "Track 3 core metrics: CAC, LTV, and churn. Everything else is secondary.",
    actionable:
      "Set up a simple dashboard today tracking these metrics daily.",
  });

  insights.push({
    area: "Founder Energy Management",
    insight:
      "Startups are a marathon. Protect your energy, sleep, and health. Burnout is the #1 failure reason.",
    actionable:
      "Define your working hours and stick to them. Build in recovery time.",
  });

  return insights;
}

/**
 * Calculate founder score based on profile
 */
function calculateFounderScore(userProfile) {
  let score = 50;

  if (userProfile.experience === "5+ years") score += 25;
  else if (userProfile.experience === "2-5 years") score += 15;
  else if (userProfile.experience === "0-2 years") score += 5;

  if (userProfile.budget >= 500000) score += 15;
  else if (userProfile.budget >= 200000) score += 10;
  else score += 5;

  if (userProfile.timeline === "1-3 months") score += 10;
  else if (userProfile.timeline === "3-6 months") score += 8;
  else score += 5;

  return Math.min(100, score);
}

/**
 * Calculate launch readiness score
 */
function calculateReadinessScore(userProfile) {
  let score = 0;

  // Idea clarity
  score += 15;

  // Market validation done
  score += 0; // Will be updated as user progresses

  // MVP defined
  score += 0; // Will be updated

  // First customers identified
  score += 0; // Will be updated

  // Funding secured
  if (userProfile.budget > 0) score += 10;

  // Co-founder identified
  score += 0; // Optional

  return score;
}

/**
 * Generate progress tracking system
 */
function generateProgressSystem(executionRoadmaps) {
  const hasRoadmap = executionRoadmaps?.length > 0;
  const firstRoadmap = hasRoadmap ? executionRoadmaps[0] : null;
  const ideaScore = 100;
  const mvpScore = firstRoadmap ? 20 : 0;
  const tractionScore = firstRoadmap ? 5 : 0;
  const scalingScore = 0;
  const currentOverall = Math.round((ideaScore + mvpScore + tractionScore + scalingScore) / 3 + 10);

  return {
    completedSteps: [
      "Customer discovery plan defined",
      "Niche offer clarified",
      "Launch workflows mapped",
    ],
    launchReadiness: {
      current: currentOverall,
      target: 100,
      stages: [
        {
          name: "Idea Validation",
          current: 100,
          target: 100,
          tasks: [
            "Clarify customer profile",
            "Validate pain points with interviews",
            "Confirm pricing interest",
          ],
        },
        {
          name: "MVP/MVP Service",
          current: mvpScore,
          target: 100,
          tasks: [
            "Build or document the minimum deliverable",
            "Set up a payment or commitment process",
            "Launch the first customer offer",
          ],
        },
        {
          name: "Traction Building",
          current: tractionScore,
          target: 100,
          tasks: [
            "Acquire repeatable customers",
            "Track unit economics",
            "Start an upsell path",
          ],
        },
        {
          name: "Scaling",
          current: scalingScore,
          target: 100,
          tasks: [
            "Systematize delivery",
            "Add more acquisition channels",
            "Prepare for team expansion",
          ],
        },
      ],
    },
    keyMilestones: [
      {
        milestone: "First customer conversation",
        target: "Day 1",
        status: "pending",
      },
      {
        milestone: "First paying customer",
        target: "Week 2",
        status: "pending",
      },
      {
        milestone: "Repeatable delivery process",
        target: "Week 4",
        status: "pending",
      },
      {
        milestone: "Monthly revenue exceeds expenses",
        target: "Month 3",
        status: "pending",
      },
      {
        milestone: "Scale to 50+ customers",
        target: "Month 6",
        status: "pending",
      },
    ],
    growthMilestones: [
      {
        milestone: "First pilot customer",
        target: "30 days",
      },
      {
        milestone: "First repeat customer",
        target: "60 days",
      },
      {
        milestone: "Launch second revenue stream",
        target: "90 days",
      },
    ],
  };
}

export default generateExecutionFocusedContent;
