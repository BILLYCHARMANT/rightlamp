export const company = {
  name: "PV-GRID",
  shortName: "PV-GRID",
  tagline: "Lighting up your world with clean energy",
  phone: "+250788810785",
  phoneDisplay: "(+250) 788 810 785",
  email: "info@pv-grid.rw",
  location: "Rwanda · Kigali area",
  hours: "Monday–Sunday · 24/7 Support",
  founded: 2010,
  incorporated: 2020,
  founder: "Mr JM Julien Dushimimana",
} as const;

/** Exact assets exported from Stitch project 3654913102318098977 */
export const stitchImages = {
  aboutHero: "/stitch/hero-bootcamp.jpg",
  aboutStory: "/stitch/story-team.jpg",
  aboutImpacts: "/stitch/impacts-award.jpg",
  servicesHero: "/stitch/services-hero.jpg",
  servicesCta: "/stitch/project-site.jpg",
  biogas: "/stitch/biogas.jpg",
  installation: "/stitch/installation-field.jpg",
  research: "/stitch/research-tools.jpg",
  manufacture: "/stitch/manufacturing.jpg",
  maintenance: "/stitch/repair-equipment.jpg",
  retail: "/stitch/retail-thumb.jpg",
  portfolioFeatured: "/stitch/portfolio-featured.jpg",
  portfolioResidential: "/stitch/portfolio-residential.jpg",
  portfolioRenewableLab: "/stitch/portfolio-renewable-lab.jpg",
  portfolioFieldwork: "/stitch/portfolio-fieldwork.jpg",
  portfolioCorporate: "/stitch/portfolio-corporate.jpg",
  portfolioSmartGrid: "/stitch/portfolio-smart-grid.jpg",
  portfolioTrust: "/stitch/portfolio-trust-engineer.jpg",
  brandLogo: "/stitch/rlsgl-logo.png",
} as const;

export const aboutHistory = {
  intro:
    "PV-GRID was founded by Mr JM Julien Dushimimana in 2020 for electrical generation, transmission, and installation. We help people design modern house electrical lighting using energy-saving lamps, and we participate in energy research.",
  points: [
    "PV-GRID is made up of masters students in renewable energy and young graduates from the University of Rwanda, College of Science and Technology (CST), Department of Physics — Renewable Energy Option.",
    "Our purpose is to promote clean energy in Rwanda by teaching Rwandans how important clean energy is for cooking and lighting, constructing and installing clean energy systems, and teaching people to manage their systems to optimize productivity.",
    "PV-GRID was started in June 2020. After seeing environmental problems from non-clean energy and low awareness during cooking and lighting, our members committed to promoting clean energy to protect the environment and improve quality of life for Rwandans.",
  ],
  servingNote:
    "We're a trusted local electrical company serving commercial, residential, and industrial customers since 2010.",
  /** Stitch about-us---rlsgl-redesign.html */
  images: [
    {
      src: stitchImages.aboutHero,
      alt: "PV-GRID electrical engineering training session",
    },
    {
      src: stitchImages.aboutImpacts,
      alt: "PV-GRID industry recognition and excellence",
    },
  ],
} as const;

export type TeamLevel = 1 | 2 | 3;

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  /** 1 = executive (largest, center), 2 = leadership, 3 = specialist */
  level: TeamLevel;
};

/** Committee photos match innovative-team---rlsgl-redesign.html */
export const teamMembers: TeamMember[] = [
  {
    id: "md",
    name: "JM Julien Dushimimana",
    role: "Managing Director",
    image: "",
    level: 1,
  },
  {
    id: "pm",
    name: "Ntirenganya Vedaste",
    role: "Product Manager",
    image: stitchImages.aboutStory,
    level: 2,
  },
  {
    id: "advisor",
    name: "Jean De Dieu Nyandwi",
    role: "Advisor",
    image: "",
    level: 2,
  },
  {
    id: "it",
    name: "Tuyizere Diane",
    role: "IT Specialist",
    image: "",
    level: 3,
  },
];

/** Left-to-right carousel: 2 on each side of center MD, outer card duplicated for symmetry */
export type TeamCarouselSlot = "side" | "center";

export type TeamCarouselItem = {
  key: string;
  memberId: TeamMember["id"];
  slot: TeamCarouselSlot;
};

