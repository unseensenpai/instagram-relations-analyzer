import { LANGUAGES, initLanguage, getLanguage, setLanguage, t } from './i18n.js';
import {
  COMPARE_LIST_KEYS,
  parseSnapshotFile,
  computeRelationsDiff,
  formatDelta
} from './compare.js';
import {
  listProfileSnapshots,
  saveProfileSnapshot,
  deleteProfileSnapshot
} from './history.js';
import { extractUsernameFromPathname } from './profile-url.js';
import { buildProfileHtmlReport, buildCompareHtmlReport } from './html-export.js';

const CONFIG = {
  appId: '936619743392459',
  targetUserId: null,
  targetUsername: ''
};

// Her profilin verisini ayırmak için ana depo yapısı
let profileCaches = {};
// Oturum boyunca username -> { id, username, followersCount, followingCount } önbelleği
const resolvedProfiles = new Map();
// Aktif üst sekme: 'analysis' | 'compare' | 'viewer'
let activePanel = 'analysis';
let currentFilterKey = 'following';
let isSyncing = false;
let syncAbortController = null;
let currentSearchTerm = '';
// Ekranda gösterilen son senkronizasyon zamanı; dil değişince
// etiketi yeniden çevirebilmek için ham hâliyle saklanır.
let lastSyncedTimestamp = '';
// Profil değiştiğinde önceki profilin verisini/karşılaştırmasını temizlemek için
let lastLoadedUserId = null;
let lastLoadedUsername = '';
let lastObservedPathname = '';
let profileResolveSeq = 0;
let urlWatchTimer = null;

// Karşılaştırma durumu (önceki JSON/CSV veya geçmiş kaydı ile fark analizi)
let compareSnapshot = null;
// 2 dosya karşılaştırmasında "güncel/yeni" tarafı tutar; null ise aktif profil cache'i kullanılır
let compareCurrentSnapshot = null;
let compareDiff = null;
let activeCompareKey = 'lostFollowers';
// Dosya Görüntüleyici sekmesinin bağımsız verisi
let viewerFileData = null;
let viewerFilterKey = 'following';
// Aktif profilin IndexedDB'deki geçmiş senkronizasyon kayıtları
let profileHistory = [];

const searchInput = document.getElementById('ig-relations-search');
const compareFileInput = document.getElementById('ig-compare-file-input');
const viewerFileInput = document.getElementById('ig-viewer-file-input');

// Arama kutusunu ve terimi sıfırlar (listeyi yeniden çizmez)
function clearSearch() {
  searchInput.value = '';
  currentSearchTerm = '';
}

initLanguage();
setupLanguageSelector();
applyTranslations();

// data-i18n* işaretli tüm elemanları aktif dile göre yeniden yazar.
// Dinamik metinler (durum mesajları, liste içeriği) ilgili yerlerde
// t() ile üretildiği için burada ele alınmaz.
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // Başlık, profil seçiliyse kullanıcı adını da içerir
  document.getElementById('ig-relations-title').textContent = CONFIG.targetUsername
    ? t('app.titleWithUser', { username: CONFIG.targetUsername })
    : t('app.title');

  // Sync butonu senkronizasyon sırasında farklı metin gösterir
  document.getElementById('btn-fetch-data').textContent = isSyncing
    ? t('sidebar.syncing')
    : t('sidebar.sync');
}

function setupLanguageSelector() {
  const select = document.getElementById('ig-relations-language');

  LANGUAGES.forEach(({ code, label }) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = label;
    select.appendChild(option);
  });

  select.value = getLanguage();

  select.addEventListener('change', () => {
    setLanguage(select.value);
    applyTranslations();
    // Liste öğelerindeki aksiyon butonları, geçmiş barı ve karşılaştırma banner'ı da çevrilmeli
    renderHistoryBar();
    refreshCompareBanner();
    refreshViewerFileInfo();
    rerenderCurrentList();
    refreshCacheTimestamp();
  });
}

function abortCurrentSync() {
  if (syncAbortController) {
    syncAbortController.abort();
    syncAbortController = null;
  }
}

document.getElementById('ig-relations-close-btn').addEventListener('click', () => {
  if (isSyncing) {
    if (!confirm(t('confirm.closeWhileSyncing'))) {
      return;
    }
    abortCurrentSync();
  }
  document.getElementById('ig-relations-modal-overlay').classList.add('ig-relations-hidden');
});

function startUrlWatcher() {
  stopUrlWatcher();
  lastObservedPathname = window.location.pathname;
  urlWatchTimer = setInterval(() => {
    if (modalOverlay.classList.contains('ig-relations-hidden')) {
      stopUrlWatcher();
      return;
    }
    if (window.location.pathname !== lastObservedPathname) {
      lastObservedPathname = window.location.pathname;
      syncModalToCurrentUrl();
    }
  }, 500);
}

function stopUrlWatcher() {
  if (urlWatchTimer) {
    clearInterval(urlWatchTimer);
    urlWatchTimer = null;
  }
}

window.addEventListener('popstate', () => {
  if (!modalOverlay.classList.contains('ig-relations-hidden')) {
    lastObservedPathname = window.location.pathname;
    syncModalToCurrentUrl();
  }
});

async function syncModalToCurrentUrl() {
  const seq = ++profileResolveSeq;
  const urlUsername = extractUsernameFromPathname(window.location.pathname);

  // Başka bir profile geçildiyse devam eden eski sync'i iptal et
  if (isSyncing && urlUsername?.toLowerCase() !== lastLoadedUsername.toLowerCase()) {
    abortCurrentSync();
  }

  clearSearch();

  if (!urlUsername) {
    CONFIG.targetUserId = null;
    CONFIG.targetUsername = '';
    lastLoadedUserId = null;
    lastLoadedUsername = '';
    profileHistory = [];
    if (!compareCurrentSnapshot) clearCompareState({ rerender: false });
    renderHistoryBar();
    document.getElementById('ig-relations-title').textContent = t('app.title');
    resetUI();
    if (activePanel === 'analysis') {
      updateStatus(t('status.invalidProfile'), true);
    }
    return;
  }

  // Kullanıcı başka bir profile geçtiyse, async çözümleme tamamlanmadan ÖNCE
  // eski profilin verisini ekrandan hemen temizle (eski analiz ekranda kalmasın).
  if (urlUsername.toLowerCase() !== lastLoadedUsername.toLowerCase()) {
    profileHistory = [];
    if (!compareCurrentSnapshot) clearCompareState({ rerender: false });
    renderHistoryBar();
    resetUI();
    document.getElementById('ig-relations-title').textContent =
      t('app.titleWithUser', { username: urlUsername });
    if (activePanel === 'analysis') {
      updateStatus(t('status.resolvingProfile', { username: urlUsername }));
    }
  }

  const result = await resolveTargetProfile(urlUsername);
  // Bu arada başka bir URL'ye geçildiyse veya modal tekrar açıldıysa eski cevabı yoksay
  if (seq !== profileResolveSeq) return;

  if (result.status !== 'ok') {
    CONFIG.targetUserId = null;
    CONFIG.targetUsername = urlUsername;
    lastLoadedUserId = null;
    lastLoadedUsername = urlUsername;
    profileHistory = [];
    renderHistoryBar();
    resetUI();
    if (activePanel === 'analysis') {
      updateStatus(t('status.profileResolveFailed', { username: urlUsername }), true);
    }
    return;
  }

  if (lastLoadedUserId && lastLoadedUserId !== CONFIG.targetUserId) {
    if (!compareCurrentSnapshot) clearCompareState({ rerender: false });
  }
  lastLoadedUserId = CONFIG.targetUserId;
  lastLoadedUsername = CONFIG.targetUsername;

  document.getElementById('ig-relations-title').textContent =
    t('app.titleWithUser', { username: CONFIG.targetUsername });

  loadCachedData();
  await refreshProfileHistory(CONFIG.targetUserId);
}

function onModalOpen() {
  startUrlWatcher();
  syncModalToCurrentUrl();
}

// Modalın aç/kapa'sını (toggle) content.js'deki floating buton yönetiyor.
// O tıklama anında overlay henüz görünür/gizli hangi duruma geçecek bilemeyiz
// (iki script bağımsız listener'lara sahip, sıra garantisi yok), bu yüzden
// burada butona değil, overlay'in "hidden" class değişimine abone oluyoruz.
// Overlay gizliden görünüre geçtiği her an güncel profile göre cache'i tazeleriz.
const modalOverlay = document.getElementById('ig-relations-modal-overlay');
let wasHidden = modalOverlay.classList.contains('ig-relations-hidden');
new MutationObserver(() => {
  const isHidden = modalOverlay.classList.contains('ig-relations-hidden');
  if (wasHidden && !isHidden) {
    onModalOpen();
  } else if (!wasHidden && isHidden) {
    stopUrlWatcher();
  }
  wasHidden = isHidden;
}).observe(modalOverlay, { attributes: true, attributeFilter: ['class'] });

// Script yüklendiğinde modal zaten açıksa ilk yüklemeyi kaçırmamak için
if (!wasHidden) {
  onModalOpen();
}

