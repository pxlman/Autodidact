import type Database from 'better-sqlite3';
import type {
    ExpireResult,
    IKnowledgeStore,
    KnowledgeCategory,
    KnowledgeEntry,
    KnowledgeScope,
    KnowledgeStoreStats,
    NewKnowledgeEntry,
    ScoredKnowledgeEntry,
    TemporalQuery,
} from '../types.js';
import { cosineSimilarity } from '../utils/cosine-similarity.js';
import {
    deserializeEmbedding,
    serializeEmbedding,
} from '../utils/embeddings.js';
import { generateId } from '../utils/id.js';
import type { Logger } from '../utils/logger.js';
import { defaultLogger } from '../utils/logger.js';
import { hoursSince, msSince, nowISO } from '../utils/time.js';

export interface KnowledgeStoreConfig {
    stmTtlMs: number;
    promotionWindowMs: number;
    ltmBaseStabilityHours: number;
    decayThreshold: number;
}

const DEFAULT_CONFIG: KnowledgeStoreConfig = {
    stmTtlMs: 3_600_000,
    promotionWindowMs: 3_600_000,
    ltmBaseStabilityHours: 168,
    decayThreshold: 0.1,
};

export class KnowledgeStore implements IKnowledgeStore {
    private readonly db: Database.Database;
    private readonly config: KnowledgeStoreConfig;
    private readonly logger: Logger;

    constructor(
        db: Database.Database,
        config?: Partial<KnowledgeStoreConfig>,
        logger: Logger = defaultLogger,
    ) {
        this.db = db;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.logger = logger;
    }

    insert(entry: NewKnowledgeEntry): KnowledgeEntry {
        const id = generateId();
        const now = nowISO();
        const embeddingBlob = entry.embedding
            ? serializeEmbedding(entry.embedding)
            : null;

        const domain = entry.domain ?? 'general';
        const topic = entry.topic ?? 'uncategorized';
        const category = entry.category ?? 'facts';

        this.db
            .prepare(
                `INSERT INTO knowledge_entries
                (id, content, source, confidence, tags, embedding, tier,
                 usage_count, created_at, last_accessed, promoted_at,
                 is_stale, self_test_questions, metadata,
                 domain, topic, category, valid_from, valid_to)
                VALUES (?, ?, ?, ?, ?, ?, 'STM', 0, ?, ?, NULL, 0, ?, ?, ?, ?, ?, ?, NULL)`,
            )
            .run(
                id,
                entry.content,
                entry.source,
                entry.confidence ?? 0.5,
                JSON.stringify(entry.tags ?? []),
                embeddingBlob,
                now,
                now,
                JSON.stringify(entry.selfTestQuestions ?? []),
                JSON.stringify(entry.metadata ?? {}),
                domain,
                topic,
                category,
                now,
            );

        this.logger.debug('KnowledgeStore.insert: created STM entry', { id });

        return this.get(id)!;
    }

