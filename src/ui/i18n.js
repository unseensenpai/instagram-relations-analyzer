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

    'tab.analysis': 'Profil Analizi',
    'tab.compare': 'Karşılaştır',
    'tab.viewer': 'Dosya Görüntüleyici',

    'viewer.openFile': '📁 Dosya Aç (JSON / CSV / HTML)',
    'viewer.empty': 'İncelemek için daha önce dışa aktardığın bir JSON, CSV veya HTML raporu seç.',
    'viewer.loadedInfo': 'Dosya: {name}',
    'compare.emptyPrompt': 'Yukarıdaki geçmişten bir kayıt seç veya 1–2 JSON/CSV/HTML dosyası yükleyerek değişimleri gör.',
    'compare.pickFiles': '📁 1 veya 2 Dosya Seç (JSON/CSV/HTML)',

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
    'filter.iNotFollowingBack': 'Takip Etmediği',

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
    'status.resolvingProfile': '@{username} profili kontrol ediliyor...',
    'status.profileResolveFailed': '@{username} profil bilgisi alınamadı. Sayfayı yenileyip tekrar deneyin.',
    'status.fetching': '{label} çekiliyor...',
    'status.fetchProgress': '{label} çekiliyor... {count} / {total} (%{percent}) — tahmini kalan {eta}',
    'status.fetchProgressNoTotal': '{label} çekiliyor... {count} kişi alındı.',
    'status.fetchDone': '{label}: {count} kişi alındı.',
    'status.comparing': 'Listeler karşılaştırılıyor...',
    'status.saving': 'Sonuçlar kaydediliyor...',
    'status.rendering': 'Liste hazırlanıyor ({count} kişi)...',
    'status.partialWarning': 'Uyarı: Instagram API bazı hesapları eksik/tekrarlı döndürdü ({details}). Bazı ilişkiler kısmi görünebilir.',

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

    'export.formatHtml': 'HTML (İnteraktif Rapor)',
    'export.headerId': 'Instagram ID',
    'export.headerUsername': 'Kullanıcı Adı',
    'export.headerFullName': 'Tam Ad',
    'export.headerOldUsername': 'Eski Kullanıcı Adı',
    'export.headerNewUsername': 'Yeni Kullanıcı Adı',

    'compare.button': '⇄ Aç / Karşılaştır (JSON/CSV)',
    'compare.sectionTitle': 'Karşılaştırma',
    'compare.changeFile': 'Başka Dosya Seç',
    'compare.swap': '⇄ Ters Çevir',
    'compare.twoFileLabel': '{old} → {current}',
    'compare.fileLoaded': 'Dosya görüntülendi: {name}. Karşılaştırmak için 2 dosya birden seçebilir veya profili senkronize edebilirsin.',
    'compare.maxTwoFiles': 'En fazla 2 dosya seçebilirsiniz (eski ve yeni).',
    'compare.clear': 'Kapat',
    'compare.export': '↓ Farkı İndir',
    'compare.snapshotLabel': 'Önceki: {name}',
    'compare.snapshotWithDate': 'Önceki: {name} ({date})',
    'compare.deltaFollowers': 'Takipçi: {old} → {current} ({delta})',
    'compare.deltaFollowing': 'Takip: {old} → {current} ({delta})',
    'compare.newFollowers': 'Yeni Takipçiler',
    'compare.lostFollowers': 'Takibi Bırakanlar',
    'compare.newFollowing': 'Yeni Takip Edilenler',
    'compare.unfollowed': 'Takipten Çıkılanlar',
    'compare.renamed': 'Kullanıcı Adı Değişenler',
    'compare.noChanges': 'Bu kategoride değişiklik yok.',
    'compare.mismatchWarning': 'Uyarı: Seçilen dosya @{snapshotUser} profiline ait, şu an @{currentUser} ile karşılaştırılıyor.',
    'compare.needCurrentData': 'Karşılaştırma yapmak için önce bu profili senkronize edin.',
    'compare.invalidFile': 'Geçersiz dosya. Lütfen bu eklentiden dışa aktarılmış bir JSON veya CSV dosyası seçin.',
    'compare.missingLists': 'Bu dosyada takipçi veya takip edilen listesi bulunamadı. Lütfen "Tümünü İndir" (JSON/CSV) veya tekil takipçi/takip edilen CSV dosyasını kullanın.',
    'compare.readError': 'Dosya okunamadı. Lütfen tekrar deneyin.',
    'compare.badgeNotFollowing': 'Takip etmiyorsun',
    'compare.renamedFrom': 'Eski: @{username}',

    'history.label': 'Geçmiş',
    'history.compare': '⇄ Karşılaştır',
    'history.deleteTitle': 'Seçili geçmiş kaydını sil',
    'history.confirmDelete': '{timestamp} tarihli yerel geçmiş kaydını silmek istediğine emin misin?',
    'history.optionLabel': '{timestamp} · {followers} takipçi / {following} takip',
    'history.latestTag': ' (son)',
    'history.sourceName': 'Yerel geçmiş'
  },

  en: {
    'app.title': 'IG Relations Analyzer',
    'app.titleWithUser': 'Relations: @{username}',

    'tab.analysis': 'Profile Analysis',
    'tab.compare': 'Compare',
    'tab.viewer': 'File Viewer',

    'viewer.openFile': '📁 Open File (JSON / CSV / HTML)',
    'viewer.empty': 'Select any exported JSON, CSV, or HTML report file to inspect and search its lists offline.',
    'viewer.loadedInfo': 'File: {name}',
    'compare.emptyPrompt': 'Pick a snapshot from History above, or select 1–2 JSON/CSV/HTML files to compare changes.',
    'compare.pickFiles': '📁 Select 1 or 2 Files (JSON/CSV/HTML)',

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
    'filter.iNotFollowingBack': 'Not Followed Back',

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
    'status.resolvingProfile': 'Loading profile info for @{username}...',
    'status.profileResolveFailed': 'Could not load profile info for @{username}. Please refresh the page and try again.',
    'status.fetching': 'Fetching {label}...',
    'status.fetchProgress': 'Fetching {label}... {count} / {total} ({percent}%) — about {eta} left',
    'status.fetchProgressNoTotal': 'Fetching {label}... {count} loaded.',
    'status.fetchDone': '{label}: {count} loaded.',
    'status.comparing': 'Comparing lists...',
    'status.saving': 'Saving results...',
    'status.rendering': 'Preparing list ({count} users)...',
    'status.partialWarning': 'Warning: Instagram API returned partial/duplicate pages ({details}). Some relations may be incomplete.',

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

    'export.formatHtml': 'HTML (Interactive Report)',
    'export.headerId': 'Instagram ID',
    'export.headerUsername': 'Username',
    'export.headerFullName': 'Full Name',
    'export.headerOldUsername': 'Old Username',
    'export.headerNewUsername': 'New Username',

    'compare.button': '⇄ Open / Compare (JSON/CSV)',
    'compare.sectionTitle': 'Comparison',
    'compare.changeFile': 'Load Another File',
    'compare.swap': '⇄ Swap',
    'compare.twoFileLabel': '{old} → {current}',
    'compare.fileLoaded': 'Viewing file: {name}. Select 2 files at once or sync a profile to compare.',
    'compare.maxTwoFiles': 'Please select at most 2 files (old and new).',
    'compare.clear': 'Close',
    'compare.export': '↓ Export Diff',
    'compare.snapshotLabel': 'Previous: {name}',
    'compare.snapshotWithDate': 'Previous: {name} ({date})',
    'compare.deltaFollowers': 'Followers: {old} → {current} ({delta})',
    'compare.deltaFollowing': 'Following: {old} → {current} ({delta})',
    'compare.newFollowers': 'New Followers',
    'compare.lostFollowers': 'Lost Followers',
    'compare.newFollowing': 'New Following',
    'compare.unfollowed': 'Unfollowed',
    'compare.renamed': 'Username Changed',
    'compare.noChanges': 'No changes in this category.',
    'compare.mismatchWarning': 'Warning: Selected file belongs to @{snapshotUser}, currently comparing against @{currentUser}.',
    'compare.needCurrentData': 'Please sync this profile first before comparing.',
    'compare.invalidFile': 'Invalid file. Please select a JSON or CSV file exported from this extension.',
    'compare.missingLists': 'No followers or following lists found in this file. Please use a "Download All" (JSON/CSV) or single followers/following CSV export.',
    'compare.readError': 'Could not read the file. Please try again.',
    'compare.badgeNotFollowing': 'Not following',
    'compare.renamedFrom': 'Was: @{username}',

    'history.label': 'History',
    'history.compare': '⇄ Compare',
    'history.deleteTitle': 'Delete selected history snapshot',
    'history.confirmDelete': 'Are you sure you want to delete the local snapshot from {timestamp}?',
    'history.optionLabel': '{timestamp} · {followers} followers / {following} following',
    'history.latestTag': ' (latest)',
    'history.sourceName': 'Local history'
  },

  es: {
    'app.title': 'IG Relations Analyzer',
    'app.titleWithUser': 'Relaciones: @{username}',

    'tab.analysis': 'Análisis',
    'tab.compare': 'Comparar',
    'tab.viewer': 'Visor de Archivos',

    'viewer.openFile': '📁 Abrir Archivo (JSON / CSV / HTML)',
    'viewer.empty': 'Selecciona un archivo JSON, CSV o informe HTML exportado para inspeccionar y buscar en sus listas.',
    'viewer.loadedInfo': 'Archivo: {name}',
    'compare.emptyPrompt': 'Elige un registro del Historial arriba o selecciona 1–2 archivos JSON/CSV/HTML para comparar cambios.',
    'compare.pickFiles': '📁 Elegir 1 o 2 Archivos (JSON/CSV/HTML)',

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
    'filter.iNotFollowingBack': 'No Seguidos de Vuelta',

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
    'status.resolvingProfile': 'Cargando perfil de @{username}...',
    'status.profileResolveFailed': 'No se pudo obtener la información de @{username}. Actualiza la página e inténtalo de nuevo.',
    'status.fetching': 'Obteniendo {label}...',
    'status.fetchProgress': 'Obteniendo {label}... {count} / {total} ({percent}%) — quedan aprox. {eta}',
    'status.fetchProgressNoTotal': 'Obteniendo {label}... {count} cargados.',
    'status.fetchDone': '{label}: {count} cargados.',
    'status.comparing': 'Comparando listas...',
    'status.saving': 'Guardando resultados...',
    'status.rendering': 'Preparando lista ({count} usuarios)...',
    'status.partialWarning': 'Aviso: La API de Instagram devolvió páginas incompletas o duplicadas ({details}). Algunas relaciones pueden estar incompletas.',

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

    'export.formatHtml': 'HTML (Informe Interactivo)',
    'export.headerId': 'ID de Instagram',
    'export.headerUsername': 'Usuario',
    'export.headerFullName': 'Nombre Completo',
    'export.headerOldUsername': 'Usuario Anterior',
    'export.headerNewUsername': 'Usuario Nuevo',

    'compare.button': '⇄ Abrir / Comparar (JSON/CSV)',
    'compare.sectionTitle': 'Comparación',
    'compare.changeFile': 'Cargar otro archivo',
    'compare.swap': '⇄ Invertir',
    'compare.twoFileLabel': '{old} → {current}',
    'compare.fileLoaded': 'Viendo archivo: {name}. Selecciona 2 archivos a la vez o sincroniza un perfil para comparar.',
    'compare.maxTwoFiles': 'Selecciona como máximo 2 archivos (anterior y nuevo).',
    'compare.clear': 'Cerrar',
    'compare.export': '↓ Exportar cambios',
    'compare.snapshotLabel': 'Anterior: {name}',
    'compare.snapshotWithDate': 'Anterior: {name} ({date})',
    'compare.deltaFollowers': 'Seguidores: {old} → {current} ({delta})',
    'compare.deltaFollowing': 'Siguiendo: {old} → {current} ({delta})',
    'compare.newFollowers': 'Nuevos Seguidores',
    'compare.lostFollowers': 'Dejaron de Seguirte',
    'compare.newFollowing': 'Nuevos Seguidos',
    'compare.unfollowed': 'Dejaste de Seguir',
    'compare.renamed': 'Cambio de Usuario',
    'compare.noChanges': 'Sin cambios en esta categoría.',
    'compare.mismatchWarning': 'Aviso: El archivo seleccionado pertenece a @{snapshotUser}, comparando con @{currentUser}.',
    'compare.needCurrentData': 'Sincroniza este perfil primero antes de comparar.',
    'compare.invalidFile': 'Archivo no válido. Selecciona un archivo JSON o CSV exportado por esta extensión.',
    'compare.missingLists': 'No se encontraron listas de seguidores o seguidos en este archivo. Usa una exportación "Descargar Todo" (JSON/CSV) o un CSV de seguidores/seguidos.',
    'compare.readError': 'No se pudo leer el archivo. Inténtalo de nuevo.',
    'compare.badgeNotFollowing': 'No sigues',
    'compare.renamedFrom': 'Antes: @{username}',

    'history.label': 'Historial',
    'history.compare': '⇄ Comparar',
    'history.deleteTitle': 'Eliminar registro seleccionado',
    'history.confirmDelete': '¿Seguro que quieres eliminar el registro local de {timestamp}?',
    'history.optionLabel': '{timestamp} · {followers} seg. / {following} sig.',
    'history.latestTag': ' (último)',
    'history.sourceName': 'Historial local'
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
