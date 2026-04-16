import type { CloudProvider, ChatMessage } from './types.js';
import { LLMClient } from './llm-client.js';

export interface EscalationResult {
    content: string;
    provider: string;
    model: string;
    cost: number;
    latencyMs: number;
}

export class CloudRouter {
    private client: LLMClient;

    constructor(private provider: CloudProvider) {
        this.client = new LLMClient(provider.baseUrl, provider.model, '');
    }

    async escalate(query: string, context?: string): Promise<EscalationResult> {
        const messages: ChatMessage[] = [];
        if (context) {
            messages.push({ role: 'system', content: context });
        }
        messages.push({ role: 'user', content: query });

        const start = Date.now();
        const response = await this.client.chat(messages, {
            model: this.provider.model,
        });
        const latencyMs = Date.now() - start;

        const totalTokens = response.usage.promptTokens + response.usage.completionTokens;
        const cost = (totalTokens / 1000) * this.provider.costPer1kTokens;

        return {
            content: response.content,
            provider: this.provider.name,
            model: response.model,
            cost,
            latencyMs,
        };
    }
}