export const teamCarouselItems: TeamCarouselItem[] = [
  { key: "it-left", memberId: "it", slot: "side" },
  { key: "pm-left", memberId: "pm", slot: "side" },
  { key: "md", memberId: "md", slot: "center" },
  { key: "advisor-right", memberId: "advisor", slot: "side" },
  { key: "it-right", memberId: "it", slot: "side" },
];

export function teamMembersByCarousel(): Array<
  TeamCarouselItem & { member: TeamMember }
> {
  const byId = Object.fromEntries(teamMembers.map((m) => [m.id, m]));
  return teamCarouselItems
    .map((item) => {
      const member = byId[item.memberId];
      return member ? { ...item, member } : null;
    })
    .filter(Boolean) as Array<TeamCarouselItem & { member: TeamMember }>;
}

/** @deprecated use teamMembersByCarousel */
export function teamMembersByDisplayOrder(): TeamMember[] {
  const byId = Object.fromEntries(teamMembers.map((m) => [m.id, m]));
  return teamCarouselItems
    .map((item) => byId[item.memberId])
    .filter(Boolean);
}

/** Card flex + aspect — all side cards equal; center slightly wider, modestly taller */
export const teamCardSlots: Record<
  TeamCarouselSlot,
  { flex: string; aspect: string }
> = {
  side: { flex: "flex-1 basis-0", aspect: "aspect-[4/5.4]" },
  center: { flex: "flex-[1.22] basis-0", aspect: "aspect-[4/5.75]" },
};

export type Skill = {
  id: string;
  label: string;
  level: number;
};

export const skills: Skill[] = [
  { id: "lighting", label: "Lighting design", level: 100 },
  { id: "equipment", label: "Electrical equipment", level: 90 },
  { id: "maintenance", label: "Electrical maintenance", level: 75 },
  { id: "installation", label: "Electrical installation", level: 100 },
  { id: "research", label: "Research & implementation", level: 90 },
  { id: "biogas", label: "Extraction of biogas", level: 85 },
];

export const teamIntro =
  "Our leadership team has over 10 years of combined experience in electrical and information technology — uniquely qualified to provide the latest electrical products and services.";

export const stats = [
  { value: "2020", label: "Established" },
  { value: "6", label: "Core services" },
  { value: "8", label: "Partners" },
  { value: "24/7", label: "Support" },
] as const;

/** Clezol-inspired homepage copy — https://clezol.com/ */
export const homeCopy = {
  heroWelcome: "Welcome to PV-GRID",
  heroTitle: "Lighting Rwanda with clean energy",
  heroSubtitle:
    "Explore electrical contracting, renewable energy, and retail products that are shaping a brighter, more sustainable future for Rwanda.",
  heroCta: "Discover more",
  heroImage: stitchImages.servicesHero,
  aboutEyebrow: "Who we are",
  aboutTitle: "Integrity, Innovation, Sustainability",
  aboutBody:
    "At PV-GRID, we are committed to honesty and open communication, ensuring every project is handled with integrity. Our innovative approach drives modern electrical and lighting solutions, while our dedication to clean energy promotes environmental health and community well-being across Rwanda.",
  questionLabel: "Have any question?",
  servicesEyebrow: "What we do",
  projectsEyebrow: "Latest projects",
  differentiatorsTitle: "What makes us different?",
  shopEyebrow: "Shop highlights",
  partnersEyebrow: "Our partners",
  contactTitle: "Contact us",
  contactSubtitle:
    "Tell us about your electrical, lighting, or renewable energy project — we respond quickly and serve clients across Rwanda.",
} as const;