document.getElementById('btn-fetch-data').addEventListener('click', async () => {
  if (isSyncing) return;

  const urlUsername = extractUsernameFromPathname(window.location.pathname);
  if (!urlUsername) {
    updateStatus(t('status.invalidProfileSync'), true);
    return;
  }

  // Her sync başında güncel URL'nin gerçek user ID'sini garantiye al
  if (!CONFIG.targetUserId || CONFIG.targetUsername.toLowerCase() !== urlUsername.toLowerCase()) {
    updateStatus(t('status.resolvingProfile', { username: urlUsername }));
    const resolved = await resolveTargetProfile(urlUsername);
    if (resolved.status !== 'ok') {
      updateStatus(t('status.profileResolveFailed', { username: urlUsername }), true);
      return;
    }
  }

  // Sync sırasında profil değişirse yanlış cache anahtarına yazmamak için
  // hedef ID ve kullanıcı adını lokal değişkene sabitliyoruz.
  const syncUserId = CONFIG.targetUserId;
  const syncUsername = CONFIG.targetUsername;
  lastLoadedUserId = syncUserId;
  lastLoadedUsername = syncUsername;
  document.getElementById('ig-relations-title').textContent =
    t('app.titleWithUser', { username: syncUsername });

  isSyncing = true;
  syncAbortController = new AbortController();
  const { signal } = syncAbortController;
  setLoading(true);
  // Not: burada eski profileCaches/localStorage verisini bilerek silmiyoruz.
  // Sync bir sayfa navigasyonu (SPA route değişimi, F5, vb.) ya da iptal
  // yüzünden yarıda kesilirse eski cache korunmuş olur.
  document.getElementById('ig-relations-user-list').innerHTML = '';
  clearSearch();

  const workingData = {
    followers: [],
    following: [],
    notFollowingBack: [],
    iNotFollowingBack: [],
    fetchMeta: null
  };

  // Profil başlığındaki "takip"/"takipçi" sayıları, ilerlemeyi yüzde
  // olarak gösterebilmek için okunur. Bulunamazsa sadece çekilen sayı
  // gösterilir (yüzde/tahmin atlanır).
  const totals = readProfileTotals(syncUsername);

  try {
    const followingRes = await fetchAllRelations(syncUserId, 'following', totals.following, signal);
    if (followingRes === null) return;

    const followersRes = await fetchAllRelations(syncUserId, 'followers', totals.followers, signal);
    if (followersRes === null) return;

    // Bellekte ve JSON dışa aktarmada tutarlılık için sadeleştirip tekilleştiriyoruz
    workingData.following = dedupeUsers(followingRes.users.map(slimUser));
    workingData.followers = dedupeUsers(followersRes.users.map(slimUser));
    workingData.fetchMeta = {
      following: {
        ...followingRes.meta,
        uniqueCount: workingData.following.length,
        duplicateCount: Math.max(0, followingRes.meta.rawCount - workingData.following.length)
      },
      followers: {
        ...followersRes.meta,
        uniqueCount: workingData.followers.length,
        duplicateCount: Math.max(0, followersRes.meta.rawCount - workingData.followers.length)
      }
    };
    profileCaches[syncUserId] = workingData;

    updateStatus(t('status.comparing'));
    processRelations(syncUserId);

    updateStatus(t('status.saving'));
    const saved = saveCacheData(syncUserId, syncUsername);

    // Yerel IndexedDB geçmişine anlık görüntü olarak kaydet
    await saveProfileSnapshot({
      userId: syncUserId,
      username: syncUsername,
      timestamp: lastSyncedTimestamp,
      followers: workingData.followers,
      following: workingData.following
    });
    await refreshProfileHistory(syncUserId);

    // Eğer aktif bir karşılaştırma yüklüyse yeni veriye göre farkı tazele
    if (compareSnapshot && !compareCurrentSnapshot) {
      recomputeCompareDiff();
    }

    const activeList = getActiveListUsers();
    updateStatus(t('status.rendering', { count: activeList.length }));
    // Tarayıcının yukarıdaki mesajı boyamasına fırsat veriyoruz; aksi
    // halde büyük listelerde render bitene kadar ekran donmuş görünüyor.
    await new Promise(resolve => requestAnimationFrame(resolve));

    rerenderCurrentList();
    updateUIElements();

    const partialWarn = buildPartialFetchWarning(workingData.fetchMeta);
    if (!saved) {
      updateStatus(t('error.cacheSaveFailed'), true);
    } else if (partialWarn) {
      updateStatus(partialWarn, true);
    }
  } finally {
    isSyncing = false;
    syncAbortController = null;
    setLoading(false);
  }
});

// Instagram profil başlığındaki takipçi/takip sayılarını okumaya çalışır.
// Önce web_profile_info API'sinden alınan kesin sayılara, yoksa hedef kullanıcı
// adına ait DOM linklerine bakar.
function readProfileTotals(username) {
  const resolved = username ? resolvedProfiles.get(username.toLowerCase()) : null;
  const totals = {
    followers: resolved?.followersCount ?? null,
    following: resolved?.followingCount ?? null
  };

  if (totals.followers !== null && totals.following !== null) {
    return totals;
  }

  const lowerUser = (username || '').toLowerCase();
  const findScopedLink = (suffix) => {
    const links = document.querySelectorAll(`a[href*="/${suffix}"]`);
    for (const link of links) {
      const href = (link.getAttribute('href') || '').toLowerCase();
      if (!lowerUser || href === `/${lowerUser}/${suffix}/` || href === `/${lowerUser}/${suffix}`) {
        return link;
      }
    }
    return null;
  };

  if (totals.followers === null) {
    totals.followers = parseCountFromElement(findScopedLink('followers'));
  }
  if (totals.following === null) {
    totals.following = parseCountFromElement(findScopedLink('following'));
  }

  return totals;
}

function parseCountFromElement(element) {
  if (!element) return null;

  // Önce title attribute'una bakıyoruz: Instagram tam sayıyı orada
  // tutuyor ("1.234"), görünen metin ise kısaltılmış olabiliyor ("1,2 B" / "1.2K").
  const titled = element.querySelector('[title]');
  const titledRaw = titled?.getAttribute('title') || '';
  const raw = titledRaw || element.innerText || '';

  // title yoksa ve metin kısaltılmış birim içeriyorsa (1.2K, 1,2 B, 3M gibi)
  // yanlış sayı üretmemek için null dönüyoruz.
  if (!titledRaw && /[0-9][.,][0-9]+\s*[a-zA-Z]/i.test(raw)) {
    return null;
  }

  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return null;

  const value = parseInt(digits, 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

// DOM'daki SSR script'lerinden yalnızca HEDEF kullanıcı adıyla eşleşen
// profil ID'sini okur (Instagram SPA navigasyonlarında eski profilin
// script etiketini yanlışlıkla seçmemek için).
function findUserIdInDomForUsername(username) {
  const targetLower = username.toLowerCase();
  const escaped = targetLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const usernamePattern = new RegExp(`"username"\\s*:\\s*"${escaped}"`, 'i');

  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    const text = script.textContent || '';
    if (!text.includes('profilePage_') && !usernamePattern.test(text)) continue;

    // Script hem bu kullanıcı adını hem profilePage_<id> içeriyorsa güvenle al
    if (usernamePattern.test(text)) {
      const pageMatch = text.match(/"profilePage_([0-9]+)"/);
      if (pageMatch?.[1]) return pageMatch[1];

      const idBeforeUser = text.match(new RegExp(`"id"\\s*:\\s*"([0-9]+)"[^\\{\\}]*"username"\\s*:\\s*"${escaped}"`, 'i'));
      if (idBeforeUser?.[1]) return idBeforeUser[1];

      const userBeforeId = text.match(new RegExp(`"username"\\s*:\\s*"${escaped}"[^\\{\\}]*"id"\\s*:\\s*"([0-9]+)"`, 'i'));
      if (userBeforeId?.[1]) return userBeforeId[1];
    }
  }

  return null;
}

// URL'deki kullanıcı adını Instagram'ın web_profile_info API'si üzerinden
// gerçek user ID'ye çözümler. SPA geçişlerinde DOM'da kalan eski profil
// ID'lerinden tamamen bağımsızdır.
async function resolveTargetProfile(username) {
  const key = username.toLowerCase();
  const cached = resolvedProfiles.get(key);
  if (cached) {
    CONFIG.targetUserId = cached.id;
    CONFIG.targetUsername = cached.username;
    return { status: 'ok', profile: cached };
  }

  // 1) En güvenilir kaynak: Instagram web_profile_info API
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          'X-IG-App-ID': CONFIG.appId,
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    );

    if (res.ok) {
      const json = await res.json();
      const user = json?.data?.user;
      if (user?.id) {
        const profile = {
          id: String(user.id),
          username: user.username || username,
          followersCount: typeof user.edge_followed_by?.count === 'number' ? user.edge_followed_by.count : null,
          followingCount: typeof user.edge_follow?.count === 'number' ? user.edge_follow.count : null
        };
        resolvedProfiles.set(key, profile);
        try {
          localStorage.setItem(`ig_uid_${key}`, profile.id);
        } catch {
          // Depolama doluysa sessizce geç
        }
        CONFIG.targetUserId = profile.id;
        CONFIG.targetUsername = profile.username;
        return { status: 'ok', profile };
      }
    }
  } catch (err) {
    console.warn('IG Relations: web_profile_info lookup failed, trying fallback', err);
  }

  // 2) Fallback: daha önce kaydedilmiş username -> id eşlemesi
  try {
    const storedId = localStorage.getItem(`ig_uid_${key}`);
    if (storedId) {
      const profile = { id: storedId, username, followersCount: null, followingCount: null };
      resolvedProfiles.set(key, profile);
      CONFIG.targetUserId = profile.id;
      CONFIG.targetUsername = profile.username;
      return { status: 'ok', profile };
    }
  } catch {
    // localStorage erişilemiyorsa geç
  }

  // 3) Son çare: DOM'da yalnızca bu kullanıcı adıyla eşleşen script etiketi
  const domId = findUserIdInDomForUsername(username);
  if (domId) {
    const profile = { id: domId, username, followersCount: null, followingCount: null };
    resolvedProfiles.set(key, profile);
    CONFIG.targetUserId = profile.id;
    CONFIG.targetUsername = profile.username;
    return { status: 'ok', profile };
  }

  CONFIG.targetUserId = null;
  CONFIG.targetUsername = username;
  return { status: 'resolve_failed', username };
}

