# Autodidact — Slide-by-Slide Build Guide
## Copy-paste this into Google Slides or Canva

**Design tips:**
- Dark background (dark navy or black) with white/green text
- Use a monospace font for code/terminal screenshots
- Keep slides minimal — 3-5 bullet points max per slide
- Use the Mermaid diagrams from the design doc as visuals (render at mermaid.live)

---

## Slide 1: Title
**Text:**
```
AUTODIDACT
The Local-First AI Agent That Actually Learns and Evolves

[Your Name]
Vietnam AI Stars 2026
```
**Visual:** Simple logo or brain icon. Clean, minimal.
**Speaker notes:** "Hi, I'm [name], and I'm building Autodidact."

---

## Slide 2: The Problem
**Title:** AI Agents Are Expensive and Forgetful
**Bullets:**
```
• Every query → cloud API call → $0.01–$0.10
• Same or similar question tomorrow? Same expensive call.
• 10,000 queries/day = $1,000–$3,000/month
• The agent never learns. Never remembers. Never improves.
```
**Visual:** Two-line chart — "Human: questions over time" (declining) vs "AI agent: cloud calls" (flat). Label the gap "wasted money."
**Speaker notes:** "No human works this way. A new employee asks questions at first, but they learn."

---

## Slide 3: The Insight
**Title:** Your Agent Has a Brain. It Just Doesn't Use It.
**Bullets:**
```
A local model on your machine can think and reason.
But most agents skip the brain and go straight to the cloud.

Humans work differently:
  → Think first
  → If uncertain, search or ask
  → Remember what you learned
```
**Visual:** Brain icon in center. Arrow to "memory." Arrow out to "search/ask" (only when uncertain). Arrow back labeled "learn."
**Speaker notes:** "Autodidact gives your local model this same workflow."

---

## Slide 4: Why Now
**Title:** The Window Is Open Now
**Bullets:**
```
• Local models just got good enough (Llama 3, Mistral, Phi-3)
• Cloud API costs are at peak ($5–$15 per million tokens)
• On-device AI is exploding (Ollama: 100K+ GitHub stars)
• Nobody has built the learning layer yet
```
**Footer:** "Two years ago, not possible. Two years from now, someone else will have built it."
**Visual:** Timeline arrow: 2023 → 2025 → 2026 (NOW) → 2027+
**Speaker notes:** "The infrastructure is ready. The pain is real. The gap is wide open."

---

## Slide 5: The Solution
**Title:** Think First. Ask When Uncertain. Always Learn.
**Three columns:**
```
THINK FIRST              ASK WHEN UNCERTAIN         ALWAYS LEARN
Local model checks       Searches internet or       Extracts knowledge
its memory first.        asks cloud model            from every answer.
If confident →           (GPT-4o, Claude).           Stores it locally.
answer immediately.      Just like you would.        Learning is permanent.
$0 cost.
```
**Visual:** Three icons in a row: Brain → Search/Cloud → Notebook/Database
**Speaker notes:** "Over time, the brain gets smarter. It asks less. It handles more on its own."

---

## Slide 6: How It Works
**Title:** The Learning Loop
**Content:** Terminal screenshot or diagram:
```
Query comes in
  → Brain thinks first, checks memory
  → CONFIDENT? → Answer locally ($0)
  → NOT CONFIDENT? → Ask cloud model
      → Extract knowledge from response
      → Store in local memory
      → Next time → answer locally
```
**Visual:** Flowchart or the Mermaid sequence diagram from the design doc (simplified)
**Speaker notes:** "Thompson Sampling learns which signals to trust. Ebbinghaus decay keeps memory fresh."

---

## Slide 7: Live Demo Results
**Title:** The Agent Learns in Real Time
**Content:** Screenshot of actual demo output showing:
```
Act 1: "Fintech regulations in Vietnam?"
  → ESCALATE  Score: 0.000  Cost: $0.0015  Latency: 21s
  → Learned 4 facts

Act 2: "What compliance does a Vietnamese payment app need?"
  → LOCAL     Score: 0.718  Cost: $0.0000  Latency: 3s
  → Answered from memory!

Interactive: "Capital of India?"
  → ESCALATE  Cost: $0.0015  Latency: 8s
  "What is the capital of India?"
  → LOCAL     Cost: $0.0000  Latency: 960ms ← 8x faster, free
```
**Visual:** Terminal screenshot from your actual demo run
**Speaker notes:** "The transition from ESCALATE to LOCAL is the learning moment. 960ms vs 8 seconds. Free vs paid."

