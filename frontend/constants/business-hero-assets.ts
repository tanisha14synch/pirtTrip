/**
 * Bump HERO_BG_VERSION when replacing frontend/public/images/upcoming-hero-bg.svg
 * so production/CDN fetches the new file instead of a cached copy.
 */
export const BUSINESS_HERO_BG_VERSION = 3

export const BUSINESS_HERO_BG_SRC = `/images/upcoming-hero-bg.svg?v=${BUSINESS_HERO_BG_VERSION}`
