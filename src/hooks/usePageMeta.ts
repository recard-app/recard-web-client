import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { createElement } from 'react';
import { PageUtils } from '../types/Pages';
import {
  formatPageTitle,
  LANDING_TITLE,
  META_DESCRIPTION,
  PAGE_META_DESCRIPTIONS,
  SITE_URL,
} from '../types/MarketingContent';

/** Public routes that should get a canonical URL and be indexable */
const PUBLIC_ROUTES = new Set(['/', '/signin', '/signup', '/terms', '/privacy']);

/**
 * Returns a Helmet element that sets the page title, meta description,
 * canonical URL, and noindex for protected routes.
 *
 * Call once in the top-level layout component and render its return value.
 */
export function usePageMeta(isLandingPage: boolean) {
  const { pathname } = useLocation();

  const isPublic = PUBLIC_ROUTES.has(pathname);

  // Title
  const pageTitle = PageUtils.getTitleByPath(pathname);
  const title = isLandingPage
    ? LANDING_TITLE
    : pageTitle
      ? formatPageTitle(pageTitle)
      : formatPageTitle('Page Not Found');

  // Description
  const description = PAGE_META_DESCRIPTIONS[pathname] || META_DESCRIPTION;

  // Build children array for Helmet
  const children: React.ReactNode[] = [
    createElement('title', { key: 'title' }, title),
    createElement('meta', { key: 'desc', name: 'description', content: description }),
  ];

  if (isPublic) {
    children.push(
      createElement('link', {
        key: 'canonical',
        rel: 'canonical',
        href: `${SITE_URL}${pathname === '/' ? '' : pathname}`,
      })
    );
  } else {
    children.push(
      createElement('meta', {
        key: 'robots',
        name: 'robots',
        content: 'noindex, nofollow',
      })
    );
  }

  return createElement(Helmet, null, ...children);
}