function updateStatus(message, isWarning = false) {
  const msgEl = document.getElementById('ig-relations-status-message');
  msgEl.innerText = message;
  msgEl.style.display = message ? 'block' : 'none';

  if (isWarning) {
    msgEl.classList.add('status-warning');
  } else {
    msgEl.classList.remove('status-warning');
  }
}

function setLoading(isLoading) {
  const spinner = document.getElementById('ig-relations-spinner');
  const btn = document.getElementById('btn-fetch-data');
  const compareBtn = document.getElementById('btn-compare-json');

  if (isLoading) {
    spinner.style.display = 'block';
    btn.disabled = true;
    btn.textContent = t('sidebar.syncing');
    compareBtn.disabled = true;
  } else {
    spinner.style.display = 'none';
    btn.disabled = false;
    btn.textContent = t('sidebar.sync');
    compareBtn.disabled = false;
  }
}

// Sayfalar arası zorunlu bekleme (ms). Instagram'ın hız limitine
// takılmamak için düşürülmemeli.
const PAGE_DELAY_MS = 1500;

function sleepWithAbort(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timerId = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timerId);
      reject(new DOMException('Aborted', 'AbortError'));
    }

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

// "Takipçiler çekiliyor... 275 / 430 (%64) — tahmini kalan ~25 sn"
function buildProgressMessage(label, fetchedCount, expectedTotal, hasMore, pageCount = 1) {
  if (!hasMore) {
    return t('status.fetchDone', { label, count: fetchedCount });
  }

  if (!expectedTotal || fetchedCount > expectedTotal) {
    return t('status.fetchProgressNoTotal', { label, count: fetchedCount });
  }

  const percent = Math.min(99, Math.round((fetchedCount / expectedTotal) * 100));
  const remaining = Math.max(0, expectedTotal - fetchedCount);
  const avgPageSize = Math.max(1, fetchedCount / Math.max(1, pageCount));
  // Kalan sayfa sayısı × (istek süresi + bekleme). İstek süresini
  // ortalama 0.5 sn kabul ediyoruz.
  const remainingPages = Math.ceil(remaining / avgPageSize);
  const etaSeconds = Math.round(remainingPages * (PAGE_DELAY_MS + 500) / 1000);

  const eta = etaSeconds >= 60
    ? t('eta.minutes', { value: Math.ceil(etaSeconds / 60) })
    : t('eta.seconds', { value: etaSeconds });

  return t('status.fetchProgress', {
    label,
    count: fetchedCount,
    total: expectedTotal,
    percent,
    eta
  });
}

// Instagram'ın sayfalama sırasında aynı kullanıcıyı birden fazla kez
// döndürmesine karşı pk (yoksa kullanıcı adı) bazlı tekilleştirme.
function dedupeUsers(users) {
  if (!Array.isArray(users)) return [];
  const seen = new Set();
  const result = [];
  for (const user of users) {
    if (!user) continue;
    const key = user.pk
      ? `pk:${String(user.pk)}`
      : (user.username ? `u:${String(user.username).toLowerCase()}` : '');
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(user);
  }
  return result;
}

function buildPartialFetchWarning(fetchMeta) {
  if (!fetchMeta) return '';
  const issues = [];
  const check = (meta, labelKey) => {
    if (!meta) return;
    const missingFromExpected = meta.expectedTotal && meta.uniqueCount < meta.expectedTotal - 2;
    const hadDuplicates = meta.duplicateCount > 0 && meta.expectedTotal && meta.uniqueCount < meta.expectedTotal;
    if (missingFromExpected || hadDuplicates) {
      issues.push(`${t(labelKey)}: ${meta.uniqueCount}/${meta.expectedTotal}`);
    }
  };
  check(fetchMeta.following, 'filter.following');
  check(fetchMeta.followers, 'filter.followers');
  if (issues.length === 0) return '';
  return t('status.partialWarning', { details: issues.join(', ') });
}

