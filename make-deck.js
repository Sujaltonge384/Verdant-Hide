// C:\Projects\D2C_Brand\make-deck.js
const PptxGenRaw = require('pptxgenjs');
const PptxGenJS = PptxGenRaw.default || PptxGenRaw;

const pres = new PptxGenJS();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 inches
pres.title = 'Plant-Based Leather D2C E-Commerce Platform — 12-Pager Business Deck';
pres.author = 'Sujal Tonge';

// Brand & PRD Palette
const C = {
  forest: '163C30',
  forestDark: '0F2921',
  gold: 'B58938',
  cream: 'F6F4EF',
  white: 'FFFFFF',
  ink: '16171A',
  muted: '525866',
  sage: 'E6EBE0',
  border: 'DEDAD0',
  softRow: 'F0EDE5',
  amberBg: 'FBF5E6',
};

const FONT = 'Calibri';

function addChrome(slide, num, tag, title, subtitle) {
  slide.background = { color: C.cream };

  // Top forest stripe
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 13.333, h: 0.1,
    fill: { color: C.forest },
  });

  // Section tag
  slide.addText(tag.toUpperCase(), {
    x: 0.65, y: 0.28, w: 9.5, h: 0.28,
    fontFace: FONT, fontSize: 10, bold: true, color: C.gold, charSpacing: 2,
  });

  // Slide pill badge
  slide.addShape(pres.ShapeType.roundRect, {
    x: 11.75, y: 0.25, w: 0.95, h: 0.34,
    fill: { color: C.forest }, rectRadius: 0.15,
  });
  slide.addText(`${String(num).padStart(2, '0')} / 12`, {
    x: 11.75, y: 0.25, w: 0.95, h: 0.34,
    fontFace: FONT, fontSize: 10, bold: true, color: C.white, align: 'center', valign: 'middle',
  });

  // Main Title & Subtitle
  slide.addText(title, {
    x: 0.65, y: 0.56, w: 11.5, h: 0.5,
    fontFace: FONT, fontSize: 24, bold: true, color: C.forest,
  });
  slide.addText(subtitle, {
    x: 0.65, y: 1.05, w: 12.0, h: 0.32,
    fontFace: FONT, fontSize: 12.5, color: C.muted,
  });

  // Divider line
  slide.addShape(pres.ShapeType.line, {
    x: 0.65, y: 1.44, w: 12.05, h: 0,
    line: { color: C.border, width: 1 },
  });

  // Footer
  slide.addText(
    'Plant-Based Leather D2C E-Commerce Platform  •  PRD v1.0 Business Deck  •  Nov 2026',
    { x: 0.65, y: 7.08, w: 10.0, h: 0.25, fontFace: FONT, fontSize: 9.5, color: C.muted }
  );
  slide.addText(`Page ${num}`, {
    x: 11.5, y: 7.08, w: 1.2, h: 0.25, fontFace: FONT, fontSize: 9.5, color: C.muted, align: 'right',
  });
}

function addCard(slide, x, y, w, h, heading, bullets, opts = {}) {
  const bg = opts.fill || C.white;
  const headingColor = opts.headingColor || C.forest;
  const textColor = opts.textColor || C.ink;

  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: bg },
    line: { color: opts.border || C.border, width: 1 },
    rectRadius: 0.08,
  });

  if (opts.topBar) {
    slide.addShape(pres.ShapeType.rect, {
      x, y, w, h: 0.08,
      fill: { color: opts.topBar },
    });
  }

  let bodyY = y + 0.18;
  if (heading) {
    slide.addText(heading, {
      x: x + 0.22, y: y + 0.16, w: w - 0.44, h: 0.34,
      fontFace: FONT, fontSize: 14, bold: true, color: headingColor,
    });
    bodyY = y + 0.54;
  }

  if (Array.isArray(bullets)) {
    const runs = bullets.map((b) => ({
      text: b,
      options: { bullet: true, breakLine: true, fontFace: FONT, fontSize: opts.fontSize || 11.5, color: textColor },
    }));
    slide.addText(runs, {
      x: x + 0.22, y: bodyY, w: w - 0.44, h: h - (bodyY - y) - 0.15,
      valign: 'top', paraSpaceAfter: opts.paraSpace || 6,
    });
  } else if (typeof bullets === 'string') {
    slide.addText(bullets, {
      x: x + 0.22, y: bodyY, w: w - 0.44, h: h - (bodyY - y) - 0.15,
      fontFace: FONT, fontSize: opts.fontSize || 11.5, color: textColor, valign: 'top',
    });
  }
}

