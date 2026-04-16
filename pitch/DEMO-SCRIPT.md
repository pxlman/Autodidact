# Autodidact — Demo Script
## For Vietnam AI Stars 2026 (Semi-finals: June)

**Duration: 3-4 minutes live demo**
**Setup: Terminal + simple web dashboard (optional)**

---

## Pre-Demo Setup

- Ollama running locally with a small model (e.g., `llama3.2:3b` or `phi3:mini`) — the agent's "brain"
- One cloud provider configured (OpenAI or any cheap endpoint) — the "senior colleague" the agent asks when stuck
- Fresh SQLite database (empty — agent knows nothing yet)
- Terminal visible, font size large enough for audience

**Framing for audience:** "This agent has a brain — a local model running right here on this machine. But it's day one. The brain has no memory yet, no learned knowledge. Watch how it thinks first, asks when uncertain, and learns from every answer."

---

## Act 1: "Day One — The Brain Is Empty" (60 seconds)

**Narration:** "The agent has a brain — Llama 3.2 running locally. But it has no memory yet. Let's ask it something."

```typescript
import { createAgent } from 'autodidact';

const agent = createAgent({
  localLLM: { baseUrl: 'http://localhost:11434/v1', model: 'llama3.2:3b' },
  cloudRouter: {
    providers: [
      { name: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini', costPer1kTokens: 0.15 }
    ]
  }
});
```

**Query 1:** "What is the capital of Vietnam?"

```typescript
const r1 = await agent.query("What is the capital of Vietnam?");
console.log(r1.routing.decision);  // → "ESCALATE"
console.log(r1.cost);              // → $0.002
console.log(r1.content);           // → "The capital of Vietnam is Hanoi..."
```

**Show the audience:**
- Routing decision: ESCALATE (agent wasn't confident — it doesn't know this yet)
- Cost: $0.002 (had to ask the cloud)
- "But here's what happened behind the scenes — it *learned*:"

```typescript
const metrics = agent.getMetrics();
console.log(metrics.totalKnowledgeEntries);  // → 2 (extracted facts)
console.log(metrics.localResolutionRate);     // → 0% (0 out of 1)
```

**Narration:** "The brain wasn't confident — it had no memory of this topic. So it did what you'd do: it asked. Cost us 0.2 cents. But it didn't just get the answer — it extracted 2 knowledge entries and stored them in its memory. Now the brain knows something it didn't before."

---

## Act 2: "The Brain Remembers" (60 seconds)

**Narration:** "Now let's ask something similar. Will the brain recognize it?"

**Query 2:** "Tell me about Hanoi — is it the capital of Vietnam?"

```typescript
const r2 = await agent.query("Tell me about Hanoi — is it the capital of Vietnam?");
console.log(r2.routing.decision);  // → "LOCAL"
console.log(r2.cost);              // → $0.000
console.log(r2.routing.signals);
// → { knowledgeSimilarity: 0.89, skillCoverage: 0.1, queryComplexity: 0.85, selfAssessment: 0.78 }
```

**Show the audience:**
- Routing decision: LOCAL (agent was confident — it already knows this)
- Cost: $0.00 (answered from memory, no cloud call)
- Signal scores: knowledge similarity is 0.89 — it recognized this is related to what it learned

**Narration:** "Zero cost. The brain thought first, checked its memory, found a match, and answered on its own. No need to search or ask anyone. That's the learning loop — ask once, remember forever."

---

## Act 3: "The Learning Curve" (45 seconds)

**Narration:** "Let's fast-forward. I'll run 20 queries — a mix of things it knows and things it doesn't."

```typescript
const queries = [
  "What's the population of Ho Chi Minh City?",    // new → ESCALATE, then learn
  "How many people live in Saigon?",                // similar → LOCAL (remembered!)
  "What currency does Vietnam use?",                // new → ESCALATE, then learn
  "Is the Vietnamese dong the local currency?",     // similar → LOCAL (remembered!)
  "What's the GDP of Vietnam?",                     // new → ESCALATE, then learn
  // ... more queries
];

for (const q of queries) {
  const r = await agent.query(q);
  console.log(`[${r.routing.decision}] $${r.cost.toFixed(4)} — ${q.slice(0, 50)}`);
}
```

**Show the terminal output scrolling — mix of ESCALATE and LOCAL, with LOCAL becoming more frequent**

```typescript
const finalMetrics = agent.getMetrics();
console.log(`Local resolution rate: ${(finalMetrics.localResolutionRate * 100).toFixed(0)}%`);
console.log(`Knowledge entries: ${finalMetrics.totalKnowledgeEntries}`);
console.log(`Cost avoided: $${finalMetrics.cumulativeCostAvoided.toFixed(4)}`);
```

**Narration:** "After 20 queries, the brain resolves 65% from memory. It only had to search or ask for 35%. Every answer it learned from is an answer it never has to pay for again. The brain gets smarter with every interaction."

---

## Act 4: "The Self-Check" (45 seconds)

**Narration:** "But what if something the agent learned becomes outdated? It checks itself."

```typescript
// Trigger a verification cycle manually for demo
const verification = await agent.selfVerify();
console.log(`Tested: ${verification.tested}`);
console.log(`Passed: ${verification.passed}`);
console.log(`Failed: ${verification.failed}`);
console.log(`Pass rate: ${((verification.passed / verification.tested) * 100).toFixed(0)}%`);
```

**Narration:** "It quizzed itself on what it knows, checked for contradictions, and flagged anything stale for refresh. Like a good employee who reviews their notes and updates them."

---

## Closing (30 seconds)

**Show final metrics dashboard:**

```
┌─────────────────────────────────────┐
│  Autodidact Agent — Session Summary │
├─────────────────────────────────────┤
│  Total queries:          20         │
│  Answered from memory:   13 (65%)   │
│  Had to ask cloud:        7 (35%)   │
│  Knowledge entries:      15         │
│  Skills learned:          3         │
│  Total cloud cost:    $0.014        │
│  Cost avoided:        $0.026        │
│  Self-test pass rate:    93%        │
└─────────────────────────────────────┘
```

**Narration:** "This is 20 questions. Imagine this running for weeks, months. The agent keeps learning. The local resolution rate climbs to 85%, 90%. Cloud costs drop. And the same framework works for an enterprise, a startup, a small business, or a personal AI assistant on your laptop. An AI that actually learns and evolves. That's Autodidact."

---

## Demo Tips

1. **Use real queries, not toy examples.** Vietnam-related questions are perfect for this audience.
2. **Show the terminal.** Judges want to see it's real, not slides.
3. **Emphasize the learning moment.** The transition from ESCALATE to LOCAL on a similar question is the "aha" moment. Pause on it.
4. **Have a backup recording.** If Ollama is slow or network fails, play a pre-recorded version.
5. **Keep the SQLite file visible.** "All of this — everything the agent learned — lives in one 200KB file" is a powerful line.
6. **End with the analogy.** "Day one, it knew nothing. Twenty questions later, it handles 65% on its own. That's what learning looks like."

---

## Technical Prep Checklist

- [ ] Ollama installed and model pulled (`ollama pull llama3.2:3b`)
- [ ] OpenAI API key loaded (or any cheap cloud endpoint)
- [ ] Demo script tested end-to-end 3+ times
- [ ] Backup video recorded
- [ ] Font size in terminal set to 18pt+
- [ ] WiFi backup (mobile hotspot) for cloud calls
- [ ] Fresh .db file ready (delete before demo starts)
