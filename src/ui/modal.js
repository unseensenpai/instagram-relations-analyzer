import { LANGUAGES, initLanguage, getLanguage, setLanguage, t } from './i18n.js';

const CONFIG = {
  appId: '936619743392459',
  targetUserId: null,
  targetUsername: ''
};

// Her profilin verisini ayırmak için ana depo yapısı
let profileCaches = {};
let currentFilterKey = 'following';
let isSyncing = false;
let currentSearchTerm = '';
// Ekranda gösterilen son senkronizasyon zamanı; dil değişince
// etiketi yeniden çevirebilmek için ham hâliyle saklanır.
let lastSyncedTimestamp = '';

const searchInput = document.getElementById('ig-relations-search');

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
    // Liste öğelerindeki aksiyon butonları da çevrilmeli
    rerenderCurrentList();
    refreshCacheTimestamp();
  });
}

document.getElementById('ig-relations-close-btn').addEventListener('click', () => {
  if (isSyncing && !confirm(t('confirm.closeWhileSyncing'))) {
    return;
  }
  document.getElementById('ig-relations-modal-overlay').classList.add('ig-relations-hidden');
});

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
    // Modal az önce açıldı; profil değişmiş olabilir, arama sıfırlanır
    clearSearch();

    if (detectTargetProfile()) {
      document.getElementById('ig-relations-title').textContent =
        t('app.titleWithUser', { username: CONFIG.targetUsername });
      loadCachedData();
    } else {
      resetUI();
      updateStatus(t('status.invalidProfile'), true);
    }
  }
  wasHidden = isHidden;
}).observe(modalOverlay, { attributes: true, attributeFilter: ['class'] });

document.getElementById('btn-fetch-data').addEventListener('click', async () => {
  if (isSyncing) return;

  if (!detectTargetProfile()) {
    updateStatus(t('status.invalidProfileSync'), true);
    return;
  }

  isSyncing = true;
  setLoading(true);
  // Not: burada eski profileCaches/localStorage verisini bilerek silmiyoruz.
  // Sync bir sayfa navigasyonu (SPA route değişimi, F5, vb.) yüzünden
  // yarıda kesilirse content script'in tüm state'i sıfırdan kurulur; eski
  // veriyi önceden silseydik, yarım kalan senkronizasyon hem yeni veriyi
  // hem de daha önce başarıyla kaydedilmiş cache'i kaybettirirdi.
  // Ekranı geçici olarak temizliyoruz, ama gerçek veri sync başarıyla
  // bitene kadar hem bellekte hem localStorage'da olduğu gibi kalıyor.
  document.getElementById('ig-relations-user-list').innerHTML = '';
  clearSearch();

  const workingData = {
    followers: [],
    following: [],
    notFollowingBack: [],
    iNotFollowingBack: []
  };

  // Profil başlığındaki "takip"/"takipçi" sayıları, ilerlemeyi yüzde
  // olarak gösterebilmek için okunur. Bulunamazsa sadece çekilen sayı
  // gösterilir (yüzde/tahmin atlanır).
  const totals = readProfileTotals();

  try {
    const following = await fetchAllRelations('following', totals.following);
    if (following === null) return;

    const followers = await fetchAllRelations('followers', totals.followers);
    if (followers === null) return;

    workingData.following = following;
    workingData.followers = followers;
    profileCaches[CONFIG.targetUserId] = workingData;

    updateStatus(t('status.comparing'));
    processRelations(CONFIG.targetUserId);

    updateStatus(t('status.saving'));
    const saved = saveCacheData(CONFIG.targetUserId);

    updateStatus(t('status.rendering', { count: workingData[currentFilterKey].length }));
    // Tarayıcının yukarıdaki mesajı boyamasına fırsat veriyoruz; aksi
    // halde büyük listelerde render bitene kadar ekran donmuş görünüyor.
    await new Promise(resolve => requestAnimationFrame(resolve));

    renderList(workingData[currentFilterKey]);
    updateUIElements();

    if (!saved) {
      updateStatus(t('error.cacheSaveFailed'), true);
    }
  } finally {
    isSyncing = false;
    setLoading(false);
  }
});

