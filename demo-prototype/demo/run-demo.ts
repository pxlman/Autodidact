import { createAgent } from '../src/index.js';
import type { Agent } from '../src/agent.js';
import type { AgentResponse, ProgressEvent } from '../src/types.js';
import * as fs from 'node:fs';
import * as readline from 'node:readline';

// ── Terminal colors ──
const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    blue: '\x1b[34m',
    white: '\x1b[37m',
};

const LINE = '──────────────────────────────────────────────';

function banner(text: string): void {
    console.log(`\n${C.cyan}${C.bold}${'═'.repeat(50)}${C.reset}`);
    console.log(`${C.cyan}${C.bold}  ${text}${C.reset}`);
    console.log(`${C.cyan}${C.bold}${'═'.repeat(50)}${C.reset}\n`);
}

function progressLogger(event: ProgressEvent): void {
    switch (event.type) {
        case 'thinking': {
            console.log(`${C.dim}${LINE}${C.reset}`);
            console.log(`${C.bold}🧠 THINKING ${C.dim}(local model)${C.reset}`);
            console.log(`${C.dim}${LINE}${C.reset}`);
            const score = event.score;
            let confidenceLabel: string;
            let confidenceIcon: string;
            if (score >= 0.55) {
                confidenceLabel = `${C.green}HIGH${C.reset}`;
                confidenceIcon = '✅';
            } else if (score >= 0.35) {
                confidenceLabel = `${C.yellow}MEDIUM${C.reset}`;
                confidenceIcon = '⚠️';
            } else {
                confidenceLabel = `${C.red}LOW${C.reset}`;
                confidenceIcon = '❌';
            }
            console.log(`  Confidence: ${C.bold}${score.toFixed(3)}${C.reset} ${confidenceIcon} ${confidenceLabel}`);
            if (event.decision === 'ESCALATE') {
                console.log(`  Decision: ${C.red}${C.bold}🔴 ESCALATE to cloud${C.reset}`);
            } else {
                console.log(`  Decision: ${C.green}${C.bold}🟢 LOCAL execution${C.reset}`);
            }
            break;
        }
        case 'cloud_call':
            console.log(`${C.dim}${LINE}${C.reset}`);
            console.log(`${C.bold}☁️  CLOUD CALL${C.reset}`);
            console.log(`${C.dim}${LINE}${C.reset}`);
            console.log(`  Model: ${C.cyan}${event.model}${C.reset}`);
            console.log(`  ${C.dim}Waiting for response...${C.reset}`);
            break;
        case 'cloud_done':
            console.log(`  Latency: ${C.bold}${(event.latencyMs / 1000).toFixed(1)}s${C.reset}`);
            console.log(`  Cost: ${C.bold}$${event.cost.toFixed(4)}${C.reset}`);
            break;
        case 'learning': {
            console.log(`${C.dim}${LINE}${C.reset}`);
            console.log(`${C.bold}📚 LEARNING${C.reset}`);
            console.log(`${C.dim}${LINE}${C.reset}`);
            const parts: string[] = [];
            if (event.knowledgeCount > 0) parts.push(`${C.green}${event.knowledgeCount} knowledge entries${C.reset}`);
            if (event.skillCount > 0) parts.push(`${C.cyan}${event.skillCount} skills${C.reset}`);
            console.log(`  Extracted: ${parts.join(' + ') || 'none'}`);
            console.log(`  ${C.dim}Stored in local memory for future use${C.reset}`);
            break;
        }
        case 'local_done':
            console.log(`  Latency: ${C.bold}${(event.latencyMs / 1000).toFixed(1)}s${C.reset}`);
            console.log(`  Cost: ${C.green}${C.bold}$0.0000${C.reset} ${C.dim}(free — answered from memory)${C.reset}`);
            break;
        case 'answer':
            console.log(`${C.dim}${LINE}${C.reset}`);
            console.log(`${C.bold}✅ ANSWER${C.reset}`);
            console.log(`${C.dim}${LINE}${C.reset}`);
            break;
    }
}

