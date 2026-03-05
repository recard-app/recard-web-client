import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { HelpService } from '../../../services/helpService';
import type { HelpArticleContent } from '../../../types';

/** Map path slugs that don't match article IDs via simple `/` -> `-` conversion. */
const PATH_TO_ID_OVERRIDES: Record<string, string> = {
  'account': 'account-settings',
};

/**
 * Convert a URL path (relative to /help/) into an article ID.
 * e.g. "ask-ai/prompts" -> "ask-ai-prompts", "account" -> "account-settings"
 */
function pathToArticleId(path: string): string {
  // Strip leading/trailing slashes
  const clean = path.replace(/^\/+|\/+$/g, '');
  if (PATH_TO_ID_OVERRIDES[clean]) return PATH_TO_ID_OVERRIDES[clean];
  return clean.replace(/\//g, '-');
}

/**
 * Pre-process custom markdown syntax before passing to react-markdown:
 * 1. :::type / ::: fences -> <div class="callout callout--type">...</div>
 * 2. Strip {.nav-path} attribute syntax from links (react-markdown doesn't support it)
 */
function preprocessMarkdown(md: string): string {
  // Convert :::type fences to HTML divs
  let result = md.replace(
    /^:::(tip|info|warning)\s*\n([\s\S]*?)^:::\s*$/gm,
    (_match, type: string, content: string) =>
      `<div class="callout callout--${type}">\n\n${content.trim()}\n\n</div>`
  );

  // Strip {.nav-path} from link text but add the class to the link itself
  // Pattern: [text]{.nav-path} -> [text]
  // The class will be applied via the custom `a` component for internal links
  result = result.replace(/\{\.nav-path\}/g, '');

  return result;
}

interface HelpArticleRendererProps {
  articleId?: string;
}

const HelpArticleRenderer: React.FC<HelpArticleRendererProps> = ({ articleId: propId }) => {
  const location = useLocation();
  const [article, setArticle] = useState<HelpArticleContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine article ID from prop or URL path
  const resolvedId = propId ?? pathToArticleId(
    location.pathname.replace(/^\/help\/?/, '') || 'getting-started'
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    HelpService.fetchArticle(resolvedId)
      .then((data) => {
        if (!cancelled) {
          setArticle(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const status = err?.response?.status;
          if (status === 404) {
            setError('Article not found.');
          } else {
            setError('Failed to load article. Please try again later.');
          }
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [resolvedId]);

  if (loading) {
    return (
      <div className="help-content">
        <div className="help-article-loading">
          <div className="help-article-loading__bar" />
          <div className="help-article-loading__bar help-article-loading__bar--short" />
          <div className="help-article-loading__bar help-article-loading__bar--medium" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="help-content">
        <p>{error || 'Article not found.'}</p>
      </div>
    );
  }

  const processedContent = preprocessMarkdown(article.content);

  return (
    <div className="help-content">
      <h2 className="help-content__title">{article.title}</h2>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ href, children, ...props }) => {
            if (href && href.startsWith('/')) {
              return (
                <Link to={href} className="nav-path">
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default HelpArticleRenderer;
