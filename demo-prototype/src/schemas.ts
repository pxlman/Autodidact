import { z } from 'zod';
import type { DemoConfig } from './types.js';

const CloudProviderSchema = z.object({
    name: z.string(),
    baseUrl: z.string(),
    apiKey: z.string(),
    model: z.string(),
    costPer1kTokens: z.number().default(0.15),
});

const BedrockConfigSchema = z.object({
    region: z.string().default('us-east-1'),
    modelId: z.string().default('us.anthropic.claude-3-5-haiku-20241022-v1:0'),
    costPer1kInputTokens: z.number().default(0.001),
    costPer1kOutputTokens: z.number().default(0.005),
});

export const DemoConfigSchema = z.object({
    local: z.object({
        baseUrl: z.string().default('http://localhost:11434/v1'),
        model: z.string().default('llama3.2'),
        embeddingModel: z.string().default('nomic-embed-text'),
    }),
    cloud: CloudProviderSchema.optional(),
    bedrock: BedrockConfigSchema.optional(),
    dbPath: z.string().default('autodidact-demo.db'),
    localThreshold: z.number().default(0.7),
    hedgeThreshold: z.number().default(0.4),
});

export function parseConfig(raw: unknown): DemoConfig {
    return DemoConfigSchema.parse(raw) as DemoConfig;
}
