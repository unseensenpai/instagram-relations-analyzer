// İki Instagram ilişki anlık görüntüsünü (önceki JSON/CSV veya geçmiş kaydı vs güncel veri)
// ayrıştırma ve fark (diff) hesaplama modülü. DOM bağımlılığı yoktur.

export const COMPARE_LIST_KEYS = [
  'newFollowers',
  'lostFollowers',
  'newFollowing',
  'unfollowed',
  'renamed'
];

export function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const pk = raw.pk != null && raw.pk !== ''
    ? String(raw.pk).trim()
    : (raw.id != null && raw.id !== '' ? String(raw.id).trim() : '');
  const username = typeof raw.username === 'string' ? raw.username.trim() : '';
  const full_name = typeof raw.full_name === 'string' ? raw.full_name.trim() : '';

  if (!pk && !username) return null;

  return { pk, username, full_name };
}

function normalizeUserList(list) {
  if (!Array.isArray(list)) return [];
  const result = [];
  const seen = new Set();

  for (const item of list) {
    const user = normalizeUser(item);
    if (!user) continue;
    const dedupeKey = user.pk ? `pk:${user.pk}` : `u:${user.username.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    result.push(user);
  }

  return result;
}

/**
 * Kullanıcının yüklediği JSON metnini ayrıştırır.
 * Desteklenen biçimler:
 *  1) Eklentinin "Tümünü İndir" JSON çıktısı ({ target_username, target_id, exported_at, details: { followers, following } })
 *  2) localStorage / geçmiş biçimi ({ timestamp, dataStore: { followers, following } })
 *  3) Düz nesne ({ followers, following })
 */
export function parseSnapshotJson(rawText, fallbackName = '') {
  let parsed;
  try {
    const cleaned = typeof rawText === 'string' ? rawText.replace(/^\uFEFF/, '') : '';
    parsed = JSON.parse(cleaned);
  } catch {
    return { ok: false, errorKey: 'compare.invalidFile' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, errorKey: 'compare.invalidFile' };
  }

  const container =
    (parsed.details && typeof parsed.details === 'object' && !Array.isArray(parsed.details))
      ? parsed.details
      : (parsed.dataStore && typeof parsed.dataStore === 'object' && !Array.isArray(parsed.dataStore))
        ? parsed.dataStore
        : parsed;

  const hasFollowers = Array.isArray(container.followers);
  const hasFollowing = Array.isArray(container.following);

  if (!hasFollowers && !hasFollowing) {
    return { ok: false, errorKey: 'compare.missingLists' };
  }

  const targetUsername = typeof parsed.target_username === 'string'
    ? parsed.target_username.trim()
    : (typeof parsed.username === 'string' ? parsed.username.trim() : '');
  const targetId = parsed.target_id != null && parsed.target_id !== ''
    ? String(parsed.target_id)
    : (parsed.userId != null && parsed.userId !== '' ? String(parsed.userId) : '');
  const exportedAt = typeof parsed.exported_at === 'string'
    ? parsed.exported_at
    : (typeof parsed.timestamp === 'string' ? parsed.timestamp : '');

  return {
    ok: true,
    snapshot: {
      fileName: fallbackName,
      targetUsername,
      targetId,
      exportedAt,
      hasFollowers,
      hasFollowing,
      followers: hasFollowers ? normalizeUserList(container.followers) : [],
      following: hasFollowing ? normalizeUserList(container.following) : []
    }
  };
}

// RFC 4180 uyumlu tek satır CSV ayrıştırıcısı (virgül veya noktalı virgül destekli)
function parseCsvRow(line, delimiter = ',') {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function detectCsvDelimiter(lines) {
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const commas = (trimmed.match(/,/g) || []).length;
    const semicolons = (trimmed.match(/;/g) || []).length;
    if (semicolons >= 2 && semicolons > commas) return ';';
    if (commas >= 2) return ',';
  }
  return ',';
}

// Çok dilli "Tümünü İndir" CSV bölüm başlıklarını tanır (TR / EN / ES)
function detectCsvSection(line) {
  const normalized = line.trim().replace(/^"|"$/g, '').toLowerCase();

  // "not following back" / "geri takip etmeyenler" / "no te siguen" önce kontrol edilir
  if (
    /^not following back\b/.test(normalized) ||
    /^geri takip etmeyenler\b/.test(normalized) ||
    /^no te siguen\b/.test(normalized)
  ) {
    return 'notFollowingBack';
  }

  if (
    /^you don't follow back\b/.test(normalized) ||
    /^not followed back\b/.test(normalized) ||
    /^takip etmediklerim\b/.test(normalized) ||
    /^takip etmediği\b/.test(normalized) ||
    /^no sigues de vuelta\b/.test(normalized) ||
    /^no seguidos de vuelta\b/.test(normalized)
  ) {
    return 'iNotFollowingBack';
  }

  if (
    /^following\b/.test(normalized) ||
    /^takip edilenler\b/.test(normalized) ||
    /^siguiendo\b/.test(normalized)
  ) {
    return 'following';
  }

  if (
    /^followers\b/.test(normalized) ||
    /^takipçiler\b/.test(normalized) ||
    /^seguidores\b/.test(normalized)
  ) {
    return 'followers';
  }

  return null;
}

function isCsvColumnHeader(fields) {
  if (fields.length < 2) return false;
  const first = fields[0].trim().toLowerCase();
  const second = fields[1].trim().toLowerCase();
  const idMatch = first === 'instagram id' || first === 'id de instagram' || first === 'pk' || first === 'id';
  const userMatch = second === 'username' || second === 'kullanıcı adı' || second === 'usuario';
  return idMatch && userMatch;
}

function extractMetaFromFilename(fileName) {
  if (!fileName) return { targetUsername: '', exportedAt: '', inferredSection: null };

  // Örn: ig-alice-all-data-2026-11-01.csv veya ig-alice-followers-2026-11-01.csv
  const match = fileName.match(/^ig-([a-zA-Z0-9._]+)-(all-data|followers|following|notFollowingBack|iNotFollowingBack)-(\d{4}-\d{2}-\d{2})\./i);
  if (match) {
    const listType = match[2].toLowerCase();
    return {
      targetUsername: match[1],
      exportedAt: match[3],
      inferredSection: listType === 'followers' ? 'followers' : (listType === 'following' ? 'following' : null)
    };
  }

  const lower = fileName.toLowerCase();
  const inferredSection = lower.includes('followers')
    ? 'followers'
    : (lower.includes('following') ? 'following' : null);

  return { targetUsername: '', exportedAt: '', inferredSection };
}

/**
 * Eklentinin ürettiği "Tümünü İndir" CSV veya tekil followers/following CSV dosyasını ayrıştırır.
 */
export function parseSnapshotCsv(rawText, fallbackName = '') {
  if (typeof rawText !== 'string') {
    return { ok: false, errorKey: 'compare.invalidFile' };
  }

  const cleaned = rawText.replace(/^\uFEFF/, '');
  const lines = cleaned.split(/\r?\n/);
  const delimiter = detectCsvDelimiter(lines);
  const fileMeta = extractMetaFromFilename(fallbackName);

  const followers = [];
  const following = [];
  let hasFollowers = false;
  let hasFollowing = false;
  let currentSection = null;
  let sawAnySectionHeader = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Bölüm başlığı mı? (örn: "Takipçiler (420)" veya "Following (310)")
    const section = detectCsvSection(trimmed);
    if (section) {
      sawAnySectionHeader = true;
      currentSection = section;
      if (section === 'followers') hasFollowers = true;
      if (section === 'following') hasFollowing = true;
      continue;
    }

    const fields = parseCsvRow(rawLine, delimiter);
    if (isCsvColumnHeader(fields)) {
      if (!sawAnySectionHeader && fileMeta.inferredSection) {
        currentSection = fileMeta.inferredSection;
        if (currentSection === 'followers') hasFollowers = true;
        if (currentSection === 'following') hasFollowing = true;
      }
      continue;
    }

    if (currentSection !== 'followers' && currentSection !== 'following') {
      continue;
    }

    if (fields.length >= 2) {
      const user = normalizeUser({
        pk: fields[0],
        username: fields[1],
        full_name: fields[2] || ''
      });
      if (user) {
        if (currentSection === 'followers') followers.push(user);
        else following.push(user);
      }
    }
  }

  if (!hasFollowers && !hasFollowing) {
    return { ok: false, errorKey: 'compare.missingLists' };
  }

  return {
    ok: true,
    snapshot: {
      fileName: fallbackName,
      targetUsername: fileMeta.targetUsername,
      targetId: '',
      exportedAt: fileMeta.exportedAt,
      hasFollowers,
      hasFollowing,
      followers: normalizeUserList(followers),
      following: normalizeUserList(following)
    }
  };
}

/**
 * Eklentinin ürettiği interaktif HTML raporunun içine gömülü JSON anlık görüntüsünü okur.
 */
export function parseSnapshotHtml(rawText, fallbackName = '') {
  if (typeof rawText !== 'string') {
    return { ok: false, errorKey: 'compare.invalidFile' };
  }
  const match = rawText.match(/<script[^>]*id=["']ig-relations-data["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match?.[1]) {
    return { ok: false, errorKey: 'compare.invalidFile' };
  }
  return parseSnapshotJson(match[1], fallbackName);
}

/**
 * JSON, CSV veya eklenti HTML raporunu uzantı ve içeriğe göre otomatik algılayıp ayrıştırır.
 */
export function parseSnapshotFile(rawText, fileName = '') {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return { ok: false, errorKey: 'compare.invalidFile' };
  }

  const trimmed = rawText.replace(/^\uFEFF/, '').trimStart();
  const isHtmlExt = /\.html?$/i.test(fileName);
  const looksLikeHtml = /^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed);

  if (isHtmlExt || looksLikeHtml) {
    return parseSnapshotHtml(rawText, fileName);
  }

  const isJsonExt = /\.json$/i.test(fileName);
  const looksLikeJson = trimmed.startsWith('{') || trimmed.startsWith('[');

  if (isJsonExt || looksLikeJson) {
    return parseSnapshotJson(rawText, fileName);
  }

  return parseSnapshotCsv(rawText, fileName);
}

function indexUsers(users) {
  const byPk = new Map();
  const byUsername = new Map();
  let hasPks = false;

  for (const user of users) {
    if (user.pk) {
      hasPks = true;
      byPk.set(user.pk, user);
    }
    if (user.username) {
      byUsername.set(user.username.toLowerCase(), user);
    }
  }

  return { byPk, byUsername, hasPks };
}

function findMatchingUser(user, otherIndex) {
  if (user.pk && otherIndex.hasPks) {
    return otherIndex.byPk.get(user.pk) || null;
  }
  if (user.username) {
    return otherIndex.byUsername.get(user.username.toLowerCase()) || null;
  }
  return null;
}

function diffLists(previousList, currentList) {
  const prevIndex = indexUsers(previousList);
  const currIndex = indexUsers(currentList);

  const added = [];
  const removed = [];

  for (const currUser of currentList) {
    if (!findMatchingUser(currUser, prevIndex)) {
      added.push(currUser);
    }
  }

  for (const prevUser of previousList) {
    if (!findMatchingUser(prevUser, currIndex)) {
      removed.push(prevUser);
    }
  }

  return { added, removed };
}

export function computeRelationsDiff(previousSnapshot, currentData) {
  const currFollowers = normalizeUserList(currentData?.followers || []);
  const currFollowing = normalizeUserList(currentData?.following || []);

  const followersDiff = previousSnapshot.hasFollowers
    ? diffLists(previousSnapshot.followers, currFollowers)
    : { added: [], removed: [] };

  const followingDiff = previousSnapshot.hasFollowing
    ? diffLists(previousSnapshot.following, currFollowing)
    : { added: [], removed: [] };

  // Aynı pk'ye sahip olup kullanıcı adı değişen hesapları tespit et
  const prevByPk = new Map();
  for (const u of [...previousSnapshot.followers, ...previousSnapshot.following]) {
    if (u.pk && u.username && !prevByPk.has(u.pk)) {
      prevByPk.set(u.pk, u);
    }
  }

  const renamed = [];
  const seenRenamed = new Set();
  for (const curr of [...currFollowers, ...currFollowing]) {
    if (!curr.pk || !curr.username || seenRenamed.has(curr.pk)) continue;
    const prev = prevByPk.get(curr.pk);
    if (prev && prev.username && prev.username !== curr.username) {
      seenRenamed.add(curr.pk);
      renamed.push({
        pk: curr.pk,
        username: curr.username,
        old_username: prev.username,
        full_name: curr.full_name || prev.full_name || ''
      });
    }
  }

  return {
    newFollowers: followersDiff.added,
    lostFollowers: followersDiff.removed,
    newFollowing: followingDiff.added,
    unfollowed: followingDiff.removed,
    renamed,
    counts: {
      previousFollowers: previousSnapshot.followers.length,
      currentFollowers: currFollowers.length,
      followersDelta: currFollowers.length - previousSnapshot.followers.length,
      previousFollowing: previousSnapshot.following.length,
      currentFollowing: currFollowing.length,
      followingDelta: currFollowing.length - previousSnapshot.following.length
    }
  };
}

export function formatDelta(value) {
  if (value > 0) return `+${value}`;
  return String(value);
}