/** Stitch "Luminous Industrial Identity" — live from Stitch project 3654913102318098977 */
export const aboutPageCopy = {
  heroEst: "EST. 2010",
  heroTitle: "Powering Progress with Clean Energy Solutions",
  heroSubtitle:
    "We help people embrace modern saving lamps and clean energy technologies through mobilization campaigns, researching better exploitation of our natural resources.",
  heroImage: stitchImages.aboutHero,
  heroImageAlt: "Electrical engineers and renewable energy specialists at a PV-GRID training session",
  heroYearsValue: "14+",
  heroYearsLabel: "Years",
  heroYearsCaption: "Trusted Excellence in Electrical Engineering",
  heroPrimaryCta: "Our Portfolio",
  heroPrimaryHref: "/portfolio",
  heroSecondaryCta: "Watch Video",
  heroSecondaryHref: "/#portfolio",
  storyTitle: "Our Story",
  storyBody:
    "PV-GRID started in 2010. We were tired of seeing home and business owners get price gouged for electrical work, so we decided to build a company rooted in fairness and technical excellence.",
  storyImage: stitchImages.aboutStory,
  storyImageAlt: "PV-GRID team reviewing technical blueprints and energy sustainability plans",
  storyFeatures: [
    {
      title: "Trusted Local Experts",
      body: "Serving commercial, residential, and industrial customers across Rwanda since 2010.",
    },
    {
      title: "Clean Energy Focus",
      body: "We believe clean energy projects must not fail. We upgrade systems in the shortest time possible.",
    },
  ],
  commitmentQuote:
    "We're as committed to our customers and partners as we are to this business. They're equally important. We'll always strive to create positive changes in the community.",
  valuesTitle: "Quality. Value. Integrity.",
  valuesSubtitle:
    "The pillars that define PV-GRID as Rwanda's leading independent electrical provider.",
  coreValues: [
    {
      id: "quality",
      title: "Superior Quality",
      description:
        "Delivering first-rate electrical systems and operations for utility and renewable asset markets.",
      iconTone: "primary" as const,
    },
    {
      id: "value",
      title: "Exceptional Value",
      description:
        "Sustainable energy solutions that reduce load on the national grid while optimizing costs for our clients.",
      iconTone: "green" as const,
    },
    {
      id: "integrity",
      title: "Unyielding Integrity",
      description:
        "Transparent partnerships and reliable rapid response support, available 24/7 for our valued partners.",
      iconTone: "yellow" as const,
    },
  ],
  impactsEyebrow: "OUR CAPABILITIES",
  impactsTitle: "From Concept to Reality",
  impactsBody:
    "We transform your electrical and lighting ideas into functional infrastructure. Our engineering expertise covers the entire project lifecycle.",
  impactsImage: stitchImages.aboutImpacts,
  impactsImageAlt: "PV-GRID industry recognition and excellence in renewable energy",
  impactsSteps: [
    {
      number: "01",
      title: "Energising Sites",
      description:
        "Energising sites and de-energising sites ready for demolition.",
    },
    {
      number: "02",
      title: "Utility Installation",
      description:
        "Arranging the installation of electricity, gas for residential and commercial properties.",
    },
    {
      number: "03",
      title: "Infrastructure Refurbishment",
      description:
        "For us, a clean energy project can not fail. Our mature engineers allow existing systems to be upgraded and refurbished in the shortest time possible.",
    },
  ],
  committeeEyebrow: "Leadership & Project Oversight",
  committeeTitle: "Our",
  committeeTitleAccent: "Committee",
  committeeAside:
    "A dedicated multidisciplinary team driving excellence in every watt and wire across Rwanda's energy landscape.",
  committeeMembers: [
    {
      id: "pm",
      tag: "Product Leadership",
      offset: "low" as const,
      variant: "glass" as const,
      placeholderIcon: "person" as const,
    },
    {
      id: "md",
      tag: "Executive Leadership",
      offset: "center" as const,
      variant: "primary" as const,
      placeholderIcon: "person" as const,
    },
    {
      id: "advisor",
      tag: "Technical Innovation",
      offset: "high" as const,
      variant: "glass" as const,
      placeholderIcon: "engineering" as const,
    },
  ],
  whyTitle: "Why Choose Us",
  whyItems: [
    {
      id: "love",
      title: "We Love What We Do",
      description:
        "Our builders come to work smiling and ready to build your dream. They have a passion for remodeling.",
    },
    {
      id: "care",
      title: "We Truly Care",
      description:
        "We believe in partnership and trust, working with you to create a space that meets your vision.",
    },
    {
      id: "promise",
      title: "Our Promise",
      description:
        "Always providing value and outstanding service, regardless of budget or design constraints.",
    },
  ],
  ctaTitle: "Ready to Start Your Next Project?",
  ctaSubtitle:
    "PV-GRID is willing and able to assist you with every issue related to electricity in your building.",
  ctaButton: "Request a Free Quote",
  ctaHref: "/custom-product",
} as const;

