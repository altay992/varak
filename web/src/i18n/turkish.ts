// Türkçe ek uyumu. Uygulamadaki dil adlarının hepsi a veya e ile biter (İngilizce, Almanca…),
// bu yüzden son ünlüye bakmak yeter.
const back = (word: string) => /[aıou][^aeıioöuü]*$/i.test(word)

/** "İngilizce" → "İngilizceden", "Almanca" → "Almancadan" */
export const ablative = (lang: string) => lang + (back(lang) ? 'dan' : 'den')

/** "Türkçe" → "Türkçeye", "Almanca" → "Almancaya" */
export const dative = (lang: string) => lang + (back(lang) ? 'ya' : 'ye')
