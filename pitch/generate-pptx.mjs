import PptxGenJS from 'pptxgenjs';

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Autodidact Team';
pptx.title = 'Autodidact — Vietnam AI Stars 2026';

const BG = '0A0A1A';
const CYAN = '00D4FF';
const GREEN = '00FF88';
const ORANGE = 'FF9F43';
const RED = 'FF6B6B';
const WHITE = 'E0E0E0';
const DIM = '888888';
const DARK_BOX = '12122A';

function addTitle(slide, text, opts = {}) {
    slide.addText(text, { x: 0.8, y: 0.4, w: '90%', fontSize: 28, color: CYAN, bold: true, ...opts });
}

function addBullets(slide, items, opts = {}) {
    const textItems = items.map(item => {
        if (typeof item === 'string') return { text: `→  ${item}`, options: { fontSize: 18, color: WHITE, paraSpaceAfter: 8 } };
        return { text: `→  ${item.text}`, options: { fontSize: 18, color: item.color || WHITE, bold: item.bold || false, paraSpaceAfter: 8 } };
    });
    slide.addText(textItems, { x: 0.8, y: opts.y || 1.2, w: '85%', h: opts.h || 5, valign: 'top', ...opts });
}

// ── Slide 1: Title ──
let s = pptx.addSlide();
s.background = { color: BG };
s.addText('🧠 AUTODIDACT', { x: 0, y: 1.5, w: '100%', fontSize: 48, color: CYAN, bold: true, align: 'center' });
s.addText('The Local-First AI Agent That Actually Learns and Evolves', { x: 0, y: 2.5, w: '100%', fontSize: 22, color: CYAN, align: 'center' });
s.addText('Vietnam AI Stars 2026', { x: 0, y: 3.3, w: '100%', fontSize: 16, color: DIM, align: 'center' });
s.addText('[Your Name]', { x: 0, y: 4.0, w: '100%', fontSize: 16, color: '555555', align: 'center' });

// ── Slide 2: Problem ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'AI Agents Are Expensive and Forgetful');
addBullets(s, [
    { text: 'Every query hits a cloud API — GPT-4o, Claude — $0.01–$0.10 per call', color: WHITE },
    { text: 'Same question tomorrow? Same expensive call. The agent forgot everything.', color: RED },
    { text: '10,000 queries/day = $1,000–$3,000/month — never goes down', color: RED },
    { text: 'The agent never learns. Never remembers. Never improves.', color: RED },
]);
s.addText('No human works this way. A new employee asks questions at first, but they learn.', { x: 0.8, y: 5.5, w: '85%', fontSize: 18, color: GREEN });

// ── Slide 3: Insight ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'Your Agent Has a Brain. It Just Doesn\'t Use It.');
s.addText('A local model on your machine can think and reason.\nBut most agents skip the brain and go straight to the cloud.', { x: 0.8, y: 1.2, w: '85%', fontSize: 18, color: DIM });

const cols3 = [
    { title: '🧠 Think First', body: 'Check memory. If you know it, respond immediately.' },
    { title: '🔍 Ask When Uncertain', body: 'Search the internet or ask a colleague.' },
    { title: '📚 Remember', body: 'Store what you learned. Never ask the same question twice.' },
];
cols3.forEach((col, i) => {
    const x = 0.5 + i * 4.0;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 2.5, w: 3.6, h: 2.5, fill: { color: DARK_BOX }, line: { color: '333333', width: 1 }, rectRadius: 0.1 });
    s.addText(col.title, { x, y: 2.6, w: 3.6, fontSize: 16, color: ORANGE, bold: true, align: 'center' });
    s.addText(col.body, { x: x + 0.2, y: 3.2, w: 3.2, fontSize: 14, color: WHITE });
});
s.addText('Autodidact gives your local model this same workflow.', { x: 0.8, y: 5.5, w: '85%', fontSize: 18, color: CYAN });