export const differentiators = [
  {
    id: "innovation",
    title: "Innovative engineering",
    description:
      "Cutting-edge electrical design and forward-thinking strategies for lighting, solar, and power systems that push beyond conventional solutions.",
  },
  {
    id: "sustainability",
    title: "Clean energy focus",
    description:
      "We prioritize renewable energy in every operation — biogas, solar, and energy-saving technologies that reduce environmental impact across Rwanda.",
  },
  {
    id: "community",
    title: "Community impact",
    description:
      "Through local partnerships and outreach, we help Rwandans access safe, efficient power — fostering empowerment and inclusive growth in every project.",
  },
] as const;

export const heroPillars = [
  {
    id: "contracting",
    tag: "Electrical contracting",
    title: "Install. Maintain. Upgrade.",
    description:
      "End-to-end electrical systems for residential, commercial, and industrial clients across Rwanda.",
    href: "/services",
    icon: "⚡",
  },
  {
    id: "renewable",
    tag: "Renewable energy",
    title: "Solar & clean energy",
    description:
      "Solar integration, biogas digesters, and renewable research to reduce costs and grid load.",
    href: "/services",
    icon: "☀",
  },
  {
    id: "retail",
    tag: "Retail & shop",
    title: "Products you can buy today",
    description:
      "Lamps, cables, panels, and household electrical equipment — online and in our retail shops.",
    href: "/shop",
    icon: "🛒",
  },
] as const;

export const quickLinks = [
  {
    id: "quote",
    title: "Get a quote",
    description: "Request a custom electrical or lighting solution.",
    href: "/custom-product",
    tone: "navy" as const,
    icon: "📋",
  },
  {
    id: "shop",
    title: "Shop products",
    description: "Browse lamps, cables, and electrical equipment.",
    href: "/shop",
    tone: "warm" as const,
    icon: "💡",
  },
  {
    id: "portfolio",
    title: "View our work",
    description: "Commercial, residential, industrial, and solar projects.",
    href: "/portfolio",
    tone: "accent" as const,
    icon: "🏗",
  },
  {
    id: "contact",
    title: "Talk to the team",
    description: "Call or email — we respond around the clock.",
    href: "#contact",
    tone: "accent" as const,
    icon: "📞",
  },
] as const;

export type PortfolioCategory =
  | "All"
  | "Commercial"
  | "Residential"
  | "Industrial"
  | "Solar"
  | "Shop";

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
  accent: "brand" | "accent";
};

export const heroSlides: HeroSlide[] = [
  {
    id: "welcome",
    eyebrow: "Welcome",
    title: "PV-GRID",
    description:
      "We help people discover modern, energy-saving lamps through clean-energy mobilization and renewable energy research across Rwanda.",
    cta: { label: "About our company", href: "#about" },
    accent: "brand",
  },
  {
    id: "solar",
    eyebrow: "Renewable energy",
    title: "Improvement of solar energy",
    description:
      "Integrating solar with hydropower can reduce electrical costs by 80–100% and lighten the load on the national grid.",
    cta: { label: "Our services", href: "/services" },
    accent: "accent",
  },
  {
    id: "commitment",
    eyebrow: "Since 2010",
    title: "Committed to what matters most — you",
    description:
      "We serve homeowners, businesses, and partners with fair pricing, quality electrical work, and positive change in our community.",
    cta: { label: "Get a quote", href: "#contact" },
    accent: "brand",
  },
  {
    id: "quality",
    eyebrow: "Quality · Value · Integrity",
    title: "End-to-end electrical contracting",
    description:
      "Industrial, commercial, utility, and renewable asset markets — first-rate systems with 24/7 rapid response support.",
    cta: { label: "View our work", href: "/portfolio" },
    accent: "accent",
  },
];

export const aboutBullets = [
  "Energising and de-energising sites ready for demolition.",
  "Arranging electricity and gas installation for residential and commercial properties.",
  "Upgrading and refurbishing existing systems in the shortest time possible.",
] as const;

