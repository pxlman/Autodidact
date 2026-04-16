import PptxGenJS from 'pptxgenjs';

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Autodidact Team';
pptx.title = 'Autodidact - Vietnam AI Stars 2026';

// Design tokens matching the screenshot style
const BG = '1A1A2E';       // dark charcoal
const CARD = '252540';      // dark card bg
const PURPLE = '6C5CE7';    // accent purple
const BLUE = '4A90D9';      // accent blue
const GREEN = '00D68F';     // success green
const RED = 'FF6B6B';       // warning red
const ORANGE = 'FFA502';    // accent orange
const WHITE = 'FFFFFF';
const LIGHT = 'E0E0E0';     // body text
const GRAY = '9999AA';      // subtitle/dim
const DARKGRAY = '666680';

// Helper: add a rounded card
function card(slide, x, y, w, h, opts = {}) {
    slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w, h,
        fill: { color: opts.fill || CARD },
        line: opts.border ? { color: opts.border, width: 1.5 } : { type: 'none' },
        rectRadius: 0.15,
        shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.3 },
    });
}

// Helper: badge in top-right
function badge(slide, text, color = PURPLE) {
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 9.8, y: 0.3, w: 2.8, h: 0.45,
        fill: { color },
        rectRadius: 0.2,
    });
    slide.addText(text, { x: 9.8, y: 0.3, w: 2.8, h: 0.45, fontSize: 12, color: WHITE, bold: true, align: 'center', valign: 'middle' });
}

// Helper: card header with icon
function cardHeader(slide, x, y, w, icon, text, color = PURPLE) {
    slide.addShape(pptx.ShapeType.ellipse, { x: x + 0.2, y: y + 0.2, w: 0.35, h: 0.35, fill: { color } });
    slide.addText(icon, { x: x + 0.2, y: y + 0.18, w: 0.35, h: 0.35, fontSize: 12, align: 'center', valign: 'middle', color: WHITE });
    slide.addText(text, { x: x + 0.65, y: y + 0.15, w: w - 0.85, h: 0.4, fontSize: 16, color: WHITE, bold: true });
}

// Helper: bullet list inside card
function cardBullets(slide, x, y, w, items, opts = {}) {
    const textItems = items.map(item => {
        const t = typeof item === 'string' ? item : item.text;
        const c = typeof item === 'string' ? LIGHT : (item.color || LIGHT);
        const b = typeof item === 'string' ? false : (item.bold || false);
        return { text: `  ${t}`, options: { fontSize: opts.fontSize || 13, color: c, bold: b, bullet: { code: '203A', color: PURPLE }, paraSpaceAfter: 4 } };
    });
    slide.addText(textItems, { x, y, w, h: opts.h || 2.5, valign: 'top' });
}

function slideBg(slide) {
    slide.background = { color: BG };
}

function slideTitle(slide, title, subtitle) {
    slide.addText(title, { x: 0.6, y: 0.3, w: 8, h: 0.6, fontSize: 30, color: WHITE, bold: true });
    if (subtitle) {
        slide.addText(subtitle, { x: 0.6, y: 0.85, w: 8, h: 0.4, fontSize: 14, color: GRAY });
    }
}

// ═══════════════════════════════════════════════
// SLIDE 1: Title
// ═══════════════════════════════════════════════
let s = pptx.addSlide();
slideBg(s);
badge(s, '⭐ Vietnam AI Stars 2026', PURPLE);
s.addText('Autodidact', { x: 0, y: 1.8, w: '100%', fontSize: 56, color: WHITE, bold: true, align: 'center' });

s.addText([
    { text: 'The ', options: { fontSize: 22, color: GRAY } },
    { text: 'Local-First AI Agent', options: { fontSize: 22, color: PURPLE, bold: true } },
    { text: ' That Actually Learns and Evolves', options: { fontSize: 22, color: GRAY } },
], { x: 0, y: 2.7, w: '100%', align: 'center' });
s.addText('Think first. Ask when uncertain. Always learn.', { x: 0, y: 3.3, w: '100%', fontSize: 14, color: DARKGRAY, align: 'center', fontFace: 'Courier New' });