// =========================================================================
// SLIDE 1: COVER & LIVE PROTOTYPE LINKS
// =========================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.forest };

  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.28, h: 7.5, fill: { color: C.gold } });

  s.addText('BUSINESS & PRODUCT DECK  •  12-PAGER', {
    x: 0.85, y: 0.85, w: 9, h: 0.35,
    fontFace: FONT, fontSize: 12, bold: true, color: C.gold, charSpacing: 2.5,
  });

  s.addText('Plant-Based Leather\nD2C E-Commerce Platform', {
    x: 0.85, y: 1.3, w: 11.2, h: 1.75,
    fontFace: FONT, fontSize: 42, bold: true, color: C.white,
  });

  s.addText('Product Strategy, Market Research, Material Governance, Tech Architecture & Live MVP', {
    x: 0.85, y: 3.1, w: 11.0, h: 0.45,
    fontFace: FONT, fontSize: 16, color: 'D5DED9',
  });

  // Info Badges
  const meta = [
    ['PREPARED BY', 'Sujal Tonge'],
    ['WORKING DEMO TITLE', 'Verdant Hide (Pending Final Brand)'],
    ['MANDATED STACK', 'Next.js • Node/Express • MongoDB'],
    ['TARGET LAUNCH MARKET', 'India-First (INR)'],
  ];
  meta.forEach(([k, v], i) => {
    const bx = 0.85 + i * 2.95;
    s.addShape(pres.ShapeType.roundRect, {
      x: bx, y: 3.9, w: 2.75, h: 0.95,
      fill: { color: C.forestDark }, line: { color: '2B5749', width: 1 }, rectRadius: 0.08,
    });
    s.addText(k, { x: bx + 0.15, y: 4.02, w: 2.45, h: 0.25, fontFace: FONT, fontSize: 9, bold: true, color: C.gold });
    s.addText(v, { x: bx + 0.15, y: 4.3, w: 2.45, h: 0.45, fontFace: FONT, fontSize: 11.5, bold: true, color: C.white });
  });

  // Live Links Box
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.85, y: 5.2, w: 11.6, h: 1.65,
    fill: { color: C.white }, rectRadius: 0.1,
  });
  s.addText('LIVE DEPLOYED MVP LINKS (FOR TEAM & STAKEHOLDER REVIEW)', {
    x: 1.1, y: 5.34, w: 10.5, h: 0.3, fontFace: FONT, fontSize: 10.5, bold: true, color: C.forest,
  });
  s.addText(
    [
      { text: '• Live Storefront (Vercel):  ', options: { bold: true, color: C.ink, fontSize: 12 } },
      { text: 'https://verdant-hide.vercel.app\n', options: { color: '1155CC', underline: true, fontSize: 12, hyperlink: { url: 'https://verdant-hide.vercel.app' } } },
      { text: '• Live Backend API (Render):  ', options: { bold: true, color: C.ink, fontSize: 12 } },
      { text: 'https://verdant-hide.onrender.com/api/health\n', options: { color: '1155CC', underline: true, fontSize: 12, hyperlink: { url: 'https://verdant-hide.onrender.com/api/health' } } },
      { text: '• GitHub Repository:  ', options: { bold: true, color: C.ink, fontSize: 12 } },
      { text: 'https://github.com/Sujaltonge384/Verdant-Hide', options: { color: '1155CC', underline: true, fontSize: 12, hyperlink: { url: 'https://github.com/Sujaltonge384/Verdant-Hide' } } },
    ],
    { x: 1.1, y: 5.7, w: 11.1, h: 1.0, fontFace: FONT, paraSpaceAfter: 4 }
  );
}

// =========================================================================
// SLIDE 2: EXECUTIVE SUMMARY & BUSINESS MODEL
// =========================================================================
{
  const s = pres.addSlide();
  addChrome(
    s, 2, '01 / Executive Summary',
    'Business Vision & D2C Operating Model',
    'A design-led Indian D2C accessories brand pairing honest material disclosure with low-friction commerce.'
  );

  // Strategic Position Banner
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.65, y: 1.65, w: 12.05, h: 0.92,
    fill: { color: C.sage }, line: { color: C.forest, width: 1 }, rectRadius: 0.08,
  });
  s.addText('RECOMMENDED PRODUCT POSITION (TO VALIDATE)', {
    x: 0.88, y: 1.74, w: 11.5, h: 0.25, fontFace: FONT, fontSize: 10, bold: true, color: C.forest,
  });
  s.addText(
    'Design-led Indian D2C wallet, handbag & travel accessories brand that makes alternative-material composition crystal clear and pairs it with reliable checkout and after-sales care.',
    { x: 0.88, y: 2.02, w: 11.5, h: 0.45, fontFace: FONT, fontSize: 12, color: C.ink }
  );

  addCard(s, 0.65, 2.8, 5.85, 3.95, 'Proposed D2C Business Model', [
    'Single-brand, brand-owned Direct-to-Consumer storefront (no third-party marketplace sellers in Release 1).',
    'Brand owns storefront UX, pricing, product catalogue, customer relationships, and order fulfilment.',
    'Initial product focus: physical wallets, handbags, cardholders, backpacks, and travel accessories.',
    'India-first launch assumption (INR currency & Indian shipping/GST rules), pending owner sign-off.',
    'Core Business Goals: Drive direct sales, reduce pre-purchase doubt, streamline daily ops, and track funnel KPIs.',
  ], { topBar: C.forest, fontSize: 12, paraSpace: 8 });

  addCard(s, 6.85, 2.8, 5.85, 3.95, 'What Release 1 (MVP) Must Prove', [
    'Easy Discovery: Customers find bags/wallets effortlessly via category navigation, search, and filters.',
    'Informed Choice: Shoppers evaluate dimensions, device fit, images, material composition, care & delivery terms.',
    'Trustworthy Checkout: Customers place orders with server-calculated totals and verified payment status.',
    'Code-Free Operations: Internal staff manage SKUs, stock, orders & support tickets directly in Admin.',
    'Evidence-Backed Claims: Only supplier-verified material & sustainability statements go live.',
  ], { topBar: C.gold, fontSize: 12, paraSpace: 8 });
}

