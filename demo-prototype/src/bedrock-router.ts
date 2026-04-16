import {
    BedrockRuntimeClient,
    ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';

export interface BedrockEscalationResult {
    content: string;
    provider: string;
    model: string;
    cost: number;
    latencyMs: number;
}

export interface BedrockCloudConfig {
    region: string;
    modelId: string;
    costPer1kInputTokens: number;
    costPer1kOutputTokens: number;
}

export class BedrockCloudRouter {
    private client: BedrockRuntimeClient;

    constructor(private config: BedrockCloudConfig) {
        this.client = new BedrockRuntimeClient({ region: config.region });
    }

    async escalate(query: string, context?: string): Promise<BedrockEscalationResult> {
        const start = Date.now();

        const messages: { role: 'user' | 'assistant'; content: { text: string }[] }[] = [];

        const userContent = context
            ? `Context:\n${context}\n\nQuestion: ${query}`
            : query;

        messages.push({
            role: 'user',
            content: [{ text: userContent }],
        });

        const command = new ConverseCommand({
            modelId: this.config.modelId,
            messages,
            inferenceConfig: {
                maxTokens: 1024,
                temperature: 0.7,
            },
        });

        const response = await this.client.send(command);
        const latencyMs = Date.now() - start;

        const outputText = response.output?.message?.content?.[0]?.text ?? '';
        const inputTokens = response.usage?.inputTokens ?? 0;
        const outputTokens = response.usage?.outputTokens ?? 0;

        const cost =
            (inputTokens / 1000) * this.config.costPer1kInputTokens +
            (outputTokens / 1000) * this.config.costPer1kOutputTokens;

        return {
            content: outputText,
            provider: 'bedrock',
            model: this.config.modelId,
            cost,
            latencyMs,
        };
    }
}