// Feature pills
const pills = [
    { icon: '🧠', text: 'Local Model Intelligence', color: PURPLE },
    { icon: '💾', text: 'Persistent Memory', color: BLUE },
    { icon: '🔄', text: 'Continuous Learning', color: GREEN },
    { icon: '💰', text: 'Cost Optimization', color: ORANGE },
];
pills.forEach((p, i) => {
    const px = 1.2 + i * 2.9;
    s.addShape(pptx.ShapeType.roundRect, { x: px, y: 4.3, w: 2.6, h: 0.55, fill: { color: CARD }, rectRadius: 0.25, line: { color: '333355', width: 1 } });
    s.addText(`${p.icon}  ${p.text}`, { x: px, y: 4.3, w: 2.6, h: 0.55, fontSize: 11, color: LIGHT, align: 'center', valign: 'middle' });
});

s.addText('TEAM', { x: 0.6, y: 5.8, w: 2, fontSize: 10, color: DARKGRAY, bold: true });
s.addText('[Your name(s)]', { x: 0.6, y: 6.05, w: 4, fontSize: 14, color: LIGHT });

// ═══════════════════════════════════════════════
// SLIDE 2: The Problem
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
slideTitle(s, 'The Problem', 'AI agents are expensive and forgetful. They never learn.');
badge(s, '⚠ Cost Analysis', ORANGE);

// Left column: Cloud API Costs card
card(s, 0.5, 1.4, 5.5, 2.6);
cardHeader(s, 0.5, 1.4, 5.5, '⚠', 'Cloud API Costs', ORANGE);
cardBullets(s, 0.7, 2.0, 5.0, [
    { text: 'Every query hits a cloud API — GPT-4o, Claude — $0.01–$0.10 / call', color: LIGHT },
    { text: 'Agents never learn — ask the same thing tomorrow?  Same cost', color: RED },
    { text: 'Scaling creates a permanent $1k–$3k/mo baseline cost', color: LIGHT },
]);

// Left column: Learning Gap card
card(s, 0.5, 4.2, 5.5, 1.5);
cardHeader(s, 0.5, 4.2, 5.5, '🔴', 'The Learning Gap', RED);
cardBullets(s, 0.7, 4.8, 5.0, [
    { text: 'Humans ask questions at first, but they eventually learn', color: LIGHT },
    { text: 'They stop asking the same things. AI agents don\'t.', color: RED },
], { h: 1.0 });

// Right column: placeholder for chart description
card(s, 6.3, 1.4, 6.2, 2.6);
cardHeader(s, 6.3, 1.4, 6.2, '📊', 'Cost: Human vs Static AI Agent', BLUE);
s.addText('Human (Learning Curve): Costs decline over time\nas employee learns and becomes autonomous\n\nStandard AI (Flat Cost): Every query = same price\nNo learning, no improvement, no memory', { x: 6.6, y: 2.1, w: 5.6, fontSize: 12, color: GRAY });

// Bottom stat boxes
card(s, 0.5, 6.0, 3.0, 0.8);
s.addText('$24,000', { x: 0.5, y: 5.95, w: 3.0, h: 0.45, fontSize: 24, color: RED, bold: true, align: 'center' });
s.addText('Annual Baseline (Static Cost)', { x: 0.5, y: 6.35, w: 3.0, h: 0.3, fontSize: 10, color: GRAY, align: 'center' });

card(s, 3.8, 6.0, 3.0, 0.8);
s.addText('$4,320', { x: 3.8, y: 5.95, w: 3.0, h: 0.45, fontSize: 24, color: GREEN, bold: true, align: 'center' });
s.addText('With Autodidact', { x: 3.8, y: 6.35, w: 3.0, h: 0.3, fontSize: 10, color: GRAY, align: 'center' });

card(s, 7.1, 6.0, 3.0, 0.8);
s.addText('82% Savings', { x: 7.1, y: 5.95, w: 3.0, h: 0.45, fontSize: 24, color: GREEN, bold: true, align: 'center' });
s.addText('~$19,700/year saved', { x: 7.1, y: 6.35, w: 3.0, h: 0.3, fontSize: 10, color: GRAY, align: 'center' });