export const values = [
  {
    number: "01",
    title: "We love what we do",
    description:
      "Our engineers come to work ready to build your vision — qualified, passionate, and focused on quality electrical work.",
  },
  {
    number: "02",
    title: "We truly care",
    description:
      "Partnership and trust guide every project. We work with you to create spaces that are safe, efficient, and built to last.",
  },
  {
    number: "03",
    title: "Our promise to you",
    description:
      "Outstanding service and value — regardless of lifestyle, design preference, or budget.",
  },
] as const;

export type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: "gas" | "bolt" | "wrench" | "shop" | "stove" | "research";
};

/** Core services from https://www.rlsgl.com/services.html */
export const services: Service[] = [
  {
    id: "biogas",
    title: "Extraction of natural gases",
    description:
      "We build biogas digesters for both domestic and institutional use.",
    image: stitchImages.biogas,
    icon: "gas",
  },
  {
    id: "installation",
    title: "Electrical installation",
    description:
      "Energy-saving lighting, motors, motor controls, and solar panel systems.",
    image: stitchImages.installation,
    icon: "bolt",
  },
  {
    id: "maintenance",
    title: "Electrical maintenance",
    description:
      "Troubleshooting and repairs, maintenance contracts, replace lamps and ballasts.",
    image: stitchImages.maintenance,
    icon: "wrench",
  },
  {
    id: "manufacture",
    title: "Manufacture of domestic appliances",
    description:
      "Retail shops stocked with electrical lamps, cables, and all electrical equipment.",
    image: stitchImages.manufacture,
    icon: "shop",
  },
  {
    id: "retail",
    title: "Retail sale of electrical household appliances",
    description:
      "Improved cook stoves that use electricity — made in Rwanda.",
    image: stitchImages.retail,
    icon: "stove",
  },
  {
    id: "research",
    title: "Research and implementation on renewable energy",
    description:
      "We participate in renewable energy innovation by bringing new energy projects to Rwanda.",
    image: stitchImages.research,
    icon: "research",
  },
];

export type ServiceFeatureIcon =
  | "solar"
  | "emergency"
  | "maintenance"
  | "modeling"
  | "biogas"
  | "construction"
  | "lighting"
  | "parking"
  | "design"
  | "generator"
  | "panel"
  | "equipment";

/** Feature list from https://www.rlsgl.com/services.html */
export const serviceFeatures: {
  id: string;
  title: string;
  icon: ServiceFeatureIcon;
}[] = [
  { id: "solar", title: "Solar panel installation", icon: "solar" },
  { id: "emergency", title: "Emergency power restoration", icon: "emergency" },
  { id: "maintenance", title: "Electrical maintenance service", icon: "maintenance" },
  { id: "modeling", title: "Electrical modeling", icon: "modeling" },
  { id: "biogas", title: "Installation of biogas", icon: "biogas" },
  { id: "construction", title: "New electrical construction", icon: "construction" },
  { id: "lighting-maint", title: "Lighting maintenance", icon: "lighting" },
  { id: "parking", title: "Parking lot lighting", icon: "parking" },
  { id: "lighting-design", title: "Lighting design & upgrades", icon: "design" },
  { id: "generator", title: "Backup generator installation", icon: "generator" },
  { id: "panel", title: "Service panel upgrades", icon: "panel" },
  { id: "equipment", title: "Electrical equipment", icon: "equipment" },
];

/** Stitch page image paths — services---innovative-redesign.html */
export const pageImages = {
  aboutHero: stitchImages.aboutHero,
  aboutStory: stitchImages.aboutStory,
  aboutImpacts: stitchImages.aboutImpacts,
  servicesHero: stitchImages.servicesHero,
  servicesCta: stitchImages.servicesCta,
  retailThumb: stitchImages.retail,
  repairThumb: stitchImages.maintenance,
} as const;

export function serviceImage(id: Service["id"]) {
  return services.find((s) => s.id === id)?.image ?? pageImages.servicesHero;
}

