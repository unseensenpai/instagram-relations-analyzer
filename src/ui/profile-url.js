// Instagram URL'lerinden hedef profil kullanıcı adını güvenilir biçimde çıkarır.
// SPA navigasyonlarında alt profil sekmelerini (/user/reels/, /user/followers/ vb.)
// destekler, profil olmayan sistem ve gönderi yollarını eler.

const NON_PROFILE_PATHS = new Set([
  'explore',
  'direct',
  'reels',
  'stories',
  'accounts',
  'p',
  'reel',
  'tv',
  'about',
  'legal',
  'developer',
  'developers',
  'notifications',
  'api',
  'graphql',
  'challenge',
  'session',
  'emails',
  'download',
  'your_activity',
  'archive',
  'create',
  'call',
  'nametag',
  'oauth',
  'lite',
  'web',
  'privacy',
  'terms',
  'press',
  'directory',
  'popular'
]);

const PROFILE_SUBPAGES = new Set([
  'followers',
  'following',
  'reels',
  'tagged',
  'saved',
  'channel',
  'guides',
  'related_profiles',
  'mutual_followers',
  'similar_accounts',
  'reposts'
]);

// Instagram kullanıcı adları: 1-30 karakter, harf/rakam/nokta/alt çizgi
const VALID_USERNAME_RE = /^[a-zA-Z0-9._]{1,30}$/;

/**
 * Verilen pathname'den profil kullanıcı adını çıkarır.
 * Geçerli bir profil URL'si değilse null döner.
 */
export function extractUsernameFromPathname(pathname) {
  if (typeof pathname !== 'string') return null;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0 || segments.length > 2) {
    return null;
  }

  let candidate;
  try {
    candidate = decodeURIComponent(segments[0]).trim();
  } catch {
    return null;
  }

  if (!candidate || NON_PROFILE_PATHS.has(candidate.toLowerCase())) {
    return null;
  }

  if (!VALID_USERNAME_RE.test(candidate)) {
    return null;
  }

  // İkinci segment varsa yalnızca bilinen profil alt sekmelerine izin ver
  // (örn. /user/p/xyz 3 segment olduğu için zaten elendi; /user/bilinmeyen de elenir)
  if (segments.length === 2 && !PROFILE_SUBPAGES.has(segments[1].toLowerCase())) {
    return null;
  }

  return candidate;
}
