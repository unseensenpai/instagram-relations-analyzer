# IG Relations — Takipçi Analiz Aracı

[English](README.md) · **Türkçe** · [Español](README.es.md)

Instagram takipçilerinizi ve takip ettiklerinizi tamamen tarayıcınızın içinde analiz eden, hafif ve gizlilik odaklı bir Chrome eklentisi. Sunucu yok, hesap yok, verileriniz bilgisayarınızdan çıkmıyor.

![sürüm](https://img.shields.io/badge/s%C3%BCr%C3%BCm-1.2.0-blue) ![manifest](https://img.shields.io/badge/manifest-v3-green) ![lisans](https://img.shields.io/badge/lisans-MIT-lightgrey)

---

## Özellikler

- **Herhangi bir profili analiz edin** — Sadece kendi profilinizi değil; açık hesapları veya takip ettiğiniz gizli hesapları da.
- **Dört ilişki görünümü**
  - Takip Edilenler — profilin takip ettiği herkes
  - Takipçiler — profili takip eden herkes
  - Geri Takip Etmeyenler — takip edilip geri takip etmeyenler
  - Takip Etmediklerim — takip edenlerden geri takip edilmeyenler
- **Canlı arama** — Açık listeyi kullanıcı adı veya isme göre anında filtreleyin.
- **Doğrudan işlemler** — Panelden takibi bırakın veya takipçi çıkarın.
- **Karşılaştırma ve görselleştirme (JSON / CSV)** — Güncel veriyi önceki bir JSON veya CSV dışa aktarımıyla karşılaştırın, tek dosyayı çevrimdışı görüntüleyici olarak açın ya da iki dosyayı birden seçip Yeni Takipçiler, Takibi Bırakanlar, Yeni Takip Edilenler, Takipten Çıkılanlar ve Kullanıcı Adı Değişenleri görsel grafikle inceleyin.
- **Tarayıcı içi geçmiş barı** — Her senkronizasyon yerel `IndexedDB` depolamasına (profil başına en fazla 20 kayıt) otomatik kaydedilir; eski bir kaydı seçip tek tıkla fark analizi yapabilirsiniz.
- **Dışa aktarma** — Tek bir listeyi, dördünü birden ya da tam karşılaştırma fark raporunu Excel uyumlu CSV veya JSON olarak indirin.
- **Yerel önbellek** — Sonuçlar profil bazında `localStorage`'da saklanır; profili tekrar açtığınızda anında yüklenir ve son senkronizasyon zamanını gösterir.
- **Çok dilli** — Türkçe, İngilizce ve İspanyolca. Tarayıcı dilinizi otomatik algılar, panelden değiştirilebilir.
- **İlerleme göstergesi** — Senkronizasyon sırasında canlı sayaç, yüzde ve tahmini süre.
- **Üçüncü parti sunucu yok** — İstekler doğrudan tarayıcınızdan Instagram'a gider.

---

## Kurulum

### A Seçeneği — Hazır sürüm indirin (önerilen)

1. [Releases](../../releases) sayfasına gidip en son sürümdeki `ig-relations-analyzer.zip` dosyasını indirin.
2. Zip dosyasını bilgisayarınızda herhangi bir klasöre çıkarın.
3. Chrome'u açıp `chrome://extensions/` adresine gidin.
4. Sağ üst köşeden **Geliştirici modu**'nu açın.
5. **Paketlenmemiş öğe yükle** butonuna tıklayıp çıkardığınız klasörü seçin.

### B Seçeneği — Depoyu klonlayın

```bash
git clone https://github.com/<kullanici-adiniz>/instagram-relations-analyzer.git
```

Ardından yukarıdaki 3–5. adımları izleyip klonladığınız klasörü seçin.

---

## Nasıl Kullanılır

1. [instagram.com](https://www.instagram.com) adresine gidin ve giriş yaptığınızdan emin olun.
2. Herhangi bir profil sayfasını açın (kendinizin veya bir başkasının).
3. Sayfanın sağ üst köşesindeki **📊 IG Relations** butonuna tıklayın.
4. **Profili Senkronize Et** butonuna basın ve işlemin bitmesini bekleyin — ilerleme canlı olarak gösterilir.
5. Sol taraftan listeler arasında geçiş yapın, liste içinde arama yapın veya sonuçları dışa aktarın.

> **Not:** Büyük profillerin senkronizasyonu zaman alır. Eklenti, Instagram'ın hız limitlerine takılmamak için istekler arasında 1,5 saniye bekler — 500 takipçili bir profil yaklaşık 1–2 dakika sürer.

---

## Dışa aktarma biçimleri

| Seçenek | Çıktı |
|---|---|
| **Listenin yanındaki ↓** | Sadece o liste, seçili biçimde |
| **↓ Tümünü İndir** | Dört listenin tamamı tek dosyada |
| **Excel / CSV** | BOM'lu UTF-8; Türkçe karakterler dahil Excel'de sorunsuz açılır |
| **JSON** | Özet bloğu içeren yapılandırılmış veri, ileri işleme için ideal |

Dışa aktarma her zaman **tam listeyi** içerir; aktif arama filtresinden etkilenmez.

---

## Gizlilik

Bu eklenti **yalnızca** `instagram.com` adresine, mevcut tarayıcı oturumunuzu kullanarak istek gönderir. Analitik yok, telemetri yok, harici uç nokta yok. Tüm sonuçlar tarayıcınızın `localStorage` alanında kalır ve site verilerini temizleyerek istediğiniz zaman silebilirsiniz.

İstenen izinler:

| İzin | Neden |
|---|---|
| `activeTab` | Sekmede açık olan profili okumak için |
| `storage` | Dil tercihinizi saklamak için |
| `https://*.instagram.com/*` | Instagram'ın kendi uç noktalarını sizin adınıza çağırmak için |

---

## Hız limitleri ve güvenlik

Instagram, otomatik istekler ve işlemler üzerinde katı limitler uygular. Hesabınızı güvende tutmak için:

- İstekler arasına **1,5 saniyelik gecikme** yerleştirilmiştir; düşürülmemelidir.
- **Takibi Bırak** veya **Çıkar** butonlarına arka arkaya hızlıca basmaktan kaçının.
- Kısa sürede çok sayıda dış profili senkronize etmek geçici kısıtlamalara yol açabilir.

Instagram hız limiti uygularsa panel net bir mesaj gösterip durur — birkaç dakika bekleyip tekrar deneyin.

---

## Sorun giderme

**"Kayıtlı veri yok"** — Bu profil henüz senkronize edilmemiş. *Profili Senkronize Et* butonuna basın.

**Senkronizasyon depolama uyarısıyla duruyor** — Tarayıcının depolama kotası dolmuş. Eklenti diğer profillerin önbelleğini otomatik temizleyip tekrar dener; yine başarısız olursa liste ekranda kalır ama panel kapanınca kaybolur.

**"Gizli profil veya engellendi"** — Profil gizli ve takip etmiyorsunuz, ya da Instagram isteği geçici olarak engellemiş.

**Panel butonu görünmüyor** — Instagram sekmesini yenileyin. Eklenti kendini sayfa yüklenirken enjekte eder.

---

## Geliştirme

```
src/
├── content.js          # Paneli instagram.com sayfasına enjekte eder
└── ui/
    ├── modal.html      # Panel işaretlemesi
    ├── modal.css       # Panel stilleri
    ├── modal.js        # Panel mantığı: senkronizasyon, karşılaştırma, geçmiş, dışa aktarma
    ├── compare.js      # JSON/CSV ayrıştırıcı ve fark (diff) motoru
    ├── history.js      # Tarayıcı içi IndexedDB anlık görüntü geçmişi
    ├── profile-url.js  # Instagram profil URL ayrıştırıcısı
    └── i18n.js         # Çeviriler (en / tr / es)
```

**Dil eklemek:** `src/ui/i18n.js` içindeki `TRANSLATIONS` nesnesine aynı anahtarlarla bir blok ekleyin ve `LANGUAGES` dizisine kaydedin. Panel otomatik olarak tanır.

Sürüm notları [`docs/release-notes/`](docs/release-notes/) klasöründedir.

---

## Sorumluluk Reddi

**Bu araç yalnızca eğitim ve kişisel analiz amaçlıdır.** Instagram, Meta Platforms, Inc. veya bunların iştirakleri/bağlı ortaklıkları ile hiçbir ilişkisi yoktur; bunlar tarafından yetkilendirilmemiş, desteklenmemiş veya onaylanmamıştır.

Instagram web uç noktalarından veri çekmek veya etkileşimleri otomatikleştirmek Instagram Kullanım Koşulları'nı ihlal edebilir. Bu yazılımı kullanarak tüm riskin **tamamen size ait olduğunu** kabul etmiş olursunuz. Geliştirici; eklentinin kullanımından kaynaklanan hesap kısıtlamaları, geçici engellemeler, askıya alınmalar veya veri kayıplarından hiçbir sorumluluk kabul etmez.

---

## Lisans

MIT Lisansı ile yayınlanmıştır — ayrıntılar için [LICENCE](LICENCE) dosyasına bakın.