// =========================================================================
// SLIDE 3: CUSTOMER PROBLEMS & PROVISIONAL PERSONAS
// =========================================================================
{
  const s = pres.addSlide();
  addChrome(
    s, 3, '02 / Target Audience',
    'Customer Pain Points & Provisional Personas',
    'Solving the five biggest doubts that stop shoppers from buying alternative leather online.'
  );

  addCard(s, 0.65, 1.68, 5.2, 5.08, 'Top 5 Customer Problem Statements', [
    '"I cannot tell what \'plant-based leather\' means for the exact product I am viewing."',
    '"I cannot judge size, capacity, internal layout, or texture from 1 or 2 photos."',
    '"I do not know whether a bag will fit my laptop, phone, cards, or daily essentials."',
    '"I need clear shipping, return, repair, and care policies before trusting a new brand."',
    '"I want to compare products and materials without opening many separate tabs."',
  ], { topBar: C.forest, fontSize: 12.5, paraSpace: 12 });

  // 4 Personas Grid
  const personas = [
    ['Design-Conscious Everyday Buyer', 'Wants stylish wallets, slings & handbags for daily use.\nKey Need: True-to-life photos, durability & simple care.'],
    ['Material-Conscious Buyer', 'Avoids animal leather and wants real environmental clarity.\nKey Need: Exact feedstock, % plant content, lining & hardware info.'],
    ['Work & Travel Buyer', 'Buys laptop bags, backpacks, and weekenders.\nKey Need: Verified laptop fit, weight, compartments & delivery SLA.'],
    ['Gift Buyer', 'Purchases accessories for special occasions.\nKey Need: Predictable delivery, clean presentation & easy exchange.'],
  ];
  personas.forEach(([title, desc], idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const px = 6.15 + col * 3.35;
    const py = 1.68 + row * 2.15;
    addCard(s, px, py, 3.2, 2.0, title, desc, { topBar: C.gold, fontSize: 11 });
  });

  // Research note banner
  s.addShape(pres.ShapeType.roundRect, {
    x: 6.15, y: 6.0, w: 6.55, h: 0.76,
    fill: { color: C.amberBg }, line: { color: C.gold, width: 1 }, rectRadius: 0.08,
  });
  s.addText(
    'Validation Plan: Personas are working hypotheses—to be validated via 8–12 exploratory buyer interviews, a 30–50 user survey, and 5–7 clickable prototype tests.',
    { x: 6.32, y: 6.08, w: 6.2, h: 0.6, fontFace: FONT, fontSize: 10.5, color: C.ink, valign: 'middle' }
  );
}

