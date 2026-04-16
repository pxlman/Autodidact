import type { NewKnowledgeEntry, NewSkillEntry, ExtractionResult } from './types.js';
import type { LLMClient } from './llm-client.js';

const EXTRACTION_PROMPT = `Extract knowledge and skills from the answer below. Return a JSON object with two arrays.

Rules:
- "knowledge": factual claims. Each: {"content": "one fact", "confidence": 0.9}
- "skills": step-by-step procedures found in the answer. Each: {"name": "short_snake_case_name", "description": "what this procedure does", "steps": [{"order": 1, "description": "step description"}]}
- Only include "skills" if the answer contains a clear multi-step procedure (3+ steps)
- Return ONLY valid JSON, nothing else

Example:
{"knowledge": [{"content": "Python was created in 1991", "confidence": 0.95}], "skills": [{"name": "deploy_to_heroku", "description": "Deploy a Node.js app to Heroku", "steps": [{"order": 1, "description": "Install Heroku CLI"}, {"order": 2, "description": "Run heroku create"}, {"order": 3, "description": "Run git push heroku main"}]}]}

If no procedures found, return empty skills array: {"knowledge": [...], "skills": []}`;

export class LearningExtractor {
    async extract(query: string, response: string, llmClient: LLMClient): Promise<ExtractionResult> {
        try {
            const result = await llmClient.chat([
                { role: 'system', content: EXTRACTION_PROMPT },
                { role: 'user', content: `Question: ${query}\n\nAnswer: ${response}` },
            ], { temperature: 0.1, maxTokens: 2048 });

            const raw = result.content.trim();

            // Try multiple strategies to extract JSON
            let parsed: { knowledge?: { content: string; confidence: number }[]; skills?: { name: string; description: string; steps: { order: number; description: string }[] }[] } | null = null;

            try {
                parsed = JSON.parse(raw);
            } catch {
                const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
                try {
                    parsed = JSON.parse(stripped);
                } catch {
                    const match = raw.match(/\{[\s\S]*\}/);
                    if (match) {
                        try { parsed = JSON.parse(match[0]); } catch { /* give up */ }
                    }
                }
            }

            const tags = query.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5);

            // Extract knowledge
            let knowledge: NewKnowledgeEntry[] = [];
            if (parsed?.knowledge && Array.isArray(parsed.knowledge) && parsed.knowledge.length > 0) {
                knowledge = parsed.knowledge
                    .filter(item => item.content && typeof item.content === 'string')
                    .map(item => ({
                        content: item.content.slice(0, 500),
                        source: 'cloud_escalation',
                        confidence: typeof item.confidence === 'number' ? item.confidence : 0.8,
                        tags,
                    }));
            }

            // Extract skills
            let skills: NewSkillEntry[] = [];
            if (parsed?.skills && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
                skills = parsed.skills
                    .filter(s => s.name && s.steps && Array.isArray(s.steps) && s.steps.length >= 2)
                    .map(s => ({
                        name: s.name,
                        description: s.description || s.name,
                        steps: s.steps.map((step, i) => ({
                            order: step.order ?? i + 1,
                            description: step.description,
                        })),
                        tags,
                    }));
            }

            // Fallback: if no knowledge extracted, store raw response
            if (knowledge.length === 0 && skills.length === 0) {
                console.log(`  📝 Extraction: LLM couldn't produce JSON, storing response as single entry`);
                knowledge = [{
                    content: response.slice(0, 500),
                    source: 'cloud_escalation',
                    confidence: 0.7,
                    tags,
                }];
            }

            const knowledgeCount = knowledge.length;
            const skillCount = skills.length;
            const parts: string[] = [];
            if (knowledgeCount > 0) parts.push(`${knowledgeCount} knowledge`);
            if (skillCount > 0) parts.push(`${skillCount} skill${skillCount > 1 ? 's' : ''}`);
            console.log(`  📝 Extraction: ${parts.join(' + ')} entries extracted`);

            return { knowledge, skills };
        } catch (err) {
            console.log(`  📝 Extraction failed (${err instanceof Error ? err.message : 'unknown'}), storing raw response`);
            const tags = query.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5);
            return {
                knowledge: [{
                    content: response.slice(0, 500),
                    source: 'cloud_escalation',
                    confidence: 0.6,
                    tags,
                }],
                skills: [],
            };
        }
    }
}