export const servicesPageCopy = {
  heroImage: pageImages.servicesHero,
  heroImageAlt: "Energy infrastructure and electrical engineering field work",
  eyebrow: "Our Technical Expertise",
  heroTitle: "High-Performance",
  heroTitleAccent: "Energy Infrastructure",
  heroSubtitle:
    "Empowering Rwanda's future through precision electrical engineering and innovative renewable energy solutions since 2010.",
  heroPrimaryCta: "Explore Solutions",
  heroPrimaryHref: "/custom-product",
  heroBadge: "ISO 9001 Certified Systems",
  floatingStat: "24/7",
  floatingStatLabel: "Rapid Response Support",
  sectionNumber: "01",
  sectionTitle: "Core Disciplines",
  sectionIntro:
    "We bridge the gap between traditional electrical systems and the future of clean energy with end-to-end solutions for industrial, commercial, and residential clients.",
  sectionStandards: "OPERATIONAL STANDARDS",
  ctaTitle: "Ready to Engineer",
  ctaTitleAccent: "The Future?",
  ctaBody:
    "From concept to reality, we take your electrical and lighting ideas and turn them into high-performing assets. Our team of mature engineers ensures every project is delivered with surgical precision.",
  ctaPrimary: "Request Technical Quote",
  ctaPrimaryHref: "/custom-product",
  ctaSecondary: "Our Portfolio",
  ctaSecondaryHref: "/portfolio",
  ctaYears: "14+",
  ctaYearsLabel: "Years of Excellence",
} as const;

export type PortfolioItem = {
  id: string;
  title: string;
  category: Exclude<PortfolioCategory, "All">;
  image: string;
  featured?: boolean;
  description?: string;
};

/** Filters on https://www.rlsgl.com/portfolio.html — Stitch portfolio + Solar */
export const portfolioFilterCategories: PortfolioCategory[] = [
  "All",
  "Commercial",
  "Residential",
  "Industrial",
  "Shop",
  "Solar",
];

/** Homepage marquee includes solar projects */
export const portfolioCategories: PortfolioCategory[] = [
  ...portfolioFilterCategories,
];

const portfolioCategoryDescriptions: Record<
  Exclude<PortfolioCategory, "All">,
  string
> = {
  Commercial:
    "Commercial electrical systems engineered for offices, retail, and corporate facilities across Rwanda.",
  Residential:
    "Residential lighting, wiring, and solar backup solutions for modern homes.",
  Industrial:
    "Large-scale power distribution and motor control systems for heavy manufacturing output.",
  Shop:
    "Electrical retail fit-outs, trade counters, and shop lighting installations.",
  Solar:
    "Solar panel arrays and hybrid renewable systems for clean energy independence.",
};

export function portfolioItemDescription(item: PortfolioItem): string {
  return item.description ?? portfolioCategoryDescriptions[item.category];
}

/** Stitch "Portfolio - PV-GRID Redesign" — project 3654913102318098977 */
export const portfolioPageCopy = {
  heroEyebrow: "EXCELLENCE IN ENERGY",
  heroTitle: "Our Impactful Projects",
  heroSubtitle:
    "Transforming conceptual energy challenges into high-performance industrial realities. Explore our track record of reliability across electrical infrastructure and renewable research.",
  heroBadges: [
    { label: "500+ Projects", tone: "green" as const },
    { label: "ISO Certified", tone: "yellow" as const },
  ],
  galleryTitle: "Portfolio Showcase",
  loadMoreLabel: "LOAD MORE PROJECTS",
  loadMoreBatch: 6,
  bentoInitialCount: 6,
  trustTitle: "Built on Precision and Punctuality",
  trustBody:
    "We are always punctual because we respect your time. When it comes to professional residential and commercial electrical services, count on PV-GRID to deliver with technical excellence.",
  trustFeatures: [
    {
      id: "response",
      title: "24/7 Rapid Response",
      body: "Maintenance support available around the clock.",
    },
    {
      id: "mission",
      title: "Clean Energy Mission",
      body: "Active mobilization for sustainable tech.",
    },
  ],
  trustCta: "Partner With Us",
  trustCtaHref: "/custom-product",
  trustImage: stitchImages.portfolioTrust,
  trustImageAlt: "Professional electrical engineer working on a modern wiring panel",
  featuredBadge: "FEATURED",
  closingNote:
    "We are always punctual because we respect your time. When it comes to professional residential and commercial electrical services, count on PV-GRID.",
} as const;