// ── Slide 4: Why Now ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'The Window Is Open Now');
addBullets(s, [
    { text: 'Local models just got good enough — Llama 3, Mistral, Phi-3', color: GREEN },
    { text: 'Cloud API costs are at peak — $5–$15 per million tokens', color: GREEN },
    { text: 'On-device AI is exploding — Ollama: 100K+ GitHub stars', color: GREEN },
    { text: 'Nobody has built the learning layer yet', color: GREEN },
]);
s.addText('Two years ago, not possible. Two years from now, someone else will have built it.', { x: 0.8, y: 5.5, w: '85%', fontSize: 16, color: DIM, italic: true });

// ── Slide 5: Solution ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'Think First. Ask When Uncertain. Always Learn.');

const solCols = [
    { title: '🟢 THINK FIRST', body: 'Local model checks memory.\nIf confident → answer.\n\n$0 cost', color: GREEN },
    { title: '🔴 ASK WHEN UNCERTAIN', body: 'Searches internet or asks\ncloud model (GPT-4o, Claude).\nJust like a person.', color: ORANGE },
    { title: '📚 ALWAYS LEARN', body: 'Extracts knowledge from\nevery answer. Stores locally.\n\nLearning is permanent.', color: CYAN },
];
solCols.forEach((col, i) => {
    const x = 0.5 + i * 4.0;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.3, w: 3.6, h: 3.2, fill: { color: DARK_BOX }, line: { color: col.color, width: 2 }, rectRadius: 0.1 });
    s.addText(col.title, { x, y: 1.4, w: 3.6, fontSize: 16, color: col.color, bold: true, align: 'center' });
    s.addText(col.body, { x: x + 0.3, y: 2.1, w: 3.0, fontSize: 14, color: WHITE });
});
s.addText('Over time, the brain gets smarter. It asks less. It handles more on its own.', { x: 0.8, y: 5.0, w: '85%', fontSize: 18, color: WHITE });

// ── Slide 6: How It Works ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'The Learning Loop');
s.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 1.2, w: 12, h: 3.5, fill: { color: '0D0D20' }, line: { color: '333333', width: 1 }, rectRadius: 0.1 });
s.addText(
    'Query comes in\n' +
    '  → 🧠 Brain thinks first, checks memory\n' +
    '  → Confident?\n' +
    '      → 🟢 YES: Answer locally ($0)\n' +
    '      → 🔴 NO: Ask cloud model\n' +
    '            → Extract knowledge from response\n' +
    '            → Store in local memory\n' +
    '            → Next time → answer locally',
    { x: 0.8, y: 1.3, w: 11.5, h: 3.3, fontSize: 16, fontFace: 'Courier New', color: WHITE, valign: 'top' }
);
s.addText('Thompson Sampling — learns which signals to trust    |    Ebbinghaus Decay — stale knowledge fades naturally', { x: 0.8, y: 5.2, w: '85%', fontSize: 14, color: ORANGE });

// ── Slide 7: Demo Results ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'Live Demo: The Agent Learns in Real Time');

// Escalate box
s.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 1.2, w: 5.8, h: 3.5, fill: { color: DARK_BOX }, line: { color: RED, width: 2 }, rectRadius: 0.1 });
s.addText('🔴 Act 1: Empty Brain', { x: 0.5, y: 1.3, w: 5.8, fontSize: 18, color: RED, bold: true, align: 'center' });
s.addText('"Fintech regulations in Vietnam?"', { x: 0.8, y: 1.9, w: 5.2, fontSize: 14, color: DIM, italic: true });
s.addText('ESCALATE — Score: 0.000\nCost: $0.0015 · Latency: 21s\n\n→ Learned 4 facts', { x: 0.8, y: 2.5, w: 5.2, fontSize: 14, color: WHITE });

// Local box
s.addShape(pptx.ShapeType.roundRect, { x: 6.7, y: 1.2, w: 5.8, h: 3.5, fill: { color: DARK_BOX }, line: { color: GREEN, width: 2 }, rectRadius: 0.1 });
s.addText('🟢 Act 2: Brain Remembers', { x: 6.7, y: 1.3, w: 5.8, fontSize: 18, color: GREEN, bold: true, align: 'center' });
s.addText('"Vietnamese payment app compliance?"', { x: 7.0, y: 1.9, w: 5.2, fontSize: 14, color: DIM, italic: true });
s.addText('LOCAL — Score: 0.718\nCost: $0.0000 · Latency: 3s\n\n→ Answered from memory!', { x: 7.0, y: 2.5, w: 5.2, fontSize: 14, color: WHITE });

