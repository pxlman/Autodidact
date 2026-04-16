import type Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import type { KnowledgeEntry, NewKnowledgeEntry } from './types.js';

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

export class KnowledgeStore {
    constructor(private db: Database.Database) { }

    insert(entry: NewKnowledgeEntry, embedding: number[]): string {
        const id = uuid();
        const stmt = this.db.prepare(`
      INSERT INTO knowledge_entries (id, content, source, confidence, tags, embedding, usage_count)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);
        stmt.run(id, entry.content, entry.source, entry.confidence, JSON.stringify(entry.tags), embeddingToBuffer(embedding));
        return id;
    }

    search(queryEmbedding: number[], limit = 5): KnowledgeEntry[] {
        const rows = this.db.prepare('SELECT * FROM knowledge_entries').all() as {
            id: string; content: string; source: string; confidence: number;
            tags: string; embedding: Buffer; usage_count: number;
            created_at: string; last_accessed: string;
        }[];

        const scored = rows.map(row => {
            const emb = bufferToEmbedding(row.embedding);
            const similarity = cosineSimilarity(queryEmbedding, emb);
            return { ...row, embedding: emb, similarity };
        });

        scored.sort((a, b) => b.similarity - a.similarity);

        return scored.slice(0, limit).map(row => ({
            id: row.id,
            content: row.content,
            source: row.source,
            confidence: row.confidence,
            tags: JSON.parse(row.tags) as string[],
            embedding: row.embedding,
            usageCount: row.usage_count,
            createdAt: row.created_at,
            lastAccessed: row.last_accessed,
            similarity: row.similarity,
        }));
    }

    access(id: string): void {
        this.db.prepare(`
      UPDATE knowledge_entries SET usage_count = usage_count + 1, last_accessed = datetime('now') WHERE id = ?
    `).run(id);
    }

    getStats(): { totalEntries: number; totalAccesses: number } {
        const row = this.db.prepare(
            'SELECT COUNT(*) as cnt, COALESCE(SUM(usage_count), 0) as acc FROM knowledge_entries'
        ).get() as { cnt: number; acc: number };
        return { totalEntries: row.cnt, totalAccesses: row.acc };
    }
}
