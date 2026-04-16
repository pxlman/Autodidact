import type Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import type { AgentResponse, AgentMetrics, DemoConfig, ProgressCallback } from './types.js';
import { LLMClient } from './llm-client.js';
import { KnowledgeStore } from './knowledge-store.js';
import { SkillStore } from './skill-store.js';
import { ConfidenceEvaluator } from './confidence-evaluator.js';
import { CloudRouter } from './cloud-router.js';
import { BedrockCloudRouter } from './bedrock-router.js';
import { LearningExtractor } from './learning-extractor.js';

interface CloudEscalationResult {
    content: string;
    provider: string;
    model: string;
    cost: number;
    latencyMs: number;
}

export class Agent {
    private localLLM: LLMClient;
    private knowledgeStore: KnowledgeStore;
    private skillStore: SkillStore;
    private evaluator: ConfidenceEvaluator;
    private cloudRouter: CloudRouter | null;
    private bedrockRouter: BedrockCloudRouter | null;
    private extractor: LearningExtractor;

    constructor(
        private db: Database.Database,
        private config: DemoConfig,
    ) {
        this.localLLM = new LLMClient(config.local.baseUrl, config.local.model, config.local.embeddingModel);
        this.knowledgeStore = new KnowledgeStore(db);
        this.skillStore = new SkillStore(db);
        this.evaluator = new ConfidenceEvaluator(config.localThreshold, config.hedgeThreshold);
        this.extractor = new LearningExtractor();

        // Use Bedrock if configured, otherwise use OpenAI-compatible cloud
        if (config.bedrock) {
            this.bedrockRouter = new BedrockCloudRouter(config.bedrock);
            this.cloudRouter = null;
        } else {
            this.cloudRouter = config.cloud ? new CloudRouter(config.cloud) : null;
            this.bedrockRouter = null;
        }
    }

    private async escalateToCloud(query: string): Promise<CloudEscalationResult> {
        if (this.bedrockRouter) {
            return this.bedrockRouter.escalate(query);
        }
        if (this.cloudRouter) {
            return this.cloudRouter.escalate(query);
        }
        throw new Error('No cloud provider configured');
    }

