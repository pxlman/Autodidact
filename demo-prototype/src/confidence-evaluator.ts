import type { KnowledgeEntry, RoutingResult, RoutingDecision } from './types.js';

export class ConfidenceEvaluator {
    constructor(
        private localThreshold: number,
        private _hedgeThreshold: number,
    ) { }

    evaluate(query: string, knowledgeHits: KnowledgeEntry[]): RoutingResult {
        const knowledgeSimilarity = knowledgeHits.length > 0
            ? Math.max(...knowledgeHits.map(h => h.similarity ?? 0))
            : 0;

        // Simple two-state routing for demo: LOCAL or ESCALATE
        const decision: RoutingDecision = knowledgeSimilarity >= this.localThreshold
            ? 'LOCAL'
            : 'ESCALATE';

        return {
            decision,
            signals: { knowledgeSimilarity },
            fusedScore: knowledgeSimilarity,
        };
    }
}