function printAnswer(content: string): void {
    console.log(`  ${content.split('\n').join('\n  ')}`);
    console.log();
}

function printMetrics(agent: Agent): void {
    const m = agent.getMetrics();
    console.log(`${C.magenta}${C.bold}╔════════════════════════════════════════════╗${C.reset}`);
    console.log(`${C.magenta}${C.bold}║         LEARNING METRICS DASHBOARD         ║${C.reset}`);
    console.log(`${C.magenta}${C.bold}╠════════════════════════════════════════════╣${C.reset}`);
    console.log(`${C.magenta}║${C.reset}  Total Queries:         ${C.bold}${String(m.totalQueries).padStart(6)}${C.reset}          ${C.magenta}║${C.reset}`);
    console.log(`${C.magenta}║${C.reset}  Escalations:           ${C.bold}${String(m.totalEscalations).padStart(6)}${C.reset}          ${C.magenta}║${C.reset}`);
    console.log(`${C.magenta}║${C.reset}  Local Resolution:  ${C.green}${C.bold}${m.localResolutionRate.toFixed(1).padStart(6)}%${C.reset}          ${C.magenta}║${C.reset}`);
    console.log(`${C.magenta}║${C.reset}  Knowledge Entries:     ${C.bold}${String(m.totalKnowledgeEntries).padStart(6)}${C.reset}          ${C.magenta}║${C.reset}`);
    console.log(`${C.magenta}║${C.reset}  Skills Learned:    ${C.cyan}${C.bold}${String(m.totalSkillEntries).padStart(6)}${C.reset}          ${C.magenta}║${C.reset}`);
    console.log(`${C.magenta}║${C.reset}  Cost Incurred:     ${C.bold}$${m.totalCostIncurred.toFixed(4).padStart(8)}${C.reset}          ${C.magenta}║${C.reset}`);
    console.log(`${C.magenta}║${C.reset}  Cost Avoided:      ${C.green}${C.bold}$${m.cumulativeCostAvoided.toFixed(4).padStart(8)}${C.reset}          ${C.magenta}║${C.reset}`);
    console.log(`${C.magenta}${C.bold}╚════════════════════════════════════════════╝${C.reset}`);
}

