# Autodidact — Pitch Deck Outline
## Vietnam AI Stars 2026

**Target: 13 slides, 5-minute pitch**

---

## Slide 1: Title

**Autodidact** — The Local-First AI Agent That Actually Learns and Evolves

Team: [Your name(s)]
Vietnam AI Stars 2026

---

## Slide 2: The Problem

**AI agents are expensive and forgetful. They never learn.**

- Every query hits a cloud API — GPT-4o, Claude, Gemini — $0.01–$0.10 per call
- Agents never learn — ask the same or similar questions or tasks tomorrow? Same expensive call. The agent forgot everything.
- A team making 10,000 agent calls/day spends $1,000–$3,000/month — and that number never goes down
- No human works this way. A new employee asks questions at first, but they *learn*. They stop asking the same things. AI agents don't.

*Visual: Two lines — "Human employee: questions asked over time" (declining curve) vs. "AI agent: cloud calls over time" (flat line). The gap is wasted money.*

---

## Slide 3: The Insight

**Your agent has a brain. It just doesn't use it yet.**

A local model (Llama, Mistral, Phi) running on your machine is like a human brain — it can think, reason, and respond. But right now, most agents skip the brain entirely and go straight to the cloud for every question.

Humans don't work that way:
- You think first. If you know the answer, you respond immediately.
- If you're uncertain, you search the internet or ask a colleague.
- Then you *remember* what you learned for next time.

**Autodidact gives your local model this same workflow: think first, ask only when uncertain, and always learn from the answer.**

*Visual: Brain (local model) in the center. Arrow to "memory" (knowledge store). Arrow out to "search/ask" (cloud/web) only when uncertain. Arrow back with "learn" label.*

---

## Slide 4: Why Now

**The window for this is open right now — and it won't stay open long.**

- **Local models just got good enough.** Llama 3, Mistral, Phi-3 can genuinely reason and follow instructions. Two years ago, local models were too weak to be a useful "brain." Today they are.
- **Cloud API costs are at peak.** GPT-4o costs $5–$15 per million tokens. Enterprises are actively looking for ways to reduce this. The pain is real and growing.
- **On-device AI is exploding.** Ollama has 100K+ GitHub stars. Apple Intelligence runs on-device. llama.cpp is everywhere. The infrastructure for local-first AI is mature.
- **Nobody has built the learning layer yet.** Frameworks like LangChain and CrewAI help you *build* agents, but none of them make agents *learn and improve over time*. The gap is wide open.

Two years ago, this wasn't possible. Two years from now, someone else will have built it.

*Visual: Timeline — 2023: "Local models too weak" → 2025: "Local models capable, cloud costs high" → 2026: "The window" → 2027+: "Commoditized"*

---

## Slide 5: The Solution

**Autodidact: A local model that thinks first, asks when uncertain, and learns from every answer.**

Your local model is the agent's brain. Autodidact wraps it with memory and a learning loop:

1. **Think First** — Every query goes to the local model first. It checks its memory: "Do I know this? Have I seen something similar?" If confident, it answers immediately — zero cloud cost.
2. **Ask When Uncertain** — If the local model isn't confident, it escalates: searches the internet or asks a powerful cloud model (GPT-4o, Claude). Just like a person Googling something or asking a colleague.
3. **Always Learn** — Every escalation teaches the agent something new. It extracts knowledge and skills from the response and stores them in local memory. The escalation was temporary; the learning is permanent.

Over time, the brain gets smarter. It asks less. It handles more on its own.

*Visual: The learning loop — Local Model (brain) → "Do I know this?" → YES: answer / NO: search or ask → learn → store in memory → next time: answer locally*

---

## Slide 6: How It Works

**The Learning Loop — How the Brain Gets Smarter**

```
Query comes in
  → Local model (the brain) thinks first
  → Checks memory: "Have I seen something like this?"
  → Checks skills: "Do I know how to do this?"
  → Confidence Evaluator decides:
    → CONFIDENT: Answer from brain + memory — $0 cost
    → UNCERTAIN: Answer locally, flag uncertainty
    → NOT CONFIDENT: Search the internet or ask a cloud model
      → Extract facts and procedures from the response
      → Store them in local memory
      → Brain is now smarter → next time, answer locally
```

Key tech:
- Thompson Sampling (Bayesian learning) — the agent learns *which signals to trust* for routing, no manual tuning needed
- Ebbinghaus decay for memory — frequently-used knowledge sticks, rarely-used knowledge fades naturally (just like human memory)
- Cost-aware failover — when escalating, tries the cheapest cloud model first

*Visual: Simplified version of the Mermaid sequence diagram*

---

## Slide 7: The Cost Curve (The Money Slide)

**The more the agent learns, the less it costs to run.**

| Metric | Week 1 | Month 1 | Month 3 |
|--------|--------|---------|---------|
| Local resolution rate | 20% | 60% | 85%+ |
| Cloud API cost | $800 | $320 | $120 |
| Monthly savings vs. baseline | — | $480 | $680 |

*At 10,000 queries/day, $0.08/cloud call average:*
- Without Autodidact: $24,000/year
- With Autodidact (Month 3+): ~$4,300/year
- **Annual savings: ~$19,700 per agent deployment**

