// Tarayıcı içi yerel anlık görüntü (snapshot) geçmişi — IndexedDB tabanlı.
// localStorage'ın ~5MB sınırına takılmadan profil başına birden fazla
// senkronizasyon kaydı tutar. Veriler yalnızca tarayıcıda kalır.

const DB_NAME = 'ig_relations_history_db';
const DB_VERSION = 1;
const STORE_NAME = 'snapshots';
const MAX_SNAPSHOTS_PER_PROFILE = 20;

let dbPromise = null;

function openHistoryDb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by_userId', 'userId', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('IG Relations: IndexedDB unavailable', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('IG Relations: failed to open IndexedDB', err);
      resolve(null);
    }
  });

  return dbPromise;
}

/**
 * Bir profilin kayıtlı geçmiş anlık görüntülerini yeniden eskiye sıralı döndürür.
 */
export async function listProfileSnapshots(userId) {
  const db = await openHistoryDb();
  if (!db || !userId) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const index = tx.objectStore(STORE_NAME).index('by_userId');
      const req = index.getAll(String(userId));

      req.onsuccess = () => {
        const items = Array.isArray(req.result) ? req.result : [];
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        resolve(items);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Senkronizasyon sonrasında yeni bir anlık görüntüyü geçmişe ekler.
 * Profil başına en fazla MAX_SNAPSHOTS_PER_PROFILE kayıt tutulur; eskiler otomatik temizlenir.
 */
export async function saveProfileSnapshot({ userId, username, timestamp, followers, following }) {
  const db = await openHistoryDb();
  if (!db || !userId) return null;

  const createdAt = Date.now();
  const record = {
    id: `${userId}_${createdAt}`,
    userId: String(userId),
    username: username || '',
    createdAt,
    timestamp: timestamp || new Date(createdAt).toLocaleString(),
    followersCount: followers.length,
    followingCount: following.length,
    followers,
    following
  };

  const putRecord = () => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });

  try {
    await putRecord();
    await pruneProfileSnapshots(userId, MAX_SNAPSHOTS_PER_PROFILE);
    return record;
  } catch (err) {
    // Kota hatasında bu profilin en eski kayıtlarını silip bir kez daha dene
    if (err?.name === 'QuotaExceededError') {
      await pruneProfileSnapshots(userId, 5);
      try {
        await putRecord();
        return record;
      } catch (retryErr) {
        console.warn('IG Relations: history save failed after pruning', retryErr);
      }
    } else {
      console.warn('IG Relations: history save failed', err);
    }
    return null;
  }
}

export async function deleteProfileSnapshot(snapshotId) {
  const db = await openHistoryDb();
  if (!db || !snapshotId) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(snapshotId);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function pruneProfileSnapshots(userId, maxKeep) {
  const existing = await listProfileSnapshots(userId);
  if (existing.length <= maxKeep) return;

  const toDelete = existing.slice(maxKeep);
  const db = await openHistoryDb();
  if (!db) return;

  await new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      toDelete.forEach(item => store.delete(item.id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}
