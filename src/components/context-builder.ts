import type {
    ContextLayerLevel,
    ContextResult,
    EvaluationContext,
    IContextBuilder,
    KnowledgeEntry,
    RoutingResult,
} from '../types.js';

export interface ContextBuilderConfig {
    l0TokenBudget: number;
    l1TokenBudget: number;
    l2TokenBudget: number;
    l3TokenBudget: number;
    l3Threshold: number;
}

const DEFAULT_CONFIG: ContextBuilderConfig = {
    l0TokenBudget: 50,
    l1TokenBudget: 120,
    l2TokenBudget: 500,
    l3TokenBudget: 1000,
    l3Threshold: 0.5,
};

/**
 * Assembles layered prompt context (L0–L3) with token budgets.
 * Simple queries use only compact layers; complex queries progressively load deeper context.
 */
export class ContextBuilder implements IContextBuilder {
    private readonly config: ContextBuilderConfig;

    constructor(config?: Partial<ContextBuilderConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    build(
        query: string,
        routing: RoutingResult,
        context: EvaluationContext,
    ): ContextResult {
        const layers: string[] = [];
        const layersUsed: ContextLayerLevel[] = [];
        const tokensByLayer: Record<ContextLayerLevel, number> = { L0: 0, L1: 0, L2: 0, L3: 0 };

        // L0: Always loaded — identity and core config preamble
        const l0 = 'You are a helpful AI assistant with a self-learning knowledge base.';
        const l0Truncated = this.truncateToTokenBudget(l0, this.config.l0TokenBudget);
        layers.push(l0Truncated);
        layersUsed.push('L0');
        tokensByLayer.L0 = this.estimateTokens(l0Truncated);

        // L1: Always loaded — critical facts + user profile summary
        const l1Parts: string[] = [];
        const criticalHits = context.knowledgeHits.filter((k) => k.confidence >= 0.8);
        if (criticalHits.length > 0) {
            l1Parts.push('Key facts:');
            for (const k of criticalHits.slice(0, 3)) {
                l1Parts.push(`- ${k.content}`);
            }
        }
        const l1 = l1Parts.join('\n');
        const l1Truncated = this.truncateToTokenBudget(l1, this.config.l1TokenBudget);
        if (l1Truncated.length > 0) {
            layers.push(l1Truncated);
        }
        layersUsed.push('L1');
        tokensByLayer.L1 = this.estimateTokens(l1Truncated);

        // L2: Loaded when query matches a known domain/topic
        if (this.queryMatchesDomainOrTopic(context.knowledgeHits)) {
            const l2Parts: string[] = ['Topic-specific knowledge:'];
            for (const k of context.knowledgeHits.slice(0, 5)) {
                l2Parts.push(`- [${k.domain}/${k.topic}] ${k.content}`);
            }
            const l2 = l2Parts.join('\n');
            const l2Truncated = this.truncateToTokenBudget(l2, this.config.l2TokenBudget);
            layers.push(l2Truncated);
            layersUsed.push('L2');
            tokensByLayer.L2 = this.estimateTokens(l2Truncated);
        }

        // L3: Loaded when confidence signals are low
        if (routing.signals.knowledgeSimilarity < this.config.l3Threshold) {
            const l3Parts: string[] = [];
            if (context.knowledgeHits.length > 0) {
                l3Parts.push('Relevant knowledge:');
                for (const k of context.knowledgeHits) {
                    l3Parts.push(`- ${k.content}`);
                }
            }
            if (context.skillHits.length > 0) {
                l3Parts.push('Relevant skills:');
                for (const s of context.skillHits) {
                    const steps = s.steps.map((st) => `  ${st.order}. ${st.description}`).join('\n');
                    l3Parts.push(`- ${s.name}: ${s.description}\n${steps}`);
                }
            }
            const l3 = l3Parts.join('\n');
            const l3Truncated = this.truncateToTokenBudget(l3, this.config.l3TokenBudget);
            if (l3Truncated.length > 0) {
                layers.push(l3Truncated);
            }
            layersUsed.push('L3');
            tokensByLayer.L3 = this.estimateTokens(l3Truncated);
        }

        const prompt = layers.join('\n\n');
        const totalTokens = tokensByLayer.L0 + tokensByLayer.L1 + tokensByLayer.L2 + tokensByLayer.L3;

        return { prompt, layersUsed, tokensByLayer, totalTokens };
    }

    // ── Private helpers ─────────────────────────────────────

    /** Simple chars/4 token estimation */
    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    /** Truncate text to fit within a token budget using chars/4 estimation */
    private truncateToTokenBudget(text: string, tokenBudget: number): string {
        const charBudget = tokenBudget * 4;
        if (text.length <= charBudget) {
            return text;
        }
        return text.slice(0, charBudget);
    }

    /**
     * Check if ≥2 knowledge hits share a common domain or topic.
     * If so, L2 (topic-specific context) should be loaded.
     */
    private queryMatchesDomainOrTopic(hits: KnowledgeEntry[]): boolean {
        if (hits.length < 2) return false;

        const domainCounts = new Map<string, number>();
        const topicCounts = new Map<string, number>();

        for (const h of hits) {
            domainCounts.set(h.domain, (domainCounts.get(h.domain) ?? 0) + 1);
            topicCounts.set(h.topic, (topicCounts.get(h.topic) ?? 0) + 1);
        }

        for (const count of domainCounts.values()) {
            if (count >= 2) return true;
        }
        for (const count of topicCounts.values()) {
            if (count >= 2) return true;
        }

        return false;
    }
}