// ═══════════════════════════════════════════════
// SLIDE 3: The Insight
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
slideTitle(s, 'The Insight', 'Your agent has a brain. It just doesn\'t use it yet.');
badge(s, '🧠 Brain-First Workflow', PURPLE);

// Left: The Realization card
card(s, 0.5, 1.4, 5.5, 2.2);
cardHeader(s, 0.5, 1.4, 5.5, '💡', 'The Realization', PURPLE);
s.addText('A local model running on your machine is like a human brain — it can think, reason, and respond. But most agents skip the brain entirely and go straight to the cloud for every question.', { x: 0.8, y: 2.0, w: 4.9, fontSize: 13, color: LIGHT });

// Left: Human-Like Workflow card
card(s, 0.5, 3.8, 5.5, 2.5);
cardHeader(s, 0.5, 3.8, 5.5, '🔄', 'Human-Like Workflow', PURPLE);
s.addText([
    { text: '✅ Think first: ', options: { fontSize: 13, color: GREEN, bold: true } },
    { text: 'Check if you know the answer from memory\n\n', options: { fontSize: 13, color: LIGHT } },
    { text: '🔍 Ask when uncertain: ', options: { fontSize: 13, color: ORANGE, bold: true } },
    { text: 'Search or ask for help only when needed\n\n', options: { fontSize: 13, color: LIGHT } },
    { text: '📚 Always learn: ', options: { fontSize: 13, color: BLUE, bold: true } },
    { text: 'Remember what you learned for next time', options: { fontSize: 13, color: LIGHT } },
], { x: 0.8, y: 4.4, w: 4.9, h: 1.8, valign: 'top' });

// Right: Learning Loop diagram
card(s, 6.3, 1.4, 6.2, 4.9);
cardHeader(s, 6.3, 1.4, 6.2, '🔄', 'Autodidact Brain-First Learning Loop', BLUE);

// Diagram boxes
const diagramBoxes = [
    { x: 7.0, y: 2.3, w: 2.2, h: 0.8, label: '📚 Memory Store', sub: 'Knowledge & Skills\nSQLite database', color: PURPLE },
    { x: 10.0, y: 2.3, w: 2.2, h: 0.8, label: '☁️ Cloud/Search', sub: 'GPT-4o, Claude\nWeb Search', color: ORANGE },
    { x: 8.5, y: 4.5, w: 2.2, h: 0.8, label: '🔄 Learn & Store', sub: 'Extract knowledge\nfrom answers', color: GREEN },
];
diagramBoxes.forEach(b => {
    s.addShape(pptx.ShapeType.roundRect, { x: b.x, y: b.y, w: b.w, h: b.h, fill: { color: '2A2A4A' }, line: { color: b.color, width: 1.5 }, rectRadius: 0.1 });
    s.addText(b.label, { x: b.x, y: b.y, w: b.w, h: 0.35, fontSize: 11, color: WHITE, bold: true, align: 'center', valign: 'middle' });
    s.addText(b.sub, { x: b.x, y: b.y + 0.35, w: b.w, h: 0.4, fontSize: 9, color: GRAY, align: 'center', valign: 'top' });
});

// Arrows as text
s.addText('1. Check memory', { x: 7.2, y: 2.0, w: 2, fontSize: 9, color: GRAY });
s.addText('2. Escalate if uncertain', { x: 10.2, y: 2.0, w: 2, fontSize: 9, color: GRAY });
s.addText('3. Learn from answer', { x: 8.7, y: 4.2, w: 2, fontSize: 9, color: GRAY });

// Local Model box
s.addShape(pptx.ShapeType.ellipse, { x: 9.2, y: 5.5, w: 1.5, h: 0.7, fill: { color: PURPLE } });
s.addText('🧠 Local\nModel', { x: 9.2, y: 5.5, w: 1.5, h: 0.7, fontSize: 10, color: WHITE, bold: true, align: 'center', valign: 'middle' });