// Instagram profil başlığındaki takipçi/takip sayılarını okumaya çalışır.
// Bulunamazsa ilgili alan null döner; ilerleme göstergesi buna göre
// yüzde göstermeden sadece çekilen sayıyı yazar.
function readProfileTotals() {
  const totals = { followers: null, following: null };

  const followersLink = document.querySelector(`a[href*="/followers"]`);
  const followingLink = document.querySelector(`a[href*="/following"]`);

  totals.followers = parseCountFromElement(followersLink);
  totals.following = parseCountFromElement(followingLink);

  return totals;
}

function parseCountFromElement(element) {
  if (!element) return null;

  // Önce title attribute'una bakıyoruz: Instagram tam sayıyı orada
  // tutuyor ("1.234"), görünen metin ise kısaltılmış olabiliyor ("1,2 B").
  const titled = element.querySelector('[title]');
  const raw = titled?.getAttribute('title') || element.innerText || '';

  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return null;

  const value = parseInt(digits, 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function detectTargetProfile() {
  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  if (!path || path.includes('/') || ['explore', 'direct', 'reels', 'stories'].includes(path)) {
    CONFIG.targetUserId = null;
    CONFIG.targetUsername = '';
    return false;
  }

  CONFIG.targetUsername = path;

  const scripts = document.querySelectorAll('script');
  for (let script of scripts) {
    if (script.innerText.includes('profilePage_')) {
      const match = script.innerText.match(/"profilePage_([0-9]+)"/);
      if (match && match[1]) {
        CONFIG.targetUserId = match[1];
        return true;
      }
    }
  }

  const metaObj = document.querySelector('meta[property="al:ios:url"]');
  if (metaObj) {
    const idMatch = metaObj.getAttribute('content').match(/id=([0-9]+)/);
    if (idMatch && idMatch[1]) {
      CONFIG.targetUserId = idMatch[1];
      return true;
    }
  }

  return false;
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
  
  if (isLoading) {
    spinner.style.display = 'block';
    btn.disabled = true;
    btn.textContent = t('sidebar.syncing');
  } else {
    spinner.style.display = 'none';
    btn.disabled = false;
    btn.textContent = t('sidebar.sync');
  }
}

// Sayfalar arası zorunlu bekleme (ms). Instagram'ın hız limitine
// takılmamak için düşürülmemeli.
const PAGE_DELAY_MS = 1500;

// "Takipçiler çekiliyor... 275 / 430 (%64) — tahmini kalan ~25 sn"
function buildProgressMessage(label, fetchedCount, expectedTotal, hasMore) {
  if (!hasMore) {
    return t('status.fetchDone', { label, count: fetchedCount });
  }

  if (!expectedTotal || fetchedCount > expectedTotal) {
    return t('status.fetchProgressNoTotal', { label, count: fetchedCount });
  }

  const percent = Math.min(99, Math.round((fetchedCount / expectedTotal) * 100));
  const remaining = Math.max(0, expectedTotal - fetchedCount);
  const pageSize = Math.max(1, fetchedCount);
  // Kalan sayfa sayısı × (istek süresi + bekleme). İstek süresini
  // ortalama 0.5 sn kabul ediyoruz.
  const remainingPages = Math.ceil(remaining / pageSize);
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

// Başarıyla tamamlanırsa tam listeyi, herhangi bir hata/engel durumunda
// `null` döner. `null`, çağıranın kısmi veriyi cache'e yazmasını
// engellemek için kullanılan açık bir sinyaldir — asla sessizce
// yutulmamalı ya da boş dizi ile karıştırılmamalıdır.
async function fetchAllRelations(type, expectedTotal = null) {
  const label = type === 'following' ? t('filter.following') : t('filter.followers');
  let list = [];
  let nextMaxId = '';
  let hasMore = true;

  updateStatus(t('status.fetching', { label }));

  while (hasMore) {
    const url = `https://www.instagram.com/api/v1/friendships/${CONFIG.targetUserId}/${type}/?count=50&max_id=${nextMaxId}`;
    try {
      const response = await fetch(url, {
        headers: {
          'X-IG-App-ID': CONFIG.appId,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

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

      if (data.users) {
        list = list.concat(data.users);
      }

      nextMaxId = data.next_max_id || '';
      hasMore = !!nextMaxId;

      updateStatus(buildProgressMessage(label, list.length, expectedTotal, hasMore));

      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, PAGE_DELAY_MS));
      }
    } catch (err) {
      console.error('IG Relations: network error while fetching', type, err);
      updateStatus(t('error.network', { type: label }), true);
      return null;
    }
  }
  return list;
}

function processRelations(userId) {
  const currentCache = profileCaches[userId];
  if (!currentCache) return;

  const followerIds = new Set(currentCache.followers.map(u => u.pk));
  const followingIds = new Set(currentCache.following.map(u => u.pk));

  currentCache.notFollowingBack = currentCache.following.filter(u => !followerIds.has(u.pk));
  currentCache.iNotFollowingBack = currentCache.followers.filter(u => !followingIds.has(u.pk));
}

// Cache'e yazarken API'den gelen ham kullanıcı nesnesinin tamamını değil,
// sadece ihtiyacımız olan alanları saklıyoruz. Ham nesne profile_pic_url
// gibi çok uzun alanlar içeriyor ve büyük profillerde localStorage'ın
// ~5MB kotasını aşarak QuotaExceededError'a yol açıyordu.
function slimUser(user) {
  return {
    pk: user.pk,
    username: user.username,
    full_name: user.full_name || ''
  };
}

function saveCacheData(userId) {
  const cacheKey = `ig_cache_${userId}`;
  const dataStore = profileCaches[userId];

  lastSyncedTimestamp = new Date().toLocaleString();
  refreshCacheTimestamp();

  const cacheObject = {
    timestamp: lastSyncedTimestamp,
    dataStore: {
      followers: dataStore.followers.map(slimUser),
      following: dataStore.following.map(slimUser),
      notFollowingBack: dataStore.notFollowingBack.map(slimUser),
      iNotFollowingBack: dataStore.iNotFollowingBack.map(slimUser)
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
  const cachedData = localStorage.getItem(cacheKey);
  
  if (cachedData) {
    const cached = JSON.parse(cachedData);
    // Hafızadaki profileCaches havuzuna ilgili ID'yi kaydediyoruz
    profileCaches[CONFIG.targetUserId] = cached.dataStore;

    lastSyncedTimestamp = cached.timestamp;
    refreshCacheTimestamp();
    processRelations(CONFIG.targetUserId);
    renderList(profileCaches[CONFIG.targetUserId][currentFilterKey]);
    updateUIElements();
  } else {
    resetUI();
    updateStatus(t('status.noCache', { username: CONFIG.targetUsername }));
  }
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
  updateStatus('');
  const currentCache = profileCaches[CONFIG.targetUserId];

  if (currentCache) {
    document.getElementById('cnt-following').innerText = currentCache.following.length;
    document.getElementById('cnt-followers').innerText = currentCache.followers.length;
    document.getElementById('cnt-not-back').innerText = currentCache.notFollowingBack.length;
    document.getElementById('cnt-i-not-back').innerText = currentCache.iNotFollowingBack.length;
  } else {
    resetUI();
  }

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

  document.getElementById('btn-export-data').disabled = !currentCache;
}

// Kullanıcı adı veya tam ad, arama terimini içeriyor mu?
// Türkçe karakterler için locale-aware küçük harfe çevirme kullanılır
// ("İ" -> "i" gibi durumlar İngilizce toLowerCase ile bozulabiliyor).
function filterUsersBySearch(users) {
  if (!currentSearchTerm) return users;

  const term = currentSearchTerm.toLocaleLowerCase('tr');
  return users.filter(user => {
    const username = (user.username || '').toLocaleLowerCase('tr');
    const fullName = (user.full_name || '').toLocaleLowerCase('tr');
    return username.includes(term) || fullName.includes(term);
  });
}

// Açık olan listeyi mevcut arama terimiyle yeniden çizer
function rerenderCurrentList() {
  const currentCache = profileCaches[CONFIG.targetUserId];
  if (currentCache) {
    renderList(currentCache[currentFilterKey]);
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

function renderList(users) {
  const listContainer = document.getElementById('ig-relations-user-list');
  listContainer.innerHTML = '';

  if (!users || users.length === 0) {
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

  const isActionRemove = currentFilterKey === 'iNotFollowingBack';
  const buttonText = isActionRemove ? t('action.remove') : t('action.unfollow');

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
    link.href = `https://instagram.com/${encodeURIComponent(user.username)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = user.username;

    const fullName = document.createElement('span');
    fullName.className = 'ig-fullname';
    fullName.textContent = user.full_name || '';

    info.appendChild(link);
    info.appendChild(fullName);

    const actionBtn = document.createElement('button');
    actionBtn.className = 'btn-unfollow';
    actionBtn.textContent = buttonText;
    actionBtn.addEventListener('click', () => {
      if (isActionRemove) {
        handleRemoveFollower(actionBtn, user.pk);
      } else {
        handleUnfollow(actionBtn, user.pk);
      }
    });

    li.appendChild(info);
    li.appendChild(actionBtn);
    fragment.appendChild(li);
  });

  listContainer.appendChild(fragment);
}

async function handleUnfollow(buttonElement, userId) {
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
      removeUserFromLocalStore('following', userId);
      processRelations(CONFIG.targetUserId);
      saveCacheData(CONFIG.targetUserId);
      buttonElement.closest('.ig-user-item').remove();
      updateUIElements();
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
      removeUserFromLocalStore('followers', userId);
      processRelations(CONFIG.targetUserId);
      saveCacheData(CONFIG.targetUserId);
      buttonElement.closest('.ig-user-item').remove();
      updateUIElements();
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

function removeUserFromLocalStore(storeKey, userId) {
  const currentCache = profileCaches[CONFIG.targetUserId];
  if (currentCache && currentCache[storeKey]) {
    currentCache[storeKey] = currentCache[storeKey].filter(u => u.pk !== userId && u.pk.toString() !== userId.toString());
  }
}

const filters = [
  { id: 'filter-following', dataKey: 'following' },
  { id: 'filter-followers', dataKey: 'followers' },
  { id: 'filter-not-following-back', dataKey: 'notFollowingBack' },
  { id: 'filter-i-not-following-back', dataKey: 'iNotFollowingBack' }
];

filters.forEach(filter => {
  const filterButton = document.getElementById(filter.id);

  filterButton.addEventListener('click', () => {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    filterButton.classList.add('active');
    currentFilterKey = filter.dataKey;

    // Liste değişince arama sıfırlanır; önceki listede yazılan terimin
    // yeni listede de uygulanması beklenmedik bir davranış olurdu.
    clearSearch();

    rerenderCurrentList();
  });
});

// CSV bölüm başlıkları, dosyayı Excel'de açan kullanıcı okusun diye
// aktif dilde yazılır. Dosya adlarında ise sabit İngilizce anahtarlar
// kullanılır (dil değişse de dosya adları tutarlı kalsın).
const EXPORT_LIST_KEYS = ['following', 'followers', 'notFollowingBack', 'iNotFollowingBack'];

function getSelectedExportFormat() {
  return document.getElementById('ig-relations-export-type').value; // 'csv' | 'json'
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
    const baseName = `ig-${CONFIG.targetUsername}-${listName}-${dateStr}`;

    if (getSelectedExportFormat() === 'csv') {
      downloadBlob(buildUsersCsv(users), `${baseName}.csv`, 'text/csv;charset=utf-8;');
    } else {
      downloadBlob(JSON.stringify(users, null, 2), `${baseName}.json`, 'application/json');
    }
  });
});

// "Tümünü İndir": dört listenin hepsini tek dosyada, seçili formatta
document.getElementById('btn-export-data').addEventListener('click', () => {
  const currentCache = profileCaches[CONFIG.targetUserId];
  if (!currentCache) {
    alert(t('alert.noData'));
    return;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const baseName = `ig-${CONFIG.targetUsername}-all-data-${dateStr}`;

  if (getSelectedExportFormat() === 'csv') {
    // Her liste kendi başlığıyla, tek CSV dosyasında art arda bölümler
    // halinde yazılır (Excel'de tek sayfada okunur; her bölüm kendi
    // kolon başlıklarını taşır).
    let csvContent = '﻿'; // Türkçe karakterlerin Excel'de düzgün görünmesi için BOM
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

// Kullanıcı listesini Excel ile tam uyumlu CSV metnine çevirir.
// `includeBom: false` verilirse BOM eklenmez (tek dosyada birden fazla
// bölüm art arda birleştirilirken BOM sadece dosyanın en başında olmalı).
function buildUsersCsv(users, { includeBom = true } = {}) {
  let csvContent = includeBom ? '﻿' : '';
  csvContent += `${t('export.headerId')},${t('export.headerUsername')},${t('export.headerFullName')}\n`;

  users.forEach(user => {
    const fullName = (user.full_name || '').replace(/"/g, '""'); // Tırnak işaretlerini escape et
    csvContent += `"${user.pk}","${user.username}","${fullName}"\n`;
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