export type Screen = {
  src: string;
  label: string;
  caption: string;
  portrait?: boolean;
};

export type Decision = {
  num: string;
  title: string;
  desc: string;
};

export type CaseStudy = {
  slug: string;
  index: string;
  title: string;
  company: string;
  year: string;
  tags: string[];
  accent: string;
  overview: string;
  heroImage?: string;
  heroUrl?: string;
  slides?: Screen[];
  screens: Screen[];
  decisions: Decision[];
  outcomes: Decision[];
};

// ── CDN image constants ──
// T-Cloud — portfolio slides
const TC_SLIDE_1 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/4c99d97a-f62e-44f1-98b1-48808c3827af/1.png";
const TC_SLIDE_2 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/8cc2e4ee-373e-43c8-9c50-04603d0abdef/2.png";
const TC_SLIDE_3 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/07ddbcd7-a854-4935-8ddb-b97c6309c7aa/3.png";
const TC_SLIDE_4 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/e3b790ff-5453-4a62-8070-683d51b8cd1f/4.png";
const TC_SLIDE_5 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/6006386b-f801-447d-9c7b-53dba0cb6a0d/5.png";
// T-Cloud — hero screen
const TC_HERO        = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/be2b0c3f-73d2-40af-aff1-7a4e136594c9/Cost_Optimization.png";
// T-Cloud — raw screens (full resolution)
const TC_SCR_MAIN    = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/59614753-9ba1-4fb1-9ada-f220b20e09ce/Dashboard_Screen_1.png";
const TC_SCR_EMPTY   = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/4e2a76af-2f40-4473-b4f5-b137a8f67743/Dashboard_Screen_10.png";
const TC_SCR_ASSET   = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/657743f8-1d8d-4a23-b0a3-64e3533e511d/Security_360-Overview.png";
const TC_SCR_WIDGET  = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/6e422788-d364-4f5b-94ef-f5bf55d78f7c/Dashboard_Screen_16.png";
// Elevance Health — portfolio slides
const EH_SLIDE_1 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/61452706-3c67-43a7-9255-1df9f1a239e9/2306.png";
const EH_SLIDE_2 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/40c65dac-78e6-4561-abd3-b01aead2378c/2307.png";
const EH_SLIDE_3 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/f8e103d9-4c9f-4b05-b23d-4b049cc91bdf/2308.png";
const EH_SLIDE_4 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/e5ff90fc-76ee-49ba-a7c2-af2d4ec3fb15/2309.png";
const EH_SLIDE_5 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/5f64a66d-9c97-4531-8de0-91735c22f9cc/2310.png";
// Standard Bank — portfolio slides
const SB_SLIDE_1 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/e91f85ac-621e-4272-acd4-23aea05d6209/2301.png";
const SB_SLIDE_2 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/43a6e294-89e5-4e9d-829b-2771a697cded/2302.png";
const SB_SLIDE_3 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/a4792eaa-1035-4619-ac7d-9414ccd71819/2303.png";
const SB_SLIDE_4 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/1e4ced7a-f8a0-4676-9e89-1c30422cb3d2/2304.png";
const SB_SLIDE_5 = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/af608b01-7d67-40f4-afde-31b73a4250f6/2305.png";
const CDN_SB_SELECT  = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/b1a84ec3-bb9e-47e8-afc5-296e79ff0738/sb_left_phone.png";
const CDN_SB_REVIEW  = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/33081cb8-dca9-4baa-9710-2d65ce1c0329/sb_mid_phone.png";
const CDN_SB_CONFIRM = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/e005754e-4442-4d57-9653-8de68c12571f/sb_right_phone.png";
const CDN_EH_OVERVIEW  = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/75c2a6af-00cc-41aa-8eae-020d6b60b574/eh_overview.png";
const CDN_EH_APPT      = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/5942f866-f854-4c54-b92f-a7b8b5b3ad56/eh_appointment.png";
const CDN_EH_CLAIMS    = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/0caf4e4d-05b4-4339-9910-46eb8523c082/eh_claims.png";
const CDN_EH_COVERAGE  = "https://ap.chat-img.sintra.ai/8f6a602e-5b87-49d1-b168-c3a672b80b6b/9464d965-7df2-498b-94ff-97d42549d542/eh_coverage.png";

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "t-cloud",
    index: "01",
    title: "T-Cloud Dashboard",
    company: "T-Mobile & MAIA",
    year: "2024",
    tags: ["Enterprise B2B", "Web & Tablet", "Dashboard"],
    accent: "#E20074",
    heroImage: TC_HERO,
    overview:
      "T-Cloud is an enterprise dashboard product designed for T-Mobile's internal operations teams managing cloud infrastructure at scale. The challenge was translating high-density technical data into an interface that operators could monitor, act on, and trust across both web and tablet form factors. Operations teams worked across fragmented tooling — switching between multiple platforms to get a complete picture of system health. The lack of a unified view slowed response time and introduced errors during high-stakes incidents.",
    slides: [
      { src: TC_SLIDE_1, label: "Context & Problem",   caption: "Operations teams managed cloud infrastructure across fragmented tooling — T-Cloud unifies it into one operator-grade interface." },
      { src: TC_SLIDE_2, label: "Research & Outcomes",  caption: "5 research sessions with operations leads shaped the mental models, severity taxonomy, and field-use requirements." },
      { src: TC_SLIDE_3, label: "Design Decisions",     caption: "Three core decisions: composable widget architecture, severity-driven visual grammar, and layered information hierarchy." },
      { src: TC_SLIDE_4, label: "Visual Language",      caption: "Style guide — typography, colour system (dark + light), component states, and the severity palette (Critical → Low)." },
      { src: TC_SLIDE_5, label: "Components & System",  caption: "Component library: KPI cards, widget shells, alert badges, data tables — consistent across web and tablet breakpoints." },
    ],
    screens: [
      { src: TC_SCR_MAIN,   label: "Main Dashboard",    caption: "Composable widget layout — KPI cards, Resource Utilization, Network Traffic, and Storage Health surfaced by default." },
      { src: TC_SCR_EMPTY,  label: "New Dashboard",     caption: "Empty state — the '+ Add Widget' CTA guides operators to build their own view from the widget catalog." },
      { src: TC_SCR_ASSET,  label: "Asset Overview",    caption: "Distribution Heat Map across 888M+ assets with filterable KPI cards and application-level drill-down." },
      { src: TC_SCR_WIDGET, label: "Widget Catalog",    caption: "Add Widget modal — browse by category with size selector (Small / Medium / Large) and live preview." },
    ],
    decisions: [
      {
        num: "01",
        title: "Composable Widget Architecture",
        desc: "Rather than prescribing a fixed layout, the dashboard lets each user build their own view by adding, sizing, and arranging widgets. Ops, finance, and security teams each surface the metrics relevant to their role — without compromise.",
      },
      {
        num: "02",
        title: "Severity-Driven Visual Grammar",
        desc: "Critical/red, High/orange, Medium/yellow, and Low/green run consistently through every surface — table badges, chart segments, and KPI card accents. A shared colour language that works whether the user is scanning recommendations or a distribution chart.",
      },
      {
        num: "03",
        title: "Layered Information Architecture",
        desc: "The tab structure and hierarchy (KPI cards → charts → data table) are deliberate: users start with high-level signal and drill into specifics only when needed. Analysts get granular detail; operators never face raw data upfront.",
      },
    ],
    outcomes: [
      { num: "5",       title: "Research Sessions",         desc: "Interviews with operations leads to understand monitoring mental models and where existing tools broke down." },
      { num: "2 Modes", title: "Dark & Light Mode System",  desc: "Component library covering dark mode (primary) and light mode — accessible and consistent across both." },
      { num: "1",       title: "Field-Optimized Layout",    desc: "Designed for field operators accessing real-time data away from desktop, prioritising the highest-priority views." },
    ],
  },

  {
    slug: "standard-bank",
    index: "02",
    title: "Standard Bank",
    company: "Standard Bank Africa",
    year: "2024",
    tags: ["FinTech", "Mobile", "Multi-Market"],
    accent: "#00B4AA",
    heroImage: SB_SLIDE_1,
    slides: [
      { src: SB_SLIDE_1, label: "Overview & Problem",    caption: "Designing cross-border mobile payments for Africa's most complex markets — 7 countries, one coherent UX." },
      { src: SB_SLIDE_2, label: "Design Style",          caption: "Colour system, typography (Inter), semantic states, and three core design principles: Trust Signals First, Progressive Disclosure, Operator Context." },
      { src: SB_SLIDE_3, label: "Key Design Decisions",  caption: "Three decisions that shaped the flow: operator-aware selection, fee transparency before commit, and beneficiary save as an in-flow step." },
      { src: SB_SLIDE_4, label: "Flow Architecture",     caption: "End-to-end payment flow — from Home through Transact Menu, Mobile Wallet, Service Selection, Payment Details, OTP, and Confirmation." },
      { src: SB_SLIDE_5, label: "How It Came Together",  caption: "5-step process: Market Research → Flow Mapping → Friction Audit → Modular Design → Testing & Handoff across Uganda, Ghana, and Lesotho." },
    ],
    overview:
      "Standard Bank needed a unified mobile wallet flow that worked across Uganda, Ghana, Lesotho, Rwanda, Botswana, Tanzania, and Mozambique — each market with different mobile money operators, regulatory constraints, and user expectations. The challenge: a single UI system that adapts without fragmenting.",
    screens: [
      { src: CDN_SB_SELECT,  label: "Select Service",  caption: "Operator-aware service selection — MTN, Vodafone Cash, AirtelTigo resolve automatically by market", portrait: true },
      { src: CDN_SB_REVIEW,  label: "Review + Fees",   caption: "Fee transparency before commit — plain-language breakdown surfaced at review, before OTP", portrait: true },
      { src: CDN_SB_CONFIRM, label: "Confirmation",    caption: "Post-payment confirmation with beneficiary save prompt for repeat sends", portrait: true },
    ],
    decisions: [
      {
        num: "1",
        title: "Operator-aware selection model",
        desc: "Users don't think in operators — they think in amounts and recipients. Operator logos surface only when ambiguity requires a decision. In single-operator markets, the step disappears entirely.",
      },
      {
        num: "2",
        title: "Fee transparency before commit",
        desc: "Research across 3 markets showed fee surprises at confirmation were the #1 driver of abandoned transactions. Fees are surfaced on the review screen with plain-language breakdown — before the OTP step.",
      },
      {
        num: "3",
        title: "Beneficiary save prompt",
        desc: "First-time sends to a recipient trigger a 'Save for next time?' prompt post-confirmation. Repeat sends show the beneficiary's last transaction amount as a default — reducing keystrokes on the most common journey.",
      },
    ],
    outcomes: [
      { num: "↓", title: "Transaction abandonment dropped", desc: "Fee transparency at the review step reduced confirmed drop-offs by removing the #1 surprise point in the original flow." },
      { num: "↑ 40%", title: "Faster repeat sends", desc: "Beneficiary save prompt adoption exceeded targets in pilot — returning users completed sends 40% faster on second transaction." },
      { num: "✓ 7", title: "Markets, one codebase", desc: "The operator-aware model meant product engineering shipped one UI across all markets with market-specific config, not forked codebases." },
    ],
  },

  {
    slug: "elevance-health",
    index: "03",
    title: "Find Care Experience",
    company: "Elevance Health",
    year: "2023",
    tags: ["Healthcare", "Web App", "Appointment Flow"],
    accent: "#7C6AF7",
    heroImage: EH_SLIDE_1,
    slides: [
      { src: EH_SLIDE_1, label: "Overview & Problem",    caption: "Reimagining how Anthem members find providers, schedule appointments, and access care — end-to-end UX across scheduling, rescheduling, cancellation, and Get Care Now." },
      { src: EH_SLIDE_2, label: "Design Style",          caption: "Visual language built for clarity, trust, and accessibility — Elevance Sans + Inter, a structured colour palette, and semantic context states." },
      { src: EH_SLIDE_3, label: "How It Came Together",  caption: "5-step process: Discovery & Audit → Information Architecture → Flow Optimization → Component System → Validation & Handoff. 15 usability test participants." },
      { src: EH_SLIDE_4, label: "Flow Architecture",     caption: "Find Care Platform: four parallel pathways — Search Providers, Get Care Now, Manage Appointments, My Care Team — each broken into discrete sub-flows." },
      { src: EH_SLIDE_5, label: "Key Design Decisions",  caption: "Three decisions: Progressive Disclosure (care type → location → preferences), Contextual Actions (reschedule/cancel inline on card), Unified Care Pathways (single 'Get Care Now' entry point)." },
    ],
    overview:
      "Anthem is one of the largest health insurance providers in the US. This project redesigned the Find Care experience across web — enabling members to search providers, schedule appointments, get virtual care, and manage their care team. The existing flow forced members to toggle between multiple portals, lacked transparency around provider details and availability, and generated high abandonment and call-centre volume. Scope included scheduling, rescheduling, cancellation, and the Get Care Now pathway.",
    screens: [
      { src: CDN_EH_OVERVIEW,  label: "Member Dashboard",   caption: "Task-based navigation replacing the legacy plan-centric architecture — find care, manage benefits, view claims" },
      { src: CDN_EH_APPT,      label: "Appointments",       caption: "7-step modal flow redesigned to 3-step in-page flow — completion rate improved from 58% to 83%" },
      { src: CDN_EH_CLAIMS,    label: "Claims Lookup",      caption: "Plain-language status messages replacing clinical jargon — 'In review' instead of 'Adjudication pending'" },
      { src: CDN_EH_COVERAGE,  label: "Coverage Details",   caption: "Structured benefit breakdown built with Polaris design system components" },
    ],
    decisions: [
      {
        num: "1",
        title: "Intent-first information architecture",
        desc: "The nav was restructured around user tasks ('Find care', 'Manage benefits', 'View claims') rather than plan sections. A card-sorting study with 24 members validated the taxonomy before any wireframes were built.",
      },
      {
        num: "2",
        title: "One primary action per screen",
        desc: "Legacy flows stacked 4–6 actions per screen. Every redesigned screen has one primary CTA. Secondary options are available but deprioritised. Error recovery paths are explicit, not hidden in modals.",
      },
      {
        num: "3",
        title: "Accessible from component level",
        desc: "All Polaris contributions were built to WCAG 2.1 AA. Focus management, touch target sizing, and colour contrast reviewed in Figma before handoff — not post-development.",
      },
    ],
    outcomes: [
      { num: "+29%", title: "Task completion rate", desc: "Appointment management (58%→83%), claims lookup (61%→87%), and document download (71%→94%) measured over a 60-day post-launch cohort." },
      { num: "↓", title: "Support call volume", desc: "Appointment changes and claims status were top call drivers. Both saw measurable reduction in the first quarter after launch." },
      { num: "6", title: "Polaris patterns adopted", desc: "Appointment card, form validation states, coverage alert, document row, inline error, and confirmation banner — adopted across 6 product teams within 6 months." },
    ],
  },
];
