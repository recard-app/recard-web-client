import DOMPurify from 'dompurify';
import showdown from 'showdown';

/**
 * Sanitized markdown-to-HTML converter.
 * Wraps showdown's output with DOMPurify to prevent XSS from
 * untrusted markdown content (e.g., LLM-generated responses).
 */

const ALLOWED_TAGS = [
  'p', 'strong', 'em', 'b', 'i',
  'ul', 'ol', 'li',
  'a', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'br', 'blockquote',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'span', 'div',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

/**
 * Convert markdown to sanitized HTML.
 * Uses a shared DOMPurify config to allow only safe markdown tags.
 */
export function sanitizeMarkdownHtml(converter: showdown.Converter, markdown: string): string {
  const rawHtml = converter.makeHtml(markdown);
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