// ═══════════════════════════════════════════════
// SLIDE 4: Why Now
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
slideTitle(s, 'Why Now', 'The window is open — and it won\'t stay open long.');
badge(s, '⏰ Market Timing', ORANGE);

const whyCards = [
    { icon: '🧠', title: 'Local Models Ready', body: 'Llama 3, Mistral, Phi-3 can genuinely reason. Two years ago, too weak.', color: GREEN },
    { icon: '💰', title: 'Cloud Costs at Peak', body: '$5–$15 per million tokens. Enterprises actively seeking alternatives.', color: RED },
    { icon: '📱', title: 'On-Device AI Exploding', body: 'Ollama: 100K+ GitHub stars. Apple Intelligence on-device. Infrastructure ready.', color: BLUE },
    { icon: '🎯', title: 'Gap Wide Open', body: 'Frameworks help build agents. None make them learn and improve over time.', color: PURPLE },
];
whyCards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.5 + col * 6.3;
    const cy = 1.4 + row * 2.3;
    card(s, cx, cy, 5.9, 2.0);
    cardHeader(s, cx, cy, 5.9, c.icon, c.title, c.color);
    s.addText(c.body, { x: cx + 0.3, y: cy + 0.65, w: 5.3, fontSize: 13, color: LIGHT });
});

s.addText('Two years ago, not possible. Two years from now, someone else will have built it.', { x: 0.6, y: 6.2, w: '90%', fontSize: 13, color: DARKGRAY, italic: true });

// ═══════════════════════════════════════════════
// SLIDE 5: Solution
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
slideTitle(s, 'The Solution', 'Think first. Ask when uncertain. Always learn.');
badge(s, '🚀 Core Architecture', PURPLE);

const solCards = [
    { icon: '🟢', title: 'Think First', body: 'Local model checks its memory.\nIf confident → answer immediately.\nCost: $0', color: GREEN, border: GREEN },
    { icon: '🔴', title: 'Ask When Uncertain', body: 'Searches internet or asks cloud\nmodel (GPT-4o, Claude).\nJust like a person would.', color: ORANGE, border: ORANGE },
    { icon: '📚', title: 'Always Learn', body: 'Extracts knowledge from every\nanswer. Stores it locally.\nLearning is permanent.', color: BLUE, border: BLUE },
];
solCards.forEach((c, i) => {
    const cx = 0.5 + i * 4.1;
    card(s, cx, 1.4, 3.8, 3.0, { border: c.border });
    cardHeader(s, cx, 1.4, 3.8, c.icon, c.title, c.color);
    s.addText(c.body, { x: cx + 0.3, y: 2.1, w: 3.2, fontSize: 13, color: LIGHT });
});

card(s, 0.5, 4.7, 12.0, 1.2);
s.addText('Over time, the brain gets smarter. It asks less. It handles more on its own. Cloud costs drop. Privacy improves naturally.', { x: 0.8, y: 4.8, w: 11.4, fontSize: 16, color: WHITE, bold: true, valign: 'middle' });

// ═══════════════════════════════════════════════
// SLIDE 6: How It Works
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
slideTitle(s, 'How It Works', 'The learning loop in detail.');
badge(s, '⚙️ Technical', BLUE);

card(s, 0.5, 1.4, 12.0, 3.5);
s.addText(
    'Query comes in\n' +
    '  → 🧠 Brain thinks first, checks memory & skills\n' +
    '  → Confidence Evaluator decides:\n' +
    '      → 🟢 CONFIDENT: Answer from brain + memory ($0)\n' +
    '      → 🔴 NOT CONFIDENT: Ask cloud model or search web\n' +
    '            → Extract knowledge & skills from response\n' +
    '            → Store in local memory (SQLite)\n' +
    '            → Next time → answer locally',
    { x: 0.8, y: 1.5, w: 11.4, h: 3.2, fontSize: 15, fontFace: 'Courier New', color: LIGHT, valign: 'top' }
);

