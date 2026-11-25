import type { HelpArticle, HelpTopicId } from '@/types/help';

const SNIPPET_LENGTH = 150;

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/** Plain substring search over the question and answer; good enough for ~25 articles. */
export function matchesQuery(article: HelpArticle, query: string): boolean {
  const needle = normalizeQuery(query);
  return !needle || `${article.question} ${article.answer}`.toLowerCase().includes(needle);
}

export function searchArticles(articles: readonly HelpArticle[], query: string): HelpArticle[] {
  const needle = normalizeQuery(query);
  return needle ? articles.filter((article) => matchesQuery(article, needle)) : [];
}

export function articlesInTopic(
  articles: readonly HelpArticle[],
  topicId: HelpTopicId,
  query = '',
): HelpArticle[] {
  return articles.filter((article) => article.topicId === topicId && matchesQuery(article, query));
}

/** The answer cut at a word boundary, for result lists. */
export function snippet(text: string): string {
  return text.length > SNIPPET_LENGTH ? `${text.slice(0, SNIPPET_LENGTH - 3).replace(/\s+\S*$/, '')}…` : text;
}

export function isHelpTopicId(
  value: string | null,
  topics: ReadonlyArray<{ id: HelpTopicId }>,
): value is HelpTopicId {
  return topics.some((topic) => topic.id === value);
}
