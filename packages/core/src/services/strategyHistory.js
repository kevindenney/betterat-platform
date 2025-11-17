/**
 * Convert persisted strategy entries into lightweight history objects the AI
 * strategy engine can feed into prompts. We intentionally keep the payload
 * small (recent entries only) to avoid bloating prompt tokens.
 */
export function buildStrategyPhaseHistory(entries, recentLimit = 3) {
    if (!Array.isArray(entries) || !entries.length) {
        return {};
    }
    const sorted = [...entries].sort((a, b) => {
        const left = new Date(b.updated_at).getTime();
        const right = new Date(a.updated_at).getTime();
        return left - right;
    });
    const history = {};
    sorted.forEach((entry) => {
        const phaseId = entry.phase;
        if (!phaseId)
            return;
        if (!history[phaseId]) {
            history[phaseId] = {
                phaseId,
                totalEntries: 0,
                recent: [],
            };
        }
        const bucket = history[phaseId];
        bucket.totalEntries += 1;
        if (bucket.recent.length < recentLimit) {
            bucket.recent.push({
                updatedAt: entry.updated_at,
                plan: entry.plan,
                aiSuggestion: entry.ai_suggestion,
                finalized: Boolean(entry.finalized),
            });
        }
        if (!bucket.lastUpdated || new Date(entry.updated_at) > new Date(bucket.lastUpdated)) {
            bucket.lastUpdated = entry.updated_at;
            bucket.lastConfidence = entry.ai_suggestion?.confidence ?? bucket.lastConfidence;
        }
    });
    return history;
}