s.addText('After 14 queries: 71% local · 15 knowledge entries · $0.03 cost avoided', { x: 0, y: 5.2, w: '100%', fontSize: 18, color: GREEN, align: 'center' });

// ── Slide 8: Cost Curve ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'The More It Learns, The Less It Costs');

const tableRows = [
    [{ text: '', options: { fill: { color: '1A1A3A' } } }, { text: 'Week 1', options: { fill: { color: '1A1A3A' }, color: CYAN, bold: true } }, { text: 'Month 1', options: { fill: { color: '1A1A3A' }, color: CYAN, bold: true } }, { text: 'Month 3', options: { fill: { color: '1A1A3A' }, color: CYAN, bold: true } }],
    ['Local Rate', '20%', '60%', { text: '85%+', options: { color: GREEN, bold: true } }],
    ['Cloud Cost', { text: '$800', options: { color: RED } }, '$320', { text: '$120', options: { color: GREEN } }],
    ['Savings', '—', '$480', { text: '$680', options: { color: GREEN, bold: true } }],
];
s.addTable(tableRows, { x: 0.8, y: 1.2, w: 10, fontSize: 16, color: WHITE, border: { type: 'solid', pt: 1, color: '333333' }, rowH: 0.5 });

s.addText('~$19,700/year saved', { x: 0, y: 3.8, w: '100%', fontSize: 48, color: GREEN, bold: true, align: 'center' });
s.addText('per agent deployment', { x: 0, y: 4.7, w: '100%', fontSize: 16, color: DIM, align: 'center' });

// ── Slide 9: Architecture ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'One SQLite File. Any Model. Pure TypeScript.');
addBullets(s, [
    'All knowledge in one portable .db file — the agent\'s brain',
    'Any OpenAI-compatible model — Ollama, vLLM, OpenAI, Anthropic',
    'Swap models without losing learned knowledge',
    'No external databases, no infrastructure',
    'Pluggable components via TypeScript interfaces',
]);

// ── Slide 10: Market ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'Market Opportunity');

const mktCols = [
    { title: 'Enterprise AI', items: 'Control cloud costs\nAgents that improve\nLess data to cloud', color: GREEN },
    { title: 'AI Startups', items: 'Unit economics at scale\nSelf-improving edge', color: CYAN },
    { title: 'SMEs in SEA', items: 'AI without $1K+/mo bills', color: ORANGE },
    { title: 'Personal AI', items: 'Your own AI on hardware\nLearns your domain\nSecond brain', color: 'BB86FC' },
];
mktCols.forEach((col, i) => {
    const x = 0.3 + i * 3.1;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.2, w: 2.9, h: 3.0, fill: { color: DARK_BOX }, line: { color: col.color, width: 1 }, rectRadius: 0.1 });
    s.addText(col.title, { x, y: 1.3, w: 2.9, fontSize: 14, color: col.color, bold: true, align: 'center' });
    s.addText(col.items, { x: x + 0.2, y: 1.9, w: 2.5, fontSize: 12, color: WHITE });
});

// ── Slide 11: Business Model ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'Business Model');
const bizCols = [
    { title: 'Open Source SDK', body: 'Core framework — MIT\nDrive adoption', color: GREEN },
    { title: 'Autodidact Cloud', body: 'Managed knowledge stores\nTeam sharing & analytics\nSaaS subscription', color: CYAN },
    { title: 'Skill Marketplace', body: 'Domain skill packs\n(Legal, Finance, Support)\nRevenue share', color: ORANGE },
];
bizCols.forEach((col, i) => {
    const x = 0.5 + i * 4.0;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.2, w: 3.6, h: 2.8, fill: { color: DARK_BOX }, line: { color: col.color, width: 2 }, rectRadius: 0.1 });
    s.addText(col.title, { x, y: 1.3, w: 3.6, fontSize: 16, color: col.color, bold: true, align: 'center' });
    s.addText(col.body, { x: x + 0.3, y: 2.0, w: 3.0, fontSize: 14, color: WHITE });
});
s.addText('+ Enterprise tier: SLAs, onboarding, custom integrations', { x: 0.8, y: 4.5, w: '85%', fontSize: 16, color: DIM });