// =========================================================================
// SLIDE 4: COMPETITOR BENCHMARKING
// =========================================================================
{
  const s = pres.addSlide();
  addChrome(
    s, 4, '03 / Market Landscape',
    'Competitor Benchmarking (India Snapshot)',
    'Dated observations from 22–23 Nov 2026 across Direct, Adjacent & Indirect brands—highlighting white-space gaps.'
  );

  const rows = [
    [
      { text: 'Brand & Role', options: { bold: true, fill: C.forest, color: C.white } },
      { text: 'Range & Snapshot Price', options: { bold: true, fill: C.forest, color: C.white } },
      { text: 'Visible Strength', options: { bold: true, fill: C.forest, color: C.white } },
      { text: 'Opportunity for Our Platform', options: { bold: true, fill: C.forest, color: C.white } },
    ],
    ['KAKTS (Direct)', 'Cactus bags/wallets\nTote ₹4,499 | Wallet ₹2,099', 'Explains cactus composite + backing', 'Complete end-to-end checkout from day one (theirs was disabled)'],
    ['Green Hermitage (Direct)', 'Apple/plant bags & wallets\n₹3,500 – ₹16,510', 'Filters, care, delivery & repair info', 'Deepen SKU-level material & stock transparency'],
    ['Sarjaa (Direct / Premium)', 'Apple, cactus, pineapple\n₹19,998 – ₹24,999', 'Strong storytelling & colour variants', 'Keep factual specs & aligned policy wording prominent'],
    ['Aulive (Adjacent)', 'Pineapple, coconut, cork\n₹3,200 – ₹5,790', 'Material-led collections & travel', 'Show live stock accurately; separate plant vs synthetic SKUs'],
    ['Studio Beej (Adjacent)', 'MIRUM, cork, Piñatex\n₹5,400 – ₹10,000', 'Honest FAQ (notes non-vegan SKUs)', 'Item-level disclosures & reliable inventory availability'],
    ['RebagCo (Adjacent)', 'Plant-leather wallets\n₹2,290 – ₹2,990', 'Quick-view, free shipping, 14-day return', 'Expand small-goods simplicity into full multi-category D2C'],
    ['Zouk (Indirect / Mass)', 'Mass-market vegan bags\n₹1,499 – ₹2,499', 'Strong filters, laptop fit, PIN check, COD', 'Adopt utility specs—never equate "vegan" with plant-based'],
  ];

  s.addTable(rows, {
    x: 0.65, y: 1.62, w: 12.05,
    colW: [2.35, 2.55, 3.15, 4.0],
    rowH: [0.42, 0.62, 0.62, 0.62, 0.62, 0.62, 0.62, 0.62],
    fontFace: FONT, fontSize: 10.5, color: C.ink, valign: 'middle',
    border: { type: 'solid', color: C.border, pt: 0.75 },
    autoPage: false,
  });

  s.addText(
    '*Note: Visible prices are single-day snapshots (22–23 Nov 2026) and must not be used to set retail prices without unit-economics validation.',
    { x: 0.65, y: 6.55, w: 12.05, h: 0.3, fontFace: FONT, fontSize: 10, italic: true, color: C.muted }
  );
}

// =========================================================================
// SLIDE 5: VALUE PROPOSITION — WHY WE WIN
// =========================================================================
{
  const s = pres.addSlide();
  addChrome(
    s, 5, '04 / Value Proposition',
    'Three Differentiators That Build Buyer Trust',
    'We do not compete merely by adding SKUs—we win on clarity, truthfulness, and post-purchase reliability.'
  );

  addCard(s, 0.65, 1.72, 3.8, 4.95, '1. High-Confidence Discovery', [
    'Interactive scroll-driven hero showcase & clean category taxonomy.',
    'Instant colour/variant switcher updating image, SKU, stock & price.',
    'Function-led PDPs: verified laptop fit, dimensions (W×H×D), weight & pockets.',
    'Multi-angle gallery (front, interior, scale & detail) with zoom & alt text.',
  ], { topBar: C.forest, fontSize: 12, paraSpace: 10 });

  addCard(s, 4.78, 1.72, 3.8, 4.95, '2. Verified Transparency', [
    'Dedicated K(NO)W Leathers hub explaining each botanical source.',
    'SKU-level composition breakdown: exterior, backing, coating, lining & hardware.',
    'Strict anti-greenwashing rule: zero unverified "%" or "biodegradable" claims.',
    'Clear care guidance & realistic durability expectations per material.',
  ], { topBar: C.gold, fontSize: 12, paraSpace: 10 });

  addCard(s, 8.9, 1.72, 3.8, 4.95, '3. Dependable Commerce', [
    'Real-time stock validation so out-of-stock variants cannot be ordered.',
    'Pre-checkout PIN serviceability, shipping cost & tax transparency.',
    'Server-verified payments (UPI/Cards/Netbanking + approved COD).',
    'Joined-up order tracking, returns, warranty/repair & grievance handling.',
  ], { topBar: C.forest, fontSize: 12, paraSpace: 10 });
}