const techCards = [
    { title: 'Thompson Sampling', body: 'Agent learns which signals to trust. No manual tuning needed.', color: PURPLE },
    { title: 'Ebbinghaus Decay', body: 'Frequently-used knowledge sticks. Stale knowledge fades naturally.', color: BLUE },
    { title: 'Cost-Aware Routing', body: 'When escalating, tries cheapest model first. Failover on error.', color: GREEN },
];
techCards.forEach((c, i) => {
    const cx = 0.5 + i * 4.1;
    card(s, cx, 5.2, 3.8, 1.3);
    s.addText(c.title, { x: cx + 0.2, y: 5.25, w: 3.4, fontSize: 14, color: c.color, bold: true });
    s.addText(c.body, { x: cx + 0.2, y: 5.6, w: 3.4, fontSize: 11, color: GRAY });
});

// ═══════════════════════════════════════════════
// SLIDE 7: Live Demo
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
slideTitle(s, 'Live Demo Results', 'The agent learns in real time.');
badge(s, '🎬 Demo', GREEN);

// Escalate card
card(s, 0.5, 1.4, 5.8, 3.0, { border: RED });
cardHeader(s, 0.5, 1.4, 5.8, '🔴', 'Act 1: Empty Brain', RED);
s.addText('"Fintech regulations in Vietnam?"', { x: 0.8, y: 2.1, w: 5.2, fontSize: 12, color: GRAY, italic: true });
s.addText([
    { text: 'ESCALATE', options: { fontSize: 14, color: RED, bold: true } },
    { text: ' — Score: 0.000\n', options: { fontSize: 13, color: LIGHT } },
    { text: 'Cost: $0.0015 · Latency: 21s\n\n', options: { fontSize: 13, color: LIGHT } },
    { text: '→ Learned 4 facts', options: { fontSize: 13, color: BLUE, bold: true } },
], { x: 0.8, y: 2.6, w: 5.2, h: 1.5, valign: 'top' });

// Local card
card(s, 6.7, 1.4, 5.8, 3.0, { border: GREEN });
cardHeader(s, 6.7, 1.4, 5.8, '🟢', 'Act 2: Brain Remembers', GREEN);
s.addText('"Vietnamese payment app compliance?"', { x: 7.0, y: 2.1, w: 5.2, fontSize: 12, color: GRAY, italic: true });
s.addText([
    { text: 'LOCAL', options: { fontSize: 14, color: GREEN, bold: true } },
    { text: ' — Score: 0.718\n', options: { fontSize: 13, color: LIGHT } },
    { text: 'Cost: $0.0000 · Latency: 3s\n\n', options: { fontSize: 13, color: LIGHT } },
    { text: '→ Answered from memory!', options: { fontSize: 13, color: GREEN, bold: true } },
], { x: 7.0, y: 2.6, w: 5.2, h: 1.5, valign: 'top' });

// Stats row
card(s, 0.5, 4.7, 3.8, 1.0);
s.addText('71.4%', { x: 0.5, y: 4.7, w: 3.8, h: 0.55, fontSize: 28, color: GREEN, bold: true, align: 'center' });
s.addText('Local Resolution', { x: 0.5, y: 5.2, w: 3.8, h: 0.3, fontSize: 11, color: GRAY, align: 'center' });

card(s, 4.6, 4.7, 3.8, 1.0);
s.addText('15', { x: 4.6, y: 4.7, w: 3.8, h: 0.55, fontSize: 28, color: BLUE, bold: true, align: 'center' });
s.addText('Knowledge Entries', { x: 4.6, y: 5.2, w: 3.8, h: 0.3, fontSize: 11, color: GRAY, align: 'center' });

card(s, 8.7, 4.7, 3.8, 1.0);
s.addText('$0.03', { x: 8.7, y: 4.7, w: 3.8, h: 0.55, fontSize: 28, color: GREEN, bold: true, align: 'center' });
s.addText('Cost Avoided', { x: 8.7, y: 5.2, w: 3.8, h: 0.3, fontSize: 11, color: GRAY, align: 'center' });

// ═══════════════════════════════════════════════
// SLIDE 8: Architecture
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
slideTitle(s, 'Technical Architecture', 'One SQLite file. Any model. Pure TypeScript.');
badge(s, '🏗️ Architecture', BLUE);