// ── Slide 12: Competition ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'Memory vs Learning');

const compRows = [
    [{ text: 'Feature', options: { fill: { color: '1A1A3A' }, color: CYAN, bold: true } }, { text: 'LangChain', options: { fill: { color: '1A1A3A' }, color: CYAN } }, { text: 'CrewAI', options: { fill: { color: '1A1A3A' }, color: CYAN } }, { text: 'AutoGen', options: { fill: { color: '1A1A3A' }, color: CYAN } }, { text: 'Autodidact', options: { fill: { color: '1A1A3A' }, color: CYAN, bold: true } }],
    ['Agent orchestration', '✅', '✅', '✅', '✅'],
    ['Basic memory', '✅', '✅', '✅', '✅'],
    ['Persistent memory', '⚠️', '⚠️', '❌', { text: '✅ Tiered', options: { color: GREEN } }],
    ['Learns from usage', '❌', '❌', '❌', { text: '✅', options: { color: GREEN } }],
    ['Measurable improvement', '❌', '❌', '❌', { text: '✅', options: { color: GREEN } }],
    ['Self-verification', '❌', '❌', '❌', { text: '✅', options: { color: GREEN } }],
    ['Cost reduction', '❌', '❌', '❌', { text: '✅', options: { color: GREEN } }],
];
s.addTable(compRows, { x: 0.5, y: 1.2, w: 12, fontSize: 14, color: WHITE, border: { type: 'solid', pt: 1, color: '333333' }, rowH: 0.42 });
s.addText('Memory is remembering what was said. Learning is getting smarter from it.', { x: 0.8, y: 5.2, w: '85%', fontSize: 16, color: ORANGE });

// ── Slide 13: Traction ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'Where We Are');
addBullets(s, [
    { text: '✅ Full technical spec — 14 requirements, 41 correctness properties', color: GREEN },
    { text: '✅ Working prototype with live demo', color: GREEN },
    { text: '✅ Learning loop proven: ESCALATE → learn → LOCAL', color: GREEN },
    '🔨 Core SDK implementation in progress',
    '🎯 Open-source release by August 2026',
]);
s.addText('Roadmap', { x: 0.8, y: 4.0, w: '85%', fontSize: 20, color: ORANGE, bold: true });
addBullets(s, [
    'Phase 2: Web search as escalation, skill marketplace',
    'Phase 3: Swarm learning across deployments',
    'Phase 4: Local model fine-tuning, personal AI mode',
], { y: 4.5, h: 2 });

// ── Slide 14: Team ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'The Team', { align: 'center', w: '100%', x: 0 });
s.addText('[Your Name] — [Role]', { x: 0, y: 2.5, w: '100%', fontSize: 24, color: WHITE, align: 'center' });
s.addText('[Background, relevant experience]', { x: 0, y: 3.1, w: '100%', fontSize: 16, color: DIM, align: 'center' });
s.addText('[Team Member 2] — [Role]', { x: 0, y: 4.0, w: '100%', fontSize: 24, color: WHITE, align: 'center' });
s.addText('[Background]', { x: 0, y: 4.6, w: '100%', fontSize: 16, color: DIM, align: 'center' });

// ── Slide 15: Ask ──
s = pptx.addSlide();
s.background = { color: BG };
addTitle(s, 'What We\'re Looking For', { align: 'center', w: '100%', x: 0 });
addBullets(s, [
    'Mentorship on go-to-market in Southeast Asia',
    'Connections to early adopter enterprises and startups',
    'Investor introductions for pre-seed',
], { y: 1.5, x: 2.5, w: 8 });
s.addText('"The future of AI agents isn\'t smarter models.\nIt\'s agents that remember what they\'ve learned."', { x: 0, y: 3.5, w: '100%', fontSize: 20, color: CYAN, align: 'center' });
s.addText('That\'s Autodidact.', { x: 0, y: 4.5, w: '100%', fontSize: 32, color: GREEN, bold: true, align: 'center' });

// ── Save ──
await pptx.writeFile({ fileName: 'Autodidact-VietnamAIStars2026.pptx' });
console.log('✅ Generated: Autodidact-VietnamAIStars2026.pptx');