// =========================================================================
// SLIDE 6: MATERIAL SCIENCE & ANTI-GREENWASHING GOVERNANCE
// =========================================================================
{
  const s = pres.addSlide();
  addChrome(
    s, 6, '05 / Material Governance',
    'Material Transparency & Anti-Greenwashing Rules',
    '"Vegan", "Plant-Based", "Plastic-Free", and "Biodegradable" are separate attributes—never synonyms.'
  );

  const matRows = [
    [
      { text: 'Material Family', options: { bold: true, fill: C.forest, color: C.white } },
      { text: 'Supplier / Source Reality (Observed)', options: { bold: true, fill: C.forest, color: C.white } },
      { text: 'Product-Data & Copy Rule for Our Storefront', options: { bold: true, fill: C.forest, color: C.white } },
    ],
    ['Cactus-Based (e.g., Desserto)', 'Prickly-pear pads combined with binder & textile backing; up to 90% bio-based.', 'Record exact supplier grade & backing. Never label "100% cactus" or "fully biodegradable".'],
    ['Pineapple Fibre (Piñatex)', 'Non-woven pineapple leaf textile; some collections use PU resin coating.', 'Store exact collection/grade & coating details; block blanket "biodegradable" claims.'],
    ['MIRUM (NFW)', 'Natural rubber, plant oils/waxes, natural pigments & minerals.', 'Display "plastic-free" only for verified supplier/product combinations with active TDS.'],
    ['Apple-Based Leather', 'Apple-processing waste exterior paired with hemp/lyocell lining & recycled zips.', 'Break down exterior, lining, coating, backing & hardware separately—never over-generalise.'],
  ];

  s.addTable(matRows, {
    x: 0.65, y: 1.68, w: 12.05,
    colW: [2.8, 4.3, 4.95],
    rowH: [0.42, 0.78, 0.78, 0.78, 0.78],
    fontFace: FONT, fontSize: 11, color: C.ink, valign: 'middle',
    border: { type: 'solid', color: C.border, pt: 0.75 },
  });

  // Governance lifecycle box
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.65, y: 5.5, w: 12.05, h: 1.25,
    fill: { color: C.sage }, line: { color: C.forest, width: 1 }, rectRadius: 0.08,
  });
  s.addText('MANDATORY EVIDENCE APPROVAL WORKFLOW (MAT-001 / MAT-002)', {
    x: 0.9, y: 5.62, w: 11.5, h: 0.28, fontFace: FONT, fontSize: 11, bold: true, color: C.forest,
  });
  s.addText(
    'Draft  →  Supplier Datasheet / Test Report Uploaded  →  Compliance Review  →  Approved  →  Published\n' +
    '• If a supplier changes material grade or a certificate expires, linked SKUs are automatically flagged and unverified claims are blocked from public display.',
    { x: 0.9, y: 5.94, w: 11.5, h: 0.72, fontFace: FONT, fontSize: 11.5, color: C.ink }
  );
}

// =========================================================================
// SLIDE 7: CUSTOMER EXPERIENCE & LIVE MVP WALKTHROUGH
// =========================================================================
{
  const s = pres.addSlide();
  addChrome(
    s, 7, '06 / Customer Journey',
    'End-to-End Customer Flow & Live MVP Features',
    'An 8-step purchase journey built and deployed in our working Next.js storefront.'
  );

  const steps = [
    ['1. Discover', 'Hero showcase & categories'],
    ['2. Narrow', 'Search, filter & sort'],
    ['3. Evaluate', 'PDP specs, variants & care'],
    ['4. Add to Cart', 'Stock check & subtotal'],
    ['5. Checkout', 'Contact, PIN & shipping'],
    ['6. Pay', 'Server-created session'],
    ['7. Confirm', 'Verified order ID'],
    ['8. After-Sales', 'Track, return & support'],
  ];

  steps.forEach(([st, sub], i) => {
    const sx = 0.65 + i * 1.52;
    s.addShape(pres.ShapeType.roundRect, {
      x: sx, y: 1.72, w: 1.42, h: 1.15,
      fill: { color: i % 2 === 0 ? C.forest : C.gold }, rectRadius: 0.08,
    });
    s.addText(st, { x: sx + 0.08, y: 1.84, w: 1.26, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: C.white, align: 'center' });
    s.addText(sub, { x: sx + 0.08, y: 2.18, w: 1.26, h: 0.58, fontFace: FONT, fontSize: 9.5, color: C.white, align: 'center', valign: 'top' });
  });

  addCard(s, 0.65, 3.15, 6.2, 3.6, 'What Is Already Live on Vercel (verdant-hide.vercel.app)', [
    'Animated Botanical Split-Curtain Preloader & SVG Brand Favicon.',
    'Dual-State Navbar: Frosted bar on Hero → Transparent adaptive bar in Showcase + Search & Mobile Drawer.',
    'Snap-Scroll 5-Product Diagonal Arc Showcase with 3 interactive colour swatches morphing background & details.',
    'Dedicated /collection (category tabs), /know-leathers (material science), /our-story, and /product/[slug].',
    'Full Auth (JWT + Initials Avatar), Persistent Cart & Wishlist, /profile (Saved Addresses), /checkout, /orders & /admin.',
  ], { topBar: C.forest, fontSize: 11.5, paraSpace: 7 });

  addCard(s, 7.1, 3.15, 5.6, 3.6, 'UX Enhancements Planned Before Launch', [
    'Multi-angle SKU image galleries (front, back, interior, laptop-fit scale, lifestyle) with zoom & keyboard support.',
    'URL-preserved multi-select filters (Price, Colour, Material, Availability) and Sort options.',
    'Guest Checkout toggle & live PIN code serviceability/shipping rate API lookup.',
    'Complete public Legal & Trust pages (Privacy, Terms, Shipping, Returns, Grievance Officer).',
    'Align styling tokens cleanly with team standards & run WCAG 2.2 AA audit.',
  ], { topBar: C.gold, fontSize: 11.5, paraSpace: 7 });
}