// Başarıyla tamamlanırsa { users, meta }, herhangi bir hata/engel/iptal durumunda
// `null` döner. `null`, çağıranın kısmi veriyi cache'e yazmasını
// engellemek için kullanılan açık bir sinyaldir — asla sessizce
// yutulmamalı ya da boş dizi ile karıştırılmamalıdır.
async function fetchAllRelations(targetUserId, type, expectedTotal = null, signal = null) {
  const label = type === 'following' ? t('filter.following') : t('filter.followers');
  let list = [];
  const seenKeys = new Set();
  let nextMaxId = '';
  let hasMore = true;
  let pageCount = 0;
  // following için sabit kronolojik sıra (order=date_followed_latest) + count=200
  // kullanmak Instagram'ın dinamik sıralama kaynaklı sayfa kayması/tekrarını önler.
  let useStableOrder = type === 'following';

  updateStatus(t('status.fetching', { label }));

  while (hasMore) {
    if (signal?.aborted) return null;

    const orderParam = useStableOrder ? '&order=date_followed_latest' : '';
    const url = `https://www.instagram.com/api/v1/friendships/${targetUserId}/${type}/?count=200${orderParam}&max_id=${encodeURIComponent(nextMaxId)}`;
    try {
      const response = await fetch(url, {
        signal,
        headers: {
          'X-IG-App-ID': CONFIG.appId,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      // Bazı hesaplarda order parametresi 400 döndürürse ilk sayfada otomatik düşür
      if (response.status === 400 && useStableOrder && pageCount === 0) {
        useStableOrder = false;
        continue;
      }

      if (response.status === 429) {
        updateStatus(t('error.rateLimit'), true);
        return null;
      }

      if (response.status === 400 || response.status === 403) {
        updateStatus(t('error.privateOrBlocked'), true);
        return null;
      }

      if (!response.ok) {
        updateStatus(t('error.unexpectedStatus', { status: response.status }), true);
        return null;
      }

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('IG Relations: failed to parse response as JSON', parseErr);
        updateStatus(t('error.badResponse'), true);
        return null;
      }

      pageCount += 1;
      if (Array.isArray(data.users)) {
        list = list.concat(data.users);
        for (const u of data.users) {
          const k = u?.pk != null ? `pk:${String(u.pk)}` : (u?.username ? `u:${u.username.toLowerCase()}` : '');
          if (k) seenKeys.add(k);
        }
      }

      const prevMaxId = nextMaxId;
      nextMaxId = data.next_max_id ? String(data.next_max_id) : '';
      hasMore = !!nextMaxId && nextMaxId !== prevMaxId;

      updateStatus(buildProgressMessage(label, seenKeys.size, expectedTotal, hasMore, pageCount));

      if (hasMore) {
        await sleepWithAbort(PAGE_DELAY_MS, signal);
      }
    } catch (err) {
      if (err?.name === 'AbortError') {
        return null;
      }
      console.error('IG Relations: network error while fetching', type, err);
      updateStatus(t('error.network', { type: label }), true);
      return null;
    }
  }
  return {
    users: list,
    meta: {
      expectedTotal,
      rawCount: list.length,
      uniqueCount: seenKeys.size,
      duplicateCount: Math.max(0, list.length - seenKeys.size)
    }
  };
}

function processRelations(userId) {
  const currentCache = profileCaches[userId];
  if (!currentCache) return;

  const followerIds = new Set(currentCache.followers.map(u => String(u.pk)));
  const followingIds = new Set(currentCache.following.map(u => String(u.pk)));

  currentCache.notFollowingBack = currentCache.following.filter(u => !followerIds.has(String(u.pk)));
  currentCache.iNotFollowingBack = currentCache.followers.filter(u => !followingIds.has(String(u.pk)));
}

// Cache'e yazarken API'den gelen ham kullanıcı nesnesinin tamamını değil,
// sadece ihtiyacımız olan alanları saklıyoruz. Ham nesne profile_pic_url
// gibi çok uzun alanlar içeriyor ve büyük profillerde localStorage'ın
// ~5MB kotasını aşarak QuotaExceededError'a yol açıyordu.
function slimUser(user) {
  return {
    pk: user.pk != null ? String(user.pk) : '',
    username: user.username || '',
    full_name: user.full_name || ''
  };
}

function saveCacheData(userId, username = CONFIG.targetUsername) {
  const cacheKey = `ig_cache_${userId}`;
  const dataStore = profileCaches[userId];

  lastSyncedTimestamp = new Date().toLocaleString();
  refreshCacheTimestamp();

  const cacheObject = {
    username: username || '',
    timestamp: lastSyncedTimestamp,
    fetchMeta: dataStore.fetchMeta || null,
    dataStore: {
      followers: dedupeUsers(dataStore.followers.map(slimUser)),
      following: dedupeUsers(dataStore.following.map(slimUser)),
      notFollowingBack: dedupeUsers(dataStore.notFollowingBack.map(slimUser)),
      iNotFollowingBack: dedupeUsers(dataStore.iNotFollowingBack.map(slimUser))
    }
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
    return true;
  } catch (err) {
    // Kota aşıldıysa: diğer profillerin cache'lerini temizleyip bir kez
    // daha deniyoruz. Yine olmazsa kullanıcıyı bilgilendiriyoruz ama
    // senkronizasyonun geri kalanını (ekrandaki liste) bozmuyoruz.
    console.error('IG Relations: failed to write cache', err);

    if (err.name === 'QuotaExceededError' || err.code === 22) {
      pruneOtherProfileCaches(cacheKey);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
        return true;
      } catch (retryErr) {
        console.error('IG Relations: cache write failed after pruning', retryErr);
      }
    }

    return false;
  }
}

// Bu profil dışındaki ig_cache_* kayıtlarını siler
function pruneOtherProfileCaches(keepKey) {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('ig_cache_') && key !== keepKey) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

function loadCachedData() {
  const cacheKey = `ig_cache_${CONFIG.targetUserId}`;
  let cachedData = null;
  try {
    cachedData = localStorage.getItem(cacheKey);
  } catch (err) {
    console.error('IG Relations: failed to read localStorage', err);
  }

  if (cachedData) {
    try {
      const cached = JSON.parse(cachedData);
      if (!cached?.dataStore || !Array.isArray(cached.dataStore.followers) || !Array.isArray(cached.dataStore.following)) {
        throw new Error('Invalid cache structure');
      }

      // Hafızadaki profileCaches havuzuna ilgili ID'yi kaydediyoruz (eski cache'lerdeki tekrarları temizleyerek)
      profileCaches[CONFIG.targetUserId] = {
        followers: dedupeUsers(cached.dataStore.followers),
        following: dedupeUsers(cached.dataStore.following),
        notFollowingBack: [],
        iNotFollowingBack: [],
        fetchMeta: cached.fetchMeta || null
      };

      lastSyncedTimestamp = cached.timestamp || '';
      refreshCacheTimestamp();
      processRelations(CONFIG.targetUserId);

      if (compareSnapshot) {
        recomputeCompareDiff();
      }

      rerenderCurrentList();
      updateUIElements();
      return;
    } catch (err) {
      console.error('IG Relations: corrupted cache entry, ignoring', err);
      localStorage.removeItem(cacheKey);
    }
  }

  resetUI();
  updateStatus(t('status.noCache', { username: CONFIG.targetUsername }));
}

// "Son senkronizasyon: ..." etiketini aktif dile göre yazar
function refreshCacheTimestamp() {
  document.getElementById('ig-cache-timestamp').textContent = lastSyncedTimestamp
    ? t('sidebar.lastSynced', { timestamp: lastSyncedTimestamp })
    : '';
}

function resetUI() {
  document.getElementById('ig-relations-user-list').innerHTML = '';
  document.getElementById('cnt-following').innerText = '0';
  document.getElementById('cnt-followers').innerText = '0';
  document.getElementById('cnt-not-back').innerText = '0';
  document.getElementById('cnt-i-not-back').innerText = '0';
  lastSyncedTimestamp = '';
  refreshCacheTimestamp();
  updateDownloadButtons();
}

function updateUIElements() {
  const currentCache = profileCaches[CONFIG.targetUserId];

  if (currentCache) {
    document.getElementById('cnt-following').innerText = currentCache.following.length;
    document.getElementById('cnt-followers').innerText = currentCache.followers.length;
    document.getElementById('cnt-not-back').innerText = currentCache.notFollowingBack.length;
    document.getElementById('cnt-i-not-back').innerText = currentCache.iNotFollowingBack.length;
    if (activePanel === 'analysis') updateStatus('');
  } else if (activePanel === 'analysis') {
    resetUI();
  }

  updateViewerCounts();
  updateCompareUI();
  updateDownloadButtons();
}

// Boş listelerin indirme ikonlarını pasifleştirir ki kullanıcı boş
// dosya indirmeye çalışmasın.
function updateDownloadButtons() {
  const currentCache = profileCaches[CONFIG.targetUserId];

  document.querySelectorAll('.btn-download-list').forEach(btn => {
    const users = currentCache ? currentCache[btn.dataset.list] : null;
    btn.disabled = !users || users.length === 0;
  });

  document.querySelectorAll('.btn-download-compare').forEach(btn => {
    const users = compareDiff ? compareDiff[btn.dataset.compareList] : null;
    btn.disabled = !users || users.length === 0;
  });

  document.querySelectorAll('.btn-download-viewer').forEach(btn => {
    const users = viewerFileData ? viewerFileData[btn.dataset.viewerList] : null;
    btn.disabled = !users || users.length === 0;
  });

  const exportBtn = document.getElementById('btn-export-data');
  if (activePanel === 'compare') {
    exportBtn.disabled = !compareDiff;
  } else if (activePanel === 'viewer') {
    exportBtn.disabled = !viewerFileData;
  } else {
    exportBtn.disabled = !currentCache;
  }

  document.getElementById('btn-compare-json').disabled = isSyncing;
}

// Kullanıcı adı, eski kullanıcı adı veya tam ad, arama terimini içeriyor mu?
// Aktif dilin locale'ini kullanarak büyük/küçük harf dönüşümünü doğru yapar.
function filterUsersBySearch(users) {
  if (!currentSearchTerm) return users;

  const locale = getLanguage();
  const term = currentSearchTerm.toLocaleLowerCase(locale);
  return users.filter(user => {
    const username = (user.username || '').toLocaleLowerCase(locale);
    const oldUsername = (user.old_username || '').toLocaleLowerCase(locale);
    const fullName = (user.full_name || '').toLocaleLowerCase(locale);
    return username.includes(term) || oldUsername.includes(term) || fullName.includes(term);
  });
}

function getActiveListUsers() {
  if (activePanel === 'compare') {
    return compareDiff ? (compareDiff[activeCompareKey] || []) : [];
  }
  if (activePanel === 'viewer') {
    return viewerFileData ? (viewerFileData[viewerFilterKey] || []) : [];
  }
  const currentCache = profileCaches[CONFIG.targetUserId];
  return currentCache ? (currentCache[currentFilterKey] || []) : [];
}

// Açık olan sekmenin listesini mevcut arama terimiyle yeniden çizer
function rerenderCurrentList() {
  if (activePanel === 'compare') {
    if (!compareDiff) {
      document.getElementById('ig-relations-user-list').innerHTML = '';
      updateStatus(t('compare.emptyPrompt'));
      return;
    }
    updateStatus('');
    renderList(compareDiff[activeCompareKey] || [], { compareKey: activeCompareKey });
    return;
  }

  if (activePanel === 'viewer') {
    if (!viewerFileData) {
      document.getElementById('ig-relations-user-list').innerHTML = '';
      updateStatus(t('viewer.empty'));
      return;
    }
    updateStatus('');
    renderList(viewerFileData[viewerFilterKey] || [], { readOnly: true });
    return;
  }

  const currentCache = profileCaches[CONFIG.targetUserId];
  if (currentCache) {
    updateStatus('');
    renderList(currentCache[currentFilterKey] || []);
  } else {
    document.getElementById('ig-relations-user-list').innerHTML = '';
    if (!CONFIG.targetUsername) {
      updateStatus(t('status.invalidProfile'), true);
    } else if (!CONFIG.targetUserId) {
      updateStatus(t('status.profileResolveFailed', { username: CONFIG.targetUsername }), true);
    } else {
      updateStatus(t('status.noCache', { username: CONFIG.targetUsername }));
    }
  }
}

searchInput.addEventListener('input', () => {
  currentSearchTerm = searchInput.value.trim();
  rerenderCurrentList();
});

document.getElementById('ig-search-clear').addEventListener('click', () => {
  clearSearch();
  rerenderCurrentList();
  searchInput.focus();
});

function renderList(users, { compareKey = null, readOnly = false } = {}) {
  const listContainer = document.getElementById('ig-relations-user-list');
  listContainer.innerHTML = '';

  if (!users || users.length === 0) {
    if (compareKey) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'ig-search-empty';
      emptyItem.textContent = t('compare.noChanges');
      listContainer.appendChild(emptyItem);
    }
    return;
  }

  // Arama kutusundaki terim, açık olan listeyi kullanıcı adı ve tam ad
  // üzerinden daraltır. Filtreleme sadece görünümü etkiler; profileCaches
  // içindeki gerçek veriye ve dışa aktarmaya dokunmaz.
  const visibleUsers = filterUsersBySearch(users);

  if (visibleUsers.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'ig-search-empty';
    emptyItem.textContent = t('search.noResults', { term: currentSearchTerm });
    listContainer.appendChild(emptyItem);
    return;
  }

  const currentCache = compareCurrentSnapshot || profileCaches[CONFIG.targetUserId];
  const isOfflineView = Boolean(readOnly || compareCurrentSnapshot || !profileCaches[CONFIG.targetUserId]);
  const currentFollowingIds = compareKey === 'lostFollowers' && currentCache
    ? new Set(currentCache.following.map(u => String(u.pk)))
    : null;

  // Normal modda: followers ve iNotFollowingBack -> Çıkar; following ve notFollowingBack -> Takibi Bırak
  const isNormalRemove = !compareKey && (currentFilterKey === 'followers' || currentFilterKey === 'iNotFollowingBack');

  // Büyük listelerde tek tek appendChild yerine fragment kullanıyoruz;
  // böylece DOM'a tek seferde eklenip yeniden boyama (reflow) sayısı azalıyor.
  const fragment = document.createDocumentFragment();

  visibleUsers.forEach(user => {
    const li = document.createElement('li');
    li.className = 'ig-user-item';

    // Kullanıcı adı ve tam ad Instagram'dan gelen serbest metin olduğu
    // için innerHTML yerine textContent ile basılıyor.
    const info = document.createElement('div');
    info.className = 'ig-user-info';

    const link = document.createElement('a');
    link.className = 'ig-username';
    if (user.username) {
      link.href = `https://www.instagram.com/${encodeURIComponent(user.username)}/`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    link.textContent = user.username || user.pk;

    const fullName = document.createElement('span');
    fullName.className = 'ig-fullname';
    fullName.textContent = user.full_name || '';

    info.appendChild(link);
    info.appendChild(fullName);

    if (compareKey === 'renamed' && user.old_username) {
      const oldSpan = document.createElement('span');
      oldSpan.className = 'ig-renamed-old';
      oldSpan.textContent = t('compare.renamedFrom', { username: user.old_username });
      info.appendChild(oldSpan);
    }

    li.appendChild(info);

    // Aksiyon butonu veya rozet belirleme (çevrimdışı dosya görünümünde API aksiyonu gösterilmez)
    let actionType = null; // 'unfollow' | 'remove' | null
    let badgeText = '';

    if (!isOfflineView) {
      if (!compareKey) {
        actionType = isNormalRemove ? 'remove' : 'unfollow';
      } else if (compareKey === 'newFollowers') {
        actionType = user.pk ? 'remove' : null;
      } else if (compareKey === 'newFollowing') {
        actionType = user.pk ? 'unfollow' : null;
      } else if (compareKey === 'lostFollowers') {
        if (user.pk && currentFollowingIds?.has(String(user.pk))) {
          actionType = 'unfollow';
        } else {
          badgeText = t('compare.badgeNotFollowing');
        }
      }
    } else if (compareKey === 'lostFollowers' && !(user.pk && currentFollowingIds?.has(String(user.pk)))) {
      badgeText = t('compare.badgeNotFollowing');
    }

    if (actionType) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'btn-unfollow';
      actionBtn.textContent = actionType === 'remove' ? t('action.remove') : t('action.unfollow');
      actionBtn.addEventListener('click', () => {
        if (actionType === 'remove') {
          handleRemoveFollower(actionBtn, user.pk);
        } else {
          handleUnfollow(actionBtn, user.pk);
        }
      });
      li.appendChild(actionBtn);
    } else if (badgeText) {
      const badge = document.createElement('span');
      badge.className = 'ig-user-badge';
      badge.textContent = badgeText;
      li.appendChild(badge);
    }

    fragment.appendChild(li);
  });

  listContainer.appendChild(fragment);
}

