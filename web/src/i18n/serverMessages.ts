// Sunucu ve motor hata mesajlarını Türkçe döndürür (KitapCevirmeni/cevirmen.py, server/).
// İngilizce arayüzde bilinen mesajlar burada çevrilir; bilinmeyenler olduğu gibi gösterilir.

type Rule = [RegExp, (...groups: string[]) => string]

const RULES: Rule[] = [
  [/^Parça (\d+)\/(\d+) · (.*)$/s, (n, total, rest) => `Part ${n}/${total} · ${toEnglish(rest!)}`],
  [/^Önce çeviriyi duraklatın\.$/, () => 'Pause the translation first.'],
  [/^Geçerli bir \.docx dosyası seçin\.$/, () => 'Choose a valid .docx file.'],
  [/^Standart bir Word \.docx dosyası seçin\.$/, () => 'Choose a standard Word .docx file.'],
  [/^(\w+) API anahtarınızı girin\.$/, (p) => `Enter your ${p} API key.`],
  [/^Bu değişiklik yeni bir sürüm açar\. Önce çeviriyi duraklatın\.$/, () => 'This change opens a new edition. Pause the translation first.'],
  [/^Önce bir Word kitabı seçin ve parça sayısının hesaplanmasını bekleyin\.$/, () => 'Choose a Word book first and wait until its parts are counted.'],
  [/^İlk Word çıktısı henüz hazırlanmadı\.$/, () => 'The first Word output isn’t ready yet.'],
  [/^Dosya bulunamadı\. Listeyi yenileyin\.$/, () => 'File not found. Refresh the list.'],
  [/^Dosya çok büyük\.$/, () => 'The file is too large.'],
  [/^Çevrilebilir Word metni bulunamadı\.$/, () => 'No translatable Word text was found.'],
  [/^Bu kitap başka bir pencerede açık\.$/, () => 'This book is open in another window.'],
  [/^Kaynak dosya işlem sırasında değişti\.$/, () => 'The source file changed during processing.'],
  [/^Sistem promptu boş olamaz\.$/, () => 'The system prompt can’t be empty.'],
  [/^İki farklı dil seçin\.$/, () => 'Choose two different languages.'],
  [/^Model veya üslup seçimi geçersiz\.$/, () => 'Invalid model or tone.'],
  [/^Bilinmeyen (model|sağlayıcı|işlem)\.$/, (w) => `Unknown ${({ model: 'model', sağlayıcı: 'provider', işlem: 'action' } as Record<string, string>)[w!]}.`],
  [/^Ayar aralık dışında \((\w+): (\d+)–(\d+)\)\.$/, (k, a, b) => `Setting out of range (${k}: ${a}–${b}).`],
  [/^Parça doğrulaması başarısız\.$/, () => 'Part validation failed.'],
  [/^Model yanıtı beklenen biçimde okunamadı\.$/, () => 'The model’s reply couldn’t be read in the expected format.'],
  [/^Yanıttaki metin alanları kaynakla eşleşmedi\.$/, () => 'The reply’s text fields didn’t match the source.'],
  [/^Çeviride boş veya Word ile uyumsuz metin bulundu\.$/, () => 'The translation contained empty or Word-incompatible text.'],
  [/^Türkçe anlam çevirisi iki denemede doğrulanamadı\. Parça kaydedilmedi\.$/, () => 'The Turkish meaning couldn’t be verified in two attempts. The part was not saved.'],
  [/^OpenAI kullanım kotası dolmuş\..*$/, () => 'Your OpenAI quota is used up. Check your API balance and project limit.'],
  [/^(\w+) yanıtı tamamlanmadan kesildi\.$/, (p) => `The ${p} reply was cut off before it finished.`],
  [/^(\w+) bu metin için tam bir çeviri döndürmedi \((.*)\)\.$/, (p, r) => `${p} didn’t return a full translation for this text (${r}).`],
  [/^Gemini bu metin için çeviri döndürmedi\.$/, () => 'Gemini returned no translation for this text.'],
  [/^(\w+) bağlantısı (\d+) denemede kurulamadı\. Ağ hatası: (.*)$/, (p, n, e) => `Couldn’t connect to ${p} in ${n} attempts. Network error: ${e}`],
  [/^(\w+) HTTP (\d+) ?(\S*)\.(.*)$/, (p, code, detail, hint) => `${p} HTTP ${code}${detail ? ` ${detail}` : ''}.${HINTS[hint!.trim()] ? ` ${HINTS[hint!.trim()]}` : hint}`],
  [/^Güvenli anahtar deposu kullanılamıyor\..*$/, () => 'Secure key storage is unavailable. Unlock your system keychain or use the provider’s environment variable.'],
  [/^Geçersiz anahtar\.$/, () => 'Invalid key.'],
  [/^İzin verilmeyen istek\.$/, () => 'Request not allowed.']
]

const HINTS: Record<string, string> = {
  'API anahtarını kontrol edin.': 'Check your API key.',
  'Anahtarı ve proje izinlerini kontrol edin.': 'Check the key and project permissions.',
  'Bu modele hesabınızdan erişilemiyor. Başka bir model seçin.': 'Your account can’t access this model. Pick another one.',
  'İstek sınırına ulaşıldı. Bir süre sonra devam edin.': 'Rate limit reached. Continue after a while.'
}

export function toEnglish(message: string): string {
  for (const [pattern, render] of RULES) {
    const match = pattern.exec(message)
    if (match) return render(...match.slice(1))
  }
  return message
}