// =========================================================================
// SLIDE 8: ADMIN & OPERATIONS CONTROL CENTER
// =========================================================================
{
  const s = pres.addSlide();
  addChrome(
    s, 8, '07 / Internal Operations',
    'Admin Console, Inventory Ledger & Fulfilment',
    'Empowering catalogue, warehouse, support, and finance teams without developer intervention.'
  );

  addCard(s, 0.65, 1.7, 5.85, 2.4, 'Access Control & Governance (ADM-001 / ADM-020)', [
    'Separate staff authentication with server-side RBAC (Owner, Catalogue, Inventory, Operations, Support, Finance).',
    'Append-only Audit Trail recording who changed prices, stock, claims, refunds, or order status and when.',
  ], { topBar: C.forest, fontSize: 11.5, paraSpace: 8 });

  addCard(s, 6.85, 1.7, 5.85, 2.4, 'Catalogue & Publishing Gates (ADM-003)', [
    'Draft → Preview → Publish/Archive lifecycle; unique global SKUs.',
    'Hard validation: Cannot publish without active SKU, price, media, stock rule & approved material disclosure.',
    'Ordered SKUs are archived (never deleted) to protect historical orders.',
  ], { topBar: C.gold, fontSize: 11.5, paraSpace: 7 });

  addCard(s, 0.65, 4.35, 5.85, 2.4, 'Atomic Inventory Ledger (ADM-008 / OPS-002)', [
    'Available-to-Sell = On-Hand − Reserved − Quarantined.',
    'Atomic stock deduction prevents 2 buyers from buying the last unit.',
    'Incoming QC batches & customer returns require inspection before restock.',
  ], { topBar: C.gold, fontSize: 11.5, paraSpace: 8 });

  addCard(s, 6.85, 4.35, 5.85, 2.4, 'Order Fulfilment, Returns & Support (ADM-010–014)', [
    'Pick-pack checklist, courier tracking attachment & controlled order transitions.',
    'Separate Payment Status vs Fulfilment Status vs Refund Status.',
    'Support & Grievance ticket queue with SLA timers & internal-only notes.',
  ], { topBar: C.forest, fontSize: 11.5, paraSpace: 8 });
}

// =========================================================================
// SLIDE 9: TECHNICAL ARCHITECTURE & SECURITY
// =========================================================================
{
  const s = pres.addSlide();
  addChrome(
    s, 9, '08 / Technical Architecture',
    'Mandated Tech Stack, Data Flow & Security Controls',
    'Strict separation between Next.js UI, Express Business Logic/Auth, and MongoDB Persistence.'
  );

  // 3-Tier Horizontal Architecture Boxes
  const tiers = [
    ['1. Next.js Storefront & Admin', 'Hosted on Vercel', 'App Router, SSR/SEO, interactive animations, cart/checkout UI. Zero secrets in NEXT_PUBLIC vars.'],
    ['2. Node.js + Express REST API', 'Hosted on Render (/api/v1)', 'Zod validation, JWT/RBAC, server-side pricing in paise, rate limits, webhook verification.'],
    ['3. MongoDB Atlas Database', 'Mongoose ODM', 'Users, Products/Variants, MaterialProfiles, Orders (immutable snapshots), Inventory & Audit logs.'],
  ];
  tiers.forEach(([t, sub, desc], i) => {
    const tx = 0.65 + i * 4.15;
    s.addShape(pres.ShapeType.roundRect, {
      x: tx, y: 1.72, w: 3.75, h: 1.75,
      fill: { color: C.forest }, rectRadius: 0.08,
    });
    s.addText(t, { x: tx + 0.18, y: 1.85, w: 3.4, h: 0.3, fontFace: FONT, fontSize: 13, bold: true, color: C.white });
    s.addText(sub, { x: tx + 0.18, y: 2.15, w: 3.4, h: 0.25, fontFace: FONT, fontSize: 10.5, bold: true, color: C.gold });
    s.addText(desc, { x: tx + 0.18, y: 2.45, w: 3.4, h: 0.9, fontFace: FONT, fontSize: 10.5, color: 'E0E7E4' });

    if (i < 2) {
      s.addText('→', { x: tx + 3.75, y: 2.3, w: 0.4, h: 0.5, fontFace: FONT, fontSize: 22, bold: true, color: C.gold, align: 'center' });
    }
  });

  addCard(s, 0.65, 3.78, 5.85, 2.95, 'Server-Authoritative Commerce & Payment Safety', [
    'Client-submitted prices, discounts, and order totals are always ignored and recalculated on Express.',
    'Never store raw card numbers or CVVs; integrate via hosted/tokenised provider checkout.',
    'Payment success requires HMAC signature verification + idempotency keys (prevents duplicate orders).',
    'Order lines store immutable snapshots so later product edits never alter past invoices.',
  ], { topBar: C.gold, fontSize: 11.5, paraSpace: 7 });

  addCard(s, 6.85, 3.78, 5.85, 2.95, 'Application Security & Performance Targets', [
    'Salted bcrypt password hashing, strict auth rate limiting (20 req/15m), Helmet headers & CORS.',
    'Custom NoSQL injection sanitizer ($ / . key stripping) + 10KB JSON payload cap.',
    'Accessibility target: WCAG 2.2 AA (keyboard navigation, visible focus, semantic labels & contrast).',
    'Core Web Vitals targets: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on production hosting.',
  ], { topBar: C.forest, fontSize: 11.5, paraSpace: 7 });
}