async function handleUnfollow(buttonElement, userId) {
  const activeUserId = CONFIG.targetUserId;
  buttonElement.disabled = true;
  buttonElement.textContent = t('action.unfollowing');

  const url = `https://www.instagram.com/api/v1/friendships/destroy/${userId}/`;
  const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-IG-App-ID': CONFIG.appId,
        'X-CSRFToken': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.ok) {
      removeUserFromLocalStore(activeUserId, 'following', userId);
      processRelations(activeUserId);
      saveCacheData(activeUserId);
      if (CONFIG.targetUserId === activeUserId) {
        if (compareSnapshot) {
          recomputeCompareDiff();
          rerenderCurrentList();
        } else {
          buttonElement.closest('.ig-user-item')?.remove();
        }
        updateUIElements();
      }
    } else {
      buttonElement.disabled = false;
      buttonElement.textContent = t('action.unfollow');
    }
  } catch (err) {
    console.error(err);
    buttonElement.disabled = false;
    buttonElement.textContent = t('action.unfollow');
  }
}

async function handleRemoveFollower(buttonElement, userId) {
  const activeUserId = CONFIG.targetUserId;
  buttonElement.disabled = true;
  buttonElement.textContent = t('action.removing');

  const url = `https://www.instagram.com/api/v1/friendships/remove_follower/${userId}/`;
  const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-IG-App-ID': CONFIG.appId,
        'X-CSRFToken': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.ok) {
      removeUserFromLocalStore(activeUserId, 'followers', userId);
      processRelations(activeUserId);
      saveCacheData(activeUserId);
      if (CONFIG.targetUserId === activeUserId) {
        if (compareSnapshot) {
          recomputeCompareDiff();
          rerenderCurrentList();
        } else {
          buttonElement.closest('.ig-user-item')?.remove();
        }
        updateUIElements();
      }
    } else {
      buttonElement.disabled = false;
      buttonElement.textContent = t('action.remove');
    }
  } catch (err) {
    console.error(err);
    buttonElement.disabled = false;
    buttonElement.textContent = t('action.remove');
  }
}

function removeUserFromLocalStore(targetUserId, storeKey, userId) {
  const currentCache = profileCaches[targetUserId];
  if (currentCache && currentCache[storeKey]) {
    const target = String(userId);
    currentCache[storeKey] = currentCache[storeKey].filter(u => String(u.pk) !== target);
  }
}

const filters = [
  { id: 'filter-following', dataKey: 'following' },
  { id: 'filter-followers', dataKey: 'followers' },
  { id: 'filter-not-following-back', dataKey: 'notFollowingBack' },
  { id: 'filter-i-not-following-back', dataKey: 'iNotFollowingBack' }
];

const compareFilters = [
  { id: 'filter-cmp-new-followers', dataKey: 'newFollowers', countId: 'cnt-cmp-new-followers' },
  { id: 'filter-cmp-lost-followers', dataKey: 'lostFollowers', countId: 'cnt-cmp-lost-followers' },
  { id: 'filter-cmp-new-following', dataKey: 'newFollowing', countId: 'cnt-cmp-new-following' },
  { id: 'filter-cmp-unfollowed', dataKey: 'unfollowed', countId: 'cnt-cmp-unfollowed' },
  { id: 'filter-cmp-renamed', dataKey: 'renamed', countId: 'cnt-cmp-renamed' }
];

const viewerFilters = [
  { id: 'filter-viewer-following', dataKey: 'following', countId: 'cnt-viewer-following' },
  { id: 'filter-viewer-followers', dataKey: 'followers', countId: 'cnt-viewer-followers' },
  { id: 'filter-viewer-not-back', dataKey: 'notFollowingBack', countId: 'cnt-viewer-not-back' },
  { id: 'filter-viewer-i-not-back', dataKey: 'iNotFollowingBack', countId: 'cnt-viewer-i-not-back' }
];

function setActiveInContainer(containerId, buttonId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
  const el = document.getElementById(buttonId);
  if (el) el.classList.add('active');
}

function switchPanel(panel) {
  activePanel = panel;

  document.querySelectorAll('.ig-panel-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.panel === panel);
  });

  document.getElementById('sidebar-panel-analysis').classList.toggle('ig-relations-hidden', panel !== 'analysis');
  document.getElementById('sidebar-panel-compare').classList.toggle('ig-relations-hidden', panel !== 'compare');
  document.getElementById('sidebar-panel-viewer').classList.toggle('ig-relations-hidden', panel !== 'viewer');

  clearSearch();
  renderHistoryBar();
  refreshCompareBanner();
  updateDownloadButtons();
  rerenderCurrentList();
}

document.querySelectorAll('.ig-panel-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    switchPanel(tab.dataset.panel);
  });
});

filters.forEach(filter => {
  const filterButton = document.getElementById(filter.id);

  filterButton.addEventListener('click', () => {
    setActiveInContainer('sidebar-panel-analysis', filter.id);
    currentFilterKey = filter.dataKey;
    clearSearch();
    rerenderCurrentList();
  });
});

compareFilters.forEach(filter => {
  const filterButton = document.getElementById(filter.id);

  filterButton.addEventListener('click', () => {
    setActiveInContainer('sidebar-panel-compare', filter.id);
    activeCompareKey = filter.dataKey;
    refreshCompareBanner();
    clearSearch();
    rerenderCurrentList();
  });
});

viewerFilters.forEach(filter => {
  const filterButton = document.getElementById(filter.id);

  filterButton.addEventListener('click', () => {
    setActiveInContainer('sidebar-panel-viewer', filter.id);
    viewerFilterKey = filter.dataKey;
    clearSearch();
    rerenderCurrentList();
  });
});

// ======================== DOSYA GÖRÜNTÜLEYİCİ (VIEWER) ========================

function updateViewerCounts() {
  viewerFilters.forEach(({ dataKey, countId }) => {
    document.getElementById(countId).innerText = viewerFileData ? (viewerFileData[dataKey]?.length || 0) : '0';
  });
}

function refreshViewerFileInfo() {
  const el = document.getElementById('ig-viewer-file-info');
  if (!el) return;
  el.textContent = viewerFileData
    ? t('viewer.loadedInfo', { name: viewerFileData.sourceName })
    : '';
}

document.getElementById('btn-viewer-open').addEventListener('click', () => {
  viewerFileInput.value = '';
  viewerFileInput.click();
});

