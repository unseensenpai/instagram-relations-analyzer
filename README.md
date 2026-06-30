# IG Relations - Follower Analyzer

[English version below](#english-version)

Instagram takipçilerinizi ve takip ettiklerinizi doğrudan tarayıcınız içinde, tamamen güvenli ve gizlilik odaklı olarak analiz etmenizi sağlayan hafif bir Chrome eklentisidir.

## Özellikler

- **Hedef Profil Analizi:** Sadece kendi profilinizi değil, girdiğiniz herhangi bir arkadaşınızın (açık hesap veya takip ettiğiniz) profilini de analiz edebilirsiniz.
- **Yerel Önbellek (Cache):** Verileri profile özel olarak tarayıcınızda (`localStorage`) saklar. Her açılışta sıfırdan çekmek yerine son senkronizasyon zamanını gösterir ve anında yüklenir.
- **Karşılıklı Takip Kontrolü:** Sizi geri takip etmeyen kişileri anında listeleyin.
- **Hayran (Fan) Kontrolü:** Sizin geri takip etmediğiniz kişileri görün.
- **Doğrudan İşlemler (Unfollow / Remove):** Sizi takip etmeyenleri panelden **Unfollow** edebilir; sizin takip etmediğiniz kişileri ise **Remove** butonu ile takipçilerinizden çıkarabilirsiniz.
- **Üçüncü Parti Sunucu Yok:** Verileriniz asla tarayıcınızdan dışarı çıkmaz, Instagram API'leri ile doğrudan sizin bilgisayarınız arasında akar.

## Kurulum (Geliştirici Modu)

1. Bu repoyu bilgisayarınıza klonlayın veya zip olarak indirin.
2. Google Chrome'u açın ve `chrome://extensions/` adresine gidin.
3. Sağ üst köşedeki **Geliştirici modu** (Developer mode) anahtarını aktif hale getirin.
4. Sol üst köşedeki **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın.
5. Eklenti klasörünü (`ig-relations-extension`) seçerek yükleyin.

> 🚀 **Alternatif Kolay Kurulum:** Reponun sağ tarafındaki **Releases** bölümünden otomatik paketlenmiş `.zip` dosyasını indirip klasöre çıkardıktan sonra Chrome'a doğrudan "Paketlenmemiş öğe yükle" diyerek tanıtabilirsiniz.

## Nasıl Kullanılır?

1. [Instagram](https://www.instagram.com) web sitesine gidin.
2. Ekranın sağ üst köşesinde beliren **📊 IG Relations** butonunu bulun.
3. Paneli açmak için butona tıklayın.
4. O an açık olan profilin verilerini çekmek ve analiz etmek için **Sync Target Profile** butonuna basın.

---

## English Version

A lightweight, local, and privacy-focused Chrome Extension to analyze Instagram followers and following lists directly within your browser.

## Features

- **Target Profile Analysis:** Analyze not just your own profile, but any friend's profile (as long as it's public or you follow them) that you are currently viewing.
- **Local Cache:** Stores fetched data per user ID inside your browser's `localStorage`. Shows the last synced timestamp and loads instantly instead of fetching from scratch every time.
- **Mutual Check:** Filter users who don't follow you back.
- **Fans Check:** Filter users you don't follow back.
- **Direct Actions (Unfollow / Remove):** Unfollow non-followers instantly or securely remove users who follow you (but you don't follow back) using the **Remove** button.
- **No Third-Party Servers:** Your data never leaves your browser; it communicates directly with Instagram endpoints.

## Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left corner.
5. Select the `ig-relations-extension` root folder.

> 🚀 **Alternative Quick Method:** You can download the pre-packaged release zip from the **Releases** section on the right, extract it, and load it directly via "Load unpacked".

## How to Use

1. Go to [Instagram](https://www.instagram.com).
2. Look for the **📊 IG Relations** button at the top right corner of your screen.
3. Click the button to open the dashboard.
4. Click **Sync Target Profile** to fetch and analyze the current profile's connections.

---

## Rate Limits & Safety Note / Hız Limitleri & Güvenlik Notu

Instagram enforces strict rate limits on automated actions and pagination requests. To keep your account safe:
- **Built-in Delays:** The extension includes a mandatory 1.5-second delay between pagination loops to reduce the risk of rate-limiting or action blocks.
- **Action Control:** Avoid using the **Unfollow** or **Remove** buttons too rapidly in short successions. 
- **Target Analysis Limit:** Analyzing external public profiles too frequently might trigger temporary endpoint restrictions from Instagram. Use the sync feature responsibly.

*Instagram, otomasyon işlemleri ve sayfalama istekleri üzerinde katı hız limitleri uygular. Hesabınızı güvende tutmak için:*
- *Eklenti, Instagram tarafından engellenme riskini azaltmak amacıyla sayfalama döngüleri arasına zorunlu 1.5 saniyelik gecikmeler koyar.*
- *Unfollow veya Remove butonlarını arka arkaya çok hızlı kullanmaktan kaçının.*
- *Dış profilleri çok sık senkronize etmek Instagram tarafında geçici kısıtlamalara yol açabilir. Özelliği sağduyulu kullanınız.*

## Disclaimer / Sorumluluk Reddi

**This tool is for educational and personal analytical purposes only.** It is not affiliated with, authorized, maintained, sponsored, or endorsed by Instagram, Meta Platforms, Inc., or any of its affiliates or subsidiaries. 

Automating interactions or scraping data from Instagram Web endpoints may violate Instagram's Terms of Service. By using this software, you acknowledge that you are doing so entirely **at your own risk**. The developer accepts no responsibility or liability for any account restrictions, temporary action blocks, suspensions, or data loss resulting from the use of this extension.

***Bu araç yalnızca eğitim ve kişisel analiz amaçlıdır.** Instagram, Meta Platforms, Inc. veya onun iştirakleri/bağlı ortaklıkları ile hiçbir ilişkisi yoktur, bunlar tarafından yetkilendirilmemiş, bakımı yapılmamış, desteklenmemiş veya onaylanmamıştır.*

*Instagram Web uç noktalarından veri çekmek veya etkileşimleri otomatize etmek Instagram Kullanım Koşullarını ihlal edebilir. Bu yazılımı kullanarak, tüm riskin **tamamen size ait olduğunu** kabul etmiş dahi olursunuz. Geliştirici, bu eklentinin kullanılmasından kaynaklanan herhangi bir hesap kısıtlaması, geçici engelleme, askıya alma veya veri kaybından dolayı hiçbir sorumluluk veya yükümlülük kabul etmez.*

## License / Lisans

This project is licensed under the MIT License - see the LICENSE file for details.