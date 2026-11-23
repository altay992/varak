# varak
Varak is an AI-powered book translation application that translates entire books and Word documents using advanced language models. It features customizable translation settings, multiple language options, automatic text chunking, real-time progress tracking, estimated completion times, and a clean, user-friendly interface.

## Hızlı başlangıç (Windows)

- **Varak Web.bat**: Tarayıcıda açılır. Yalnızca Python 3.9+ gerekir.
- **Varak Masaustu.bat**: Ayrı pencerede açılır. Python 3.9+ ve Node.js LTS gerekir; ilk açılışta gerekli paketleri kendisi kurar.
- Eski arayüz `KitapCevirmeni/Baslat.bat` ile aynen çalışmaya devam eder. Çıktılar ve ayarlar ortak, ikisi de aynı kayıtları kullanır.

macOS / Linux: `python3 server/server.py` (web) veya `npm install && npm run desktop` (masaüstü).

## Yapı

```
KitapCevirmeni/   Python çeviri motoru (üst depodan geldiği gibi; burada değiştirilmez)
server/           Yerel HTTP sunucusu: motoru çalıştırır, /api ve arayüzü sunar (yalnızca standart kütüphane)
web/              Nöbet arayüzü: React + Vite + Tailwind
desktop/          İnce Electron kabuğu: sunucuyu başlatır, dosya seçme ve şifreli anahtar saklama
```

Aynı arayüz ve aynı API iki şekilde kullanılabilir:

- **Web:** `python3 server/server.py` → tarayıcıda `http://127.0.0.1:8765` açılır. Kitap yüklenerek seçilir. API anahtarları `~/.varak/anahtarlar.json` (yalnızca kullanıcı okuyabilir) veya `OPENAI_API_KEY` / `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` ortam değişkenlerinden okunur.
- **Masaüstü:** `npm run desktop` → Electron penceresi. Kitap yerel dosya penceresiyle seçilir, anahtarlar işletim sisteminin anahtarlığıyla şifreli saklanır.

Sunucu yalnızca `127.0.0.1` üzerinde dinler, dışarıdan erişilemez. Derlenmiş arayüz (`web/dist`) depoda olduğu için web modu Node.js olmadan çalışır.

## Arayüz (web/src)

```
app/          Kabuk: AppProvider (durum yoklama, işlemler), Sidebar, görünüm seçimi, kısayollar, tema
features/     Ekranlar, her biri kendi klasöründe: dashboard, reader, library, outputs, settings, run (adım akışı)
components/   Paylaşılan parçalar; ui/ altında shadcn (popover, command, select…) ve Nöbet düğme/çip/nokta
i18n/         Türkçe ve İngilizce metinler (locales/), dile göre biçimler, sunucu mesajlarının çevirisi
lib/          API istemcisi, motor seçenekleri (config), çeviri durumu yardımcıları
types/        Sunucuyla paylaşılan veri tipleri
styles/       globals.css: renk belirteçleri, Tailwind teması, temel kurallar. Bileşen stilleri Tailwind sınıflarıyla bileşenin içinde.
```

Metin eklerken `i18n/locales/tr.tsx` ve `en.tsx` ikisine birden yazılır; TypeScript eksik anahtarı yakalar.

## Geliştirme

```bash
npm install
npm run dev            # Python sunucusu + Vite: http://localhost:5173 (kod değişince yenilenir)
npm run dev:desktop    # Vite + Electron (Electron ilk açılışta kendini indirir)
npm run build          # web/dist üretir; server.py bunu sunar. Arayüzü değiştirdikten sonra çalıştırıp web/dist'i de commit'le
npm run typecheck
```

Çıktılar ve ayarlar eskisi gibi `KitapCevirmeni/Kitap Çıktısı/` ve `KitapCevirmeni/ayarlar.json` içinde tutulur; 5.x kayıtları aynen kullanılır.

## Motorla ilişki

`KitapCevirmeni/` klasöründeki motora dokunulmadı; motor güncellemeleri eskisi gibi o klasöre yüklenebilir. Sunucu motorun yalnızca dışa açık işlevlerini (`process`, `Book`, `settings`, `project_paths`, `part_name`, `cached`, `inventory`) kullanır. Bunların adı ya da parametreleri değişirse `server/runner.py` buna göre uyarlanmalıdır.