And as a bonus: the more it learns locally, the fewer calls go to the cloud — so privacy improves naturally over time too.

*Visual: Two lines — "traditional agent cost" (flat/linear) vs. "Autodidact cost" (declining curve). Annotation: "Each drop = knowledge the agent learned and kept"*

---

## Slide 8: Technical Architecture

**Single SQLite file. Any model. Pure TypeScript SDK.**

- All learned knowledge and skills persist in one portable .db file — your agent's "brain"
- Works with any OpenAI-compatible model — Ollama, vLLM, OpenAI, Anthropic
- Swap your local model anytime without losing what the agent has learned
- No external databases, no extra infrastructure
- Pluggable: swap any component via TypeScript interfaces

*Visual: Clean architecture diagram — Agent → Memory (Knowledge Store + Skill Store) → SQLite, with cloud models as external "teachers"*

---

## Slide 9: Market Opportunity

**Who needs this:**

**Primary — Enterprise AI Teams:**
- Companies deploying AI agents at scale (customer support, internal tools, knowledge management)
- Need to control cloud API costs and want agents that get better over time
- Bonus: as the agent learns more locally, fewer queries go to cloud → data exposure decreases naturally

**Secondary — AI Startups & Developer Tools:**
- Startups building customer-facing agents/copilots who need to control unit economics
- Developer tool companies embedding AI — self-improving behavior as a competitive feature

**Tertiary — SMEs in Emerging Markets:**
- Vietnamese and Southeast Asian businesses who want AI but can't afford $1,000+/month API bills

**Expansion — Personal AI Assistants:**
- Individuals running local models on their own hardware (Mac, Linux, home server via Ollama)
- A personal AI that learns your preferences, your domain, your workflow — a second brain that gets better every day

**Market sizing:**
- AI agent framework market growing rapidly (LangChain, CrewAI, AutoGen ecosystem)
- 70%+ of agent operational cost is LLM API calls (source: industry benchmarks)
- Enterprise AI spending projected to exceed $100B by 2028

**Business model:**
- Core SDK: open-source (MIT) — drive adoption, build community
- **Autodidact Cloud** (future): managed knowledge stores, team knowledge sharing, analytics dashboard, audit logging — subscription per agent deployment
- **Skill Marketplace** (future): curated, pre-trained skill packs for specific domains (customer support, legal, finance) — revenue share model
- Enterprise support tier: SLAs, dedicated onboarding, custom integrations

*Visual: Concentric circles — Enterprise (core) → Startups → SMEs → Personal AI (expansion)*

---

## Slide 10: Competitive Landscape

| Feature | LangChain | CrewAI | AutoGen | **Autodidact** |
|---------|-----------|--------|---------|----------------|
| Agent orchestration | ✅ | ✅ | ✅ | ✅ |
| Basic conversation memory | ✅ | ✅ | ✅ | ✅ |
| Persistent long-term memory | ⚠️ Basic | ⚠️ Basic | ❌ | ✅ Tiered STM/LTM |
| Learns from every interaction | ❌ | ❌ | ❌ | ✅ |
| Measurable improvement over time | ❌ | ❌ | ❌ | ✅ |
| Self-verification of knowledge | ❌ | ❌ | ❌ | ✅ |
| Skill self-improvement | ❌ | ❌ | ❌ | ✅ |
| Cost reduction as agent learns | ❌ | ❌ | ❌ | ✅ |

**The difference:** Other frameworks have memory — they can remember conversation context. Autodidact has *learning* — the agent extracts knowledge from every escalation, stores it permanently, and measurably improves over time. Memory is remembering what was said. Learning is getting smarter from it.

**Autodidact doesn't replace these frameworks — it adds the learning layer they're all missing. It can even sit on top of them.**

---

## Slide 11: Traction & Status

**Phase 1 — Core SDK (current):**
- ✅ Full requirements spec (14 requirements, detailed acceptance criteria)
- ✅ Technical design (41 correctness properties, SQLite schemas, TypeScript interfaces)
- 🔨 Implementation in progress — TypeScript/Node.js SDK
- 🎯 Target: Working prototype with live demo by June semi-finals

**Roadmap:**
- Phase 2: Web search as escalation source, skill sharing marketplace
- Phase 3: Swarm learning — agents share learned skills across deployments within an organization
- Phase 4: Local model fine-tuning from accumulated knowledge, personal AI assistant mode

---

## Slide 12: The Team

[Your name] — [Role, background, relevant experience]
[Team member 2] — [Role, background]
...

*Highlight Vietnamese connection, AI/ML experience, open-source contributions*

---

## Slide 13: The Ask

**What we're looking for from Vietnam AI Stars:**

1. Mentorship on go-to-market strategy for developer tools in SEA
2. Connections to early adopter startups and enterprises building AI agents
3. Investor introductions for pre-seed funding

**Our commitment:**
- Working demo by June semi-finals
- Open-source release by August finals
- First 10 design partners onboarded by Q4 2026

---

## Appendix (backup slides)

- Detailed Thompson Sampling algorithm explanation
- Ebbinghaus decay math and human memory research parallels
- Full SQLite schema
- Competitive deep-dive (LangChain memory vs. Autodidact learning — detailed comparison)
- Unit economics model
- Privacy as a consequence of learning (detailed explanation)
