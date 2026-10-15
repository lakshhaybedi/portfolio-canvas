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

export type CaseStudyLink = { label: string; href: string };

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
  // Gates the homepage "Selected Work" list, which is curated, not
  // comprehensive — it stays at a handful of entries on purpose rather than
  // growing with every new case study. A case study with `featured: false`
  // still gets its own full /work/[slug] page and prev/next nav; it just
  // surfaces instead in the "More Case Studies" list on /other-work.
  featured: boolean;
  // "software" entries are shipped apps rather than client engagements: they
  // get the same /work/[slug] page, but surface in the homepage's Software
  // section instead of Selected Work / More Case Studies.
  kind?: "software";
  // GitHub / download buttons shown under the page title.
  links?: CaseStudyLink[];
  // Overrides the default "My Role" line on the page's at-a-glance strip.
  role?: string;
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
  // Which hardware the hero frame should draw. Standard Bank shipped as an
  // iOS app (its captures include the status bar and home indicator), so
  // presenting it in browser chrome misrepresented the platform; everything
  // else here is desktop web. Defaults to "desktop" when unset.
  heroDevice?: "desktop" | "mobile";
  // Two extra screens layered behind the hero, giving the stack its depth.
  // Optional: with none, the hero is just the single primary frame.
  heroStack?: Screen[];
  slides?: Screen[];
  screens: Screen[];
  scopeConstraints: ScopeItem[];
  decisions: Decision[];
  outcomes: Decision[];
};