viewerFileInput.addEventListener('change', async () => {
  const file = viewerFileInput.files?.[0];
  if (!file) return;

  let rawText;
  try {
    rawText = await file.text();
  } catch (err) {
    console.error('IG Relations: failed to read viewer file', err);
    updateStatus(t('compare.readError'), true);
    return;
  }

  const parsed = parseSnapshotFile(rawText, file.name);
  if (!parsed.ok) {
    updateStatus(t(parsed.errorKey), true);
    return;
  }

  viewerFileData = buildStandaloneStoreFromSnapshot(parsed.snapshot);
  updateViewerCounts();
  refreshViewerFileInfo();
  updateDownloadButtons();
  switchPanel('viewer');
});

// ======================== YEREL GEÇMİŞ BARI (HISTORY) ========================

async function refreshProfileHistory(userId) {
  if (!userId) {
    profileHistory = [];
    renderHistoryBar();
    return;
  }

  const snapshots = await listProfileSnapshots(userId);
  // Async cevap döndüğünde başka bir profile geçildiyse yoksay
  if (String(CONFIG.targetUserId) !== String(userId)) return;

  profileHistory = snapshots;
  renderHistoryBar();
}

function renderHistoryBar() {
  const bar = document.getElementById('ig-history-bar');
  const select = document.getElementById('ig-history-select');
  const compareBtn = document.getElementById('btn-history-compare');
  const deleteBtn = document.getElementById('btn-history-delete');

  if (activePanel !== 'compare' || !profileHistory.length || !profileCaches[CONFIG.targetUserId]) {
    bar.classList.add('ig-relations-hidden');
    return;
  }

  const previousSelection = select.value;
  select.innerHTML = '';

  profileHistory.forEach((snap, idx) => {
    const option = document.createElement('option');
    option.value = snap.id;
    const baseLabel = t('history.optionLabel', {
      timestamp: snap.timestamp,
      followers: snap.followersCount ?? snap.followers?.length ?? 0,
      following: snap.followingCount ?? snap.following?.length ?? 0
    });
    option.textContent = idx === 0 ? `${baseLabel}${t('history.latestTag')}` : baseLabel;
    select.appendChild(option);
  });

  // Önceki seçim hâlâ varsa onu koru; yoksa bir önceki kaydı (index 1) seç
  if (previousSelection && profileHistory.some(s => s.id === previousSelection)) {
    select.value = previousSelection;
  } else if (profileHistory.length >= 2) {
    select.value = profileHistory[1].id;
  } else {
    select.value = profileHistory[0].id;
  }

  compareBtn.disabled = profileHistory.length === 0;
  deleteBtn.disabled = profileHistory.length === 0;
  bar.classList.remove('ig-relations-hidden');
}

document.getElementById('btn-history-compare').addEventListener('click', () => {
  const currentCache = profileCaches[CONFIG.targetUserId];
  if (!currentCache) {
    updateStatus(t('compare.needCurrentData'), true);
    return;
  }

  const selectedId = document.getElementById('ig-history-select').value;
  const record = profileHistory.find(s => s.id === selectedId);
  if (!record) return;

  const snapshot = {
    fileName: t('history.sourceName'),
    targetUsername: record.username || CONFIG.targetUsername,
    targetId: record.userId || CONFIG.targetUserId,
    exportedAt: record.timestamp,
    hasFollowers: Array.isArray(record.followers),
    hasFollowing: Array.isArray(record.following),
    followers: record.followers || [],
    following: record.following || []
  };

  activateCompareSession(snapshot, null);
});

document.getElementById('btn-history-delete').addEventListener('click', async () => {
  const selectedId = document.getElementById('ig-history-select').value;
  const record = profileHistory.find(s => s.id === selectedId);
  if (!record) return;

  if (!confirm(t('history.confirmDelete', { timestamp: record.timestamp }))) {
    return;
  }

  await deleteProfileSnapshot(record.id);
  await refreshProfileHistory(CONFIG.targetUserId);
});

// ======================== KARŞILAŞTIRMA & GÖRSELLEŞTİRME (COMPARE) ========================

function triggerCompareFilePicker() {
  compareFileInput.value = '';
  compareFileInput.click();
}

document.getElementById('btn-compare-json').addEventListener('click', triggerCompareFilePicker);
document.getElementById('btn-compare-change').addEventListener('click', triggerCompareFilePicker);
document.getElementById('btn-compare-close').addEventListener('click', () => clearCompareState({ rerender: true }));

document.getElementById('btn-compare-swap').addEventListener('click', () => {
  if (!compareSnapshot || !compareCurrentSnapshot) return;
  const prev = compareSnapshot;
  compareSnapshot = compareCurrentSnapshot;
  compareCurrentSnapshot = prev;
  recomputeCompareDiff();
  updateCompareUI();
  updateDownloadButtons();
  rerenderCurrentList();
});

function estimateSnapshotTime(snapshot, file) {
  if (snapshot.exportedAt) {
    const parsedTime = Date.parse(snapshot.exportedAt);
    if (!Number.isNaN(parsedTime)) return parsedTime;
  }
  return file?.lastModified || 0;
}

function buildStandaloneStoreFromSnapshot(snapshot) {
  const followers = snapshot.followers || [];
  const following = snapshot.following || [];
  const followerIds = new Set(followers.map(u => String(u.pk || u.username.toLowerCase())));
  const followingIds = new Set(following.map(u => String(u.pk || u.username.toLowerCase())));

  return {
    followers,
    following,
    notFollowingBack: following.filter(u => !followerIds.has(String(u.pk || u.username.toLowerCase()))),
    iNotFollowingBack: followers.filter(u => !followingIds.has(String(u.pk || u.username.toLowerCase()))),
    sourceName: snapshot.targetUsername ? `@${snapshot.targetUsername}` : (snapshot.fileName || 'file')
  };
}

function activateCompareSession(previousSnap, currentSnap = null) {
  compareSnapshot = previousSnap;
  compareCurrentSnapshot = currentSnap;
  recomputeCompareDiff();

  const priorityOrder = ['lostFollowers', 'newFollowers', 'unfollowed', 'newFollowing', 'renamed'];
  const defaultKey = priorityOrder.find(key => compareDiff[key].length > 0) || 'lostFollowers';
  activeCompareKey = defaultKey;

  const targetFilter = compareFilters.find(f => f.dataKey === activeCompareKey);
  if (targetFilter) {
    setActiveInContainer('sidebar-panel-compare', targetFilter.id);
  }

  updateCompareUI();
  switchPanel('compare');
}

compareFileInput.addEventListener('change', async () => {
  const files = Array.from(compareFileInput.files || []);
  if (files.length === 0) return;

  if (files.length > 2) {
    updateStatus(t('compare.maxTwoFiles'), true);
    return;
  }

  // 2 dosya seçildi: doğrudan iki dosyayı (eski -> yeni) karşılaştır
  if (files.length === 2) {
    const parsedItems = [];
    for (const file of files) {
      let rawText;
      try {
        rawText = await file.text();
      } catch (err) {
        console.error('IG Relations: failed to read compare file', err);
        updateStatus(t('compare.readError'), true);
        return;
      }

      const parsed = parseSnapshotFile(rawText, file.name);
      if (!parsed.ok) {
        updateStatus(t(parsed.errorKey), true);
        return;
      }
      parsedItems.push({ snapshot: parsed.snapshot, time: estimateSnapshotTime(parsed.snapshot, file) });
    }

    // Daha eski olanı "önceki", daha yeni olanı "güncel" kabul et
    parsedItems.sort((a, b) => a.time - b.time);
    const [older, newer] = parsedItems;
    activateCompareSession(older.snapshot, newer.snapshot);
    return;
  }

  // 1 dosya seçildi
  const file = files[0];
  let rawText;
  try {
    rawText = await file.text();
  } catch (err) {
    console.error('IG Relations: failed to read compare file', err);
    updateStatus(t('compare.readError'), true);
    return;
  }

  const parsed = parseSnapshotFile(rawText, file.name);
  if (!parsed.ok) {
    updateStatus(t(parsed.errorKey), true);
    return;
  }

  const currentData = profileCaches[CONFIG.targetUserId];
  if (currentData) {
    // Mevcut senkronize profil verisi varsa onunla karşılaştır
    activateCompareSession(parsed.snapshot, null);
  } else {
    // Senkronize veri yoksa Dosya Görüntüleyici sekmesinde aç
    viewerFileData = buildStandaloneStoreFromSnapshot(parsed.snapshot);
    updateViewerCounts();
    refreshViewerFileInfo();
    switchPanel('viewer');
  }
});

function recomputeCompareDiff() {
  const currentData = compareCurrentSnapshot || profileCaches[CONFIG.targetUserId];
  if (!compareSnapshot || !currentData) {
    compareDiff = null;
    return;
  }
  compareDiff = computeRelationsDiff(compareSnapshot, currentData);
}

function updateCompareUI() {
  compareFilters.forEach(({ dataKey, countId }) => {
    document.getElementById(countId).innerText = compareDiff ? compareDiff[dataKey].length : '0';
  });

  refreshCompareBanner();
}

function formatSnapshotDisplayName(snap) {
  const base = snap.targetUsername ? `@${snap.targetUsername}` : (snap.fileName || 'File');
  return snap.exportedAt ? `${base} (${snap.exportedAt})` : base;
}

