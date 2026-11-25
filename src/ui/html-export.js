// Tek dosyalık, çevrimdışı çalışabilen interaktif HTML rapor üretici.
// Harici CDN / kütüphane bağımlılığı yoktur; üretilen HTML içinde standart
// JSON anlık görüntüsü de gömülüdür (eklentiye geri yüklenebilir).

const REPORT_STRINGS = {
  tr: {
    reportTitle: 'Instagram İlişki Raporu',
    compareTitle: 'Instagram Karşılaştırma Raporu',
    exportedAt: 'Dışa Aktarım',
    openProfile: 'Profili Aç',
    themeToggle: 'Tema Değiştir',
    following: 'Takip Edilen',
    followers: 'Takipçi',
    mutual: 'Karşılıklı',
    notFollowingBack: 'Geri Takip Etmeyen',
    iNotFollowingBack: 'Takip Etmediği',
    allUnique: 'Tümü (Tekil)',
    insightsTitle: 'İlişki Dağılımı & Özet',
    uniqueAccounts: 'Tekil Hesap',
    reciprocityRate: 'Karşılıklılık Oranı',
    followerRatio: 'Takipçi / Takip Oranı',
    triageProgress: 'İnceleme İlerlemesi',
    directoryTitle: 'Hesap Rehberi',
    searchPlaceholder: 'Kullanıcı adı veya isim ara...',
    sortDefault: 'Varsayılan Sıra',
    sortUserAsc: 'Kullanıcı Adı (A → Z)',
    sortUserDesc: 'Kullanıcı Adı (Z → A)',
    sortNameAsc: 'İsim (A → Z)',
    hideReviewed: 'İncelenenleri Gizle',
    resetReviewed: 'İşaretleri Sıfırla',
    resetConfirm: 'Tüm incelendi işaretleri sıfırlansın mı?',
    copyUsernames: 'Kullanıcı Adlarını Kopyala',
    copied: 'Kopyalandı!',
    viewGrid: 'Kart',
    viewTable: 'Tablo',
    openOnIg: "Instagram'da Aç",
    markReviewed: 'İncelendi',
    reviewed: 'İncelendi ✓',
    noResults: 'Eşleşen hesap bulunamadı.',
    loadMore: 'Daha Fazla Göster ({remaining} kaldı)',
    showingCount: '{shown} / {total} hesap gösteriliyor',
    badgeMutual: 'Karşılıklı',
    badgeNotBack: 'Geri Takip Etmiyor',
    badgeINotBack: '{target} Takip Etmiyor',
    badgeFollowing: 'Takip Edilen',
    badgeFollowers: 'Takipçi',
    partialWarning: 'Uyarı: Instagram API bu profilde bazı kayıtları eksik/tekrarlı döndürdü ({details}). Bazı ilişkiler kısmi görünebilir.',
    colAccount: 'Hesap',
    colStatus: 'Durum',
    colActions: 'İşlemler',
    footerNote: 'IG Relations Analyzer ile yerel olarak oluşturuldu · Çevrimdışı çalışır · Eklentiye geri yüklenebilir',
    compareSummaryTitle: 'Değişim Özeti',
    newFollowers: 'Yeni Takipçiler',
    lostFollowers: 'Takibi Bırakanlar',
    newFollowing: 'Yeni Takip Edilenler',
    unfollowed: 'Takipten Çıkılanlar',
    renamed: 'Kullanıcı Adı Değişenler',
    totalChanges: 'Toplam Değişim',
    wasUsername: 'Eski: @{username}',
    followersDelta: 'Takipçi',
    followingDelta: 'Takip'
  },
  en: {
    reportTitle: 'Instagram Relations Report',
    compareTitle: 'Instagram Comparison Report',
    exportedAt: 'Exported',
    openProfile: 'Open Profile',
    themeToggle: 'Toggle Theme',
    following: 'Following',
    followers: 'Followers',
    mutual: 'Mutual',
    notFollowingBack: 'Not Following Back',
    iNotFollowingBack: 'Not Followed Back',
    allUnique: 'All Unique',
    insightsTitle: 'Relationship Breakdown & Insights',
    uniqueAccounts: 'Unique Accounts',
    reciprocityRate: 'Reciprocity Rate',
    followerRatio: 'Follower / Following Ratio',
    triageProgress: 'Review Progress',
    directoryTitle: 'Account Directory',
    searchPlaceholder: 'Search username or full name...',
    sortDefault: 'Default Order',
    sortUserAsc: 'Username (A → Z)',
    sortUserDesc: 'Username (Z → A)',
    sortNameAsc: 'Full Name (A → Z)',
    hideReviewed: 'Hide Reviewed',
    resetReviewed: 'Reset Checks',
    resetConfirm: 'Reset all reviewed checkmarks?',
    copyUsernames: 'Copy Usernames',
    copied: 'Copied!',
    viewGrid: 'Cards',
    viewTable: 'Table',
    openOnIg: 'Open on Instagram',
    markReviewed: 'Mark Done',
    reviewed: 'Done ✓',
    noResults: 'No matching accounts found.',
    loadMore: 'Load More ({remaining} left)',
    showingCount: 'Showing {shown} of {total} accounts',
    badgeMutual: 'Mutual',
    badgeNotBack: 'Not Following Back',
    badgeINotBack: "{target} Doesn't Follow",
    badgeFollowing: 'Following',
    badgeFollowers: 'Follower',
    partialWarning: 'Warning: Instagram API returned partial/duplicate pages ({details}). Some relations may be incomplete.',
    colAccount: 'Account',
    colStatus: 'Relation',
    colActions: 'Actions',
    footerNote: 'Generated locally by IG Relations Analyzer · Works 100% offline · Re-importable into extension',
    compareSummaryTitle: 'Changes Breakdown',
    newFollowers: 'New Followers',
    lostFollowers: 'Lost Followers',
    newFollowing: 'New Following',
    unfollowed: 'Unfollowed',
    renamed: 'Username Changed',
    totalChanges: 'Total Changes',
    wasUsername: 'Was: @{username}',
    followersDelta: 'Followers',
    followingDelta: 'Following'
  },
  es: {
    reportTitle: 'Informe de Relaciones de Instagram',
    compareTitle: 'Informe de Comparación de Instagram',
    exportedAt: 'Exportado',
    openProfile: 'Abrir Perfil',
    themeToggle: 'Cambiar Tema',
    following: 'Siguiendo',
    followers: 'Seguidores',
    mutual: 'Mutuos',
    notFollowingBack: 'No Te Siguen',
    iNotFollowingBack: 'No Seguidos de Vuelta',
    allUnique: 'Todos (Únicos)',
    insightsTitle: 'Distribución y Resumen',
    uniqueAccounts: 'Cuentas Únicas',
    reciprocityRate: 'Tasa de Reciprocidad',
    followerRatio: 'Ratio Seguidores / Siguiendo',
    triageProgress: 'Progreso de Revisión',
    directoryTitle: 'Directorio de Cuentas',
    searchPlaceholder: 'Buscar usuario o nombre...',
    sortDefault: 'Orden predeterminado',
    sortUserAsc: 'Usuario (A → Z)',
    sortUserDesc: 'Usuario (Z → A)',
    sortNameAsc: 'Nombre (A → Z)',
    hideReviewed: 'Ocultar Revisados',
    resetReviewed: 'Reiniciar Marcas',
    resetConfirm: '¿Reiniciar todas las marcas de revisión?',
    copyUsernames: 'Copiar Usuarios',
    copied: '¡Copiado!',
    viewGrid: 'Tarjetas',
    viewTable: 'Tabla',
    openOnIg: 'Abrir en Instagram',
    markReviewed: 'Marcar',
    reviewed: 'Revisado ✓',
    noResults: 'No se encontraron cuentas.',
    loadMore: 'Cargar más ({remaining} restantes)',
    showingCount: 'Mostrando {shown} de {total} cuentas',
    badgeMutual: 'Mutuo',
    badgeNotBack: 'No Te Sigue',
    badgeINotBack: '{target} No Sigue',
    badgeFollowing: 'Siguiendo',
    badgeFollowers: 'Seguidor',
    partialWarning: 'Aviso: La API de Instagram devolvió páginas incompletas o duplicadas ({details}). Algunas relaciones pueden estar incompletas.',
    colAccount: 'Cuenta',
    colStatus: 'Relación',
    colActions: 'Acciones',
    footerNote: 'Generado localmente con IG Relations Analyzer · 100% sin conexión · Reimportable en la extensión',
    compareSummaryTitle: 'Resumen de Cambios',
    newFollowers: 'Nuevos Seguidores',
    lostFollowers: 'Dejaron de Seguirte',
    newFollowing: 'Nuevos Seguidos',
    unfollowed: 'Dejaste de Seguir',
    renamed: 'Cambio de Usuario',
    totalChanges: 'Cambios Totales',
    wasUsername: 'Antes: @{username}',
    followersDelta: 'Seguidores',
    followingDelta: 'Siguiendo'
  }
};

