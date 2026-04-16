import type { ChatMessage, ChatOptions, ChatResponse } from './types.js';

export class LLMClient {
    constructor(
        private baseUrl: string,
        private defaultModel: string,
        private embeddingModel: string,
    ) { }

    async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
        const model = options?.model ?? this.defaultModel;
        const body = {
            model,
            messages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens,
        };

        const res = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(120_000),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`LLM chat failed (${res.status}): ${text}`);
        }

        const json = await res.json() as {
            choices: { message: { content: string } }[];
            usage?: { prompt_tokens?: number; completion_tokens?: number };
            model?: string;
        };

        const choice = json.choices?.[0];
        if (!choice) throw new Error('LLM returned no choices');

        return {
            content: choice.message.content,
            usage: {
                promptTokens: json.usage?.prompt_tokens ?? 0,
                completionTokens: json.usage?.completion_tokens ?? 0,
            },
            model: json.model ?? model,
        };
    }

    async embed(text: string): Promise<number[]> {
        const body = { model: this.embeddingModel, input: text };

        const res = await fetch(`${this.baseUrl}/embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(60_000),
        });

        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new Error(`Embedding failed (${res.status}): ${errText}`);
        }

        const json = await res.json() as {
            data: { embedding: number[] }[];
        };

        const embedding = json.data?.[0]?.embedding;
        if (!embedding) throw new Error('Embedding response missing data');
        return embedding;
    }
}