function renderCompareVisualization() {
  const vizEl = document.getElementById('ig-compare-viz');
  vizEl.innerHTML = '';
  if (!compareDiff) return;

  const segments = [
    { key: 'newFollowers', count: compareDiff.newFollowers.length, segClass: 'seg-new-followers', chipClass: 'chip-new-followers', prefix: '+' },
    { key: 'lostFollowers', count: compareDiff.lostFollowers.length, segClass: 'seg-lost-followers', chipClass: 'chip-lost-followers', prefix: '−' },
    { key: 'newFollowing', count: compareDiff.newFollowing.length, segClass: 'seg-new-following', chipClass: 'chip-new-following', prefix: '+' },
    { key: 'unfollowed', count: compareDiff.unfollowed.length, segClass: 'seg-unfollowed', chipClass: 'chip-unfollowed', prefix: '−' },
    { key: 'renamed', count: compareDiff.renamed.length, segClass: 'seg-renamed', chipClass: 'chip-renamed', prefix: '↻' }
  ];

  const totalChanges = segments.reduce((sum, s) => sum + s.count, 0);

  if (totalChanges > 0) {
    const bar = document.createElement('div');
    bar.className = 'ig-viz-bar';
    segments.forEach(seg => {
      if (seg.count === 0) return;
      const part = document.createElement('div');
      part.className = `ig-viz-seg ${seg.segClass}`;
      part.style.width = `${(seg.count / totalChanges) * 100}%`;
      part.title = `${t(`compare.${seg.key}`)}: ${seg.count}`;
      bar.appendChild(part);
    });
    vizEl.appendChild(bar);
  }

  const chips = document.createElement('div');
  chips.className = 'ig-viz-chips';
  segments.forEach(seg => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `ig-viz-chip ${seg.chipClass}`;
    chip.textContent = `${seg.prefix}${seg.count} ${t(`compare.${seg.key}`)}`;
    chip.addEventListener('click', () => {
      const targetFilter = compareFilters.find(f => f.dataKey === seg.key);
      if (targetFilter) {
        setActiveInContainer('sidebar-panel-compare', targetFilter.id);
        activeCompareKey = seg.key;
        refreshCompareBanner();
        clearSearch();
        rerenderCurrentList();
      }
    });
    chips.appendChild(chip);
  });
  vizEl.appendChild(chips);
}

function refreshCompareBanner() {
  const banner = document.getElementById('ig-compare-banner');
  const swapBtn = document.getElementById('btn-compare-swap');

  if (activePanel !== 'compare' || !compareSnapshot || !compareDiff) {
    banner.classList.add('ig-relations-hidden');
    return;
  }

  banner.classList.remove('ig-relations-hidden');
  swapBtn.classList.toggle('ig-relations-hidden', !compareCurrentSnapshot);

  const infoEl = document.getElementById('ig-compare-snapshot-info');
  if (compareCurrentSnapshot) {
    infoEl.textContent = t('compare.twoFileLabel', {
      old: formatSnapshotDisplayName(compareSnapshot),
      current: formatSnapshotDisplayName(compareCurrentSnapshot)
    });
  } else {
    const snapshotName = compareSnapshot.targetUsername
      ? `@${compareSnapshot.targetUsername}`
      : (compareSnapshot.fileName || 'File');
    infoEl.textContent = compareSnapshot.exportedAt
      ? t('compare.snapshotWithDate', { name: snapshotName, date: compareSnapshot.exportedAt })
      : t('compare.snapshotLabel', { name: snapshotName });
  }
  infoEl.title = infoEl.textContent;

  const deltasEl = document.getElementById('ig-compare-deltas');
  deltasEl.innerHTML = '';

  const { counts } = compareDiff;
  if (compareSnapshot.hasFollowers) {
    const pill = document.createElement('span');
    pill.className = `ig-delta-pill ${counts.followersDelta > 0 ? 'delta-up' : counts.followersDelta < 0 ? 'delta-down' : ''}`;
    pill.textContent = t('compare.deltaFollowers', {
      old: counts.previousFollowers,
      current: counts.currentFollowers,
      delta: formatDelta(counts.followersDelta)
    });
    deltasEl.appendChild(pill);
  }

  if (compareSnapshot.hasFollowing) {
    const pill = document.createElement('span');
    pill.className = `ig-delta-pill ${counts.followingDelta > 0 ? 'delta-up' : counts.followingDelta < 0 ? 'delta-down' : ''}`;
    pill.textContent = t('compare.deltaFollowing', {
      old: counts.previousFollowing,
      current: counts.currentFollowing,
      delta: formatDelta(counts.followingDelta)
    });
    deltasEl.appendChild(pill);
  }

  renderCompareVisualization();

  // Farklı profilin dosyası yüklendiyse kullanıcıyı uyar
  const warningEl = document.getElementById('ig-compare-warning');
  const compareTargetId = compareCurrentSnapshot ? compareCurrentSnapshot.targetId : CONFIG.targetUserId;
  const compareTargetUsername = compareCurrentSnapshot ? compareCurrentSnapshot.targetUsername : CONFIG.targetUsername;

  const idMismatch = compareSnapshot.targetId && compareTargetId
    && String(compareSnapshot.targetId) !== String(compareTargetId);
  const usernameMismatch = !compareSnapshot.targetId && compareSnapshot.targetUsername && compareTargetUsername
    && compareSnapshot.targetUsername.toLowerCase() !== compareTargetUsername.toLowerCase();

  if (idMismatch || usernameMismatch) {
    warningEl.textContent = t('compare.mismatchWarning', {
      snapshotUser: compareSnapshot.targetUsername || compareSnapshot.targetId,
      currentUser: compareTargetUsername
    });
    warningEl.classList.remove('ig-relations-hidden');
  } else {
    warningEl.textContent = '';
    warningEl.classList.add('ig-relations-hidden');
  }
}

function clearCompareState({ rerender = true } = {}) {
  compareSnapshot = null;
  compareCurrentSnapshot = null;
  compareDiff = null;
  activeCompareKey = 'lostFollowers';

  setActiveInContainer('sidebar-panel-compare', 'filter-cmp-lost-followers');
  updateCompareUI();
  updateDownloadButtons();

  if (rerender) {
    clearSearch();
    rerenderCurrentList();
  }
}

// ======================== DIŞA AKTARMA (EXPORT) ========================

// CSV bölüm başlıkları, dosyayı Excel'de açan kullanıcı okusun diye
// aktif dilde yazılır. Dosya adlarında ise sabit İngilizce anahtarlar
// kullanılır (dil değişse de dosya adları tutarlı kalsın).
const EXPORT_LIST_KEYS = ['following', 'followers', 'notFollowingBack', 'iNotFollowingBack'];

function getSelectedExportFormat() {
  return document.getElementById('ig-relations-export-type').value; // 'html' | 'csv' | 'json'
}

// Her filtrenin yanındaki ⬇ ikonu: sadece o listeyi, seçili formatta indirir
document.querySelectorAll('.btn-download-list').forEach(btn => {
  btn.addEventListener('click', () => {
    const currentCache = profileCaches[CONFIG.targetUserId];
    if (!currentCache) {
      alert(t('alert.noData'));
      return;
    }

    const listName = btn.dataset.list;
    const users = currentCache[listName] || [];
    if (users.length === 0) {
      alert(t('alert.emptyList'));
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const exportUser = CONFIG.targetUsername || 'profile';
    const baseName = `ig-${exportUser}-${listName}-${dateStr}`;
    const format = getSelectedExportFormat();

    if (format === 'html') {
      const html = buildProfileHtmlReport({
        targetUsername: CONFIG.targetUsername,
        targetId: CONFIG.targetUserId,
        exportedAt: new Date().toLocaleString(),
        followers: listName === 'followers' ? users : [],
        following: listName === 'following' ? users : [],
        notFollowingBack: listName === 'notFollowingBack' ? users : [],
        iNotFollowingBack: listName === 'iNotFollowingBack' ? users : [],
        singleListKey: listName,
        singleListLabel: t(`filter.${listName}`),
        lang: getLanguage()
      });
      downloadBlob(html, `${baseName}.html`, 'text/html;charset=utf-8;');
    } else if (format === 'csv') {
      downloadBlob(buildUsersCsv(users), `${baseName}.csv`, 'text/csv;charset=utf-8;');
    } else {
      downloadBlob(JSON.stringify(users, null, 2), `${baseName}.json`, 'application/json');
    }
  });
});

// Dosya Görüntüleyici sekmesindeki ⬇ ikonu
document.querySelectorAll('.btn-download-viewer').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!viewerFileData) {
      alert(t('alert.noData'));
      return;
    }

    const listName = btn.dataset.viewerList;
    const users = viewerFileData[listName] || [];
    if (users.length === 0) {
      alert(t('alert.emptyList'));
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const baseName = `ig-viewer-${listName}-${dateStr}`;
    const format = getSelectedExportFormat();

    if (format === 'html') {
      const cleanName = (viewerFileData.sourceName || '').replace(/^@/, '');
      const html = buildProfileHtmlReport({
        targetUsername: cleanName,
        targetId: '',
        exportedAt: new Date().toLocaleString(),
        followers: listName === 'followers' ? users : [],
        following: listName === 'following' ? users : [],
        notFollowingBack: listName === 'notFollowingBack' ? users : [],
        iNotFollowingBack: listName === 'iNotFollowingBack' ? users : [],
        singleListKey: listName,
        singleListLabel: t(`filter.${listName}`),
        lang: getLanguage()
      });
      downloadBlob(html, `${baseName}.html`, 'text/html;charset=utf-8;');
    } else if (format === 'csv') {
      downloadBlob(buildUsersCsv(users), `${baseName}.csv`, 'text/csv;charset=utf-8;');
    } else {
      downloadBlob(JSON.stringify(users, null, 2), `${baseName}.json`, 'application/json');
    }
  });
});