---

## Slide 8: The Cost Curve
**Title:** The More It Learns, The Less It Costs
**Table:**
```
                Week 1    Month 1    Month 3
Local rate      20%       60%        85%+
Cloud cost      $800      $320       $120
Savings         —         $480       $680
```
**Big number:** Annual savings: ~$19,700 per agent deployment
**Visual:** Two-line chart — flat "traditional" line vs declining "Autodidact" curve
**Speaker notes:** "These are modeled estimates. We'll validate with real data in Phase 1."

---

## Slide 9: Technical Architecture
**Title:** One SQLite File. Any Model. Pure TypeScript.
**Bullets:**
```
• All knowledge persists in one portable .db file
• Works with any OpenAI-compatible model (Ollama, vLLM, OpenAI, Anthropic)
• Swap models without losing learned knowledge
• No external databases, no infrastructure
• Pluggable components via TypeScript interfaces
```
**Visual:** Simple architecture diagram: Agent → Memory → SQLite, with Cloud as external "teacher"
**Speaker notes:** "Everything the agent learned in the demo lives in a 200KB file."

---

## Slide 10: Market Opportunity
**Title:** Who Needs This
**Content:**
```
PRIMARY — Enterprise AI Teams
  Control cloud costs, agents that improve over time

SECONDARY — AI Startups
  Unit economics at scale, self-improving as competitive edge

TERTIARY — SMEs in Vietnam & SEA
  AI capabilities without $1K+/month API bills

EXPANSION — Personal AI Assistants
  Your own AI that learns your domain, on your hardware
```
**Business model:**
```
• Core SDK: open-source (MIT)
• Autodidact Cloud: managed knowledge stores, analytics (SaaS)
• Skill Marketplace: domain-specific skill packs (revenue share)
• Enterprise tier: SLAs, onboarding, custom integrations
```
**Speaker notes:** "Open-source drives adoption. Enterprise features capture value."

---

## Slide 11: Competitive Landscape
**Title:** Memory vs Learning
**Table:**
```
                    LangChain  CrewAI  AutoGen  Autodidact
Agent orchestration    ✅        ✅      ✅       ✅
Basic memory           ✅        ✅      ✅       ✅
Learns from usage      ❌        ❌      ❌       ✅
Measurable improvement ❌        ❌      ❌       ✅
Self-verification      ❌        ❌      ❌       ✅
Cost reduction         ❌        ❌      ❌       ✅
```
**Footer:** "Memory is remembering what was said. Learning is getting smarter from it."
**Speaker notes:** "We don't replace these frameworks. We add the learning layer they're missing."

---

## Slide 12: Traction & Status
**Title:** Where We Are
**Content:**
```
✅ Full technical spec (14 requirements, 41 correctness properties)
✅ Working prototype with live demo
✅ Learning loop proven: ESCALATE → learn → LOCAL
🔨 Core SDK implementation in progress
🎯 Open-source release by August 2026

Roadmap:
  Phase 2: Web search as escalation source
  Phase 3: Swarm learning across deployments
  Phase 4: Local model fine-tuning, personal AI mode
```
**Speaker notes:** "We have a working demo today. Full SDK by August."

---

## Slide 13: The Team
```
[Your Name] — [Role]
[Background, relevant experience]

[Team member 2 if applicable]
```
**Speaker notes:** Highlight Vietnamese connection, AI/ML experience.

---

## Slide 14: The Ask
**Title:** What We're Looking For
**Content:**
```
1. Mentorship on go-to-market in Southeast Asia
2. Connections to early adopter enterprises and startups
3. Investor introductions for pre-seed

Our commitment:
  • Open-source release by August finals
  • 10 design partners by Q4 2026
```
**Closing line:** "The future of AI agents isn't smarter models. It's agents that remember what they've learned."
**Speaker notes:** End strong. Pause. "That's Autodidact. Thank you."
