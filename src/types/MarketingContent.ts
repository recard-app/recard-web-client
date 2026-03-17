import { APP_NAME } from './Constants';

/** Primary tagline used across meta tags, OG, and marketing surfaces */
export const TAGLINE = 'The calm way to maximize rewards';

/** Longer description for meta description tags and OG descriptions */
export const META_DESCRIPTION = `${APP_NAME} - ${TAGLINE}. AI-powered credit card recommendations tailored to your spending habits.`;

/** Short meta description variant for constrained contexts */
export const META_DESCRIPTION_SHORT = `${APP_NAME} - ${TAGLINE}`;

/** Production domain (no trailing slash) */
export const SITE_URL = 'https://cardzen.ai';

/** Page-specific meta descriptions for public routes (all others fall back to META_DESCRIPTION) */
export const PAGE_META_DESCRIPTIONS: Record<string, string> = {
  '/': META_DESCRIPTION,
  '/signin': `Sign in to ${APP_NAME} to access your personalized credit card recommendations.`,
  '/signup': `Create your free ${APP_NAME} account and start maximizing your credit card rewards.`,
  '/terms': `${APP_NAME} Terms of Service - read our terms and conditions.`,
  '/privacy': `${APP_NAME} Privacy Policy - learn how we handle your data.`,
};

/** Title template: "Page Title | cardzen" */
export const formatPageTitle = (pageTitle: string): string =>
  `${pageTitle} | ${APP_NAME}`;

/** Homepage/landing title (no pipe separator) */
export const LANDING_TITLE = `${APP_NAME} - ${TAGLINE}`;