// =========================================================================
// SLIDE 10: INDIA COMPLIANCE, RISKS & QA MATRIX
// =========================================================================
{
  const s = pres.addSlide();
  addChrome(
    s, 10, '09 / Governance & Quality',
    'India Legal Compliance, Key Risks & QA Readiness',
    'Built around Indian e-commerce regulations and a 16-scenario End-to-End QA Acceptance Matrix.'
  );

  addCard(s, 0.65, 1.7, 5.85, 5.05, 'India E-Commerce Compliance Checklist', [
    'Consumer Protection (E-Commerce) Rules, 2020: Publish legal entity name, address, support contact & Grievance Officer (48-hr ack / 1-month redressal design).',
    'CCPA Greenwashing Guidelines, 2024: Substantiate all botanical/eco claims with SKU-level supplier evidence.',
    'DPDP Act 2023 & Rules 2025: Minimise PII, unbundle marketing consent (no pre-ticked boxes) & handle deletion requests.',
    'Legal Metrology Rules: Display country of origin, net quantity & manufacturer/packer details where required.',
  ], { topBar: C.forest, fontSize: 11.5, paraSpace: 10 });

  addCard(s, 6.85, 1.7, 5.85, 2.45, 'Critical Launch Risks & Mitigations', [
    'Unsubstantiated Claims → Blocked by MAT-002 evidence approval gate.',
    'Stock Overselling → Atomic stock deduction + ledger reconciliation.',
    'Payment Callback Replay → Webhook signature + deduplicated event IDs.',
    'Unresolved Policies → Checkout blocked until legal/ops sign-off.',
  ], { topBar: C.gold, fontSize: 11.5, paraSpace: 6 });

  addCard(s, 6.85, 4.35, 5.85, 2.4, 'End-to-End QA Matrix (QA-01 to QA-16)', [
    '16 formal test scenarios covering discovery, variants, sold-out blocking, cart revalidation & PIN checks.',
    'Payment failure/timeout/duplicate webhook stress tests & concurrent final-unit checkout.',
    'RBAC denial tests, backup restoration drills & WCAG 2.2 AA accessibility sign-off.',
  ], { topBar: C.forest, fontSize: 11.5, paraSpace: 6 });
}

// =========================================================================
// SLIDE 11: RELEASE ROADMAP, SCOPE & KPIs
// =========================================================================
{
  const s = pres.addSlide();
  addChrome(
    s, 11, '10 / Delivery & Measurement',
    '5-Stage Release Gates, Scope & Funnel KPIs',
    'Phased launch governance to ensure operational, legal, and technical readiness before taking real orders.'
  );

  const gates = [
    ['Gate 0: Discovery', 'Sign off brand, SKUs, suppliers, prices & partners'],
    ['Gate 1: UX & Content', 'Approve wireframes, policies & 5–7 user tests'],
    ['Gate 2: MVP Build', 'Core app, API, DB & sandbox (Prototype Live ✓)'],
    ['Gate 3: QA & UAT', 'Pass QA-01..16, security, backups & ops training'],
    ['Gate 4: Go-Live', 'Live keys, domain/TLS, opening stock & monitoring'],
  ];
  gates.forEach(([g, d], i) => {
    const gx = 0.65 + i * 2.45;
    s.addShape(pres.ShapeType.roundRect, {
      x: gx, y: 1.7, w: 2.3, h: 1.25,
      fill: { color: i === 2 ? C.gold : C.forest }, rectRadius: 0.08,
    });
    s.addText(g, { x: gx + 0.12, y: 1.82, w: 2.06, h: 0.3, fontFace: FONT, fontSize: 11.5, bold: true, color: C.white });
    s.addText(d, { x: gx + 0.12, y: 2.18, w: 2.06, h: 0.68, fontFace: FONT, fontSize: 10, color: C.white });
  });

  addCard(s, 0.65, 3.22, 5.85, 3.55, 'Release 1 (MVP) vs. Phase 2 Roadmap', [
    'MVP (In Progress / Built): Storefront, Search/Filters, PDP + Material Transparency, Cart, Verified Checkout, Orders, Profile & Admin Operations.',
    'Phase 2 Candidates: Verified customer reviews with moderation, coupon/promo engine, gift wrap & corporate/bulk enquiries, self-service returns/repairs & loyalty.',
    'Out of Scope (Release 1): Multi-vendor marketplace, native mobile apps, international multi-currency shipping, AI styling try-on.',
  ], { topBar: C.forest, fontSize: 11.5, paraSpace: 9 });

  addCard(s, 6.85, 3.22, 5.85, 3.55, 'North-Star Funnel & Health Metrics', [
    'Discovery: Product-listing Click-Through Rate & Search Success Rate.',
    'Intent: Add-to-Cart Rate & Checkout-Start Rate.',
    'Conversion: Payment Success Rate, Purchase Conversion Rate & Average Order Value (AOV).',
    'Retention & Quality: Return/Defect Rate, Support Contact Rate & Repeat Purchase Rate.',
    '(Numerical targets to be set after baseline traffic & margin sign-off.)',
  ], { topBar: C.gold, fontSize: 11.5, paraSpace: 8 });
}