    search(
        _query: string,
        embedding: number[],
        limit: number = 10,
        scope?: KnowledgeScope,
        temporal?: TemporalQuery,
    ): ScoredKnowledgeEntry[] {
        let sql = `SELECT * FROM knowledge_entries WHERE is_stale = 0`;
        const params: unknown[] = [];

        // Temporal filtering
        if (temporal?.asOf) {
            sql += ` AND valid_from <= ? AND (valid_to IS NULL OR valid_to > ?)`;
            params.push(temporal.asOf, temporal.asOf);
        } else {
            sql += ` AND valid_to IS NULL`;
        }

        // Scope filtering
        if (scope?.domain) {
            sql += ` AND domain = ?`;
            params.push(scope.domain);
        }
        if (scope?.topic) {
            sql += ` AND topic = ?`;
            params.push(scope.topic);
        }
        if (scope?.category) {
            sql += ` AND category = ?`;
            params.push(scope.category);
        }

        const rows = this.db.prepare(sql).all(...params) as RawRow[];

        const scored: { entry: KnowledgeEntry; score: number }[] = [];

        for (const row of rows) {
            const entry = this.rowToEntry(row);
            if (!entry.embedding || entry.embedding.length === 0) {
                continue;
            }
            const score = cosineSimilarity(embedding, entry.embedding);
            scored.push({ entry, score });
        }

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit);
    }

    get(id: string): KnowledgeEntry | null {
        const row = this.db
            .prepare(`SELECT * FROM knowledge_entries WHERE id = ?`)
            .get(id) as RawRow | undefined;

        if (!row) {
            return null;
        }
        return this.rowToEntry(row);
    }

    access(id: string): void {
        const entry = this.get(id);
        if (!entry) {
            this.logger.warn('KnowledgeStore.access: entry not found', { id });
            return;
        }

        const now = nowISO();
        this.db
            .prepare(
                `UPDATE knowledge_entries
                 SET usage_count = usage_count + 1, last_accessed = ?
                 WHERE id = ?`,
            )
            .run(now, id);

        this.logger.debug('KnowledgeStore.access: bumped usage', { id });

        // Auto-promote STM → LTM if within promotion window
        if (entry.tier === 'STM') {
            const elapsed = msSince(entry.createdAt);
            if (elapsed <= this.config.promotionWindowMs) {
                this.promoteToLTM(id);
            }
        }
    }

    promoteToLTM(id: string): void {
        const now = nowISO();
        this.db
            .prepare(
                `UPDATE knowledge_entries
                 SET tier = 'LTM', promoted_at = ?
                 WHERE id = ?`,
            )
            .run(now, id);

        this.logger.debug('KnowledgeStore.promoteToLTM: promoted', { id });
    }

    expire(id: string): void {
        this.db
            .prepare(`DELETE FROM knowledge_entries WHERE id = ?`)
            .run(id);

        this.logger.debug('KnowledgeStore.expire: deleted', { id });
    }

    invalidate(id: string): void {
        const now = nowISO();
        this.db
            .prepare(
                `UPDATE knowledge_entries SET valid_to = ? WHERE id = ?`,
            )
            .run(now, id);

        this.logger.debug('KnowledgeStore.invalidate: set valid_to', { id });
    }

    runDecayCycle(): ExpireResult {
        let expired = 0;
        let promoted = 0;

        const allRows = this.db
            .prepare(`SELECT * FROM knowledge_entries`)
            .all() as RawRow[];

        for (const row of allRows) {
            const entry = this.rowToEntry(row);

            if (entry.tier === 'STM') {
                const elapsed = msSince(entry.createdAt);
                if (elapsed > this.config.stmTtlMs) {
                    if (
                        entry.usageCount > 0 &&
                        msSince(entry.lastAccessed) <=
                        this.config.promotionWindowMs
                    ) {
                        this.promoteToLTM(entry.id);
                        promoted++;
                    } else {
                        this.expire(entry.id);
                        expired++;
                    }
                }
            } else if (entry.tier === 'LTM') {
                const t = hoursSince(entry.lastAccessed);
                const S =
                    this.config.ltmBaseStabilityHours *
                    (1 + Math.log(1 + entry.usageCount));
                const R = Math.exp(-t / S);

                if (R < this.config.decayThreshold) {
                    this.expire(entry.id);
                    expired++;
                }
            }
        }

        this.logger.info('KnowledgeStore.runDecayCycle: complete', {
            expired,
            promoted,
        });
        return { expired, promoted };
    }

    getStats(): KnowledgeStoreStats {
        const total = (
            this.db
                .prepare(
                    `SELECT COUNT(*) as cnt FROM knowledge_entries`,
                )
                .get() as { cnt: number }
        ).cnt;

        const stm = (
            this.db
                .prepare(
                    `SELECT COUNT(*) as cnt FROM knowledge_entries WHERE tier = 'STM'`,
                )
                .get() as { cnt: number }
        ).cnt;

        const ltm = (
            this.db
                .prepare(
                    `SELECT COUNT(*) as cnt FROM knowledge_entries WHERE tier = 'LTM'`,
                )
                .get() as { cnt: number }
        ).cnt;

        const stale = (
            this.db
                .prepare(
                    `SELECT COUNT(*) as cnt FROM knowledge_entries WHERE is_stale = 1`,
                )
                .get() as { cnt: number }
        ).cnt;

        return { total, stm, ltm, stale };
    }

    listDomains(): string[] {
        const rows = this.db
            .prepare(
                `SELECT DISTINCT domain FROM knowledge_entries WHERE valid_to IS NULL ORDER BY domain`,
            )
            .all() as { domain: string }[];
        return rows.map((r) => r.domain);
    }

    listTopics(domain: string): string[] {
        const rows = this.db
            .prepare(
                `SELECT DISTINCT topic FROM knowledge_entries WHERE domain = ? AND valid_to IS NULL ORDER BY topic`,
            )
            .all(domain) as { topic: string }[];
        return rows.map((r) => r.topic);
    }

    listCategories(): KnowledgeCategory[] {
        const rows = this.db
            .prepare(
                `SELECT DISTINCT category FROM knowledge_entries WHERE valid_to IS NULL ORDER BY category`,
            )
            .all() as { category: string }[];
        return rows.map((r) => r.category as KnowledgeCategory);
    }

    getCrossDomainTopics(): Array<{ topic: string; domains: string[] }> {
        const rows = this.db
            .prepare(
                `SELECT topic, GROUP_CONCAT(DISTINCT domain) as domains
                 FROM knowledge_entries
                 WHERE valid_to IS NULL
                 GROUP BY topic
                 HAVING COUNT(DISTINCT domain) > 1`,
            )
            .all() as { topic: string; domains: string }[];
        return rows.map((r) => ({
            topic: r.topic,
            domains: r.domains.split(','),
        }));
    }

    // ── Private helpers ─────────────────────────────────────

    private rowToEntry(row: RawRow): KnowledgeEntry {
        return {
            id: row.id,
            content: row.content,
            source: row.source as KnowledgeEntry['source'],
            confidence: row.confidence,
            tags: JSON.parse(row.tags) as string[],
            embedding: row.embedding
                ? deserializeEmbedding(row.embedding as Buffer)
                : null,
            tier: row.tier as KnowledgeEntry['tier'],
            usageCount: row.usage_count,
            createdAt: row.created_at,
            lastAccessed: row.last_accessed,
            promotedAt: row.promoted_at,
            isStale: row.is_stale === 1,
            selfTestQuestions: JSON.parse(row.self_test_questions) as string[],
            metadata: JSON.parse(row.metadata) as Record<string, unknown>,
            domain: row.domain,
            topic: row.topic,
            category: row.category as KnowledgeCategory,
            validFrom: row.valid_from,
            validTo: row.valid_to,
        };
    }
}

/** Raw SQLite row shape for knowledge_entries */
interface RawRow {
    id: string;
    content: string;
    source: string;
    confidence: number;
    tags: string;
    embedding: Buffer | null;
    tier: string;
    usage_count: number;
    created_at: string;
    last_accessed: string;
    promoted_at: string | null;
    is_stale: number;
    self_test_questions: string;
    metadata: string;
    domain: string;
    topic: string;
    category: string;
    valid_from: string;
    valid_to: string | null;
}