const archCards = [
    { icon: '💾', title: 'Single SQLite File', body: 'All knowledge persists in one portable .db file — the agent\'s brain. Backupable, inspectable.', color: PURPLE },
    { icon: '🔌', title: 'Model Agnostic', body: 'Works with any OpenAI-compatible model — Ollama, vLLM, OpenAI, Anthropic. Swap anytime.', color: BLUE },
    { icon: '🧩', title: 'Pluggable Components', body: 'TypeScript interfaces for every component. Swap implementations without touching internals.', color: GREEN },
    { icon: '📦', title: 'Zero Infrastructure', body: 'No external databases. No servers. No Docker. Just npm install and go.', color: ORANGE },
];
archCards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.5 + col * 6.3;
    const cy = 1.4 + row * 2.3;
    card(s, cx, cy, 5.9, 2.0);
    cardHeader(s, cx, cy, 5.9, c.icon, c.title, c.color);
    s.addText(c.body, { x: cx + 0.3, y: cy + 0.65, w: 5.3, fontSize: 13, color: LIGHT });
});

// ═══════════════════════════════════════════════
// SLIDE 9: Market
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
slideTitle(s, 'Market Opportunity', 'Who needs this — and how we monetize.');
badge(s, '📈 Market', GREEN);

const mktCards = [
    { icon: '🏢', title: 'Enterprise AI', body: 'Control cloud costs at scale\nAgents that improve over time\nLess data to cloud as agent learns', color: GREEN },
    { icon: '🚀', title: 'AI Startups', body: 'Unit economics at scale\nSelf-improving as competitive edge\nOpen-source SDK adoption', color: BLUE },
    { icon: '🏪', title: 'SMEs in Vietnam & SEA', body: 'AI capabilities without\n$1K+/month API bills\nAccessible AI for emerging markets', color: ORANGE },
    { icon: '👤', title: 'Personal AI (Expansion)', body: 'Your own AI on your hardware\nLearns your domain & workflow\nA second brain that grows daily', color: PURPLE },
];
mktCards.forEach((c, i) => {
    const cx = 0.3 + i * 3.15;
    card(s, cx, 1.4, 2.9, 3.0);
    cardHeader(s, cx, 1.4, 2.9, c.icon, c.title, c.color);
    s.addText(c.body, { x: cx + 0.2, y: 2.1, w: 2.5, fontSize: 11, color: LIGHT });
});

// Business model row
card(s, 0.5, 4.7, 3.8, 1.5);
s.addText('Open Source SDK', { x: 0.5, y: 4.8, w: 3.8, fontSize: 14, color: GREEN, bold: true, align: 'center' });
s.addText('Core framework — MIT\nDrive adoption, build community', { x: 0.7, y: 5.15, w: 3.4, fontSize: 11, color: GRAY, align: 'center' });

card(s, 4.6, 4.7, 3.8, 1.5);
s.addText('Autodidact Cloud', { x: 4.6, y: 4.8, w: 3.8, fontSize: 14, color: BLUE, bold: true, align: 'center' });
s.addText('Managed knowledge stores\nTeam sharing & analytics — SaaS', { x: 4.8, y: 5.15, w: 3.4, fontSize: 11, color: GRAY, align: 'center' });

card(s, 8.7, 4.7, 3.8, 1.5);
s.addText('Skill Marketplace', { x: 8.7, y: 4.8, w: 3.8, fontSize: 14, color: ORANGE, bold: true, align: 'center' });
s.addText('Domain-specific skill packs\n(Legal, Finance, Support)', { x: 8.9, y: 5.15, w: 3.4, fontSize: 11, color: GRAY, align: 'center' });

// ═══════════════════════════════════════════════
// SLIDE 10: Competition
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
slideTitle(s, 'Competitive Landscape', 'Memory is remembering. Learning is getting smarter.');
badge(s, '🏆 Differentiation', PURPLE);

