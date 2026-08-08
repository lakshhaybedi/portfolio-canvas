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

export type ScopeItem = {
  label: string;
  desc: string;
};

export type CaseStudy = {
  slug: string;
  index: string;
  title: string;
  company: string;
  year: string;
  tags: string[];
  // Id of this project's canvas page (see SEED_PAGES in useCanvasStore.js)
  // — powers the case-study page's "View in Canvas" link.
  canvasPageId: string;
  // Homepage-only — a shorter blurb than `overview` (written for a project
  // row you're scanning, not a page you've committed to reading) and a
  // hover-row accent distinct from `accent` (that one's tuned for contrast
  // against the case-study page itself; this one's tuned for the
  // homepage's dark hover row, and the two aren't interchangeable — e.g.
  // Standard Bank's teal `accent` reads poorly there, so `heroColor` is a
  // different blue). Single source of truth: the homepage derives its
  // project list from this array instead of keeping its own copy.
  homeDesc: string;
  heroColor: string;
  accent: string;
  // `accent` as a solid fill (backgrounds, borders, dots) always has enough
  // contrast against the page's near-black bg, but two of the three brand
  // colors fall under 4.5:1 when used *as text* — `accentText` is a
  // lightened variant safe for that (equal to `accent` when the original
  // already passes). `badgeOnAccent` is the readable text color to place
  // *on top of* a solid `accent` fill (e.g. a filled number badge) — pure
  // white fails badly on the lighter accents (standard-bank, elevance).
  accentText: string;
  badgeOnAccent: string;
  overview: string;
  heroImage?: string;
  heroUrl?: string;
  slides?: Screen[];
  screens: Screen[];
  scopeConstraints: ScopeItem[];
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
const TC_SCR_MAIN    = "/case-studies/t-cloud/main-dashboard.png";
const TC_SCR_EMPTY   = "/case-studies/t-cloud/new-dashboard.png";
const TC_SCR_ASSET   = "/case-studies/t-cloud/asset-overview.png";
const TC_SCR_WIDGET  = "/case-studies/t-cloud/widget-catalog.png";
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

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "t-cloud",
    index: "01",
    title: "T-Cloud Dashboard",
    company: "T-Mobile & MAIA",
    year: "2023–2024",
    tags: ["Enterprise B2B"],
    canvasPageId: "tcloud-flow",
    homeDesc: "Enterprise cloud infrastructure dashboard for T-Mobile's internal operations teams. Translates high-density monitoring data into a composable, role-specific interface across web and tablet — dark and light mode.",
    heroColor: "#E10074",
    accent: "#E20074",
    // #E20074 is 4.23:1 on the page bg as text (fails AA 4.5:1) and 2.59:1
    // for white-on-fill (badge) — E62689 (15% mixed toward white) clears
    // 4.5:1 for text; white stays the right badge color here (4.68:1).
    accentText: "#E62689",
    badgeOnAccent: "#FFFFFF",
    heroImage: TC_HERO,
    overview:
      "A dashboard that turns incident response from a five-tab scavenger hunt into one screen. At T-Mobile's scale, every minute inside an incident is a minute another team spends escalating instead of fixing. Operations, finance, and security teams were each running their own tooling to answer the same question: is anything on fire right now, and whose problem is it. This wasn't a “make it prettier” brief. It was a request to remove a structural bottleneck sitting between a system going sideways and the person who could fix it.",
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
    scopeConstraints: [
      { label: "Platform", desc: "Built on an existing MAIA data platform. Telemetry, APIs, and the data model were fixed, so the job was the layer operators actually look at, not re-architecting what feeds it." },
      { label: "Audiences", desc: "Two defaults, one product. Security and compliance teams live in dark mode on SOC monitors; finance and reporting stakeholders print and annotate light-mode exports. Both had to be first-class, not one themed after the other." },
      { label: "Device reality", desc: "Tablet-in-the-field was a hard requirement, not a stretch goal. Worse lighting, less screen real estate, and no assumption of a desktop-sized layout to fall back on." },
      { label: "Timeline & budget", desc: "A 14-week SOW with room to work. Enough runway for a real discovery phase, the five operations-lead interviews included, before anything got built, and no schedule renegotiation mid-project. One of the more comfortably scoped engagements on this list." },
    ],
    decisions: [
      {
        num: "01",
        title: "Composable Widget Architecture",
        desc: "One fixed layout serving ops, finance, and security at once meant compromise for all three, or three separate products to maintain. Letting each team assemble their own view meant one codebase instead of three.",
      },
      {
        num: "02",
        title: "Severity-Driven Visual Grammar",
        desc: "Critical, High, Medium, and Low read identically whether it's a table badge, a chart segment, or a KPI accent. The point underneath it: an operator glancing at a tablet across a room should be able to tell if something's bad without reading a word.",
      },
      {
        num: "03",
        title: "Layered Triage Architecture",
        desc: "KPI cards, then charts, then the data table. It's structured so the first five seconds on screen answer how bad, where, and raw log-level detail only shows up after a deliberate drill-down, because reaching for raw data first is how response time gets wasted mid-incident.",
      },
    ],
    outcomes: [
      { num: "5",       title: "Research Sessions",         desc: "Interviews with operations leads to understand monitoring mental models and where existing tools broke down." },
      { num: "2 Modes", title: "Dark & Light Mode System",  desc: "Component library covering dark mode (primary) and light mode, accessible and consistent across both." },
      { num: "1",       title: "Field-Optimized Layout",    desc: "Designed for field operators accessing real-time data away from desktop, prioritizing the highest-priority views." },
    ],
  },

  {
    slug: "maia",
    index: "02",
    title: "MAIA Platform Onboarding",
    company: "T-Mobile & MAIA",
    year: "2023–2024",
    tags: ["Enterprise B2B"],
    canvasPageId: "maia-flow",
    homeDesc: "Self-service application-access onboarding for the MAIA platform T-Cloud itself is built on. An honest request-to-access flow, a skippable guided tour, and a dashboard that admits when there's nothing to show yet.",
    heroColor: "#E62689",
    accent: "#E91E8C",
    // Same magenta family as T-Cloud's #E20074 — reuses T-Cloud's already-
    // verified lightened text colour (E62689, 4.5:1+) instead of re-deriving
    // a new one for a hue this close.
    accentText: "#E62689",
    badgeOnAccent: "#FFFFFF",
    heroImage: "/canvas-flow/maia/welcome.png",
    slides: [
      { src: "/canvas-flow/maia/welcome.png", label: "Overview & Problem", caption: "MAIA is the platform other products, T-Cloud included, are built on top of — the request-to-access flow had to work as a confusing front door for none of them." },
      { src: "/canvas-flow/maia/all-applications.png", label: "Requesting Access", caption: "A searchable table of every requestable application, replacing a per-app support ticket with a single self-service request." },
      { src: "/canvas-flow/maia/configuration-complete.png", label: "Key Design Decision", caption: "Configuration Complete closes the loop with real approve / deny / pending status, plus three explicit next steps instead of a silent redirect." },
      { src: "/canvas-flow/maia/dashboard-populated.png", label: "The Destination", caption: "Where every request lands once access clears — violations, alerts, and tickets surfaced at a glance instead of a screen the user has to learn from scratch." },
      { src: "/canvas-flow/maia/resource-library.png", label: "Ongoing Support", caption: "MAIA 101 stays one click away from onboarding, not filed under a help menu nobody opens until something's already broken." },
    ],
    overview:
      "The screen every MAIA customer sees first, before they've touched anything else on the platform. MAIA sits underneath products like T-Cloud, giving operations teams a shared, self-service way to request access to the applications they're accountable for instead of filing a ticket and waiting on IT. A platform used as the foundation for other products can't afford a confusing front door: if the first five minutes don't work, every team building on top of MAIA inherits that friction. The brief was a request-to-access flow honest about the fact that MAIA can't unilaterally grant access, an optional guided tour that respects a \"skip\" click, and a dashboard that admits when there's nothing to show yet instead of faking data.",
    screens: [
      { src: "/canvas-flow/maia/welcome.png", label: "Welcome", caption: "Self-service application access framed around what changes once approval lands, not a bare form." },
      { src: "/canvas-flow/maia/all-applications.png", label: "All Applications", caption: "Every requestable application in one searchable table, no separate ticket per app." },
      { src: "/canvas-flow/maia/configuration-complete.png", label: "Configuration Complete", caption: "Per-app approve / deny / pending status, plus three explicit next steps instead of a blank dashboard." },
      { src: "/canvas-flow/maia/dashboard-empty.png", label: "Dashboard — Before Access", caption: "An honest empty state while approvals are pending, not a dashboard pretending there's data." },
      { src: "/canvas-flow/maia/dashboard-populated.png", label: "Dashboard — After Access", caption: "The same dashboard once access clears — violations, alerts, and Jira tickets surfaced at a glance." },
      { src: "/canvas-flow/maia/applications.png", label: "Applications", caption: "Portfolio-wide inventory: violations, compliance score, and monthly cloud spend per application." },
      { src: "/canvas-flow/maia/resources.png", label: "Resources", caption: "Every cloud resource — health, idle status, and monthly cost — filterable by application, platform, and account." },
      { src: "/canvas-flow/maia/activities.png", label: "Activities", caption: "A single log for tickets, provisioning, onboarding, and decommissioning across the platform, not four separate places to check." },
      { src: "/canvas-flow/maia/alerts.png", label: "Alerts", caption: "Severity-ranked alerts across every application the user now has visibility into." },
      { src: "/canvas-flow/maia/resource-library.png", label: "MAIA 101", caption: "A self-serve resource library, reachable directly from onboarding instead of buried in a help menu." },
    ],
    scopeConstraints: [
      { label: "Platform, not one product", desc: "MAIA underlies multiple downstream products, T-Cloud among them. Onboarding had to read as generic infrastructure a new hire could land on regardless of which specific app brought them there, not framed around any one product's vocabulary." },
      { label: "Request, not grant", desc: "MAIA routes access requests to application owners, it can't approve them itself. The flow had to stay honest about approved / denied / pending states rather than implying access is instant, which shaped the entire post-request screen." },
      { label: "Permanently skippable", desc: "A returning admin setting up their fifth new hire shouldn't be forced through the same 13-step guided tour as someone's actual first login. Skip is available at every step, not just at the start." },
      { label: "Timeline & budget", desc: "A 10-week engagement shared across two other in-flight MAIA workstreams. Scoped tightly to the onboarding and first-run tour, not a redesign of the dashboard or applications views those flows land on." },
    ],
    decisions: [
      {
        num: "1",
        title: "Three Explicit Next Steps, Not One Drop-Off",
        desc: "Finishing the access-request wizard used to dump the user straight onto an empty dashboard with nothing to look at yet. Configuration Complete now offers three concrete next moves instead: take the guided tour, browse developer tools, or open the resource library, so \"you're done\" doesn't read as a dead end.",
      },
      {
        num: "2",
        title: "The Empty Dashboard Says So",
        desc: "Before access is approved, the dashboard showed the same layout as after, just with every widget silently reading zero. Indistinguishable from a broken page. It now explicitly states access is pending, so an empty state reads as expected, not as a bug report waiting to happen.",
      },
      {
        num: "3",
        title: "Reference Team Member as a First-Class Step",
        desc: "New users rarely know their own access needs precisely enough to self-serve confidently. Letting them name an existing team member as a reference, surfaced as its own onboarding step rather than a buried optional field, gives approvers real context instead of a blind request.",
      },
    ],
    outcomes: [
      { num: "3", title: "Next steps instead of 1 dead end", desc: "Configuration Complete's tour / dev tools / resource library split replaced a single silent redirect to an empty dashboard." },
      { num: "13", title: "Step guided tour, fully skippable", desc: "Every tour step carries its own Skip control, so it never becomes a tax on someone who's onboarded before." },
      { num: "0", title: "Fake data in empty states", desc: "The pre-access dashboard states plainly that access is pending instead of rendering the same widgets with silently zeroed-out values." },
    ],
  },

  {
    slug: "standard-bank",
    index: "03",
    title: "Standard Bank",
    company: "Standard Bank Africa",
    year: "2022–2023",
    tags: ["FinTech"],
    canvasPageId: "standard-bank-flow",
    homeDesc: "Cross-border mobile wallet flows for Standard Bank across Uganda, Ghana, Lesotho, and 4 other African markets. Operator-aware selection (MTN, Vodafone Cash, AirtelTigo) with fee transparency before commit.",
    // Requested #0033A9 measures 1.78:1 against the homepage row's hover
    // background (var(--bg-elevated)) — fails even the 3:1 large-text
    // minimum this title needs. Lightened ~30% toward white (same hue) to
    // clear 3:1 with a real margin (3.83:1) while staying close to navy.
    heroColor: "#4C70C3",
    accent: "#00B4AA",
    // Already 7.6:1 as text — no lightening needed. White-on-fill for the
    // badge is only 2.6:1 though (fails), so the badge uses near-black text.
    accentText: "#00B4AA",
    badgeOnAccent: "#0A0A0A",
    heroImage: SB_SLIDE_1,
    slides: [
      { src: SB_SLIDE_1, label: "Overview & Problem",    caption: "Designing cross-border mobile payments for Africa's most complex markets — 7 countries, one coherent UX." },
      { src: SB_SLIDE_2, label: "Design Style",          caption: "Colour system, typography (Inter), semantic states, and three core design principles: Trust Signals First, Progressive Disclosure, Operator Context." },
      { src: SB_SLIDE_3, label: "Key Design Decisions",  caption: "Three decisions that shaped the flow: operator-aware selection, fee transparency before commit, and beneficiary save as an in-flow step." },
      { src: SB_SLIDE_4, label: "Flow Architecture",     caption: "End-to-end payment flow — from Home through Transact Menu, Mobile Wallet, Service Selection, Payment Details, OTP, and Confirmation." },
      { src: SB_SLIDE_5, label: "How It Came Together",  caption: "5-step process: Market Research → Flow Mapping → Friction Audit → Modular Design → Testing & Handoff across Uganda, Ghana, and Lesotho." },
    ],
    overview:
      "One payment flow, seven regulatory regimes, and a user base where opening the app is itself a decision point. Data costs money in every market this shipped to. Standard Bank needed a single mobile wallet experience across Uganda, Ghana, Lesotho, Rwanda, Botswana, Tanzania, and Mozambique, each running different mobile money operators, different regulators, and a different baseline comfort with digital financial services. The brief wasn't “make a nice app.” It was “don't lose the trust it took years to build.”",
    screens: [
      { src: "/case-studies/standard-bank/01-dashboard.png",         label: "Dashboard",           caption: "Accounts home — Money Box balance and the entry point into every transfer.", portrait: true },
      { src: "/case-studies/standard-bank/02-menu.png",               label: "Menu",                 caption: "Pay, Mobile Wallet, and Transfer surfaced from the same home screen, no deeper navigation required.", portrait: true },
      { src: "/case-studies/standard-bank/03-mobile-wallet.png",      label: "Mobile Wallet",        caption: "Once-off payment, pay a saved beneficiary, or add a new one — three entry points for three different repeat-use patterns.", portrait: true },
      { src: "/case-studies/standard-bank/04-recipient.png",          label: "Recipient",            caption: "Recipient and amount confirmed before fees or OTP ever enter the flow.", portrait: true },
      { src: "/case-studies/standard-bank/05-select-service.png",     label: "Select Service",       caption: "Operator-aware selection — only the wallets reachable from the user's market are shown.", portrait: true },
      { src: "/case-studies/standard-bank/06-payment-details.png",    label: "Payment Details",      caption: "Fee transparency before commit — the breakdown is surfaced here, before OTP, not after.", portrait: true },
      { src: "/case-studies/standard-bank/07-payment-complete.png",   label: "Payment Complete",     caption: "Receipt with transaction ID and reference, plus an in-flow prompt to save the beneficiary.", portrait: true },
      { src: "/case-studies/standard-bank/08-choose-account.png",     label: "Choose Account",       caption: "Verifying the receiving wallet operator and number before the transfer is authorized.", portrait: true },
      { src: "/case-studies/standard-bank/09-review-details.png",     label: "Review Details",       caption: "Transaction fee and tax broken out as their own line items ahead of the OTP step.", portrait: true },
      { src: "/case-studies/standard-bank/10-otp-entry.png",          label: "OTP Entry",            caption: "One-time PIN sent to the registered number, with a plain-language resend path.", portrait: true },
      { src: "/case-studies/standard-bank/11-otp-verified.png",       label: "OTP Verified",         caption: "A real failure path, not just a happy-path form — resend and email fallback stay visible.", portrait: true },
      { src: "/case-studies/standard-bank/12-confirmation.png",       label: "Confirmation",         caption: "Payment successful, with transaction ID, reference, and a direct path to save the beneficiary.", portrait: true },
      { src: "/case-studies/standard-bank/13-save-beneficiary.png",   label: "Save Beneficiary",     caption: "Saving a beneficiary sits inside the payment flow itself, not a separate contacts area.", portrait: true },
      { src: "/case-studies/standard-bank/14-beneficiary-saved.png",  label: "Beneficiary Saved",    caption: "Operator, reference, and notification preference captured in the same step as the nickname.", portrait: true },
      { src: "/case-studies/standard-bank/15-save-confirmation.png",  label: "Beneficiary Confirmed", caption: "Save-for-next-time confirmation — the prompt that cut repeat sends by 40%.", portrait: true },
    ],
    scopeConstraints: [
      { label: "Engineering scope", desc: "Seven markets, one UI, one shipping team. Per-market forks were explicitly ruled out. Anything that couldn't be solved with configuration instead of a rebuild wasn't viable, because the org couldn't support seven codebases long-term." },
      { label: "Financial & digital literacy", desc: "Designing for interface literacy that can't be assumed. A meaningful share of users have limited exposure to smartphone banking conventions: no shared assumption that a spinner means wait, a checkmark means done, or that fees get disclosed before you commit rather than after. Every pattern had to work for a first-time digital-banking user, not just be forgiving of one." },
      { label: "Bandwidth & device cost", desc: "Not an edge case, the baseline. Screens had to hold up on low-end Android hardware and inconsistent connectivity, which ruled out anything assuming a fast connection or a high-end display, and pushed the team toward lightweight, low-motion, text-forward UI over anything decorative." },
      { label: "Regulatory fragmentation", desc: "Fee disclosure, KYC, and confirmation language weren't uniform across the seven markets. The flow was built with those differences as parameters the config layer handles, not exceptions the design has to special-case." },
      { label: "Timeline & budget", desc: "Nine weeks, seven markets, and a budget that got cut before the work even started. There wasn't room to run fresh field research in every market, so it went into three (Uganda, Ghana, Lesotho) and the other four were designed off those findings plus a lighter remote validation pass. The operator-aware, configuration-first model wasn't just good practice here. On that runway, it was the only way seven markets were shipping at all." },
    ],
    decisions: [
      {
        num: "1",
        title: "Operator-Aware Selection",
        desc: "Users think in amounts and recipients, not which telco they're on. Operator branding surfaces only when a market genuinely has more than one option. In single-operator markets, the decision disappears rather than being shown and immediately made irrelevant.",
      },
      {
        num: "2",
        title: "Fee Transparency Before Commit",
        desc: "Research across three markets identified fee surprise at confirmation as the number one reason transactions were abandoned mid-flow. Moving the breakdown, in plain language rather than banking jargon, to the review screen and ahead of the OTP step turned a moment of suspicion into a moment of confirmation.",
      },
      {
        num: "3",
        title: "Beneficiary Save as a Flow Step",
        desc: "First-time sends prompt to save for next time right after confirmation, when the value is obvious, instead of sitting buried in a settings menu a less digitally-fluent user would likely never find.",
      },
    ],
    outcomes: [
      { num: "↓", title: "Transaction abandonment dropped", desc: "Fee transparency at the review step removed the single largest identified drop-off point in the original design." },
      { num: "40%", title: "Faster repeat sends", desc: "Beneficiary-save adoption cleared pilot targets, a direct result of meeting first-time users where their comfort actually was." },
      { num: "7 → 1", title: "Markets, one codebase", desc: "The operator-aware model is why engineering never had to maintain forked codebases per country." },
    ],
  },

  {
    slug: "elevance-health",
    index: "04",
    title: "Find Care Experience",
    company: "Elevance Health",
    year: "2025–2026",
    tags: ["Healthcare"],
    canvasPageId: "find-care-flow",
    homeDesc: "Redesigned the Find Care experience for Anthem members — provider search, scheduling, rescheduling, cancellation, and Get Care Now — using progressive disclosure, contextual actions, and a unified care pathway.",
    heroColor: "#3D82FF",
    accent: "#7C6AF7",
    // Already 5.0:1 as text — no lightening needed. White-on-fill for the
    // badge is only 4.0:1 though (fails), so the badge uses near-black text.
    accentText: "#7C6AF7",
    badgeOnAccent: "#0A0A0A",
    heroImage: EH_SLIDE_1,
    slides: [
      { src: EH_SLIDE_1, label: "Overview & Problem",    caption: "Reimagining how Anthem members find providers, schedule appointments, and access care — end-to-end UX across scheduling, rescheduling, cancellation, and Get Care Now." },
      { src: EH_SLIDE_2, label: "Design Style",          caption: "Visual language built for clarity, trust, and accessibility — Elevance Sans + Inter, a structured colour palette, and semantic context states." },
      { src: EH_SLIDE_3, label: "How It Came Together",  caption: "5-step process: Discovery & Audit → Information Architecture → Flow Optimization → Component System → Validation & Handoff. 15 usability test participants." },
      { src: EH_SLIDE_4, label: "Flow Architecture",     caption: "Find Care Platform: four parallel pathways — Search Providers, Get Care Now, Manage Appointments, My Care Team — each broken into discrete sub-flows." },
      { src: EH_SLIDE_5, label: "Key Design Decisions",  caption: "Three decisions: Progressive Disclosure (care type → location → preferences), Contextual Actions (reschedule/cancel inline on card), Unified Care Pathways (single 'Get Care Now' entry point)." },
    ],
    overview:
      "Every extra click between a member and an appointment is a click that ends in a call center instead. Call centers are the most expensive support channel a health insurer runs. Anthem members needing to find a provider, manage an appointment, or check a claim were routed through multiple disconnected portals, each reflecting the insurer's internal plan structure rather than what a member was actually trying to do. This was a cost-structure problem wearing a UX problem's clothes.",
    screens: [
      { src: "/case-studies/elevance-health/01-find-care-landing.png",   label: "Care Dashboard",         caption: "Task-based navigation replacing the legacy plan-centric architecture — find care, manage benefits, view appointments." },
      { src: "/case-studies/elevance-health/02-get-care-now.png",        label: "Get Care Now",           caption: "Unified care pathway — virtual, retail, urgent, and emergency options compared by cost and wait time from a single entry point." },
      { src: "/case-studies/elevance-health/03-locations-near-you.png",  label: "Locations Near You",     caption: "Geolocated provider list with office hours and available services surfaced inline, no separate page to open." },
      { src: "/case-studies/elevance-health/04-select-date-time.png",    label: "Select Date & Time",     caption: "Calendar and open slots in one view — rescheduling doesn't require re-entering visit details already on file." },
      { src: "/case-studies/elevance-health/05-confirm-booking.png",     label: "Appointment Rescheduled", caption: "Review and success state combined — provider, address, and confirmation email shown in the same card." },
      { src: "/case-studies/elevance-health/06-cancel-appointment.png",  label: "Appointment Canceled",    caption: "Confirmation state with an automatic email receipt, no separate confirmation screen to navigate to." },
      { src: "/case-studies/elevance-health/07-manage-appointments.png", label: "Manage Appointments",     caption: "Reschedule and cancel actions sit inline on the appointment card, in the same place the member notices the problem." },
    ],
    scopeConstraints: [
      { label: "Design system", desc: "Built inside and contributed back to Polaris, Anthem's existing enterprise system. New patterns had to be justified as reusable across other product teams, not one-off solutions for this flow alone." },
      { label: "Bounded scope", desc: "Scheduling, rescheduling, cancellation, and Get Care Now. Explicitly not a rebuild of the entire member portal, inside a large regulated org where scope creep on a healthcare product means a much longer compliance and legal review cycle." },
      { label: "Accessibility", desc: "WCAG 2.1 AA as a component-level requirement, reviewed in Figma before handoff rather than a post-launch audit item, given a user population more likely to rely on assistive technology than the average consumer app audience." },
      { label: "Timeline & budget", desc: "A 16-week engagement, scoped tightly to scheduling, rescheduling, cancellation, and Get Care Now rather than the full member portal. Enough time to do the accessibility and Polaris-contribution work properly, not enough to justify expanding scope beyond what was actually broken." },
    ],
    decisions: [
      {
        num: "1",
        title: "Intent-First Information Architecture",
        desc: "Legacy navigation mirrored the insurer's internal plan structure. The redesign organizes around what a member is actually trying to do (find care, manage benefits, view claims), validated with a 24-member card-sorting study before a single wireframe existed.",
      },
      {
        num: "2",
        title: "One Primary Action Per Screen",
        desc: "Legacy flows stacked four to six competing actions per screen, exactly the ambiguity that turns a simple task into a support call. Every redesigned screen has one clear primary CTA, with error recovery made explicit instead of buried in a modal.",
      },
      {
        num: "3",
        title: "Component-Level Accessibility",
        desc: "Every Polaris contribution shipped WCAG 2.1 AA compliant from the start. Focus management and contrast were reviewed in Figma before engineering touched it, not caught in a QA pass after the fact.",
      },
    ],
    outcomes: [
      { num: "+29%", title: "Task completion rate", desc: "Appointment management (58%→83%), claims lookup (61%→87%), and document download (71%→94%) measured over a 60-day post-launch cohort." },
      { num: "↓", title: "Support call volume", desc: "Appointment changes and claims status were top call drivers. Both saw measurable reduction in the first quarter after launch." },
      { num: "6", title: "Polaris patterns adopted", desc: "Appointment card, form validation states, coverage alert, document row, inline error, and confirmation banner, adopted across 6 product teams within 6 months." },
    ],
  },
];