// ── Image constants ──
// T-Cloud — portfolio slides (full-page frame exports from the Figma case
// study deck, not raw UI screenshots — each one is a complete designed page)
const TC_SLIDE_1 = "/case-studies/slides/tcloud-01-context.png";
const TC_SLIDE_2 = "/case-studies/slides/tcloud-02-decisions.png";
const TC_SLIDE_3 = "/case-studies/slides/tcloud-03-widget-system.png";
const TC_SLIDE_4 = "/case-studies/slides/tcloud-04-hierarchy.png";
const TC_SLIDE_5 = "/case-studies/slides/tcloud-05-design-system.png";
// T-Cloud — hero screen
// Was a remote Sintra CDN URL pointing at a 3456x4824 portrait export — the
// only portrait asset in a set of otherwise 1920x1200 landscape screens, so
// it was being crammed sideways into the hero's browser frame even when the
// host was up. The main dashboard is both the right shape and the screen
// this case study is actually about. Local, so it also stops leaking
// visitor IPs to a third-party host that could disappear at any time.
const TC_HERO        = "/case-studies/t-cloud/main-dashboard.png";
// T-Cloud — raw screens (full resolution)
const TC_SCR_MAIN    = "/case-studies/t-cloud/main-dashboard.png";
const TC_SCR_EMPTY   = "/case-studies/t-cloud/new-dashboard.png";
const TC_SCR_ASSET   = "/case-studies/t-cloud/asset-overview.png";
const TC_SCR_WIDGET  = "/case-studies/t-cloud/widget-catalog.png";
// Elevance Health — portfolio slides (same Figma-frame-export approach)
const EH_SLIDE_1 = "/case-studies/slides/anthem-01-context.png";
const EH_SLIDE_2 = "/case-studies/slides/anthem-02-decisions.png";
const EH_SLIDE_3 = "/case-studies/slides/anthem-03-appointment-flow.png";
const EH_SLIDE_4 = "/case-studies/slides/anthem-04-getcare-flow.png";
const EH_SLIDE_5 = "/case-studies/slides/anthem-05-design-system.png";
// Standard Bank — portfolio slides (same Figma-frame-export approach)
const SB_SLIDE_1 = "/case-studies/slides/sb-01-context.png";
const SB_SLIDE_2 = "/case-studies/slides/sb-02-decisions.png";
const SB_SLIDE_3 = "/case-studies/slides/sb-03-payment-flow.png";
const SB_SLIDE_4 = "/case-studies/slides/sb-04-verification.png";
const SB_SLIDE_5 = "/case-studies/slides/sb-05-design-system.png";
// MAIA — portfolio slides (same Figma-frame-export approach)
const MI_SLIDE_1 = "/case-studies/slides/maia-02-context.png";
const MI_SLIDE_2 = "/case-studies/slides/maia-04-decisions.png";
const MI_SLIDE_3 = "/case-studies/slides/maia-08-virtual-tour.png";
const MI_SLIDE_4 = "/case-studies/slides/maia-09-core-platform.png";
const MI_SLIDE_5 = "/case-studies/slides/maia-15-design-system.png";

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "t-cloud",
    index: "01",
    title: "T-Cloud Dashboard",
    company: "T-Mobile & MAIA",
    year: "2023–2024",
    tags: ["Enterprise B2B"],
    canvasPageId: "tcloud-flow",
    featured: true,
    homeDesc: "Enterprise cloud infrastructure dashboard for T-Mobile's internal operations teams. Translates high-density monitoring data into a composable, role-specific interface across web and tablet, in dark and light mode.",
    heroColor: "#E10074",
    accent: "#E20074",
    // #E20074 is 4.23:1 on the page bg as text (fails AA 4.5:1) and 2.59:1
    // for white-on-fill (badge). The original 15%-toward-white mix (E62689)
    // was verified against the page's base --bg (#0A0A0A), but several of
    // its real usages (Scope/Constraints labels, decision index numbers)
    // render on --bg-elevated (#151517), a lighter surface that eats into
    // that margin, measuring 4.34:1 live, just under AA. 20%-toward-white
    // (E83390) clears 4.5:1 against --bg-elevated too (verified live, 4.6:1).
    accentText: "#E83390",
    badgeOnAccent: "#FFFFFF",
    heroImage: TC_HERO,
    heroDevice: "desktop",
    heroStack: [
      { src: TC_SCR_ASSET,  label: "Asset Overview",  caption: "" },
      { src: TC_SCR_WIDGET, label: "Widget Catalog",  caption: "" },
    ],
    overview:
      "A dashboard that turns incident response from a five-tab scavenger hunt into one screen. At T-Mobile's scale, every minute inside an incident is a minute another team spends escalating instead of fixing. Operations, finance, and security teams were each running their own tooling to answer the same question: is anything on fire right now, and whose problem is it. This wasn't a “make it prettier” brief. It was a request to remove a structural bottleneck sitting between a system going sideways and the person who could fix it.",
    slides: [
      { src: TC_SLIDE_1, label: "Context & Problem",   caption: "Operators were reconstructing system health by hand, across fragmented tooling. No single surface held the whole state." },
      { src: TC_SLIDE_2, label: "Key Decisions",        caption: "Three choices that shaped how operators read the platform: composable widget architecture, severity-driven visual grammar, and layered information hierarchy." },
      { src: TC_SLIDE_3, label: "Composable Widget System", caption: "Five modules, eight categories, one canvas: Main Dashboard, Asset Overview, Patching Compliance, Security Overview, and Cost Recommendation." },
      { src: TC_SLIDE_4, label: "Information Hierarchy", caption: "Signal first, detail on demand: KPI cards, then charts, then the data table, with one severity scale used consistently across every surface." },
      { src: TC_SLIDE_5, label: "Design System",        caption: "Built for density, speed and operator clarity: core palette, semantic severity colours, and a type scale tuned for dark-first, light-at-parity use." },
    ],
    screens: [
      { src: TC_SCR_MAIN,   label: "Main Dashboard",    caption: "Composable widget layout: KPI cards, Resource Utilization, Network Traffic, and Storage Health surfaced by default." },
      { src: TC_SCR_EMPTY,  label: "New Dashboard",     caption: "Empty state. The '+ Add Widget' CTA guides operators to build their own view from the widget catalog." },
      { src: TC_SCR_ASSET,  label: "Asset Overview",    caption: "Distribution Heat Map across 888M+ assets with filterable KPI cards and application-level drill-down." },
      { src: TC_SCR_WIDGET, label: "Widget Catalog",    caption: "Add Widget modal, browse by category with a size selector (Small / Medium / Large) and live preview." },
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
    featured: true,
    homeDesc: "Self-service application-access onboarding for the MAIA platform T-Cloud itself is built on. An honest request-to-access flow, a skippable guided tour, and a dashboard that admits when there's nothing to show yet.",
    heroColor: "#E62689",
    accent: "#E91E8C",
    // Same magenta family as T-Cloud's #E20074, reuses T-Cloud's corrected
    // lightened text colour (E83390, verified 4.5:1+ against --bg-elevated
    // too) instead of re-deriving a new one for a hue this close.
    accentText: "#E83390",
    badgeOnAccent: "#FFFFFF",
    // Hero uses a real screen (like Standard Bank/Elevance above) rather
    // than a narrative deck slide — the onboarding tour's first tooltip
    // fits the overview copy below ("the screen every MAIA customer sees
    // first") better than a static dashboard shot would.
    heroImage: "/canvas-flow/maia/onboarding-tour.png",
    heroDevice: "desktop",
    heroStack: [
      { src: "/canvas-flow/maia/dashboard.png",    label: "Dashboard",    caption: "" },
      { src: "/canvas-flow/maia/applications.png", label: "Applications", caption: "" },
    ],
    slides: [
      { src: MI_SLIDE_1, label: "Context & Problem",  caption: "New operators were dropped into a full enterprise dashboard with nothing in it. Access is granted in ServiceNow, not MAIA, so nothing could tell a new user which applications were theirs." },
      { src: MI_SLIDE_2, label: "Key Decisions",      caption: "Three choices that shaped the first session: stepped portfolio configuration, a contextual virtual tour that overlays the live dashboard, and smart resource discovery." },
      { src: MI_SLIDE_3, label: "The Virtual Tour",   caption: "A 13-step guided walkthrough that never leaves the live dashboard. It plays on first login, stays re-accessible from Help, and is skippable at every step." },
      { src: MI_SLIDE_4, label: "Core Platform Pages", caption: "Four pages, one grammar: clear headers, meaningful counts, and one filter model (Application, Platform, Account, Manage) reused on every table." },
      { src: MI_SLIDE_5, label: "Design System",      caption: "Built for density, speed and operator clarity: trust signals first, progressive disclosure, and every count carrying a route to the thing it counts." },
    ],
    overview:
      "The screen every MAIA customer sees first, before they've touched anything else on the platform. MAIA sits underneath products like T-Cloud, giving operations teams a shared, self-service way to request access to the applications they're accountable for instead of filing a ticket and waiting on IT. A platform used as the foundation for other products can't afford a confusing front door: if the first five minutes don't work, every team building on top of MAIA inherits that friction. The brief was a request-to-access flow honest about the fact that MAIA can't unilaterally grant access, an optional guided tour that respects a \"skip\" click, and a dashboard that admits when there's nothing to show yet instead of faking data.",
    screens: [
      { src: "/canvas-flow/maia/onboarding-tour.png", label: "First-Time Guidance", caption: "A 13-step guided tour that never leaves the live dashboard. It plays on first login, stays re-accessible from Help, and is skippable at every step." },
      { src: "/canvas-flow/maia/dashboard.png", label: "Dashboard", caption: "A high-level view of applications and services across multi-cloud, tailored by reporting scope." },
      { src: "/canvas-flow/maia/applications.png", label: "Applications", caption: "Manage and monitor all your cloud applications in one place: violations, compliance status, and monthly cloud spend." },
      { src: "/canvas-flow/maia/resources.png", label: "Resources", caption: "Every cloud resource, with health, idle status, and monthly cost, filterable by application, platform, and account." },
      { src: "/canvas-flow/maia/activities.png", label: "Activities", caption: "A single log for tickets, provisioning, onboarding, and decommissioning across the platform, not four separate places to check." },
      { src: "/canvas-flow/maia/alerts.png", label: "Alerts", caption: "Critical, high, and medium alerts with SLA state and category, each row carrying its own resolution path." },
      { src: "/canvas-flow/maia/resource-library.png", label: "MAIA 101", caption: "A self-serve resource library, reachable directly from the nav, with five discovery filters so a first search returns something worth reading." },
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
    featured: true,
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
    // Was heroImage: SB_SLIDE_1 — that pointed at the deck's Context slide,
    // which is now a text-only frame (stats + paragraphs, no product UI) and
    // looks wrong inside the hero's fake-browser-chrome frame built for a
    // screenshot. A real screen reads correctly there instead.
    heroImage: "/case-studies/standard-bank/06-payment-details.png",
    // The only mobile product in the set — these captures carry a real iOS
    // status bar and home indicator, so a browser frame around them was
    // actively misleading about the platform.
    heroDevice: "mobile",
    heroStack: [
      { src: "/case-studies/standard-bank/03-mobile-wallet.png", label: "Mobile Wallet", caption: "", portrait: true },
      { src: "/case-studies/standard-bank/01-dashboard.png",     label: "Dashboard",     caption: "", portrait: true },
    ],
    slides: [
      { src: SB_SLIDE_1, label: "Context & Problem",     caption: "Standard Bank serves customers across Uganda, Ghana, Lesotho, Zimbabwe and other African markets, each with its own mobile money ecosystem, regulator, and operator network." },
      { src: SB_SLIDE_2, label: "Key Decisions",         caption: "Three decisions that shaped the flow: operator-aware selection, fee transparency before commit, and beneficiary save as an in-flow step." },
      { src: SB_SLIDE_3, label: "The Payment Flow",      caption: "Dashboard to completed transfer in eight screens. Every screen resolves exactly one unknown: which service, which recipient, which account, how much." },
      { src: SB_SLIDE_4, label: "Verification & Beneficiary", caption: "Fees land on review before OTP, verification has a real failure path, and saving a beneficiary closes the loop for every future transfer." },
      { src: SB_SLIDE_5, label: "Design System",         caption: "Colour system, typography, and design principles built for a user base where opening the app is itself a decision point." },
    ],
    overview:
      "One payment flow, seven regulatory regimes, and a user base where opening the app is itself a decision point. Data costs money in every market this shipped to. Standard Bank needed a single mobile wallet experience across Uganda, Ghana, Lesotho, Rwanda, Botswana, Tanzania, and Mozambique, each running different mobile money operators, different regulators, and a different baseline comfort with digital financial services. The brief wasn't “make a nice app.” It was “don't lose the trust it took years to build.”",
    screens: [
      { src: "/case-studies/standard-bank/01-dashboard.png",         label: "Dashboard",           caption: "Accounts home: Money Box balance and the entry point into every transfer.", portrait: true },
      { src: "/case-studies/standard-bank/02-menu.png",               label: "Menu",                 caption: "Pay, Mobile Wallet, and Transfer surfaced from the same home screen, no deeper navigation required.", portrait: true },
      { src: "/case-studies/standard-bank/03-mobile-wallet.png",      label: "Mobile Wallet",        caption: "Once-off payment, pay a saved beneficiary, or add a new one: three entry points for three different repeat-use patterns.", portrait: true },
      { src: "/case-studies/standard-bank/04-recipient.png",          label: "Recipient",            caption: "Recipient and amount confirmed before fees or OTP ever enter the flow.", portrait: true },
      { src: "/case-studies/standard-bank/05-select-service.png",     label: "Select Service",       caption: "Operator-aware selection: only the wallets reachable from the user's market are shown.", portrait: true },
      { src: "/case-studies/standard-bank/06-payment-details.png",    label: "Payment Details",      caption: "Fee transparency before commit. The breakdown is surfaced here, before OTP, not after.", portrait: true },
      { src: "/case-studies/standard-bank/07-payment-complete.png",   label: "Payment Complete",     caption: "Receipt with transaction ID and reference, plus an in-flow prompt to save the beneficiary.", portrait: true },
      { src: "/case-studies/standard-bank/08-choose-account.png",     label: "Choose Account",       caption: "Verifying the receiving wallet operator and number before the transfer is authorized.", portrait: true },
      { src: "/case-studies/standard-bank/09-review-details.png",     label: "Review Details",       caption: "Transaction fee and tax broken out as their own line items ahead of the OTP step.", portrait: true },
      { src: "/case-studies/standard-bank/10-otp-entry.png",          label: "OTP Entry",            caption: "One-time PIN sent to the registered number, with a plain-language resend path.", portrait: true },
      { src: "/case-studies/standard-bank/11-otp-verified.png",       label: "OTP Verified",         caption: "A real failure path, not just a happy-path form. Resend and email fallback stay visible.", portrait: true },
      { src: "/case-studies/standard-bank/12-confirmation.png",       label: "Confirmation",         caption: "Payment successful, with transaction ID, reference, and a direct path to save the beneficiary.", portrait: true },
      { src: "/case-studies/standard-bank/13-save-beneficiary.png",   label: "Save Beneficiary",     caption: "Saving a beneficiary sits inside the payment flow itself, not a separate contacts area.", portrait: true },
      { src: "/case-studies/standard-bank/14-beneficiary-saved.png",  label: "Beneficiary Saved",    caption: "Operator, reference, and notification preference captured in the same step as the nickname.", portrait: true },
      { src: "/case-studies/standard-bank/15-save-confirmation.png",  label: "Beneficiary Confirmed", caption: "Save-for-next-time confirmation, the prompt that cut repeat sends by 40%.", portrait: true },
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
    featured: true,
    homeDesc: "Redesigned the Find Care experience for Anthem members: provider search, scheduling, rescheduling, cancellation, and Get Care Now, using progressive disclosure, contextual actions, and a unified care pathway.",
    heroColor: "#3D82FF",
    accent: "#7C6AF7",
    // Already 5.0:1 as text — no lightening needed. White-on-fill for the
    // badge is only 4.0:1 though (fails), so the badge uses near-black text.
    accentText: "#7C6AF7",
    badgeOnAccent: "#0A0A0A",
    // Was heroImage: EH_SLIDE_1 — see the same note on Standard Bank above;
    // the Context slide is text-only now, a real screen fits the hero's
    // browser-chrome frame better.
    heroImage: "/case-studies/elevance-health/02-get-care-now.png",
    // Desktop web despite the tall captures — these are full-page
    // screenshots of the member portal (desktop nav and footer are visible
    // in them), not phone screens.
    heroDevice: "desktop",
    heroStack: [
      { src: "/case-studies/elevance-health/03-locations-near-you.png", label: "Locations Near You", caption: "" },
      { src: "/case-studies/elevance-health/04-select-date-time.png",   label: "Select Date & Time", caption: "" },
    ],
    slides: [
      { src: EH_SLIDE_1, label: "Context & Problem",     caption: "Members were asked to diagnose which system handled their care: 12 drop-off points in a funnel that took 8 steps just to book an appointment." },
      { src: EH_SLIDE_2, label: "Key Decisions",         caption: "Three decisions: Progressive Disclosure (care type → location → preferences), Contextual Actions (reschedule/cancel inline on card), Unified Care Pathways (single 'Get Care Now' entry point)." },
      { src: EH_SLIDE_3, label: "Manage Appointment Flow", caption: "The full appointment lifecycle in one place: five screens from Find Care landing through Select Date & Time, Confirm Booking, Cancel, and My Care Team." },
      { src: EH_SLIDE_4, label: "Get Care Now Flow",     caption: "One entry, three kinds of care. Smart routing sends virtual, in-person, and urgent care requests down the right path without the member choosing a system first." },
      { src: EH_SLIDE_5, label: "Design System",         caption: "Visual language built for clarity, trust, and accessibility: a structured colour palette and semantic context states." },
    ],
    overview:
      "Every extra click between a member and an appointment is a click that ends in a call center instead. Call centers are the most expensive support channel a health insurer runs. Anthem members needing to find a provider, manage an appointment, or check a claim were routed through multiple disconnected portals, each reflecting the insurer's internal plan structure rather than what a member was actually trying to do. This was a cost-structure problem wearing a UX problem's clothes.",
    screens: [
      { src: "/case-studies/elevance-health/01-find-care-landing.png",   label: "Care Dashboard",         caption: "Task-based navigation replacing the legacy plan-centric architecture: find care, manage benefits, view appointments." },
      { src: "/case-studies/elevance-health/02-get-care-now.png",        label: "Get Care Now",           caption: "Unified care pathway: virtual, retail, urgent, and emergency options compared by cost and wait time from a single entry point." },
      { src: "/case-studies/elevance-health/03-locations-near-you.png",  label: "Locations Near You",     caption: "Geolocated provider list with office hours and available services surfaced inline, no separate page to open." },
      { src: "/case-studies/elevance-health/04-select-date-time.png",    label: "Select Date & Time",     caption: "Calendar and open slots in one view. Rescheduling doesn't require re-entering visit details already on file." },
      { src: "/case-studies/elevance-health/05-confirm-booking.png",     label: "Appointment Rescheduled", caption: "Review and success state combined: provider, address, and confirmation email shown in the same card." },
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

  // ── 05 · This site ────────────────────────────────────────────────────
  // The one project with no client. Screens are exports from the Figma file
  // where the system was documented, not screenshots of the running site —
  // the point of the case study is the system, not the pixels.
  {
    slug: "portfolio-site",
    index: "05",
    title: "Portfolio Site",
    company: "Personal",
    year: "2026",
    tags: ["Design Systems", "Interaction Design", "Front-End"],
    canvasPageId: "portfolio-site-flow",
    featured: true,
    homeDesc:
      "The portfolio you're reading. Built from a paper wireframe system, then documented backwards into a design system: 36 variables, 13 type styles, and a 64% lighter image payload.",
    heroColor: "#EDEAD4",
    accent: "#C9A227",
    accentText: "#E3BE45",
    badgeOnAccent: "#14140F",
    overview:
      "A portfolio gets judged by the people it was built to impress, which makes it a uniquely unforgiving brief: every shortcut in it is a claim about how you work. It started from a wireframe system worked out on paper and a generated starter site that supplied a working shell and a light identity worth keeping none of. Everything after that was built by describing intent and reviewing what came back. That part is usually left out of a case study. It's in here because knowing what to ask for, and what to reject, turned out to be the entire job.",
    heroImage: "/case-studies/portfolio-site/04-home.png",
    heroDevice: "desktop",
    heroStack: [
      { src: "/case-studies/portfolio-site/06-canvas.png", label: "Interactive Canvas", caption: "" },
      { src: "/case-studies/portfolio-site/03-design-system.png", label: "Design System", caption: "" },
    ],
    // Full-page exports from the Figma deck built specifically for this
    // project (page "23 · Case Study Decks"), kept deliberately distinct
    // from the other four decks: Space Grotesk instead of Inter, the site's
    // own near-black instead of the enterprise decks' #1e1e1e, gold instead
    // of a client accent, and no metrics-grid closing slide — a reflection
    // instead, since there's no client outcome to report.
    slides: [
      { src: "/case-studies/slides/portfolio-01-ideation.png",      label: "Ideation",        caption: "The brief, the constraint of no coding background, and the inversion from the generated starter's light identity to the shipped dark one." },
      { src: "/case-studies/slides/portfolio-02-design-system.png", label: "Design System",   caption: "Colour swatches bound to live variables and real type-style specimens, not a picture of the system but the system itself." },
      { src: "/case-studies/slides/portfolio-03-final-screens.png", label: "Final Screens",   caption: "Home, case study and canvas, rebuilt in Figma from the same tokens the shipped site reads." },
      { src: "/case-studies/slides/portfolio-04-reflection.png",    label: "What I'd Tell Someone Else", caption: "Three decisions that needed a second look, and the reason none of the mistakes behind them threw an error." },
    ],
    screens: [
      { src: "/case-studies/portfolio-site/01-ideation.png",       label: "Ideation",       caption: "Framing the brief, four principles, and the light-to-dark inversion that generated the whole token set." },
      { src: "/case-studies/portfolio-site/02-wireframe-home.png", label: "Wireframes",     caption: "Structure before surface: the homepage broken into blocks, each annotated with the behaviour it owns.", portrait: true },
      { src: "/case-studies/portfolio-site/03-design-system.png",  label: "Design System",  caption: "36 variables and 13 text styles, documented from the shipped product. Swatch fills are bound to the live variables, so the sheet is the system rather than a picture of it.", portrait: true },
      { src: "/case-studies/portfolio-site/04-home.png",           label: "Home",           caption: "Hero, tag-filtered work list, services accordion and about, rebuilt natively from the tokens.", portrait: true },
      { src: "/case-studies/portfolio-site/05-case-study.png",     label: "Case Study",     caption: "Device-true hero stack. Browser chrome for web products, a phone bezel for the one that shipped on iOS, and the chrome tab shows the screen's real name instead of an invented hostname." },
      { src: "/case-studies/portfolio-site/06-canvas.png",         label: "Canvas",         caption: "A Figma-style infinite board built into the site: pannable, zoomable, with the case-study decks laid out spatially and a guest mode anyone can draw on." },
    ],
    scopeConstraints: [
      { label: "No coding background", desc: "Every line came from specification, review and rejection, not hands-on code, which shaped the process more than any technical constraint did." },
      { label: "A starting point, not a blank page", desc: "The generated starter arrived with a light/cream identity and its own defaults. Inverting it was the first real decision, and it cascaded through every token in the system." },
      { label: "Static hosting, no backend", desc: "No server means no server-side secrets and no runtime image processing. Performance had to be solved at build time or not at all." },
      { label: "Real client work, handled carefully", desc: "T-Mobile, Standard Bank and Elevance screens are real product. Nothing could be invented, and nothing could be represented as something it wasn't." },
    ],
    decisions: [
      {
        num: "1",
        title: "Frames That Tell The Truth About The Platform",
        desc: "Every case-study hero originally sat in the same desktop browser chrome with a fabricated URL, which put Standard Bank's iOS app, status bar and home indicator included, inside a browser window with a made-up address bar. Frames are now device-true and no URL is invented. Elevance nearly got mis-assigned the other way: its screens are tall and look mobile by aspect ratio, but they're full-page desktop captures with the nav and footer visible.",
      },
      {
        num: "2",
        title: "One Accent, Three Roles",
        desc: "Each case study carries its client's colour. The naive version broke immediately: T-Mobile magenta passes contrast as a fill but fails as text on the dark background, and white fails on top of the lighter accents. So each accent is three tokens rather than one, verified against 4.5:1 instead of eyeballed. A colour token is a role, not a value.",
      },
      {
        num: "3",
        title: "Animation Mapped To The Wrong Range",
        desc: "The hero screens drift apart on scroll. The first build was technically working and effectively invisible, and the cause was the input range, not the distance: the drift was mapped from where the hero enters the viewport, but the hero is already on screen at load, so readers began halfway through and only saw the back half of the motion. An animation nobody notices is more often mapped to the wrong range than tuned to the wrong output.",
      },
    ],
    outcomes: [
      { num: "−64%", title: "Image payload", desc: "54.4MB to 19.8MB across 238 images via WebP served through <picture>, with the originals kept as fallback so older browsers get a working image rather than a broken one. Other Work's initial load dropped 4073KB to 240KB." },
      { num: "670KB", title: "Removed for low-end devices", desc: "The WebGL hero already checked for weak hardware and reduced-motion, but the check ran after the library had downloaded. Moving it behind a dynamic boundary means the devices that fall back to a CSS gradient no longer fetch roughly half the homepage payload." },
      { num: "1 → 16", title: "Headings on the homepage", desc: "Every section title and project name had been a styled div, leaving screen-reader users no outline to navigate and search engines a flat wall of divs. Rendering is pixel-identical: the fix was semantic, not visual." },
    ],
  },

  // ── 06 · InSpin Survey Analysis ────────────────────────────────────────
  // A design task, not a shipped product: the data is 2,000 synthetic rows
  // generated to match the brief's question types, and the research is
  // desk research only. The copy says so rather than implying real users.
  // Screens are frame exports from the Figma file's Final Screens page.
  {
    slug: "inspin-survey-analysis",
    index: "06",
    title: "InSpin Survey Analysis",
    company: "HeyMarvin design task",
    year: "2026",
    tags: ["UX Research", "Data Visualisation", "AI UX"],
    canvasPageId: "inspin-flow",
    featured: true,
    role: "End-to-end: research, information architecture, high-fidelity UI, accessibility.",
    homeDesc:
      "2,000 survey answers, and the person opening them isn't an analyst. An overview-first analysis tool where every AI answer can be checked, and every design decision traces back to published research.",
    heroColor: "#8B8FF7",
    accent: "#4F46E5",
    accentText: "#A5A8FF",
    badgeOnAccent: "#0E0E22",
    overview:
      "InSpin had 2,000 answers from its workers and an Excel file nobody wanted to open. The task was a tool for the person who has to decide what to fix and who to call back, someone in ops or research who is comfortable with numbers but isn't a data analyst. I designed it overview-first, with AI that shows its working, and wrote down why every major decision was made. There are no real users yet: the data is synthetic, and the document marks which decisions still need testing.",
    heroImage: "/case-studies/inspin/01-overview.png",
    heroDevice: "desktop",
    heroStack: [
      { src: "/case-studies/inspin/03-open-text-themes.png", label: "Open-text themes", caption: "" },
      { src: "/case-studies/inspin/05-compare-heatmap.png", label: "Compare groups", caption: "" },
    ],
    screens: [
      { src: "/case-studies/inspin/01-overview.png",          label: "Overview",          caption: "The landing page: four numbers and two short lists. NPS is −25, so the first question answers itself. 403 unhappy people asked to be called, and one flag the tool raised unprompted." },
      { src: "/case-studies/inspin/02-privacy-setup.png",     label: "Privacy Setup",     caption: "Before any numbers, the tool asks what respondents were promised. Anonymous is the default: small groups stay hidden, and a person's answers open only if they said yes to a follow-up." },
      { src: "/case-studies/inspin/03-open-text-themes.png",  label: "Open-Text Themes", caption: "The one question where AI earns its place. Answers are grouped into themes, but the quotes underneath are the respondents' own words, each linking to their full record." },
      { src: "/case-studies/inspin/04-nps.png",               label: "NPS As A Split",    caption: "The score always shows the promoters and detractors pulling against each other, and the same question compared by tenure." },
      { src: "/case-studies/inspin/05-compare-heatmap.png",   label: "Compare Groups",    caption: "A heatmap with a number in every cell and a legend, themes sorted by share so the pattern shows. Pay delays hit San Francisco at 27% against 23% overall." },
      { src: "/case-studies/inspin/06-small-group.png",       label: "Small Group Warning", caption: "Narrow a segment to 26 people and the screen says the numbers are a hint. Narrow it to 2 and it shows nothing, and says which filter to remove." },
      { src: "/case-studies/inspin/07-participants.png",      label: "Participants",      caption: "The 403 detractors who said yes to a call. Contact details are one more click, and that click is logged." },
      { src: "/case-studies/inspin/08-ask-ai-view.png",       label: "Open This View",    caption: "Ask AI ends with the exact group it used. One click applies that segment to the real screens, so checking an answer costs a click, not a footnote." },
      { src: "/case-studies/inspin/09-share-panel.png",       label: "Share",             caption: "The bonus flow. One field for people, pods and outside guests, with a role on every recipient and an External tag on guests." },
      { src: "/case-studies/inspin/10-sharing-people.png",    label: "People And Seats",  caption: "Past the Share button: who has access and how, pods you can manage, guest access that expires." },
    ],
    scopeConstraints: [
      { label: "No real users, synthetic data", desc: "The 2,000 rows are generated to match InSpin's question types, so the patterns are plausible, not proven. Wherever a decision depends on how real analysts behave, the document flags it as something to test." },
      { label: "Desk research only", desc: "Published work on how people read charts, NN/g, Google and Microsoft guidance on dashboards and AI, the WCAG 2.2 spec, and the public help docs of five tools that already do this job." },
      { label: "The user isn't a data analyst", desc: "They work in ops, workforce or research. They're comfortable with numbers, and they've probably opened the Excel file once and closed it again. The tool has to be readable without training." },
      { label: "A promise the tool has to ask about", desc: "Whether workers were promised anonymity isn't in the brief, so setup asks. Anonymous is the default: groups under 5 stay hidden everywhere, and answers open only for people who said yes to a follow-up. An original version with no privacy setting is kept in case InSpin never promised it." },
    ],
    decisions: [
      {
        num: "1",
        title: "Overview First, Then Zoom, Then Details",
        desc: "Shneiderman's 1996 rule is the whole information architecture: an Overview, segments to zoom and filter, then the respondent record on demand. The Overview shows four numbers and two lists, and everything else is one click away. Categorical questions are sorted horizontal bars, because people read length more accurately than angle, so the donut chart was dropped.",
      },
      {
        num: "2",
        title: "AI That Can Be Checked, Not Just Cited",
        desc: "Theme cards show a short AI summary labelled as one, then real quotes word for word. Each theme list ends with a coverage line, like “96% of answers fit a theme. Read the other 4%.” NN/g found participants never clicked AI citations, so every Ask AI answer ends with a plain “based on” line and an Open this view button that lands on the same charts you'd trust anyway.",
      },
      {
        num: "3",
        title: "Segments Apply Instantly And Stay Visible",
        desc: "Someone exploring survey results shouldn't press Apply. Picking a segment updates every chart at once, the applied filters stay on screen as chips, and a live count reads “Showing 248 of 2,000.” Below about 30 people the screen warns that percentages are unstable, and an empty result tells you which segment to remove.",
      },
    ],
    outcomes: [
      { num: "14", title: "Decisions traced to evidence", desc: "Each row of the evidence-to-decision table pairs a published source with the specific thing it changed in the design." },
      { num: "5", title: "Tools compared", desc: "Dovetail, Qualtrics Text iQ, SurveyMonkey, Typeform Smart Insights and Marvin, each with what was borrowed and what was deliberately done differently." },
      { num: "AA", title: "WCAG 2.2 target, one miss caught", desc: "Writing up the contrast checks found that segment chips and secondary buttons used a 1.75:1 border. They moved to the darker control border. A user-test plan for the next round is in the document." },
    ],
  },

  // ── Software · NetMeter ─────────────────────────────────────────────────
  // Screenshots are the app's own demo-data captures (`NetMeter --demo`),
  // not real usage. Figures come from the project README.
  {
    slug: "netmeter",
    role: "Design, development and release, end to end.",
    index: "S1",
    kind: "software",
    title: "NetMeter",
    company: "Personal",
    year: "2026",
    tags: ["macOS", "Menu Bar App", "Utility"],
    canvasPageId: "netmeter-flow",
    featured: false,
    links: [
      { label: "View on GitHub", href: "https://github.com/lakshhaybedi/NetMeter" },
      { label: "Download", href: "https://github.com/lakshhaybedi/NetMeter/releases/latest" },
    ],
    homeDesc:
      "A menu bar app that shows what your Mac is using: live speed, usage per network against its own limit, which apps spent it, and day-by-day history. Nothing leaves the machine.",
    heroColor: "#6AA7F5",
    accent: "#3B82F6",
    accentText: "#7DB5FF",
    badgeOnAccent: "#0B1220",
    overview:
      "A home connection and a phone hotspot don't bill the same way, and macOS shows you neither. NetMeter sits in the menu bar and counts what each network has used against its own monthly limit, resetting on that network's own billing day, then shows which apps spent it. Everything stays on the Mac: the app makes no network connections of its own.",
    heroImage: "/case-studies/netmeter/01-overview-dark.png",
    heroDevice: "desktop",
    heroStack: [
      { src: "/case-studies/netmeter/03-history.png", label: "History", caption: "" },
      { src: "/case-studies/netmeter/06-overview-light.png", label: "Overview, light", caption: "" },
    ],
    screens: [
      { src: "/case-studies/netmeter/01-overview-dark.png",      label: "Overview",         caption: "This month at a glance: usage per network against its limit, the busiest apps, and a day-by-day chart." },
      { src: "/case-studies/netmeter/02-menubar-panel.png",      label: "Menu Bar Panel",   caption: "The everyday view. Live speed, each network with its own limit and reset day, and the apps being tracked.", portrait: true },
      { src: "/case-studies/netmeter/03-history.png",            label: "History",          caption: "A sortable day-by-day table. Each day opens into the apps and networks behind it, with CSV export." },
      { src: "/case-studies/netmeter/04-network-editor.png",     label: "Network Editor",   caption: "Right-click a network to set its monthly limit and the day its billing cycle resets, or sync it to your ISP's own figure.", portrait: true },
      { src: "/case-studies/netmeter/05-menubar-settings.png",   label: "Menu Bar Settings", caption: "The menu bar item is the product, so it is configurable: icon and/or text, number size, two-line stacking, any order.", portrait: true },
      { src: "/case-studies/netmeter/06-overview-light.png",     label: "Light Mode",       caption: "Same layout in light appearance. All screenshots use synthetic demo data." },
    ],
    scopeConstraints: [
      { label: "One limit per network, not one number", desc: "Billing cycles differ per connection: a home line that resets on the 1st and a hotspot that resets on the 9th. A single global counter would have been wrong for anyone with both." },
      { label: "No sandbox, no App Store", desc: "Per-app traffic comes from /usr/bin/nettop, which a sandboxed app can't run. That rules out the Mac App Store, so NetMeter ships as a direct download." },
      { label: "Wi-Fi names need Location access", desc: "macOS only reveals the network name to apps with Location permission. Without it the app still counts everything but can't tell networks apart, so the welcome flow has to explain the ask." },
      { label: "Unsigned until there's a Developer ID", desc: "Releases are ad-hoc signed and not notarized, so first launch needs a Control-click Open. The README says so before the download link, not after." },
    ],
    decisions: [
      {
        num: "1",
        title: "Exact Totals, Estimated Attribution",
        desc: "Network totals come straight from interface byte counters every 2 seconds, so they are exact. The per-app view is a nettop snapshot every 5 seconds, reconciled to those totals. Which app a closing connection's last seconds belong to is estimated, and the documentation says so plainly instead of implying precision it doesn't have.",
      },
      {
        num: "2",
        title: "Internet And Local Are Different Numbers",
        desc: "An ISP meters internet download only. Traffic that stays on the Mac, such as Docker talking to rclone, or on the home network is counted separately. Switch the view between Internet, Local and All, so the number you compare against your plan is the number your ISP actually bills.",
      },
      {
        num: "3",
        title: "The Menu Bar Item Is The Product",
        desc: "Most people will never open the main window; they glance at the menu bar all day. So that one item is the most configurable part of the app: icon, text or both, full, compact or tiny numbers, optional two-line stacking, and any order of items.",
      },
    ],
    outcomes: [
      { num: "~1%", title: "Of one CPU core", desc: "Light enough to leave running all day. The per-app snapshot costs about 30 ms of CPU every 5 seconds." },
      { num: "2 s", title: "Counter refresh", desc: "Network totals refresh from the interface counters every 2 seconds and are exact. The per-app breakdown is reconciled to those totals." },
      { num: "0", title: "Network connections of its own", desc: "Usage history lives in one local file on the Mac, about 13 months of it. Export to CSV, or erase it from Settings." },
    ],
  },

  // ── Software · Sunroof ──────────────────────────────────────────────────
  // Figures come from the project README and its scripts/perf.sh run.
  {
    slug: "sunroof",
    role: "Design, development and release, end to end.",
    index: "S2",
    kind: "software",
    title: "Sunroof",
    company: "Personal",
    year: "2026",
    tags: ["macOS", "Productivity", "SwiftUI"],
    canvasPageId: "sunroof-flow",
    featured: false,
    links: [
      { label: "View on GitHub", href: "https://github.com/lakshhaybedi/Sunroof" },
      { label: "Download", href: "https://github.com/lakshhaybedi/Sunroof/releases/latest" },
    ],
    homeDesc:
      "Clipboard history, a file drawer, markdown notes and widgets, one scroll away. Push the pointer to the top of the screen and scroll down. It uses 22 MB of memory when closed and wakes nothing at idle.",
    heroColor: "#F2B84B",
    accent: "#F59E0B",
    accentText: "#FBBF24",
    badgeOnAccent: "#1A1205",
    overview:
      "The things you keep reaching for, clipboard history, a place to park files, quick notes, the weather and the next meeting, are scattered across five apps and a Dock. Sunroof puts them on one shelf that slides open from the top edge of any screen: push the pointer up and scroll down. There is no Dock icon and no window to manage, and it closes the way it opened.",
    heroImage: "/case-studies/sunroof/01-shelf.png",
    heroDevice: "desktop",
    heroStack: [
      { src: "/case-studies/sunroof/02-in-use.jpg", label: "In Daily Use", caption: "" },
      { src: "/case-studies/sunroof/03-widgets.png", label: "Widgets", caption: "" },
    ],
    screens: [
      { src: "/case-studies/sunroof/01-shelf.png",    label: "The Shelf",     caption: "Clipboard history, a file drawer and markdown notes side by side, with calendar, weather, music, tasks and system widgets floating underneath." },
      { src: "/case-studies/sunroof/02-in-use.jpg",   label: "In Daily Use",  caption: "A real screenshot from daily use, with personal items blacked out." },
      { src: "/case-studies/sunroof/03-widgets.png",  label: "Widgets",       caption: "A row of widgets on frosted glass. Drag one onto another to rearrange, right-click to resize or remove." },
      { src: "/case-studies/sunroof/04-notes.png",    label: "Notes",         caption: "Plain Markdown files with live styling: the syntax hides as you type, checklists are clickable." },
      { src: "/case-studies/sunroof/05-settings.png", label: "Appearance",    caption: "Accent colour, shelf tint, note font, Liquid Glass or solid, light, dark or auto." },
    ],
    scopeConstraints: [
      { label: "Invisible until it's wanted", desc: "No Dock icon and no window. The shelf has to open over any app, in any Space, full-screen apps included, and leave no trace when closed." },
      { label: "Idle cost has to be zero", desc: "Widgets only run while the shelf is open. Measured on Apple Silicon: 22 MB with the shelf closed, 0.0% CPU and zero idle wake-ups." },
      { label: "The clipboard is the sensitive part", desc: "Anything a password manager copies shows as dots, is never written to disk and never matches a search. History files are readable by the owner's account only." },
      { label: "Plain files over a database", desc: "Notes and files are ordinary files in folders you choose, so iCloud Drive or Dropbox can sync them. A change from another Mac never overwrites unsaved work; a conflict copy is kept instead." },
    ],
    decisions: [
      {
        num: "1",
        title: "One Gesture, Several Ways In",
        desc: "Scroll down at the top edge, hold a key, pause there, drag a file upward, or press a hotkey. People's habits differ, and a gesture that fires by accident is worse than none, so each trigger can be switched on or off.",
      },
      {
        num: "2",
        title: "Notes That Stay Plain Markdown",
        desc: "Headings, bold, highlights and checklists render as you type, so it feels like a notes app. Underneath, each note is a plain .md file any editor can open. Moving away from Sunroof means copying a folder, not exporting.",
      },
      {
        num: "3",
        title: "Hidden By Default Where It Matters",
        desc: "Password-manager clips show as dots. Type ||secret|| in a note and it stays a dark field until you click its eye. Link clicks open web and mail addresses only, and images in notes never load from the internet.",
      },
    ],
    outcomes: [
      { num: "22 MB", title: "Memory with the shelf closed", desc: "47 MB while open, 0.0% CPU at rest and zero idle wake-ups. Widgets cost nothing when the shelf is shut." },
      { num: "7.6 MB", title: "App size", desc: "Down from 14 MB after removing unused code and stripping debug symbols." },
      { num: "5", title: "Widgets, all optional", desc: "Calendar, weather, music, tasks and system stats. Each can be turned off in Settings, and none of them run while the shelf is closed." },
    ],
  },

  // ── Software · DocFlow ──────────────────────────────────────────────────
  // Designed in the SchnellPDF Figma file (flow-by-flow state screens);
  // screenshots here are the shipped app. Figures from the project README.
  {
    slug: "docflow",
    role: "Design, development and release, end to end.",
    index: "S3",
    kind: "software",
    title: "DocFlow",
    company: "Personal",
    year: "2026",
    tags: ["macOS", "PDF", "Privacy"],
    canvasPageId: "docflow-flow",
    featured: false,
    links: [
      { label: "View on GitHub", href: "https://github.com/lakshhaybedi/docflow" },
      { label: "Download", href: "https://github.com/lakshhaybedi/docflow/releases/latest" },
    ],
    homeDesc:
      "Read, edit, sign and securely redact PDFs entirely on your Mac. No account, no uploads. Redaction rebuilds the page and checks that the hidden text is really gone.",
    heroColor: "#F26B6B",
    accent: "#EF4444",
    accentText: "#F87171",
    badgeOnAccent: "#1A0808",
    overview:
      "Most free PDF tools want an account, an upload, or both, and most black-box redaction leaves the original text sitting underneath. DocFlow does the job on the machine: annotate, edit text, sign, OCR, merge and export, with nothing leaving the Mac. Redaction is the part that had to be right, so it rebuilds each page and re-opens the result to check that nothing survived.",
    heroImage: "/case-studies/docflow/01-signature.png",
    heroDevice: "desktop",
    heroStack: [
      { src: "/case-studies/docflow/02-editor-dark.png", label: "Editor, dark", caption: "" },
      { src: "/case-studies/docflow/03-dashboard.png", label: "Dashboard", caption: "" },
    ],
    screens: [
      { src: "/case-studies/docflow/01-signature.png",    label: "Sign",         caption: "Type, draw, upload or scan a signature from paper with the webcam, then save it and reuse it." },
      { src: "/case-studies/docflow/02-editor-dark.png",  label: "Editor",       caption: "Annotate, edit text and organise pages in one workspace. Dark appearance shown." },
      { src: "/case-studies/docflow/03-dashboard.png",    label: "Dashboard",    caption: "Files, folders, labels (Draft, Review, Approved) and quick tools for merge, compress and convert." },
      { src: "/case-studies/docflow/04-onboarding.png",   label: "Onboarding",   caption: "A guided first run with a practice document, so the first thing you edit isn't something you care about." },
      { src: "/case-studies/docflow/05-editor-light.png", label: "Light Mode",   caption: "Light, dark or auto, any accent colour, and sepia or night page tones for reading." },
    ],
    scopeConstraints: [
      { label: "No account, no upload", desc: "Documents are processed on the device. The OCR engine, its language data and all fonts ship inside the app, so it works fully offline. The only request it ever makes is one you start: stock image search." },
      { label: "Redaction has to be real", desc: "Drawing a black box over text in a PDF often leaves the text underneath, still selectable. For a tool people use on contracts and IDs, that failure is the whole risk." },
      { label: "Text in more than one script", desc: "Latin uses the PDF standard fonts. Devanagari, Cyrillic and Greek embed subset Noto fonts, and other scripts need a font you add." },
      { label: "A Mac app, built on web tech", desc: "An Electron shell serves the app from a private origin with a strict content security policy, a sandboxed renderer and a minimal preload bridge." },
    ],
    decisions: [
      {
        num: "1",
        title: "Redaction That Proves Itself",
        desc: "Each redacted page is rebuilt as an image in a brand-new document, so the original text and graphics are not carried over. The output is re-opened and checked for leftover text before success is reported. The trade-off is stated, not hidden: those pages become images, so OCR restores a searchable layer.",
      },
      {
        num: "2",
        title: "Every State Designed, Not Just The Happy Path",
        desc: "The Figma file runs to 53 screens: empty, loading, unsaved changes, saving, save error, toast notifications, and a flow per tool for redaction, OCR, signing, annotation and export. Errors and half-finished states get a layout, instead of falling back to a default.",
      },
      {
        num: "3",
        title: "Honest About Editing Existing Text",
        desc: "Retouching an existing line covers the original, and the original stays in the file underneath. The app says so at the moment of editing and points to Redact for when the text has to be gone. A reassuring lie there would defeat the purpose of the tool.",
      },
    ],
    outcomes: [
      { num: "53", title: "Screens designed", desc: "Each tool, state and error path was designed in Figma before it was built." },
      { num: "0", title: "Accounts, uploads or analytics", desc: "Documents live in local storage. The app has no sign-in and sends nothing anywhere." },
      { num: "2 in 1", title: "One download, both Mac chips", desc: "A single universal build runs natively on Apple Silicon and Intel, on macOS 13 Ventura or later." },
    ],
  },
];