// Karşılaştırma listesindeki ⬇ ikonu: sadece o fark kategorisini indirir
document.querySelectorAll('.btn-download-compare').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!compareDiff) {
      alert(t('alert.noData'));
      return;
    }

    const listName = btn.dataset.compareList;
    const users = compareDiff[listName] || [];
    if (users.length === 0) {
      alert(t('alert.emptyList'));
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const exportUser = CONFIG.targetUsername || compareCurrentSnapshot?.targetUsername || compareSnapshot?.targetUsername || 'snapshot';
    const baseName = `ig-${exportUser}-compare-${listName}-${dateStr}`;
    const format = getSelectedExportFormat();

    if (format === 'html') {
      const comparisonLabel = compareCurrentSnapshot
        ? `${formatSnapshotDisplayName(compareSnapshot)} → ${formatSnapshotDisplayName(compareCurrentSnapshot)}`
        : formatSnapshotDisplayName(compareSnapshot);
      const html = buildCompareHtmlReport({
        targetUsername: exportUser,
        targetId: CONFIG.targetUserId || compareCurrentSnapshot?.targetId || compareSnapshot?.targetId || '',
        comparedAt: new Date().toLocaleString(),
        comparisonLabel,
        compareDiff,
        singleCategoryKey: listName,
        lang: getLanguage()
      });
      downloadBlob(html, `${baseName}.html`, 'text/html;charset=utf-8;');
    } else if (format === 'csv') {
      const csv = listName === 'renamed'
        ? buildRenamedCsv(users)
        : buildUsersCsv(users);
      downloadBlob(csv, `${baseName}.csv`, 'text/csv;charset=utf-8;');
    } else {
      downloadBlob(JSON.stringify(users, null, 2), `${baseName}.json`, 'application/json');
    }
  });
});

// Karşılaştırma banner'ındaki "↓ Farkı İndir" butonu: tüm fark raporunu indirir
document.getElementById('btn-compare-export').addEventListener('click', () => {
  if (!compareSnapshot || !compareDiff) {
    alert(t('alert.noData'));
    return;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const exportUser = CONFIG.targetUsername || compareCurrentSnapshot?.targetUsername || compareSnapshot?.targetUsername || 'snapshot';
  const baseName = `ig-${exportUser}-compare-all-${dateStr}`;
  const format = getSelectedExportFormat();

  if (format === 'html') {
    const comparisonLabel = compareCurrentSnapshot
      ? `${formatSnapshotDisplayName(compareSnapshot)} → ${formatSnapshotDisplayName(compareCurrentSnapshot)}`
      : formatSnapshotDisplayName(compareSnapshot);
    const html = buildCompareHtmlReport({
      targetUsername: exportUser,
      targetId: CONFIG.targetUserId || compareCurrentSnapshot?.targetId || compareSnapshot?.targetId || '',
      comparedAt: new Date().toLocaleString(),
      comparisonLabel,
      compareDiff,
      lang: getLanguage()
    });
    downloadBlob(html, `${baseName}.html`, 'text/html;charset=utf-8;');
  } else if (format === 'csv') {
    let csvContent = '\uFEFF';
    COMPARE_LIST_KEYS.forEach((listName, index) => {
      const users = compareDiff[listName] || [];
      if (index > 0) csvContent += '\n';
      csvContent += `${t(`compare.${listName}`)} (${users.length})\n`;
      csvContent += listName === 'renamed'
        ? buildRenamedCsv(users, { includeBom: false })
        : buildUsersCsv(users, { includeBom: false });
    });

    downloadBlob(csvContent, `${baseName}.csv`, 'text/csv;charset=utf-8;');
  } else {
    const report = JSON.stringify({
      target_username: CONFIG.targetUsername,
      target_id: CONFIG.targetUserId,
      compared_at: new Date().toLocaleString(),
      previous_snapshot: {
        file_name: compareSnapshot.fileName,
        target_username: compareSnapshot.targetUsername,
        target_id: compareSnapshot.targetId,
        exported_at: compareSnapshot.exportedAt
      },
      summary: {
        ...compareDiff.counts,
        new_followers_count: compareDiff.newFollowers.length,
        lost_followers_count: compareDiff.lostFollowers.length,
        new_following_count: compareDiff.newFollowing.length,
        unfollowed_count: compareDiff.unfollowed.length,
        renamed_count: compareDiff.renamed.length
      },
      changes: {
        newFollowers: compareDiff.newFollowers,
        lostFollowers: compareDiff.lostFollowers,
        newFollowing: compareDiff.newFollowing,
        unfollowed: compareDiff.unfollowed,
        renamed: compareDiff.renamed
      }
    }, null, 2);

    downloadBlob(report, `${baseName}.json`, 'application/json');
  }
});

// "Tümünü İndir": aktif sekmeye göre tüm listeleri veya fark raporunu indirir
document.getElementById('btn-export-data').addEventListener('click', () => {
  if (activePanel === 'compare') {
    document.getElementById('btn-compare-export').click();
    return;
  }

  const currentCache = activePanel === 'viewer' ? viewerFileData : profileCaches[CONFIG.targetUserId];
  if (!currentCache) {
    alert(t('alert.noData'));
    return;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const exportUser = activePanel === 'viewer' ? 'viewer' : (CONFIG.targetUsername || 'profile');
  const baseName = `ig-${exportUser}-all-data-${dateStr}`;
  const format = getSelectedExportFormat();

  if (format === 'html') {
    const html = buildProfileHtmlReport({
      targetUsername: activePanel === 'viewer'
        ? (viewerFileData.sourceName || '').replace(/^@/, '')
        : CONFIG.targetUsername,
      targetId: activePanel === 'viewer' ? '' : CONFIG.targetUserId,
      exportedAt: new Date().toLocaleString(),
      followers: currentCache.followers || [],
      following: currentCache.following || [],
      notFollowingBack: currentCache.notFollowingBack || [],
      iNotFollowingBack: currentCache.iNotFollowingBack || [],
      fetchMeta: currentCache.fetchMeta || null,
      lang: getLanguage()
    });
    downloadBlob(html, `${baseName}.html`, 'text/html;charset=utf-8;');
  } else if (format === 'csv') {
    // Her liste kendi başlığıyla, tek CSV dosyasında art arda bölümler
    // halinde yazılır (Excel'de tek sayfada okunur; her bölüm kendi
    // kolon başlıklarını taşır).
    let csvContent = '\uFEFF'; // Türkçe karakterlerin Excel'de düzgün görünmesi için BOM
    EXPORT_LIST_KEYS.forEach((listName, index) => {
      const users = currentCache[listName] || [];
      if (index > 0) csvContent += '\n';
      csvContent += `${t(`filter.${listName}`)} (${users.length})\n`;
      csvContent += buildUsersCsv(users, { includeBom: false });
    });

    downloadBlob(csvContent, `${baseName}.csv`, 'text/csv;charset=utf-8;');
  } else {
    // Takipçi, takip edilen ve filtrelenmiş tüm listeleri tek JSON'da paketle
    const allDataContent = JSON.stringify({
      target_username: CONFIG.targetUsername,
      target_id: CONFIG.targetUserId,
      exported_at: new Date().toLocaleString(),
      summary: {
        following_count: currentCache.following.length,
        followers_count: currentCache.followers.length,
        not_following_back_count: currentCache.notFollowingBack.length,
        i_not_following_back_count: currentCache.iNotFollowingBack.length
      },
      details: currentCache
    }, null, 2);

    downloadBlob(allDataContent, `${baseName}.json`, 'application/json');
  }
});

function escapeCsvField(value) {
  return String(value ?? '').replace(/\r?\n/g, ' ').replace(/"/g, '""');
}

// Kullanıcı listesini Excel ile tam uyumlu CSV metnine çevirir.
// `includeBom: false` verilirse BOM eklenmez (tek dosyada birden fazla
// bölüm art arda birleştirilirken BOM sadece dosyanın en başında olmalı).
function buildUsersCsv(users, { includeBom = true } = {}) {
  let csvContent = includeBom ? '\uFEFF' : '';
  csvContent += `${t('export.headerId')},${t('export.headerUsername')},${t('export.headerFullName')}\n`;

  users.forEach(user => {
    const pk = escapeCsvField(user.pk);
    const username = escapeCsvField(user.username);
    const fullName = escapeCsvField(user.full_name);
    csvContent += `"${pk}","${username}","${fullName}"\n`;
  });

  return csvContent;
}

function buildRenamedCsv(users, { includeBom = true } = {}) {
  let csvContent = includeBom ? '\uFEFF' : '';
  csvContent += `${t('export.headerId')},${t('export.headerOldUsername')},${t('export.headerNewUsername')},${t('export.headerFullName')}\n`;

  users.forEach(user => {
    const pk = escapeCsvField(user.pk);
    const oldUsername = escapeCsvField(user.old_username);
    const newUsername = escapeCsvField(user.username);
    const fullName = escapeCsvField(user.full_name);
    csvContent += `"${pk}","${oldUsername}","${newUsername}","${fullName}"\n`;
  });

  return csvContent;
}

// Tarayıcıya dosyayı indirtmek için yardımcı fonksiyon
function downloadBlob(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Temizlik
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}