async function queryWithUI(agent: Agent, query: string): Promise<AgentResponse> {
    console.log(`\n${C.cyan}${C.bold}❓ ${query}${C.reset}`);
    const res = await agent.query(query, progressLogger);
    printAnswer(res.content);
    return res;
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
    console.log(`\n${C.bold}${C.cyan}🧠 AUTODIDACT — The Local-First AI Agent That Actually Learns and Evolves${C.reset}`);
    console.log(`${C.dim}Vietnam AI Stars 2026${C.reset}\n`);

    const dbPath = 'autodidact-demo.db';
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

    let agent: Agent;
    try {
        process.env['AWS_PROFILE'] = process.env['AWS_PROFILE'] ?? 'acamlops';

        agent = createAgent({
            local: {
                baseUrl: process.env['OLLAMA_URL'] ?? 'http://localhost:11434/v1',
                model: process.env['LOCAL_MODEL'] ?? 'llama3.2',
                embeddingModel: process.env['EMBEDDING_MODEL'] ?? 'nomic-embed-text',
            },
            bedrock: {
                region: process.env['AWS_REGION'] ?? 'us-east-1',
                modelId: process.env['BEDROCK_MODEL'] ?? 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
                costPer1kInputTokens: 0.001,
                costPer1kOutputTokens: 0.005,
            },
            dbPath,
            localThreshold: 0.55,
            hedgeThreshold: 0.55,
        }) as Agent;
    } catch (err) {
        console.error(`${C.red}Failed to initialize agent:${C.reset}`, err);
        console.log(`\n${C.yellow}Make sure Ollama is running: ollama serve${C.reset}`);
        process.exit(1);
    }

    // ── Act 1: ESCALATE ──
    banner('ACT 1: Empty Brain — The Agent Knows Nothing');
    console.log(`${C.dim}The brain has no memory yet. It must ask the cloud.${C.reset}`);
    try {
        await queryWithUI(agent, 'What are the key regulations and compliance requirements for launching a fintech startup in Vietnam?');
    } catch (err) {
        console.error(`${C.red}Act 1 failed:${C.reset}`, err instanceof Error ? err.message : err);
        return;
    }

    await sleep(500);

    // ── Act 2: LOCAL ──
    banner('ACT 2: The Brain Remembers');
    console.log(`${C.dim}A related question — will the brain recognize it?${C.reset}`);
    await queryWithUI(agent, 'What compliance does a Vietnamese payment app need before launch?');

    await sleep(500);

    // ── Interactive Mode (after Act 2, before batch) ──
    banner('INTERACTIVE MODE');
    console.log(`${C.dim}The agent learned from Act 1. Try asking related or new questions.${C.reset}`);
    console.log(`${C.dim}Commands:${C.reset}`);
    console.log(`${C.dim}  • Type any question to ask the agent${C.reset}`);
    console.log(`${C.dim}  • "batch"   — run 12 pre-written queries across 5 domains${C.reset}`);
    console.log(`${C.dim}  • "metrics" — show the learning dashboard${C.reset}`);
    console.log(`${C.dim}  • "quit"    — exit${C.reset}\n`);

    const batchQueries = [
        'Compare PostgreSQL vs MongoDB for a real-time analytics dashboard',
        'Should I use a relational or document database for event tracking?',
        'What are the biggest challenges for AI startups in Southeast Asia?',
        'What obstacles do Vietnamese tech companies face when scaling?',
        'How do I set up a CI/CD pipeline for a TypeScript monorepo?',
        'What is the best way to automate deployment for a Node.js project?',
        'Explain the difference between fine-tuning and retrieval-augmented generation',
        'When should I use RAG instead of fine-tuning a language model?',
        'How do open-source developer tools typically monetize?',
        'What revenue models work for open-source AI frameworks?',
        'What database is better for analytics workloads with complex joins?',
        'What are the regulatory hurdles for fintech in Vietnam?',
    ];

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const ask = (): void => {
        rl.question(`${C.cyan}${C.bold}You: ${C.reset}`, async (input) => {
            const t = input.trim();
            if (!t || ['quit', 'exit', '/quit', '/exit'].includes(t.toLowerCase())) {
                console.log(`\n${C.dim}Final stats:${C.reset}`);
                printMetrics(agent);
                console.log(`${C.dim}Database: ${dbPath}${C.reset}\n`);
                rl.close();
                return;
            }
            if (t.toLowerCase() === 'metrics') {
                printMetrics(agent);
                ask();
                return;
            }
            if (t.toLowerCase() === 'batch') {
                banner('BATCH: 12 Queries Across 5 Domains');
                console.log(`${C.dim}New topics escalate, follow-ups resolve locally.${C.reset}`);

                let localCount = 0;
                let escalateCount = 0;

                for (let i = 0; i < batchQueries.length; i++) {
                    console.log(`${C.dim}[${i + 1}/${batchQueries.length}]${C.reset}`);
                    try {
                        const res = await queryWithUI(agent, batchQueries[i]);
                        if (res.routing.decision === 'LOCAL') localCount++;
                        else escalateCount++;
                    } catch (err) {
                        console.error(`${C.red}  Failed:${C.reset}`, err instanceof Error ? err.message : err);
                    }
                }

                console.log(`\n${C.bold}Batch Summary: ${C.green}${localCount} local${C.reset} / ${C.red}${escalateCount} escalated${C.reset} out of ${batchQueries.length}\n`);
                printMetrics(agent);
                ask();
                return;
            }
            try {
                await queryWithUI(agent, t);
            } catch (err) {
                console.error(`${C.red}Error:${C.reset}`, err instanceof Error ? err.message : err);
            }
            ask();
        });
    };
    ask();
}

main().catch(err => {
    console.error(`${C.red}Demo crashed:${C.reset}`, err);
    process.exit(1);
});