    async query(text: string, onProgress?: ProgressCallback): Promise<AgentResponse> {
        const start = Date.now();
        let cost = 0;
        let knowledgeLearned = 0;
        let skillsLearned = 0;
        let cloudModel: string | undefined;
        let cloudLatencyMs: number | undefined;
        const sourcesUsed: string[] = [];

        // 1. Generate embedding
        const embedding = await this.localLLM.embed(text);

        // 2. Search knowledge store
        const hits = this.knowledgeStore.search(embedding, 5);

        // 3. Evaluate confidence
        const routing = this.evaluator.evaluate(text, hits);

        onProgress?.({ type: 'thinking', score: routing.fusedScore, decision: routing.decision });

        let content: string;

        if (routing.decision === 'ESCALATE') {
            // 5. Cloud escalation
            const cloudProviderName = this.bedrockRouter ? 'Bedrock' : 'Cloud';
            const modelName = this.config.bedrock?.modelId ?? this.config.cloud?.model ?? 'unknown';
            onProgress?.({ type: 'cloud_call', model: modelName });

            const escalation = await this.escalateToCloud(text);
            content = escalation.content;
            cost = escalation.cost;
            cloudModel = escalation.model;
            cloudLatencyMs = escalation.latencyMs;

            onProgress?.({ type: 'cloud_done', model: escalation.model, latencyMs: escalation.latencyMs, cost });

            // Extract and store knowledge + skills
            const extracted = await this.extractor.extract(text, content, this.localLLM);
            for (const entry of extracted.knowledge) {
                try {
                    const entryEmbedding = await this.localLLM.embed(entry.content);
                    const id = this.knowledgeStore.insert(entry, entryEmbedding);
                    sourcesUsed.push(id);
                    knowledgeLearned++;
                } catch {
                    // Skip entries that fail to embed
                }
            }
            for (const skill of extracted.skills) {
                try {
                    const skillEmbedding = await this.localLLM.embed(`${skill.name}: ${skill.description}`);
                    const id = this.skillStore.insert(skill, skillEmbedding);
                    sourcesUsed.push(`skill:${id}`);
                    skillsLearned++;
                } catch {
                    // Skip skills that fail to embed
                }
            }

            onProgress?.({ type: 'learning', knowledgeCount: knowledgeLearned, skillCount: skillsLearned });
        } else {
            // 4. Local resolution with knowledge + skill context
            const knowledgeContext = hits
                .filter(h => (h.similarity ?? 0) > 0.2)
                .map(h => h.content)
                .join('\n');

            hits.forEach(h => {
                if ((h.similarity ?? 0) > 0.2) {
                    this.knowledgeStore.access(h.id);
                    sourcesUsed.push(h.id);
                }
            });

            // Also search skills
            const skillHits = this.skillStore.search(embedding, 3);
            const skillContext = skillHits
                .filter(s => (s.similarity ?? 0) > 0.3)
                .map(s => {
                    this.skillStore.access(s.id);
                    sourcesUsed.push(`skill:${s.id}`);
                    const steps = s.steps.map(st => `  ${st.order}. ${st.description}`).join('\n');
                    return `Learned skill "${s.name}": ${s.description}\nSteps:\n${steps}`;
                })
                .join('\n\n');

            let contextParts: string[] = [];
            if (knowledgeContext) contextParts.push(`Knowledge:\n${knowledgeContext}`);
            if (skillContext) contextParts.push(`Skills:\n${skillContext}`);
            const fullContext = contextParts.join('\n\n');

            const systemPrompt = fullContext
                ? `You are a helpful assistant. Use the following knowledge and skills to answer:\n\n${fullContext}`
                : 'You are a helpful assistant.';

            const response = await this.localLLM.chat([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text },
            ]);
            content = response.content;

            onProgress?.({ type: 'local_done', latencyMs: Date.now() - start });
        }

        onProgress?.({ type: 'answer' });

        const latencyMs = Date.now() - start;

        // 6. Log query
        this.db.prepare(`
      INSERT INTO query_log (id, query_text, routing_decision, fused_score, cost, latency_ms)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(uuid(), text, routing.decision, routing.fusedScore, cost, latencyMs);

        return { content, routing, cost, latencyMs, sourcesUsed, knowledgeLearned, skillsLearned, cloudModel, cloudLatencyMs };
    }

    getMetrics(): AgentMetrics {
        const total = this.db.prepare('SELECT COUNT(*) as cnt FROM query_log').get() as { cnt: number };
        const escalations = this.db.prepare(
            "SELECT COUNT(*) as cnt FROM query_log WHERE routing_decision = 'ESCALATE'"
        ).get() as { cnt: number };
        const totalCost = this.db.prepare(
            'SELECT COALESCE(SUM(cost), 0) as total FROM query_log'
        ).get() as { total: number };
        const avgCost = this.db.prepare(
            "SELECT COALESCE(AVG(cost), 0) as avg FROM query_log WHERE routing_decision = 'ESCALATE'"
        ).get() as { avg: number };

        const localQueries = total.cnt - escalations.cnt;
        const costAvoided = localQueries * avgCost.avg;

        const stats = this.knowledgeStore.getStats();
        const skillStats = this.skillStore.getStats();

        return {
            totalQueries: total.cnt,
            totalEscalations: escalations.cnt,
            localResolutionRate: total.cnt > 0 ? (localQueries / total.cnt) * 100 : 0,
            totalKnowledgeEntries: stats.totalEntries,
            totalSkillEntries: skillStats.totalEntries,
            cumulativeCostAvoided: costAvoided,
            totalCostIncurred: totalCost.total,
        };
    }
}
