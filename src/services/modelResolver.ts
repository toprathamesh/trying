import type { PolyPizzaModel, SearchResult } from './polyPizzaService';
import type { SceneElement } from './geminiService';

/**
 * ModelResolver - decides which 3D model is "best" for a given scene element.
 *
 * V1: simple heuristic based on title / query matching.
 * Later, we can plug Gemini-based visual / semantic scoring in here without
 * touching the rest of the pipeline.
 */
export class ModelResolver {
  /**
   * Pick the best model from a Poly Pizza search result for a given element.
   */
  chooseBestModel(element: SceneElement, searchResult: SearchResult): PolyPizzaModel | null {
    const { models } = searchResult;
    if (!models || models.length === 0) return null;

    const query = element.searchQuery.toLowerCase().trim();
    const queryTokens = query.split(/\s+/).filter(Boolean);

    let best: { model: PolyPizzaModel; score: number } | null = null;

    for (const model of models) {
      const title = (model.title || '').toLowerCase();
      const category = (model.category || '').toLowerCase();

      let score = 0;

      // Exact match on title is very strong
      if (title === query) score += 10;

      // Title contains full query
      if (query && title.includes(query)) score += 6;

      // Token overlap between query and title/category
      for (const token of queryTokens) {
        if (!token) continue;
        if (title.includes(token)) score += 2;
        if (category && category.includes(token)) score += 1;
      }

      // Very small preference for shorter, simpler titles
      score -= Math.min(title.length, 60) / 60;

      if (!best || score > best.score) {
        best = { model, score };
      }
    }

    if (!best) return null;

    console.log(
      `🤖 ModelResolver chose "${best.model.title}" for "${element.searchQuery}" with score ${best.score.toFixed(
        2,
      )}`,
    );

    return best.model;
  }
}

export const modelResolver = new ModelResolver();