function getReportStrings(lang) {
  return REPORT_STRINGS[lang] || REPORT_STRINGS.en;
}

function escapeHtmlText(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// JSON'u <script type="application/json"> içine güvenli gömmek için
function safeJsonForScript(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function getSharedStyles() {
  return `
    :root {
      --bg: #0b0e14;
      --bg-elevated: #121722;
      --bg-card: #161c2a;
      --bg-card-hover: #1b2234;
      --border: rgba(255, 255, 255, 0.08);
      --border-strong: rgba(255, 255, 255, 0.16);
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --accent: #e1306c;
      --accent-grad: linear-gradient(135deg, #f58529 0%, #dd2a7b 50%, #8134af 100%);
      --mutual: #10b981;
      --mutual-bg: rgba(16, 185, 129, 0.14);
      --notback: #f43f5e;
      --notback-bg: rgba(244, 63, 94, 0.14);
      --inotback: #f59e0b;
      --inotback-bg: rgba(245, 158, 11, 0.14);
      --info: #38bdf8;
      --info-bg: rgba(56, 189, 248, 0.14);
      --purple: #a855f7;
      --purple-bg: rgba(168, 85, 247, 0.14);
      --radius: 14px;
      --shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
    }

    [data-theme="light"] {
      --bg: #f8fafc;
      --bg-elevated: #ffffff;
      --bg-card: #ffffff;
      --bg-card-hover: #f1f5f9;
      --border: rgba(15, 23, 42, 0.09);
      --border-strong: rgba(15, 23, 42, 0.18);
      --text: #0f172a;
      --text-muted: #475569;
      --text-dim: #94a3b8;
      --mutual-bg: rgba(16, 185, 129, 0.12);
      --notback-bg: rgba(244, 63, 94, 0.11);
      --inotback-bg: rgba(245, 158, 11, 0.13);
      --info-bg: rgba(56, 189, 248, 0.13);
      --purple-bg: rgba(168, 85, 247, 0.12);
      --shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1220px;
      margin: 0 auto;
      padding: 24px 20px 56px;
    }

    /* HEADER */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding: 18px 22px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      margin-bottom: 18px;
    }

    .profile-head {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }

    .profile-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--accent-grad);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
      color: #fff;
      flex-shrink: 0;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(221, 42, 123, 0.35);
    }

    .profile-meta h1 {
      font-size: 19px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .id-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;
      background: var(--info-bg);
      color: var(--info);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    .submeta {
      font-size: 12.5px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid var(--border-strong);
      background: var(--bg-card);
      color: var(--text);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.12s ease, background 0.15s ease, border-color 0.15s ease;
      white-space: nowrap;
    }

    .btn:hover { background: var(--bg-card-hover); transform: translateY(-1px); }
    .btn:active { transform: translateY(0); }

    .btn-gradient {
      background: var(--accent-grad);
      border-color: transparent;
      color: #fff;
    }
    .btn-gradient:hover { opacity: 0.92; background: var(--accent-grad); }

    /* KPI GRID */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }

    .kpi-card {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 18px;
      cursor: pointer;
      text-align: left;
      color: inherit;
      transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease;
      position: relative;
      overflow: hidden;
    }

    .kpi-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
    .kpi-card.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }

    .kpi-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .kpi-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }

    .kpi-sub {
      font-size: 12px;
      color: var(--text-dim);
      margin-top: 4px;
    }

    /* INSIGHTS PANEL */
    .insights-panel {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
      align-items: center;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 22px 24px;
      margin-bottom: 20px;
      box-shadow: var(--shadow);
    }

    .donut-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .donut-box {
      position: relative;
      width: 196px;
      height: 196px;
    }

    .donut-box svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .donut-seg {
      fill: none;
      stroke-width: 24;
      cursor: pointer;
      transition: stroke-width 0.15s ease, opacity 0.15s ease;
    }

    .donut-seg:hover { stroke-width: 28; opacity: 0.92; }

    .donut-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      text-align: center;
    }

    .donut-total {
      font-size: 28px;
      font-weight: 800;
      line-height: 1.1;
    }

    .donut-caption {
      font-size: 11.5px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .insights-right {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .insights-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
    }

    .legend-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .legend-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 600;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text);
      cursor: pointer;
      transition: border-color 0.15s ease, transform 0.12s ease;
    }

    .legend-pill:hover { border-color: var(--border-strong); transform: translateY(-1px); }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 12px;
    }

    .metric-box {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
    }

    .metric-label {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .metric-val {
      font-size: 20px;
      font-weight: 700;
    }

    .progress-track {
      height: 7px;
      border-radius: 999px;
      background: var(--border);
      overflow: hidden;
      margin-top: 8px;
    }

    .progress-fill {
      height: 100%;
      border-radius: 999px;
      background: var(--accent-grad);
      transition: width 0.25s ease;
    }

    .stacked-bar {
      display: flex;
      height: 14px;
      border-radius: 999px;
      overflow: hidden;
      background: var(--border);
      gap: 2px;
    }

    .stacked-seg {
      height: 100%;
      cursor: pointer;
      transition: opacity 0.15s ease;
    }
    .stacked-seg:hover { opacity: 0.85; }

    /* DIRECTORY SECTION */
    .directory-panel {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      box-shadow: var(--shadow);
    }

    .dir-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .dir-header h2 {
      font-size: 16px;
      font-weight: 700;
    }

    .dir-count {
      font-size: 12.5px;
      color: var(--text-muted);
    }

    .tabs-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 13px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .tab-btn:hover { color: var(--text); border-color: var(--border-strong); }
    .tab-btn.active {
      background: var(--accent-grad);
      border-color: transparent;
      color: #fff;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .search-input {
      flex: 1 1 240px;
      padding: 9px 14px;
      border-radius: 10px;
      border: 1px solid var(--border-strong);
      background: var(--bg-card);
      color: var(--text);
      font-size: 13.5px;
      outline: none;
    }

    .search-input:focus { border-color: var(--accent); }

    .select-input {
      padding: 9px 12px;
      border-radius: 10px;
      border: 1px solid var(--border-strong);
      background: var(--bg-card);
      color: var(--text);
      font-size: 13px;
      cursor: pointer;
    }

    .check-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-muted);
      cursor: pointer;
      padding: 7px 11px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      user-select: none;
    }

    .view-switch {
      display: inline-flex;
      border: 1px solid var(--border-strong);
      border-radius: 10px;
      overflow: hidden;
    }

    .view-btn {
      padding: 8px 12px;
      border: none;
      background: var(--bg-card);
      color: var(--text-muted);
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
    }

    .view-btn.active {
      background: var(--accent);
      color: #fff;
    }

    /* CARDS GRID */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 12px;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 14px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--bg-card);
      transition: border-color 0.15s ease, opacity 0.15s ease, transform 0.12s ease;
    }

    .user-card:hover { border-color: var(--border-strong); transform: translateY(-1px); }
    .user-card.is-reviewed { opacity: 0.52; }

    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      color: #fff;
      flex-shrink: 0;
      letter-spacing: 0.4px;
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 14px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-handle {
      font-size: 12.5px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 5px;
    }

    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;
    }

    .badge-mutual { background: var(--mutual-bg); color: var(--mutual); }
    .badge-notback { background: var(--notback-bg); color: var(--notback); }
    .badge-inotback { background: var(--inotback-bg); color: var(--inotback); }
    .badge-info { background: var(--info-bg); color: var(--info); }
    .badge-purple { background: var(--purple-bg); color: var(--purple); }

    .card-actions {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex-shrink: 0;
    }

    .icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 5px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-strong);
      background: transparent;
      color: var(--text);
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      transition: background 0.15s ease, border-color 0.15s ease;
    }

    .icon-btn:hover { background: var(--bg-card-hover); }
    .icon-btn.done {
      background: var(--mutual-bg);
      border-color: var(--mutual);
      color: var(--mutual);
    }

    /* TABLE VIEW */
    .table-wrap {
      width: 100%;
      overflow-x: auto;
    }

    table.user-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }

    table.user-table th {
      text-align: left;
      padding: 10px 12px;
      font-size: 12px;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-strong);
      font-weight: 600;
    }

    table.user-table td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    table.user-table tr:hover td { background: var(--bg-card-hover); }
    table.user-table tr.is-reviewed td { opacity: 0.5; }

    .tbl-user {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .tbl-user .avatar { width: 32px; height: 32px; border-radius: 8px; font-size: 12px; }

    .tbl-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .empty-state {
      text-align: center;
      padding: 42px 16px;
      color: var(--text-muted);
      font-size: 14px;
    }

    .load-more-wrap {
      display: flex;
      justify-content: center;
      margin-top: 18px;
    }

    .footer {
      text-align: center;
      margin-top: 28px;
      font-size: 12px;
      color: var(--text-dim);
    }

    .hidden { display: none !important; }

    .partial-warning {
      margin-bottom: 16px;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid rgba(245, 158, 11, 0.4);
      background: var(--inotback-bg);
      color: var(--inotback);
      font-size: 13px;
      font-weight: 600;
    }

    @media (max-width: 780px) {
      .insights-panel { grid-template-columns: 1fr; }
      .cards-grid { grid-template-columns: 1fr; }
    }
  `;
}

/**
 * Profil Analizi veya Dosya Görüntüleyici için tek dosyalık interaktif HTML raporu üretir.
 */
export function buildProfileHtmlReport({
  targetUsername = '',
  targetId = '',
  exportedAt = '',
  followers = [],
  following = [],
  notFollowingBack = [],
  iNotFollowingBack = [],
  fetchMeta = null,
  singleListKey = null,
  singleListLabel = '',
  lang = 'en'
}) {
  const S = getReportStrings(lang);
  const displayUser = targetUsername ? `@${targetUsername}` : 'Instagram Profile';
  const pageTitle = singleListLabel
    ? `${displayUser} — ${singleListLabel}`
    : `${displayUser} — ${S.reportTitle}`;

  // Eksik/tekrarlı Instagram API yanıtı varsa raporda uyarı göster
  let partialWarningText = '';
  if (fetchMeta && !singleListKey) {
    const issues = [];
    const check = (meta, label) => {
      if (!meta) return;
      const missing = meta.expectedTotal && meta.uniqueCount < meta.expectedTotal - 2;
      const dupes = meta.duplicateCount > 0 && meta.expectedTotal && meta.uniqueCount < meta.expectedTotal;
      if (missing || dupes) issues.push(`${label}: ${meta.uniqueCount}/${meta.expectedTotal}`);
    };
    check(fetchMeta.following, S.following);
    check(fetchMeta.followers, S.followers);
    if (issues.length > 0) {
      partialWarningText = S.partialWarning.replace('{details}', issues.join(', '));
    }
  }

  // Gömülü standart JSON anlık görüntüsü (eklentiye geri yüklenebilir)
  const embeddedSnapshot = {
    target_username: targetUsername,
    target_id: targetId,
    exported_at: exportedAt,
    summary: {
      following_count: following.length,
      followers_count: followers.length,
      not_following_back_count: notFollowingBack.length,
      i_not_following_back_count: iNotFollowingBack.length
    },
    details: {
      followers,
      following,
      notFollowingBack,
      iNotFollowingBack
    }
  };

  const payload = {
    mode: 'profile',
    lang,
    singleListKey,
    singleListLabel,
    strings: S,
    meta: { targetUsername, targetId, exportedAt }
  };

  return `<!DOCTYPE html>
<html lang="${escapeHtmlText(lang)}" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtmlText(pageTitle)}</title>
  <style>${getSharedStyles()}</style>
</head>
<body>
  <div class="container">
    <header class="topbar">
      <div class="profile-head">
        <div class="profile-avatar" id="header-avatar">IG</div>
        <div class="profile-meta">
          <h1>
            <span id="header-username">${escapeHtmlText(displayUser)}</span>
            ${targetId ? `<span class="id-pill">ID: ${escapeHtmlText(targetId)}</span>` : ''}
          </h1>
          <div class="submeta">${escapeHtmlText(S.exportedAt)}: ${escapeHtmlText(exportedAt)}${singleListLabel ? ` · ${escapeHtmlText(singleListLabel)}` : ''}</div>
        </div>
      </div>
      <div class="topbar-actions">
        <button type="button" class="btn" id="btn-theme">☀ ${escapeHtmlText(S.themeToggle)}</button>
        ${targetUsername ? `<a class="btn btn-gradient" href="https://www.instagram.com/${encodeURIComponent(targetUsername)}/" target="_blank" rel="noopener noreferrer">${escapeHtmlText(S.openProfile)} ↗</a>` : ''}
      </div>
    </header>

    ${partialWarningText ? `<div class="partial-warning">⚠ ${escapeHtmlText(partialWarningText)}</div>` : ''}

    <section class="kpi-grid" id="kpi-grid"></section>

    <section class="insights-panel" id="insights-panel">
      <div class="donut-wrap">
        <div class="donut-box">
          <svg viewBox="0 0 180 180" id="donut-svg"></svg>
          <div class="donut-center">
            <div class="donut-total" id="donut-total">0</div>
            <div class="donut-caption">${escapeHtmlText(S.uniqueAccounts)}</div>
          </div>
        </div>
      </div>
      <div class="insights-right">
        <div class="insights-title">${escapeHtmlText(S.insightsTitle)}</div>
        <div class="legend-row" id="legend-row"></div>
        <div class="metrics-grid" id="metrics-grid"></div>
      </div>
    </section>

    <section class="directory-panel">
      <div class="dir-header">
        <h2>${escapeHtmlText(S.directoryTitle)}</h2>
        <span class="dir-count" id="dir-count"></span>
      </div>

      <div class="tabs-bar" id="tabs-bar"></div>

      <div class="toolbar">
        <input type="search" class="search-input" id="search-input" placeholder="${escapeHtmlText(S.searchPlaceholder)}" />
        <select class="select-input" id="sort-select">
          <option value="default">${escapeHtmlText(S.sortDefault)}</option>
          <option value="user-asc">${escapeHtmlText(S.sortUserAsc)}</option>
          <option value="user-desc">${escapeHtmlText(S.sortUserDesc)}</option>
          <option value="name-asc">${escapeHtmlText(S.sortNameAsc)}</option>
        </select>
        <label class="check-toggle">
          <input type="checkbox" id="hide-reviewed" />
          <span>${escapeHtmlText(S.hideReviewed)}</span>
        </label>
        <button type="button" class="btn" id="btn-copy">${escapeHtmlText(S.copyUsernames)}</button>
        <button type="button" class="btn" id="btn-reset">${escapeHtmlText(S.resetReviewed)}</button>
        <div class="view-switch">
          <button type="button" class="view-btn active" data-view="grid">${escapeHtmlText(S.viewGrid)}</button>
          <button type="button" class="view-btn" data-view="table">${escapeHtmlText(S.viewTable)}</button>
        </div>
      </div>

      <div id="list-container"></div>
      <div class="load-more-wrap hidden" id="load-more-wrap">
        <button type="button" class="btn" id="btn-load-more"></button>
      </div>
    </section>

    <footer class="footer">${escapeHtmlText(S.footerNote)}</footer>
  </div>

  <script id="ig-relations-data" type="application/json">${safeJsonForScript(embeddedSnapshot)}</script>
  <script id="ig-report-config" type="application/json">${safeJsonForScript(payload)}</script>
  <script>
    (function () {
      const snapshot = JSON.parse(document.getElementById('ig-relations-data').textContent);
      const cfg = JSON.parse(document.getElementById('ig-report-config').textContent);
      const S = cfg.strings;
      const details = snapshot.details || {};
      const followers = details.followers || [];
      const following = details.following || [];
      const notFollowingBack = details.notFollowingBack || [];
      const iNotFollowingBack = details.iNotFollowingBack || [];

      const PALETTE = ['#e1306c', '#8134af', '#f58529', '#10b981', '#3b82f6', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b'];
      function hashColor(str) {
        let h = 0;
        const s = String(str || 'ig');
        for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
        return PALETTE[Math.abs(h) % PALETTE.length];
      }
      function initials(name, username) {
        const src = (name || username || 'IG').trim();
        const parts = src.split(/\\s+/).filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return src.slice(0, 2).toUpperCase();
      }
      function userKey(u) {
        return u.pk ? 'pk:' + String(u.pk) : 'u:' + String(u.username || '').toLowerCase();
      }

      // Header avatar
      const headerAv = document.getElementById('header-avatar');
      headerAv.textContent = initials(cfg.meta.targetUsername, 'IG');

      // Theme persistence
      const THEME_KEY = 'ig_report_theme';
      function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        try { localStorage.setItem(THEME_KEY, t); } catch {}
      }
      try {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') applyTheme(savedTheme);
      } catch {}
      document.getElementById('btn-theme').addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });

      // Deduplicate & classify (tekrarlı kayıtları temizleyerek tutarlı sayılar üret)
      function dedupeList(arr) {
        const seen = new Set();
        const out = [];
        arr.forEach(u => {
          const k = userKey(u);
          if (!seen.has(k)) {
            seen.add(k);
            out.push(u);
          }
        });
        return out;
      }

      const uniqueFollowers = dedupeList(followers);
      const uniqueFollowing = dedupeList(following);
      const followerKeys = new Set(uniqueFollowers.map(userKey));
      const followingKeys = new Set(uniqueFollowing.map(userKey));
      const uniqueMap = new Map();
      [...uniqueFollowing, ...uniqueFollowers, ...notFollowingBack, ...iNotFollowingBack].forEach(u => {
        const k = userKey(u);
        if (!uniqueMap.has(k)) {
          const isF = followerKeys.has(k);
          const isG = followingKeys.has(k);
          let rel = 'other';
          if (isF && isG) rel = 'mutual';
          else if (isG && !isF) rel = 'notFollowingBack';
          else if (isF && !isG) rel = 'iNotFollowingBack';
          else if (cfg.singleListKey) rel = cfg.singleListKey;
          uniqueMap.set(k, { ...u, _key: k, _rel: rel });
        }
      });

      const allUnique = Array.from(uniqueMap.values());
      const mutual = allUnique.filter(u => u._rel === 'mutual');
      const notBackList = cfg.singleListKey === 'notFollowingBack'
        ? allUnique
        : allUnique.filter(u => u._rel === 'notFollowingBack');
      const iNotBackList = cfg.singleListKey === 'iNotFollowingBack'
        ? allUnique
        : allUnique.filter(u => u._rel === 'iNotFollowingBack');

      const datasets = {
        all: allUnique,
        mutual,
        notFollowingBack: notBackList,
        iNotFollowingBack: iNotBackList,
        following: uniqueFollowing.map(u => uniqueMap.get(userKey(u)) || { ...u, _key: userKey(u), _rel: 'following' }),
        followers: uniqueFollowers.map(u => uniqueMap.get(userKey(u)) || { ...u, _key: userKey(u), _rel: 'followers' })
      };

      // Reviewed state (localStorage)
      const STORAGE_KEY = 'ig_report_reviewed_' + (cfg.meta.targetId || cfg.meta.targetUsername || 'default');
      let reviewedSet = new Set();
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) reviewedSet = new Set(JSON.parse(raw));
      } catch {}
      function saveReviewed() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(reviewedSet))); } catch {}
      }

      let activeTab = cfg.singleListKey ? 'all' : (notBackList.length > 0 ? 'notFollowingBack' : 'all');
      let searchTerm = '';
      let sortMode = 'default';
      let hideReviewed = false;
      let viewMode = 'grid';
      let visibleLimit = 120;

      // Single-list mode hides KPI/insights if only one list was exported
      if (cfg.singleListKey) {
        document.getElementById('kpi-grid').classList.add('hidden');
        document.getElementById('insights-panel').classList.add('hidden');
      }

      function renderKpis() {
        if (cfg.singleListKey) return;
        const grid = document.getElementById('kpi-grid');
        const items = [
          { key: 'following', label: S.following, count: datasets.following.length, color: '#38bdf8' },
          { key: 'followers', label: S.followers, count: datasets.followers.length, color: '#a855f7' },
          { key: 'mutual', label: S.mutual, count: mutual.length, color: '#10b981' },
          { key: 'notFollowingBack', label: S.notFollowingBack, count: notBackList.length, color: '#f43f5e' },
          { key: 'iNotFollowingBack', label: S.iNotFollowingBack, count: iNotBackList.length, color: '#f59e0b' }
        ];
        grid.innerHTML = '';
        items.forEach(item => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'kpi-card' + (activeTab === item.key ? ' active' : '');
          btn.innerHTML =
            '<div class="kpi-label"><span>' + escapeHtml(item.label) + '</span><span class="kpi-dot" style="background:' + item.color + '"></span></div>' +
            '<div class="kpi-value" style="color:' + item.color + '">' + item.count.toLocaleString() + '</div>';
          btn.addEventListener('click', () => selectTab(item.key));
          grid.appendChild(btn);
        });
      }

      function renderInsights() {
        if (cfg.singleListKey) return;
        const total = allUnique.length;
        document.getElementById('donut-total').textContent = total.toLocaleString();

        const segments = [
          { key: 'mutual', label: S.mutual, count: mutual.length, color: '#10b981' },
          { key: 'notFollowingBack', label: S.notFollowingBack, count: notBackList.length, color: '#f43f5e' },
          { key: 'iNotFollowingBack', label: S.iNotFollowingBack, count: iNotBackList.length, color: '#f59e0b' }
        ];

        const svg = document.getElementById('donut-svg');
        svg.innerHTML = '';
        const r = 70;
        const c = 2 * Math.PI * r;
        let offset = 0;

        if (total === 0) {
          const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          bg.setAttribute('cx', '90');
          bg.setAttribute('cy', '90');
          bg.setAttribute('r', String(r));
          bg.setAttribute('fill', 'none');
          bg.setAttribute('stroke', 'rgba(148,163,184,0.2)');
          bg.setAttribute('stroke-width', '24');
          svg.appendChild(bg);
        } else {
          segments.forEach(seg => {
            if (seg.count <= 0) return;
            const len = (seg.count / total) * c;
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '90');
            circle.setAttribute('cy', '90');
            circle.setAttribute('r', String(r));
            circle.setAttribute('class', 'donut-seg');
            circle.setAttribute('stroke', seg.color);
            circle.setAttribute('stroke-dasharray', len + ' ' + (c - len));
            circle.setAttribute('stroke-dashoffset', String(-offset));
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = seg.label + ': ' + seg.count + ' (' + Math.round((seg.count / total) * 100) + '%)';
            circle.appendChild(title);
            circle.addEventListener('click', () => selectTab(seg.key));
            svg.appendChild(circle);
            offset += len;
          });
        }

        const legendRow = document.getElementById('legend-row');
        legendRow.innerHTML = '';
        segments.forEach(seg => {
          const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0;
          const pill = document.createElement('button');
          pill.type = 'button';
          pill.className = 'legend-pill';
          pill.innerHTML = '<span class="kpi-dot" style="background:' + seg.color + '"></span>' +
            '<span>' + escapeHtml(seg.label) + ': <strong>' + seg.count.toLocaleString() + '</strong> (' + pct + '%)</span>';
          pill.addEventListener('click', () => selectTab(seg.key));
          legendRow.appendChild(pill);
        });

        renderMetrics();
      }

      function renderMetrics() {
        if (cfg.singleListKey) return;
        const reciprocity = datasets.following.length > 0 ? Math.round((mutual.length / datasets.following.length) * 100) : 0;
        const ratio = datasets.following.length > 0 ? (datasets.followers.length / datasets.following.length).toFixed(2) + 'x' : '—';
        const activeList = datasets[activeTab] || [];
        const reviewedInTab = activeList.filter(u => reviewedSet.has(u._key)).length;
        const reviewPct = activeList.length > 0 ? Math.round((reviewedInTab / activeList.length) * 100) : 0;

        document.getElementById('metrics-grid').innerHTML =
          '<div class="metric-box">' +
            '<div class="metric-label">' + escapeHtml(S.reciprocityRate) + '</div>' +
            '<div class="metric-val">' + reciprocity + '%</div>' +
            '<div class="progress-track"><div class="progress-fill" style="width:' + reciprocity + '%"></div></div>' +
          '</div>' +
          '<div class="metric-box">' +
            '<div class="metric-label">' + escapeHtml(S.followerRatio) + '</div>' +
            '<div class="metric-val">' + escapeHtml(ratio) + '</div>' +
            '<div class="kpi-sub">' + datasets.followers.length.toLocaleString() + ' / ' + datasets.following.length.toLocaleString() + '</div>' +
          '</div>' +
          '<div class="metric-box">' +
            '<div class="metric-label">' + escapeHtml(S.triageProgress) + '</div>' +
            '<div class="metric-val">' + reviewedInTab + ' / ' + activeList.length + '</div>' +
            '<div class="progress-track"><div class="progress-fill" style="width:' + reviewPct + '%"></div></div>' +
          '</div>';
      }

      function renderTabs() {
        const bar = document.getElementById('tabs-bar');
        bar.innerHTML = '';
        if (cfg.singleListKey) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'tab-btn active';
          btn.textContent = (cfg.singleListLabel || S.allUnique) + ' (' + allUnique.length + ')';
          bar.appendChild(btn);
          return;
        }
        const tabs = [
          { key: 'all', label: S.allUnique },
          { key: 'mutual', label: S.mutual },
          { key: 'notFollowingBack', label: S.notFollowingBack },
          { key: 'iNotFollowingBack', label: S.iNotFollowingBack },
          { key: 'following', label: S.following },
          { key: 'followers', label: S.followers }
        ];
        tabs.forEach(t => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'tab-btn' + (activeTab === t.key ? ' active' : '');
          btn.textContent = t.label + ' (' + (datasets[t.key]?.length || 0).toLocaleString() + ')';
          btn.addEventListener('click', () => selectTab(t.key));
          bar.appendChild(btn);
        });
      }

      function selectTab(key) {
        activeTab = key;
        visibleLimit = 120;
        renderKpis();
        renderTabs();
        renderMetrics();
        renderList();
      }

      function escapeHtml(s) {
        return String(s ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }

      function badgeForRel(rel) {
        const targetLabel = cfg.meta.targetUsername ? '@' + cfg.meta.targetUsername : 'Profile';
        if (rel === 'mutual') return { cls: 'badge-mutual', text: S.badgeMutual };
        if (rel === 'notFollowingBack') return { cls: 'badge-notback', text: S.badgeNotBack };
        if (rel === 'iNotFollowingBack') return { cls: 'badge-inotback', text: S.badgeINotBack.replace('{target}', targetLabel) };
        if (rel === 'following') return { cls: 'badge-info', text: S.badgeFollowing };
        if (rel === 'followers') return { cls: 'badge-purple', text: S.badgeFollowers };
        return { cls: 'badge-info', text: cfg.singleListLabel || S.allUnique };
      }

      function getFilteredUsers() {
        const base = datasets[activeTab] || [];
        const q = searchTerm.trim().toLowerCase();
        let list = base.filter(u => {
          if (hideReviewed && reviewedSet.has(u._key)) return false;
          if (!q) return true;
          return (u.username || '').toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q);
        });
        if (sortMode === 'user-asc') list = [...list].sort((a, b) => (a.username || '').localeCompare(b.username || ''));
        else if (sortMode === 'user-desc') list = [...list].sort((a, b) => (b.username || '').localeCompare(a.username || ''));
        else if (sortMode === 'name-asc') list = [...list].sort((a, b) => (a.full_name || a.username || '').localeCompare(b.full_name || b.username || ''));
        return list;
      }

      function toggleReviewed(key) {
        if (reviewedSet.has(key)) reviewedSet.delete(key);
        else reviewedSet.add(key);
        saveReviewed();
        renderMetrics();
        renderList();
      }

      function renderList() {
        const container = document.getElementById('list-container');
        const loadWrap = document.getElementById('load-more-wrap');
        const loadBtn = document.getElementById('btn-load-more');
        const filtered = getFilteredUsers();
        const slice = filtered.slice(0, visibleLimit);

        document.getElementById('dir-count').textContent =
          S.showingCount.replace('{shown}', slice.length.toLocaleString()).replace('{total}', filtered.length.toLocaleString());

        if (filtered.length === 0) {
          container.innerHTML = '<div class="empty-state">' + escapeHtml(S.noResults) + '</div>';
          loadWrap.classList.add('hidden');
          return;
        }

        if (viewMode === 'grid') {
          const grid = document.createElement('div');
          grid.className = 'cards-grid';
          slice.forEach(u => {
            const isRev = reviewedSet.has(u._key);
            const b = badgeForRel(u._rel);
            const card = document.createElement('div');
            card.className = 'user-card' + (isRev ? ' is-reviewed' : '');
            const igUrl = 'https://www.instagram.com/' + encodeURIComponent(u.username || '') + '/';
            card.innerHTML =
              '<div class="avatar" style="background:' + hashColor(u.username || u.pk) + '">' + escapeHtml(initials(u.full_name, u.username)) + '</div>' +
              '<div class="user-info">' +
                '<div class="user-name">' + escapeHtml(u.full_name || u.username || '-') + '</div>' +
                '<div class="user-handle">@' + escapeHtml(u.username || '') + '</div>' +
                '<div class="user-badges"><span class="badge ' + b.cls + '">' + escapeHtml(b.text) + '</span></div>' +
              '</div>' +
              '<div class="card-actions">' +
                '<a class="icon-btn" href="' + igUrl + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(S.openOnIg) + ' ↗</a>' +
                '<button type="button" class="icon-btn' + (isRev ? ' done' : '') + '" data-toggle="' + escapeHtml(u._key) + '">' + escapeHtml(isRev ? S.reviewed : S.markReviewed) + '</button>' +
              '</div>';
            grid.appendChild(card);
          });
          container.innerHTML = '';
          container.appendChild(grid);
        } else {
          const wrap = document.createElement('div');
          wrap.className = 'table-wrap';
          const table = document.createElement('table');
          table.className = 'user-table';
          table.innerHTML = '<thead><tr><th>' + escapeHtml(S.colAccount) + '</th><th>' + escapeHtml(S.colStatus) + '</th><th>' + escapeHtml(S.colActions) + '</th></tr></thead><tbody></tbody>';
          const tbody = table.querySelector('tbody');
          slice.forEach(u => {
            const isRev = reviewedSet.has(u._key);
            const b = badgeForRel(u._rel);
            const tr = document.createElement('tr');
            if (isRev) tr.className = 'is-reviewed';
            const igUrl = 'https://www.instagram.com/' + encodeURIComponent(u.username || '') + '/';
            tr.innerHTML =
              '<td><div class="tbl-user"><div class="avatar" style="background:' + hashColor(u.username || u.pk) + '">' + escapeHtml(initials(u.full_name, u.username)) + '</div><div><div class="user-name">' + escapeHtml(u.full_name || u.username || '-') + '</div><div class="user-handle">@' + escapeHtml(u.username || '') + '</div></div></div></td>' +
              '<td><span class="badge ' + b.cls + '">' + escapeHtml(b.text) + '</span></td>' +
              '<td><div class="tbl-actions"><a class="icon-btn" href="' + igUrl + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(S.openOnIg) + ' ↗</a><button type="button" class="icon-btn' + (isRev ? ' done' : '') + '" data-toggle="' + escapeHtml(u._key) + '">' + escapeHtml(isRev ? S.reviewed : S.markReviewed) + '</button></div></td>';
            tbody.appendChild(tr);
          });
          wrap.appendChild(table);
          container.innerHTML = '';
          container.appendChild(wrap);
        }

        container.querySelectorAll('[data-toggle]').forEach(btn => {
          btn.addEventListener('click', () => toggleReviewed(btn.getAttribute('data-toggle')));
        });

        const remaining = filtered.length - slice.length;
        if (remaining > 0) {
          loadBtn.textContent = S.loadMore.replace('{remaining}', remaining.toLocaleString());
          loadWrap.classList.remove('hidden');
        } else {
          loadWrap.classList.add('hidden');
        }
      }

      document.getElementById('search-input').addEventListener('input', e => {
        searchTerm = e.target.value;
        visibleLimit = 120;
        renderList();
      });
      document.getElementById('sort-select').addEventListener('change', e => {
        sortMode = e.target.value;
        renderList();
      });
      document.getElementById('hide-reviewed').addEventListener('change', e => {
        hideReviewed = e.target.checked;
        renderList();
      });
      document.getElementById('btn-load-more').addEventListener('click', () => {
        visibleLimit += 120;
        renderList();
      });
      document.getElementById('btn-reset').addEventListener('click', () => {
        if (reviewedSet.size === 0) return;
        if (!confirm(S.resetConfirm)) return;
        reviewedSet.clear();
        saveReviewed();
        renderMetrics();
        renderList();
      });
      document.getElementById('btn-copy').addEventListener('click', async () => {
        const list = getFilteredUsers().map(u => '@' + (u.username || '')).filter(s => s.length > 1).join('\\n');
        if (!list) return;
        const btn = document.getElementById('btn-copy');
        try {
          await navigator.clipboard.writeText(list);
          const orig = btn.textContent;
          btn.textContent = S.copied;
          setTimeout(() => { btn.textContent = orig; }, 1500);
        } catch {}
      });
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          viewMode = btn.getAttribute('data-view');
          document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === btn));
          renderList();
        });
      });

      renderKpis();
      renderInsights();
      renderTabs();
      renderList();
    })();
  </script>
</body>
</html>`;
}

/**
 * Karşılaştırma (Diff) sekmesi için tek dosyalık interaktif HTML raporu üretir.
 */
export function buildCompareHtmlReport({
  targetUsername = '',
  targetId = '',
  comparedAt = '',
  comparisonLabel = '',
  compareDiff,
  singleCategoryKey = null,
  lang = 'en'
}) {
  const S = getReportStrings(lang);
  const displayUser = targetUsername ? `@${targetUsername}` : 'Instagram Snapshot';
  const pageTitle = `${displayUser} — ${S.compareTitle}`;

  const payload = {
    mode: 'compare',
    lang,
    singleCategoryKey,
    strings: S,
    meta: { targetUsername, targetId, comparedAt, comparisonLabel },
    diff: {
      counts: compareDiff?.counts || {},
      newFollowers: compareDiff?.newFollowers || [],
      lostFollowers: compareDiff?.lostFollowers || [],
      newFollowing: compareDiff?.newFollowing || [],
      unfollowed: compareDiff?.unfollowed || [],
      renamed: compareDiff?.renamed || []
    }
  };

  return `<!DOCTYPE html>
<html lang="${escapeHtmlText(lang)}" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtmlText(pageTitle)}</title>
  <style>${getSharedStyles()}</style>
</head>
<body>
  <div class="container">
    <header class="topbar">
      <div class="profile-head">
        <div class="profile-avatar" id="header-avatar">⇄</div>
        <div class="profile-meta">
          <h1>
            <span>${escapeHtmlText(displayUser)}</span>
            <span class="id-pill">${escapeHtmlText(S.compareTitle)}</span>
          </h1>
          <div class="submeta">${comparisonLabel ? `${escapeHtmlText(comparisonLabel)} · ` : ''}${escapeHtmlText(S.exportedAt)}: ${escapeHtmlText(comparedAt)}</div>
        </div>
      </div>
      <div class="topbar-actions">
        <button type="button" class="btn" id="btn-theme">☀ ${escapeHtmlText(S.themeToggle)}</button>
        ${targetUsername ? `<a class="btn btn-gradient" href="https://www.instagram.com/${encodeURIComponent(targetUsername)}/" target="_blank" rel="noopener noreferrer">${escapeHtmlText(S.openProfile)} ↗</a>` : ''}
      </div>
    </header>

    <section class="kpi-grid" id="kpi-grid"></section>

    <section class="insights-panel" id="compare-summary" style="grid-template-columns: 1fr;">
      <div class="insights-right">
        <div class="insights-title">${escapeHtmlText(S.compareSummaryTitle)}</div>
        <div class="stacked-bar" id="stacked-bar"></div>
        <div class="metrics-grid" id="delta-metrics"></div>
      </div>
    </section>

    <section class="directory-panel">
      <div class="dir-header">
        <h2>${escapeHtmlText(S.directoryTitle)}</h2>
        <span class="dir-count" id="dir-count"></span>
      </div>

      <div class="tabs-bar" id="tabs-bar"></div>

      <div class="toolbar">
        <input type="search" class="search-input" id="search-input" placeholder="${escapeHtmlText(S.searchPlaceholder)}" />
        <select class="select-input" id="sort-select">
          <option value="default">${escapeHtmlText(S.sortDefault)}</option>
          <option value="user-asc">${escapeHtmlText(S.sortUserAsc)}</option>
          <option value="user-desc">${escapeHtmlText(S.sortUserDesc)}</option>
          <option value="name-asc">${escapeHtmlText(S.sortNameAsc)}</option>
        </select>
        <label class="check-toggle">
          <input type="checkbox" id="hide-reviewed" />
          <span>${escapeHtmlText(S.hideReviewed)}</span>
        </label>
        <button type="button" class="btn" id="btn-copy">${escapeHtmlText(S.copyUsernames)}</button>
        <div class="view-switch">
          <button type="button" class="view-btn active" data-view="grid">${escapeHtmlText(S.viewGrid)}</button>
          <button type="button" class="view-btn" data-view="table">${escapeHtmlText(S.viewTable)}</button>
        </div>
      </div>

      <div id="list-container"></div>
      <div class="load-more-wrap hidden" id="load-more-wrap">
        <button type="button" class="btn" id="btn-load-more"></button>
      </div>
    </section>

    <footer class="footer">${escapeHtmlText(S.footerNote)}</footer>
  </div>

  <script id="ig-compare-report-config" type="application/json">${safeJsonForScript(payload)}</script>
  <script>
    (function () {
      const cfg = JSON.parse(document.getElementById('ig-compare-report-config').textContent);
      const S = cfg.strings;
      const diff = cfg.diff;

      const CATEGORIES = [
        { key: 'lostFollowers', label: S.lostFollowers, color: '#f43f5e', badgeCls: 'badge-notback', prefix: '−' },
        { key: 'newFollowers', label: S.newFollowers, color: '#10b981', badgeCls: 'badge-mutual', prefix: '+' },
        { key: 'newFollowing', label: S.newFollowing, color: '#38bdf8', badgeCls: 'badge-info', prefix: '+' },
        { key: 'unfollowed', label: S.unfollowed, color: '#f59e0b', badgeCls: 'badge-inotback', prefix: '−' },
        { key: 'renamed', label: S.renamed, color: '#a855f7', badgeCls: 'badge-purple', prefix: '↻' }
      ];

      const PALETTE = ['#e1306c', '#8134af', '#f58529', '#10b981', '#3b82f6', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f59e0b'];
      function hashColor(str) {
        let h = 0;
        const s = String(str || 'ig');
        for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
        return PALETTE[Math.abs(h) % PALETTE.length];
      }
      function initials(name, username) {
        const src = (name || username || 'IG').trim();
        const parts = src.split(/\\s+/).filter(Boolean);
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return src.slice(0, 2).toUpperCase();
      }
      function userKey(u) {
        return u.pk ? 'pk:' + String(u.pk) : 'u:' + String(u.username || '').toLowerCase();
      }
      function escapeHtml(s) {
        return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }

      const THEME_KEY = 'ig_report_theme';
      function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        try { localStorage.setItem(THEME_KEY, t); } catch {}
      }
      try {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') applyTheme(savedTheme);
      } catch {}
      document.getElementById('btn-theme').addEventListener('click', () => {
        applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      });

      const STORAGE_KEY = 'ig_compare_reviewed_' + (cfg.meta.targetId || cfg.meta.targetUsername || 'default');
      let reviewedSet = new Set();
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) reviewedSet = new Set(JSON.parse(raw));
      } catch {}
      function saveReviewed() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(reviewedSet))); } catch {}
      }

      const visibleCats = cfg.singleCategoryKey
        ? CATEGORIES.filter(c => c.key === cfg.singleCategoryKey)
        : CATEGORIES;

      let activeTab = cfg.singleCategoryKey
        || (visibleCats.find(c => (diff[c.key] || []).length > 0)?.key || 'lostFollowers');
      let searchTerm = '';
      let sortMode = 'default';
      let hideReviewed = false;
      let viewMode = 'grid';
      let visibleLimit = 120;

      function renderSummary() {
        const grid = document.getElementById('kpi-grid');
        grid.innerHTML = '';
        visibleCats.forEach(cat => {
          const count = (diff[cat.key] || []).length;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'kpi-card' + (activeTab === cat.key ? ' active' : '');
          btn.innerHTML =
            '<div class="kpi-label"><span>' + escapeHtml(cat.label) + '</span><span class="kpi-dot" style="background:' + cat.color + '"></span></div>' +
            '<div class="kpi-value" style="color:' + cat.color + '">' + cat.prefix + count.toLocaleString() + '</div>';
          btn.addEventListener('click', () => selectTab(cat.key));
          grid.appendChild(btn);
        });

        const totalChanges = visibleCats.reduce((sum, c) => sum + (diff[c.key] || []).length, 0);
        const bar = document.getElementById('stacked-bar');
        bar.innerHTML = '';
        if (totalChanges > 0) {
          visibleCats.forEach(cat => {
            const count = (diff[cat.key] || []).length;
            if (!count) return;
            const seg = document.createElement('div');
            seg.className = 'stacked-seg';
            seg.style.width = ((count / totalChanges) * 100) + '%';
            seg.style.background = cat.color;
            seg.title = cat.label + ': ' + count;
            seg.addEventListener('click', () => selectTab(cat.key));
            bar.appendChild(seg);
          });
        }

        const c = diff.counts || {};
        const fmtDelta = n => (n > 0 ? '+' + n : String(n ?? 0));
        document.getElementById('delta-metrics').innerHTML =
          '<div class="metric-box"><div class="metric-label">' + escapeHtml(S.followersDelta) + '</div><div class="metric-val">' +
            (c.previousFollowers ?? 0) + ' → ' + (c.currentFollowers ?? 0) + ' (' + fmtDelta(c.followersDelta) + ')</div></div>' +
          '<div class="metric-box"><div class="metric-label">' + escapeHtml(S.followingDelta) + '</div><div class="metric-val">' +
            (c.previousFollowing ?? 0) + ' → ' + (c.currentFollowing ?? 0) + ' (' + fmtDelta(c.followingDelta) + ')</div></div>' +
          '<div class="metric-box"><div class="metric-label">' + escapeHtml(S.totalChanges) + '</div><div class="metric-val">' +
            totalChanges.toLocaleString() + '</div></div>';
      }

      function renderTabs() {
        const bar = document.getElementById('tabs-bar');
        bar.innerHTML = '';
        visibleCats.forEach(cat => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'tab-btn' + (activeTab === cat.key ? ' active' : '');
          btn.textContent = cat.prefix + ' ' + cat.label + ' (' + (diff[cat.key]?.length || 0).toLocaleString() + ')';
          btn.addEventListener('click', () => selectTab(cat.key));
          bar.appendChild(btn);
        });
      }

      function selectTab(key) {
        activeTab = key;
        visibleLimit = 120;
        renderSummary();
        renderTabs();
        renderList();
      }

      function getFilteredUsers() {
        const base = diff[activeTab] || [];
        const q = searchTerm.trim().toLowerCase();
        let list = base.filter(u => {
          if (hideReviewed && reviewedSet.has(userKey(u))) return false;
          if (!q) return true;
          return (u.username || '').toLowerCase().includes(q)
            || (u.old_username || '').toLowerCase().includes(q)
            || (u.full_name || '').toLowerCase().includes(q);
        });
        if (sortMode === 'user-asc') list = [...list].sort((a, b) => (a.username || '').localeCompare(b.username || ''));
        else if (sortMode === 'user-desc') list = [...list].sort((a, b) => (b.username || '').localeCompare(a.username || ''));
        else if (sortMode === 'name-asc') list = [...list].sort((a, b) => (a.full_name || a.username || '').localeCompare(b.full_name || b.username || ''));
        return list;
      }

      function toggleReviewed(key) {
        if (reviewedSet.has(key)) reviewedSet.delete(key);
        else reviewedSet.add(key);
        saveReviewed();
        renderList();
      }

      function renderList() {
        const container = document.getElementById('list-container');
        const loadWrap = document.getElementById('load-more-wrap');
        const loadBtn = document.getElementById('btn-load-more');
        const cat = CATEGORIES.find(c => c.key === activeTab) || CATEGORIES[0];
        const filtered = getFilteredUsers();
        const slice = filtered.slice(0, visibleLimit);

        document.getElementById('dir-count').textContent =
          S.showingCount.replace('{shown}', slice.length.toLocaleString()).replace('{total}', filtered.length.toLocaleString());

        if (filtered.length === 0) {
          container.innerHTML = '<div class="empty-state">' + escapeHtml(S.noResults) + '</div>';
          loadWrap.classList.add('hidden');
          return;
        }

        if (viewMode === 'grid') {
          const grid = document.createElement('div');
          grid.className = 'cards-grid';
          slice.forEach(u => {
            const k = userKey(u);
            const isRev = reviewedSet.has(k);
            const igUrl = 'https://www.instagram.com/' + encodeURIComponent(u.username || '') + '/';
            const extraBadge = u.old_username
              ? '<span class="badge badge-info">' + escapeHtml(S.wasUsername.replace('{username}', u.old_username)) + '</span>'
              : '';
            const card = document.createElement('div');
            card.className = 'user-card' + (isRev ? ' is-reviewed' : '');
            card.innerHTML =
              '<div class="avatar" style="background:' + hashColor(u.username || u.pk) + '">' + escapeHtml(initials(u.full_name, u.username)) + '</div>' +
              '<div class="user-info">' +
                '<div class="user-name">' + escapeHtml(u.full_name || u.username || '-') + '</div>' +
                '<div class="user-handle">@' + escapeHtml(u.username || '') + '</div>' +
                '<div class="user-badges"><span class="badge ' + cat.badgeCls + '">' + escapeHtml(cat.label) + '</span>' + extraBadge + '</div>' +
              '</div>' +
              '<div class="card-actions">' +
                '<a class="icon-btn" href="' + igUrl + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(S.openOnIg) + ' ↗</a>' +
                '<button type="button" class="icon-btn' + (isRev ? ' done' : '') + '" data-toggle="' + escapeHtml(k) + '">' + escapeHtml(isRev ? S.reviewed : S.markReviewed) + '</button>' +
              '</div>';
            grid.appendChild(card);
          });
          container.innerHTML = '';
          container.appendChild(grid);
        } else {
          const wrap = document.createElement('div');
          wrap.className = 'table-wrap';
          const table = document.createElement('table');
          table.className = 'user-table';
          table.innerHTML = '<thead><tr><th>' + escapeHtml(S.colAccount) + '</th><th>' + escapeHtml(S.colStatus) + '</th><th>' + escapeHtml(S.colActions) + '</th></tr></thead><tbody></tbody>';
          const tbody = table.querySelector('tbody');
          slice.forEach(u => {
            const k = userKey(u);
            const isRev = reviewedSet.has(k);
            const igUrl = 'https://www.instagram.com/' + encodeURIComponent(u.username || '') + '/';
            const extraBadge = u.old_username
              ? ' <span class="badge badge-info">' + escapeHtml(S.wasUsername.replace('{username}', u.old_username)) + '</span>'
              : '';
            const tr = document.createElement('tr');
            if (isRev) tr.className = 'is-reviewed';
            tr.innerHTML =
              '<td><div class="tbl-user"><div class="avatar" style="background:' + hashColor(u.username || u.pk) + '">' + escapeHtml(initials(u.full_name, u.username)) + '</div><div><div class="user-name">' + escapeHtml(u.full_name || u.username || '-') + '</div><div class="user-handle">@' + escapeHtml(u.username || '') + '</div></div></div></td>' +
              '<td><span class="badge ' + cat.badgeCls + '">' + escapeHtml(cat.label) + '</span>' + extraBadge + '</td>' +
              '<td><div class="tbl-actions"><a class="icon-btn" href="' + igUrl + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(S.openOnIg) + ' ↗</a><button type="button" class="icon-btn' + (isRev ? ' done' : '') + '" data-toggle="' + escapeHtml(k) + '">' + escapeHtml(isRev ? S.reviewed : S.markReviewed) + '</button></div></td>';
            tbody.appendChild(tr);
          });
          wrap.appendChild(table);
          container.innerHTML = '';
          container.appendChild(wrap);
        }

        container.querySelectorAll('[data-toggle]').forEach(btn => {
          btn.addEventListener('click', () => toggleReviewed(btn.getAttribute('data-toggle')));
        });

        const remaining = filtered.length - slice.length;
        if (remaining > 0) {
          loadBtn.textContent = S.loadMore.replace('{remaining}', remaining.toLocaleString());
          loadWrap.classList.remove('hidden');
        } else {
          loadWrap.classList.add('hidden');
        }
      }

      document.getElementById('search-input').addEventListener('input', e => {
        searchTerm = e.target.value;
        visibleLimit = 120;
        renderList();
      });
      document.getElementById('sort-select').addEventListener('change', e => {
        sortMode = e.target.value;
        renderList();
      });
      document.getElementById('hide-reviewed').addEventListener('change', e => {
        hideReviewed = e.target.checked;
        renderList();
      });
      document.getElementById('btn-load-more').addEventListener('click', () => {
        visibleLimit += 120;
        renderList();
      });
      document.getElementById('btn-copy').addEventListener('click', async () => {
        const list = getFilteredUsers().map(u => '@' + (u.username || '')).filter(s => s.length > 1).join('\\n');
        if (!list) return;
        const btn = document.getElementById('btn-copy');
        try {
          await navigator.clipboard.writeText(list);
          const orig = btn.textContent;
          btn.textContent = S.copied;
          setTimeout(() => { btn.textContent = orig; }, 1500);
        } catch {}
      });
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          viewMode = btn.getAttribute('data-view');
          document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b === btn));
          renderList();
        });
      });

      renderSummary();
      renderTabs();
      renderList();
    })();
  </script>
</body>
</html>`;
}