/** Stitch shop---authentic-rlsgl-assets-update.html */
export const shopPageCopy = {
  heroBadge: "TECHNICAL CATALOG 2024",
  heroTitle: "Engineering Excellence",
  heroTitleLine2: "in Every Component",
  heroSubtitle:
    "PV-GRID delivers precision-engineered electrical infrastructure. From smart grid controls to industrial-grade switchgear, we empower global energy systems with technical excellence.",
  heroPrimaryCta: "Explore Catalog",
  heroSecondaryCta: "Technical Support",
  heroSecondaryHref: "/contact",
  heroImage: stitchImages.biogas,
  heroImageAlt:
    "Industrial electrical control panel with precision wiring and digital readouts",
  sidebarTitle: "Product Categories",
  sidebarSubtitle: "Technical Specifications",
  sidebarQuoteLabel: "Get Quote",
  sidebarQuoteHref: "/custom-product",
  sidebarGuideTitle: "Technical Guide",
  sidebarGuideBody: "Complete 2024 Engineering Specifications.",
  sidebarGuideCta: "Download Catalog",
  sidebarGuideHref: "/contact",
  gridDefaultTitle: "Precision Components",
  gridDefaultSubtitle: "Industrial-grade voltage regulation and electrical solutions.",
  featuredEyebrow: "FEATURED INNOVATION",
  featuredTitle: "Next-Gen Smart Grid Controller",
  featuredBody:
    "Leading provider of end-to-end electrical contracting, PV-GRID introduces the SC-5000. Optimized for renewable energy integration with real-time AI grid balancing and military-grade encryption.",
  featuredHighlights: [
    { id: "fast", title: "Ultra Fast", body: "3ms Response Time" },
    { id: "sustainable", title: "Sustainable", body: "Carbon Optimized" },
  ],
  featuredCta: "Reserve For Your Facility",
  featuredCtaHref: "/custom-product",
  featuredImage: stitchImages.biogas,
  featuredImageAlt:
    "Electrical technician installing solar panels on a rooftop in an urban setting",
  featuredStatLabel: "ACTIVE SYSTEM",
  featuredStatValue: "99.9% Uptime",
  featuredStatNote: "Operational Stability Verified",
  emptyState: "No products match these filters. Try a broader search or reset filters.",
} as const;

/** Stitch shared footer — about-us---official-branding-update.html */
export const footerCopy = {
  brandTitle: "PV-GRID",
  about:
    "Helping people embrace modern energy technologies for a better exploitation of our natural resources.",
  usefulLinks: [
    { label: "Home", href: "/" },
    { label: "About us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Team", href: "/about#committee" },
    { label: "Contact", href: "/contact" },
  ],
  serviceLinks: [
    "Electrical Maintenance",
    "Electrical Installation",
    "Lighting Design",
    "Extraction of Biogas",
    "Research and Implementation",
  ],
  newsletterTitle: "Join Our Newsletter",
  newsletterBody: "We are here to hear you and provide all response.",
  newsletterPlaceholder: "Your email address",
  newsletterCta: "Subscribe",
  copyright: "© 2024 PV-GRID. All rights reserved.",
  logo: stitchImages.brandLogo,
  logoAlt: "PV-GRID Logo",
} as const;

export const shopSidebarCategories = [
  { id: "solar", label: "Solar Arrays", icon: "solar" as const, match: /solar|pv|panel/i },
  { id: "switchgear", label: "Switchgear", icon: "switchgear" as const, match: /switch|gear|breaker/i },
  { id: "battery", label: "Battery Storage", icon: "battery" as const, match: /battery|storage|inverter/i },
  { id: "grid", label: "Grid Controls", icon: "grid" as const, match: /grid|control|meter/i },
] as const;

