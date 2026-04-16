import { initDatabase } from './database.js';
import { Agent } from './agent.js';
import { parseConfig } from './schemas.js';
import type { DemoConfig } from './types.js';

export function createAgent(rawConfig: unknown): Agent {
    const config: DemoConfig = parseConfig(rawConfig);
    const db = initDatabase(config.dbPath);
    return new Agent(db, config);
}

export { Agent } from './agent.js';
export { LLMClient } from './llm-client.js';
export { KnowledgeStore } from './knowledge-store.js';
export { SkillStore } from './skill-store.js';
export { ConfidenceEvaluator } from './confidence-evaluator.js';
export { CloudRouter } from './cloud-router.js';
export { BedrockCloudRouter } from './bedrock-router.js';
export { LearningExtractor } from './learning-extractor.js';
export { initDatabase } from './database.js';
export { parseConfig, DemoConfigSchema } from './schemas.js';
export type * from './types.js';