const compRows = [
    [{ text: 'Feature', options: { fill: { color: '2A2A4A' }, color: PURPLE, bold: true, fontSize: 13 } }, { text: 'LangChain', options: { fill: { color: '2A2A4A' }, color: LIGHT, bold: true, fontSize: 13 } }, { text: 'CrewAI', options: { fill: { color: '2A2A4A' }, color: LIGHT, bold: true, fontSize: 13 } }, { text: 'AutoGen', options: { fill: { color: '2A2A4A' }, color: LIGHT, bold: true, fontSize: 13 } }, { text: 'Autodidact', options: { fill: { color: '2A2A4A' }, color: PURPLE, bold: true, fontSize: 13 } }],
    [{ text: 'Agent orchestration', options: { fontSize: 12 } }, { text: '✅', options: { align: 'center', fontSize: 14 } }, { text: '✅', options: { align: 'center', fontSize: 14 } }, { text: '✅', options: { align: 'center', fontSize: 14 } }, { text: '✅', options: { align: 'center', fontSize: 14 } }],
    [{ text: 'Basic memory', options: { fontSize: 12 } }, { text: '✅', options: { align: 'center', fontSize: 14 } }, { text: '✅', options: { align: 'center', fontSize: 14 } }, { text: '✅', options: { align: 'center', fontSize: 14 } }, { text: '✅', options: { align: 'center', fontSize: 14 } }],
    [{ text: 'Persistent long-term memory', options: { fontSize: 12 } }, { text: '⚠️', options: { align: 'center', fontSize: 14 } }, { text: '⚠️', options: { align: 'center', fontSize: 14 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '✅ Tiered', options: { align: 'center', fontSize: 12, color: GREEN, bold: true } }],
    [{ text: 'Learns from every interaction', options: { fontSize: 12 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '✅', options: { align: 'center', fontSize: 14, color: GREEN } }],
    [{ text: 'Measurable improvement', options: { fontSize: 12 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '✅', options: { align: 'center', fontSize: 14, color: GREEN } }],
    [{ text: 'Self-verification', options: { fontSize: 12 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '✅', options: { align: 'center', fontSize: 14, color: GREEN } }],
    [{ text: 'Cost reduction over time', options: { fontSize: 12 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '❌', options: { align: 'center', fontSize: 14 } }, { text: '✅', options: { align: 'center', fontSize: 14, color: GREEN } }],
];
s.addTable(compRows, { x: 0.5, y: 1.4, w: 12, color: LIGHT, border: { type: 'solid', pt: 1, color: '333355' }, rowH: 0.48, colW: [3.5, 2, 2, 2, 2.5] });

card(s, 0.5, 5.8, 12.0, 0.8);
s.addText('We don\'t replace these frameworks — we add the learning layer they\'re all missing. Autodidact can sit on top of them.', { x: 0.8, y: 5.85, w: 11.4, fontSize: 14, color: ORANGE, bold: true, valign: 'middle' });

// ═══════════════════════════════════════════════
// SLIDE 11: Traction
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
slideTitle(s, 'Traction & Roadmap', 'Where we are and where we\'re going.');
badge(s, '📍 Status', GREEN);

card(s, 0.5, 1.4, 5.8, 3.5);
cardHeader(s, 0.5, 1.4, 5.8, '✅', 'Current Status', GREEN);
s.addText([
    { text: '✅ ', options: { color: GREEN } }, { text: 'Full technical spec — 14 requirements, 41 properties\n\n', options: { color: LIGHT, fontSize: 13 } },
    { text: '✅ ', options: { color: GREEN } }, { text: 'Working prototype with live demo\n\n', options: { color: LIGHT, fontSize: 13 } },
    { text: '✅ ', options: { color: GREEN } }, { text: 'Learning loop proven: ESCALATE → learn → LOCAL\n\n', options: { color: LIGHT, fontSize: 13 } },
    { text: '🔨 ', options: {} }, { text: 'Core SDK implementation in progress\n\n', options: { color: GRAY, fontSize: 13 } },
    { text: '🎯 ', options: {} }, { text: 'Open-source release by August 2026', options: { color: GRAY, fontSize: 13 } },
], { x: 0.8, y: 2.1, w: 5.2, h: 2.5, valign: 'top' });

card(s, 6.7, 1.4, 5.8, 3.5);
cardHeader(s, 6.7, 1.4, 5.8, '🗺️', 'Roadmap', BLUE);
s.addText([
    { text: 'Phase 2: ', options: { color: BLUE, bold: true, fontSize: 13 } }, { text: 'Web search as escalation source\nSkill sharing marketplace\n\n', options: { color: LIGHT, fontSize: 13 } },
    { text: 'Phase 3: ', options: { color: PURPLE, bold: true, fontSize: 13 } }, { text: 'Swarm learning — agents share\nknowledge across deployments\n\n', options: { color: LIGHT, fontSize: 13 } },
    { text: 'Phase 4: ', options: { color: GREEN, bold: true, fontSize: 13 } }, { text: 'Local model fine-tuning from\naccumulated knowledge\nPersonal AI assistant mode', options: { color: LIGHT, fontSize: 13 } },
], { x: 7.0, y: 2.1, w: 5.2, h: 2.5, valign: 'top' });

// ═══════════════════════════════════════════════
// SLIDE 12: Team
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
slideTitle(s, 'The Team');
badge(s, '👥 Team', PURPLE);

card(s, 2.5, 2.0, 8.0, 3.0);
s.addText('[Your Name]', { x: 2.5, y: 2.3, w: 8.0, fontSize: 24, color: WHITE, bold: true, align: 'center' });
s.addText('[Role — e.g., Founder & CEO]', { x: 2.5, y: 2.9, w: 8.0, fontSize: 14, color: PURPLE, align: 'center' });
s.addText('[Background, relevant experience — AI/ML, open-source, Vietnamese connection]', { x: 3.0, y: 3.4, w: 7.0, fontSize: 13, color: GRAY, align: 'center' });

s.addText('[Team Member 2 — if applicable]', { x: 2.5, y: 4.1, w: 8.0, fontSize: 18, color: LIGHT, align: 'center' });
s.addText('[Role & Background]', { x: 2.5, y: 4.5, w: 8.0, fontSize: 13, color: GRAY, align: 'center' });

// ═══════════════════════════════════════════════
// SLIDE 13: The Ask
// ═══════════════════════════════════════════════
s = pptx.addSlide();
slideBg(s);
badge(s, '🤝 The Ask', PURPLE);

s.addText('What We\'re Looking For', { x: 0, y: 0.8, w: '100%', fontSize: 30, color: WHITE, bold: true, align: 'center' });

const askCards = [
    { icon: '🎓', title: 'Mentorship', body: 'Go-to-market strategy\nfor developer tools in SEA', color: PURPLE },
    { icon: '🤝', title: 'Connections', body: 'Early adopter enterprises\nand AI startups', color: BLUE },
    { icon: '💰', title: 'Investment', body: 'Pre-seed funding\nintroductions', color: GREEN },
];
askCards.forEach((c, i) => {
    const cx = 0.8 + i * 4.1;
    card(s, cx, 1.8, 3.6, 2.0);
    cardHeader(s, cx, 1.8, 3.6, c.icon, c.title, c.color);
    s.addText(c.body, { x: cx + 0.3, y: 2.5, w: 3.0, fontSize: 13, color: LIGHT });
});

card(s, 1.5, 4.3, 10.0, 1.8);
s.addText('"The future of AI agents isn\'t smarter models.\nIt\'s agents that remember what they\'ve learned."', { x: 1.5, y: 4.4, w: 10.0, fontSize: 18, color: PURPLE, align: 'center', italic: true });
s.addText('That\'s Autodidact.', { x: 1.5, y: 5.3, w: 10.0, fontSize: 28, color: GREEN, bold: true, align: 'center' });

// ═══════════════════════════════════════════════
// SAVE
// ═══════════════════════════════════════════════
await pptx.writeFile({ fileName: 'Autodidact-VietnamAIStars2026.pptx' });
console.log('✅ Generated: Autodidact-VietnamAIStars2026.pptx');
