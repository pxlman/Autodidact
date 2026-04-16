// ── Core Types for Autodidact Demo Prototype ──

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatOptions {
    temperature?: number;
    maxTokens?: number;
    model?: string;
}

export interface ChatResponse {
    content: string;
    usage: { promptTokens: number; completionTokens: number };
    model: string;
}

export interface KnowledgeEntry {
    id: string;
    content: string;
    source: string;
    confidence: number;
    tags: string[];
    embedding: number[];
    usageCount: number;
    createdAt: string;
    lastAccessed: string;
    similarity?: number;
}

export interface NewKnowledgeEntry {
    content: string;
    source: string;
    confidence: number;
    tags: string[];
}

export type RoutingDecision = 'LOCAL' | 'HEDGE' | 'ESCALATE';

export interface SignalScores {
    knowledgeSimilarity: number;
}

export interface RoutingResult {
    decision: RoutingDecision;
    signals: SignalScores;
    fusedScore: number;
}

export interface AgentResponse {
    content: string;
    routing: RoutingResult;
    cost: number;
    latencyMs: number;
    sourcesUsed: string[];
    knowledgeLearned: number;
    skillsLearned: number;
    cloudModel?: string;
    cloudLatencyMs?: number;
}

export type ProgressEvent =
    | { type: 'thinking'; score: number; decision: RoutingDecision }
    | { type: 'cloud_call'; model: string }
    | { type: 'cloud_done'; model: string; latencyMs: number; cost: number }
    | { type: 'learning'; knowledgeCount: number; skillCount: number }
    | { type: 'local_done'; latencyMs: number }
    | { type: 'answer' };

export type ProgressCallback = (event: ProgressEvent) => void;

export interface CloudProvider {
    name: string;
    baseUrl: string;
    apiKey: string;
    model: string;
    costPer1kTokens: number;
}

export interface DemoConfig {
    local: {
        baseUrl: string;
        model: string;
        embeddingModel: string;
    };
    cloud?: CloudProvider;
    bedrock?: {
        region: string;
        modelId: string;
        costPer1kInputTokens: number;
        costPer1kOutputTokens: number;
    };
    dbPath: string;
    localThreshold: number;
    hedgeThreshold: number;
}

export interface AgentMetrics {
    totalQueries: number;
    totalEscalations: number;
    localResolutionRate: number;
    totalKnowledgeEntries: number;
    totalSkillEntries: number;
    cumulativeCostAvoided: number;
    totalCostIncurred: number;
}

export interface SkillStep {
    order: number;
    description: string;
}

export interface SkillEntry {
    id: string;
    name: string;
    description: string;
    steps: SkillStep[];
    tags: string[];
    embedding: number[];
    usageCount: number;
    createdAt: string;
    similarity?: number;
}

export interface NewSkillEntry {
    name: string;
    description: string;
    steps: SkillStep[];
    tags: string[];
}

export interface ExtractionResult {
    knowledge: NewKnowledgeEntry[];
    skills: NewSkillEntry[];
}
