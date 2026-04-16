import type Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import type { SkillEntry, SkillStep, NewSkillEntry } from './types.js';

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

function embeddingToBuffer(embedding: number[]): Buffer {
    const buf = Buffer.alloc(embedding.length * 8);
    for (let i = 0; i < embedding.length; i++) {
        buf.writeDoubleLE(embedding[i], i * 8);
    }
    return buf;
}

function bufferToEmbedding(buf: Buffer): number[] {
    const count = buf.length / 8;
    const result: number[] = new Array(count);
    for (let i = 0; i < count; i++) {
        result[i] = buf.readDoubleLE(i * 8);
    }
    return result;
}

export class SkillStore {
    constructor(private db: Database.Database) { }

    insert(entry: NewSkillEntry, embedding: number[]): string {
        const id = uuid();
        this.db.prepare(`
            INSERT INTO skill_entries (id, name, description, steps, tags, embedding, usage_count)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `).run(id, entry.name, entry.description, JSON.stringify(entry.steps), JSON.stringify(entry.tags), embeddingToBuffer(embedding));
        return id;
    }

    search(queryEmbedding: number[], limit = 3): SkillEntry[] {
        const rows = this.db.prepare('SELECT * FROM skill_entries').all() as {
            id: string; name: string; description: string; steps: string;
            tags: string; embedding: Buffer; usage_count: number; created_at: string;
        }[];

        const scored = rows.map(row => {
            const emb = bufferToEmbedding(row.embedding);
            const similarity = cosineSimilarity(queryEmbedding, emb);
            return { ...row, embedding: emb, similarity };
        });

        scored.sort((a, b) => b.similarity - a.similarity);

        return scored.slice(0, limit).map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            steps: JSON.parse(row.steps) as SkillStep[],
            tags: JSON.parse(row.tags) as string[],
            embedding: row.embedding,
            usageCount: row.usage_count,
            createdAt: row.created_at,
            similarity: row.similarity,
        }));
    }

    access(id: string): void {
        this.db.prepare('UPDATE skill_entries SET usage_count = usage_count + 1 WHERE id = ?').run(id);
    }

    getStats(): { totalEntries: number } {
        const row = this.db.prepare('SELECT COUNT(*) as cnt FROM skill_entries').get() as { cnt: number };
        return { totalEntries: row.cnt };
    }
}