// =========================================================================
// SLIDE 12: OPEN DECISIONS & TEAMMATE HANDOFF PLAN
// =========================================================================
{
  const s = pres.addSlide();
  addChrome(
    s, 12, '11 / Next Steps & Sign-Off',
    '7 Go-Live Blockers & Immediate Teammate Handoff',
    'Clear ownership across business stakeholders and assigned engineering/design/QA teammates.'
  );

  addCard(s, 0.65, 1.7, 6.0, 5.05, '7 Business Decisions Blocking Live Checkout (OD-01–15)', [
    '1. Legal Seller Identity & Final Brand Name (confirm or replace "Verdant Hide").',
    '2. Confirmed MVP SKUs, Product Photography & Supplier Material Datasheets.',
    '3. Retail Prices, MRP, Discounts & GST/Tax Treatment per SKU.',
    '4. Stock Ownership & Fulfilment Model (in-house vs contract manufacturer).',
    '5. Approved Payment Gateway (e.g., Razorpay merchant KYC) & COD Rules.',
    '6. Courier Partner, PIN Serviceability Coverage & Shipping Charge Rules.',
    '7. Approved Return, Refund, Warranty/Repair Policies & Grievance Officer.',
  ], { topBar: C.gold, fontSize: 11.5, paraSpace: 8 });

  addCard(s, 6.9, 1.7, 5.8, 3.4, 'Assigned Teammate Action Plan (Next 7 Days)', [
    'Frontend Team: Audit mobile/tablet responsiveness, add multi-image PDP gallery, URL filters & legal policy pages; align styling with team standards.',
    'Backend & DB Team: Implement MaterialProfile & InventoryMovement ledger schemas, payment webhooks with idempotency, and OpenAPI docs.',
    'QA & Ops Team: Build test suite from QA-01..16, collect real SKU specs/datasheets, and close the 7 stakeholder decisions.',
  ], { topBar: C.forest, fontSize: 11.5, paraSpace: 8 });

  // Bottom quick links box
  s.addShape(pres.ShapeType.roundRect, {
    x: 6.9, y: 5.3, w: 5.8, h: 1.45,
    fill: { color: C.forest }, rectRadius: 0.08,
  });
  s.addText('PROJECT LINKS FOR TEAM ONBOARDING', {
    x: 7.12, y: 5.42, w: 5.4, h: 0.25, fontFace: FONT, fontSize: 10, bold: true, color: C.gold,
  });
  s.addText(
    [
      { text: 'Storefront: https://verdant-hide.vercel.app\n', options: { color: C.white, fontSize: 11, hyperlink: { url: 'https://verdant-hide.vercel.app' } } },
      { text: 'API Health: https://verdant-hide.onrender.com/api/health\n', options: { color: C.white, fontSize: 11, hyperlink: { url: 'https://verdant-hide.onrender.com/api/health' } } },
      { text: 'GitHub: https://github.com/Sujaltonge384/Verdant-Hide', options: { color: C.white, fontSize: 11, hyperlink: { url: 'https://github.com/Sujaltonge384/Verdant-Hide' } } },
    ],
    { x: 7.12, y: 5.74, w: 5.4, h: 0.9, fontFace: FONT, paraSpaceAfter: 4 }
  );
}

pres.writeFile({ fileName: 'Verdant_Hide_12_Pager_Deck.pptx' }).then((fileName) => {
  console.log(`✅ Created: ${fileName}`);
});