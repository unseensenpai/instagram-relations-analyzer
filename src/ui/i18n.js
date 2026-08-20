// Panel arayüzünün tüm metinleri. Yeni bir dil eklemek için buraya
// aynı anahtarlarla bir blok eklemek ve LANGUAGES listesine kaydetmek yeterli.
//
// Yer tutucular {name} biçiminde yazılır ve t() çağrısına verilen
// nesneden doldurulur: t('sync.progress', { label, count, total })

export const LANGUAGES = [
  { code: 'tr', label: 'Türkçe' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' }
];

export const DEFAULT_LANGUAGE = 'en';

const TRANSLATIONS = {
  tr: {
    'app.title': 'IG Relations Analyzer',
    'app.titleWithUser': 'İlişkiler: @{username}',

    'sidebar.sync': 'Profili Senkronize Et',
    'sidebar.syncing': 'Senkronize ediliyor...',
    'sidebar.lastSynced': 'Son senkronizasyon: {timestamp}',
    'sidebar.language': 'Dil',
    'sidebar.format': 'Biçim',
    'sidebar.downloadAll': '↓ Tümünü İndir',
    'sidebar.downloadList': 'Bu listeyi indir',

    'filter.following': 'Takip Edilenler',
    'filter.followers': 'Takipçiler',
    'filter.notFollowingBack': 'Geri Takip Etmeyenler',
    'filter.iNotFollowingBack': 'Takip Etmediklerim',

    'search.placeholder': 'Bu listede ara (kullanıcı adı veya isim)...',
    'search.clear': 'Aramayı temizle',
    'search.noResults': '"{term}" için eşleşen kullanıcı yok.',

    'action.unfollow': 'Takibi Bırak',
    'action.unfollowing': 'Bırakılıyor...',
    'action.remove': 'Çıkar',
    'action.removing': 'Çıkarılıyor...',

    'status.welcome': 'Bir profil sayfası açıp "Profili Senkronize Et" butonuna basın...',
    'status.invalidProfile': 'Analize başlamak için geçerli bir Instagram profil sayfasına gidin.',
    'status.invalidProfileSync': 'Geçersiz profil sayfası. Senkronize etmek için bir profil açın.',
    'status.noCache': '@{username} için kayıtlı veri yok. Lütfen senkronize edin.',
    'status.fetching': '{label} çekiliyor...',
    'status.fetchProgress': '{label} çekiliyor... {count} / {total} (%{percent}) — tahmini kalan {eta}',
    'status.fetchProgressNoTotal': '{label} çekiliyor... {count} kişi alındı.',
    'status.fetchDone': '{label}: {count} kişi alındı.',
    'status.comparing': 'Listeler karşılaştırılıyor...',
    'status.saving': 'Sonuçlar kaydediliyor...',
    'status.rendering': 'Liste hazırlanıyor ({count} kişi)...',

    'error.rateLimit': 'Instagram istekleri geçici olarak sınırladı (rate limit). Birkaç dakika bekleyip tekrar deneyin.',
    'error.privateOrBlocked': 'Gizli profil veya Instagram tarafından engellendi. Listeye erişilemiyor.',
    'error.unexpectedStatus': 'Instagram beklenmeyen bir hata döndürdü (HTTP {status}). Senkronizasyon durduruldu.',
    'error.badResponse': 'Instagram beklenmeyen bir yanıt döndürdü (muhtemelen oturum süresi doldu). Sayfayı yenileyip tekrar deneyin.',
    'error.network': 'Ağ hatası nedeniyle senkronizasyon durduruldu ({type}). Bağlantınızı kontrol edip tekrar deneyin.',
    'error.cacheSaveFailed': 'Analiz tamam, ancak sonuçlar tarayıcı depolamasına kaydedilemedi (alan yetersiz). Liste ekranda görünüyor ama panel kapanınca kaybolacak.',

    'confirm.closeWhileSyncing': 'Senkronizasyon devam ediyor. Kapatırsan işlem iptal edilecek ve şu ana kadar çekilen veri kaydedilmeyecek. Kapatmak istediğine emin misin?',

    'alert.noData': 'İndirilecek veri bulunamadı. Lütfen önce profili senkronize edin.',
    'alert.emptyList': 'Bu listede indirilecek kullanıcı yok.',

    'eta.seconds': '~{value} sn',
    'eta.minutes': '~{value} dk',

    'export.headerId': 'Instagram ID',
    'export.headerUsername': 'Kullanıcı Adı',
    'export.headerFullName': 'Tam Ad'
  },

  en: {
    'app.title': 'IG Relations Analyzer',
    'app.titleWithUser': 'Relations: @{username}',

    'sidebar.sync': 'Sync Target Profile',
    'sidebar.syncing': 'Syncing...',
    'sidebar.lastSynced': 'Last synced: {timestamp}',
    'sidebar.language': 'Language',
    'sidebar.format': 'Format',
    'sidebar.downloadAll': '↓ Download All',
    'sidebar.downloadList': 'Download this list',

    'filter.following': 'Following',
    'filter.followers': 'Followers',
    'filter.notFollowingBack': 'Not Following Back',
    'filter.iNotFollowingBack': "You Don't Follow Back",

    'search.placeholder': 'Search this list (username or name)...',
    'search.clear': 'Clear search',
    'search.noResults': 'No users match "{term}".',

    'action.unfollow': 'Unfollow',
    'action.unfollowing': 'Leaving...',
    'action.remove': 'Remove',
    'action.removing': 'Removing...',

    'status.welcome': 'Open any profile page and click "Sync Target Profile"...',
    'status.invalidProfile': 'Please navigate to a valid Instagram profile page to begin analysis.',
    'status.invalidProfileSync': 'Invalid profile page. Please open a profile to sync.',
    'status.noCache': 'No cached data found for @{username}. Please sync relations.',
    'status.fetching': 'Fetching {label}...',
    'status.fetchProgress': 'Fetching {label}... {count} / {total} ({percent}%) — about {eta} left',
    'status.fetchProgressNoTotal': 'Fetching {label}... {count} loaded.',
    'status.fetchDone': '{label}: {count} loaded.',
    'status.comparing': 'Comparing lists...',
    'status.saving': 'Saving results...',
    'status.rendering': 'Preparing list ({count} users)...',

    'error.rateLimit': 'Instagram has temporarily rate-limited requests. Please wait a few minutes and try again.',
    'error.privateOrBlocked': 'Private profile or action blocked by Instagram. Cannot access list.',
    'error.unexpectedStatus': 'Instagram returned an unexpected error (HTTP {status}). Sync stopped.',
    'error.badResponse': 'Instagram returned an unexpected response (your session may have expired). Refresh the page and try again.',
    'error.network': 'Sync stopped due to a network error ({type}). Check your connection and try again.',
    'error.cacheSaveFailed': 'Analysis complete, but results could not be saved to browser storage (not enough space). The list is visible now but will be lost when the panel closes.',

    'confirm.closeWhileSyncing': 'A sync is in progress. Closing will cancel it and the data fetched so far will not be saved. Are you sure you want to close?',

    'alert.noData': 'No data to download. Please sync the profile first.',
    'alert.emptyList': 'There are no users to download in this list.',

    'eta.seconds': '~{value}s',
    'eta.minutes': '~{value}m',

    'export.headerId': 'Instagram ID',
    'export.headerUsername': 'Username',
    'export.headerFullName': 'Full Name'
  },

  es: {
    'app.title': 'IG Relations Analyzer',
    'app.titleWithUser': 'Relaciones: @{username}',

    'sidebar.sync': 'Sincronizar Perfil',
    'sidebar.syncing': 'Sincronizando...',
    'sidebar.lastSynced': 'Última sincronización: {timestamp}',
    'sidebar.language': 'Idioma',
    'sidebar.format': 'Formato',
    'sidebar.downloadAll': '↓ Descargar Todo',
    'sidebar.downloadList': 'Descargar esta lista',

    'filter.following': 'Siguiendo',
    'filter.followers': 'Seguidores',
    'filter.notFollowingBack': 'No Te Siguen',
    'filter.iNotFollowingBack': 'No Sigues de Vuelta',

    'search.placeholder': 'Buscar en esta lista (usuario o nombre)...',
    'search.clear': 'Borrar búsqueda',
    'search.noResults': 'Ningún usuario coincide con "{term}".',

    'action.unfollow': 'Dejar de seguir',
    'action.unfollowing': 'Procesando...',
    'action.remove': 'Eliminar',
    'action.removing': 'Eliminando...',

    'status.welcome': 'Abre una página de perfil y pulsa "Sincronizar Perfil"...',
    'status.invalidProfile': 'Ve a una página de perfil de Instagram válida para comenzar el análisis.',
    'status.invalidProfileSync': 'Página de perfil no válida. Abre un perfil para sincronizar.',
    'status.noCache': 'No hay datos guardados para @{username}. Sincroniza primero.',
    'status.fetching': 'Obteniendo {label}...',
    'status.fetchProgress': 'Obteniendo {label}... {count} / {total} ({percent}%) — quedan aprox. {eta}',
    'status.fetchProgressNoTotal': 'Obteniendo {label}... {count} cargados.',
    'status.fetchDone': '{label}: {count} cargados.',
    'status.comparing': 'Comparando listas...',
    'status.saving': 'Guardando resultados...',
    'status.rendering': 'Preparando lista ({count} usuarios)...',

    'error.rateLimit': 'Instagram ha limitado temporalmente las solicitudes. Espera unos minutos e inténtalo de nuevo.',
    'error.privateOrBlocked': 'Perfil privado o acción bloqueada por Instagram. No se puede acceder a la lista.',
    'error.unexpectedStatus': 'Instagram devolvió un error inesperado (HTTP {status}). Sincronización detenida.',
    'error.badResponse': 'Instagram devolvió una respuesta inesperada (tu sesión puede haber caducado). Actualiza la página e inténtalo de nuevo.',
    'error.network': 'Sincronización detenida por un error de red ({type}). Comprueba tu conexión e inténtalo de nuevo.',
    'error.cacheSaveFailed': 'Análisis completo, pero los resultados no se pudieron guardar en el almacenamiento del navegador (espacio insuficiente). La lista se ve ahora pero se perderá al cerrar el panel.',

    'confirm.closeWhileSyncing': 'Hay una sincronización en curso. Si cierras, se cancelará y los datos obtenidos hasta ahora no se guardarán. ¿Seguro que quieres cerrar?',

    'alert.noData': 'No hay datos para descargar. Sincroniza el perfil primero.',
    'alert.emptyList': 'No hay usuarios para descargar en esta lista.',

    'eta.seconds': '~{value}s',
    'eta.minutes': '~{value}min',

    'export.headerId': 'ID de Instagram',
    'export.headerUsername': 'Usuario',
    'export.headerFullName': 'Nombre Completo'
  }
};

const STORAGE_KEY = 'ig_relations_language';

let activeLanguage = DEFAULT_LANGUAGE;

// Tarayıcı dilinden desteklenen bir dil çıkarmaya çalışır ("es-MX" -> "es")
function detectBrowserLanguage() {
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const base = candidate.toLowerCase().split('-')[0];
    if (TRANSLATIONS[base]) return base;
  }

  return DEFAULT_LANGUAGE;
}

// Kayıtlı tercih varsa onu, yoksa tarayıcı dilini kullanır
export function initLanguage() {
  let stored = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage erişilemiyorsa sessizce tarayıcı diline düşüyoruz
  }

  activeLanguage = TRANSLATIONS[stored] ? stored : detectBrowserLanguage();
  return activeLanguage;
}

export function getLanguage() {
  return activeLanguage;
}

export function setLanguage(code) {
  if (!TRANSLATIONS[code]) return false;

  activeLanguage = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Tercih saklanamadıysa oturum boyunca yine de geçerli kalır
  }
  return true;
}

// Anahtarı aktif dile çevirir. Anahtar bulunamazsa İngilizce'ye,
// o da yoksa anahtarın kendisine düşer (sessizce boş string dönmez;
// eksik çeviri böylece gözle görülür olur).
export function t(key, params = {}) {
  const template = TRANSLATIONS[activeLanguage]?.[key]
    ?? TRANSLATIONS[DEFAULT_LANGUAGE]?.[key]
    ?? key;

  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
  );
}