/** Stitch contact-us---rlsgl-redesign.html */
export const contactPageCopy = {
  heroEyebrow: "GLOBAL OPERATIONS & MAINTENANCE",
  heroTitle: "Connect with Engineering Excellence",
  heroSubtitle:
    "PV-GRID is the leading independent provider of end-to-end electrical contracting, operations and maintenance services. We're here to power your next innovation.",
  heroImage: stitchImages.biogas,
  heroImageAlt:
    "Technical engineering site view showing complex electrical infrastructure and power systems",
  channelsTitle: "Contact Channels",
  phoneLabel: "Support Line",
  phoneNote: "Monday-Sunday 24/7 Support",
  emailLabel: "Electronic Correspondence",
  hubTitle: "Visit Our Technical Hub",
  addressLines: [
    "Plot 442, Kigali Special Economic Zone",
    "Gasabo District, Kigali",
    "Republic of Rwanda",
  ],
  mapLabel: "View on map",
  mapHref:
    "https://www.google.com/maps/search/?api=1&query=Kigali+Special+Economic+Zone+Rwanda",
  formTitle: "Project Inquiry Protocol",
  formSubtitle:
    "Please complete the technical specifications below for a prompt engineering response.",
  formFields: {
    nameLabel: "Full Name",
    namePlaceholder: "Engineering Lead / Manager",
    companyLabel: "Company Entity",
    companyPlaceholder: "Organization Name",
    emailLabel: "Email Address",
    emailPlaceholder: "corporate@domain.com",
    projectLabel: "Project Type",
    messageLabel: "Technical Requirements / Message",
    messagePlaceholder: "Describe your technical requirements...",
  },
  projectTypes: [
    "Renewable Installation",
    "Industrial Maintenance",
    "Contracting & Procurement",
    "System Consultation",
  ],
  submitLabel: "Submit Inquiry",
  securityNote: "Data secured by AES-256 standards.",
  anchorTitle: "Precision in Every Connection",
  anchorBody:
    "From complex industrial grids to sustainable home energy, PV-GRID maintains the highest safety standards in the industry.",
  anchorImage: stitchImages.portfolioFeatured,
  anchorImageAlt:
    "Professional electrical technician working on a high-voltage control panel with precision tools and intricate wiring",
} as const;

/** Exact Stitch portfolio bento — portfolio---rlsgl-redesign.html */
export const portfolioItems: PortfolioItem[] = [
  {
    id: "featured",
    title: "Industrial Grid System",
    category: "Industrial",
    image: stitchImages.portfolioFeatured,
    featured: true,
    description:
      "Large scale power distribution unit engineered for heavy manufacturing output and resilience.",
  },
  {
    id: "residential",
    title: "Residential Solar Hub",
    category: "Residential",
    image: stitchImages.portfolioResidential,
    featured: true,
  },
  {
    id: "renewable",
    title: "Renewable Innovation Lab",
    category: "Solar",
    image: stitchImages.portfolioRenewableLab,
    featured: true,
    description:
      "Renewable energy innovation and technology transfer for Rwanda's clean energy future.",
  },
  {
    id: "fieldwork",
    title: "Advanced Fieldwork",
    category: "Industrial",
    image: stitchImages.portfolioFieldwork,
    description: "Precision electrical fieldwork and on-site infrastructure upgrades.",
  },
  {
    id: "corporate",
    title: "Corporate Center Electrics",
    category: "Commercial",
    image: stitchImages.portfolioCorporate,
    featured: true,
  },
  {
    id: "smart-grid",
    title: "Smart Grid Implementation",
    category: "Solar",
    image: stitchImages.portfolioSmartGrid,
    description: "Modern energy monitoring and smart grid integration for industrial clients.",
  },
];

export type Partner = {
  id: string;
  name: string;
  image: string;
};

/** Partner logos from https://www.rlsgl.com/ (OUR PARTNERS section) */
export const partners: Partner[] = [
  { id: "p1", name: "Partner", image: "/partners/partner-1.jpg" },
  { id: "p2", name: "Partner", image: "/partners/partner-2.jpg" },
  { id: "p3", name: "Partner", image: "/partners/partner-3.gif" },
  { id: "p4", name: "Partner", image: "/partners/partner-4.jpg" },
  {
    id: "minaLoc",
    name: "MINALOC — Ministry of Local Government",
    image: "/partners/MINALOC.jpg",
  },
  {
    id: "minecofin",
    name: "MINECOFIN — Ministry of Finance and Economic Planning",
    image: "/partners/MINECOFIN.jpg",
  },
  {
    id: "minirena",
    name: "MINIRENA — Ministry of Environment",
    image: "/partners/MINIRENA.jpg",
  },
  {
    id: "wda",
    name: "WDA — Workforce Development Authority",
    image: "/partners/partner-5.jpg",
  },
];
