import type { ReactNode } from 'react'
import { ablative, dative } from '../turkish'

/** Plan cümlesindeki çeviri yolu. Dil ve üslup adları zaten seçili dile çevrilmiş gelir. */
export interface Route {
  title: string
  src: string
  dst: string
  model: ReactNode
  tone: string
}

const route = (r: Route) => <>“{r.title}” kitabını {ablative(r.src)} {dative(r.dst)}, {r.model} ile {r.tone.toLocaleLowerCase('tr')} üslupta</>

export const tr = {
  locale: { name: 'Türkçe', short: 'TR' },

  common: {
    parts: (n: number | string) => `${n} parça`,
    part: (n: number) => `Parça ${n}`,
    of: (done: number, total: number) => `${done} / ${total}`,
    openInWord: 'Word’de aç',
    openFolder: 'Klasörü aç',
    revealInFolder: 'Klasörde göster',
    chooseBook: 'Kitap seç',
    refresh: 'Yenile',
    loading: 'Yükleniyor…',
    cancel: 'Vazgeç',
    save: 'Kaydet',
    remove: 'Kaldır',
    start: 'Başlat',
    resume: 'Devam et',
    pause: 'Duraklat',
    unknownError: 'Bilinmeyen bir hata oluştu.'
  },

  app: {
    opening: 'Varak açılıyor…',
    serverDown: (detail: string) => `Varak sunucusuna bağlanılamadı: ${detail}`,
    status: {
      running: 'çalışıyor',
      runningPart: (n: number) => `çalışıyor · Parça ${n}`,
      stopped: 'durdu',
      complete: 'tamamladı',
      paused: 'duraklatıldı',
      ready: 'hazır',
      decision: '1 karar'
    },
    nav: {
      dashboard: 'Kontrol Paneli',
      reader: 'Canlı Okuma',
      library: 'Kitap Geçmişi',
      outputs: 'Çıktı Dosyaları',
      settings: 'Ayarlar'
    },
    books: 'Kitaplar',
    noBooks: 'Henüz kayıtlı kitap yok.',
    theme: 'Tema',
    themes: { dark: 'Koyu', light: 'Açık' },
    language: 'Dil',
    togglePane: 'Yan paneli aç/kapat',
    needKey: (provider: string) => `${provider} API anahtarını girip kaydet.`
  },

  dashboard: {
    empty: {
      title: 'Bana bir Word kitabı ver; parça parça çevirip Word dosyasına yazarım.',
      body: 'Her parça kaydedilir, istediğin an duraklatıp sonra devam edebilirsin.'
    },
    started: (clock: string) => `başlangıç ${clock}`,
    elapsed: (duration: string) => `${duration} çalıştı`,
    reading: 'Kitap ve kayıtlar okunuyor…'
  },

  plan: {
    error: (done: number, total: number) => <>Çeviri durdu. {done} / {total} parça kaydedildi; sorunu giderince kaldığım yerden sürerim.</>,
    complete: (title: string, dst: string, total: number) => <>“{title}” kitabının {dst} çevirisi bitti: {total} parçanın hepsi Word dosyasında.</>,
    paused: (done: number, total: number) => <>Çeviriyi duraklattım. {done} / {total} parça kayıtlı; devam etmek ücretsiz, kaldığım yerden sürerim.</>,
    running: (r: Route, kept: number, todo: number, finish: string) => <>{route(r)} çeviriyorum. {kept} parça kayıttan geldi, {todo} parça kaldı; bitişi {finish} civarında bekliyorum.</>,
    upToDate: (r: Route) => <>{route(r)} çeviri bu sürümde tamam. Başlatırsan Word dosyasını kayıtlardan yeniden yazarım.</>,
    ready: (r: Route, kept: number, todo: number, eta: string) => <>{route(r)} çevireceğim. {kept} parça kayıttan gelecek, {todo} parça çevrilecek, yaklaşık {eta} sürer.</>
  },

  progress: {
    remaining: (eta: string, finish: string) => `≈ ${eta} kalan · bitiş ${finish}`,
    perPart: (seconds: string) => `parça başına ${seconds}`,
    kept: (n: number) => `Kayıttan ${n}`,
    done: (n: number) => `Bu oturumda ${n}`,
    todo: (n: number) => `Kalan ${n}`
  },

  steps: {
    summary: (n: number, duration: string) => `${n} parça çevrildi · ${duration}`,
    foldedTitle: (first: number, last: number) => `Parça ${first}–${last} çevrildi`,
    foldedMeta: (n: number, avg: string) => `${n} parça · ortalama ${avg}`,
    read: 'Kitap ve kayıtlar okundu',
    readSub: (total: number, kept: number, resume?: number) =>
      `${total} parça · ${kept} kayıtlı parça bulundu${resume ? ` · Parça ${resume} ile devam` : ''}`,
    chunk: (n: number) => `Parça ${n} çevrildi`,
    retried: (n: number) => `Geçici hata, ${n} kez yeniden denendi`,
    wordUpdated: 'Word güncellendi',
    paused: (done: number, total: number) => `Çeviri duraklatıldı · ${done} / ${total}`,
    pausedSub: 'Her parça kaydedildi; devam etmek ücretsiz.',
    complete: (total: string, duration: string) => `Çeviri tamamlandı · ${total} parça · ${duration}`,
    structureKept: (h: number, t: number, i: number) => `Yapı korundu: ${h} başlık, ${t} tablo, ${i} resim.`,
    errorSaved: (done: number, total: number) => `${done} / ${total} parça kaydedildi.`,
    goToSettings: 'Ayarlar’a git',
    retry: 'Yeniden dene',
    pausingAfter: (n: number) => `Parça ${n} bitince duraklatıyorum`,
    translating: (n: number) => `Parça ${n} çevriliyor`,
    next: (n: number) => `Sırada ${n} parça, sonra Word’ün son hali`
  },

  receipt: {
    updated: 'Word belgesi güncellendi',
    renamed: 'Word belgesi yeni adla yazıldı',
    partial: (upTo: number, dst: string, src: string) => `ilk ${upTo} parça ${dst}, kalanı ${src}`,
    whole: (dst: string) => `tamamı ${dst}`,
    lockedNote: 'Word dosyası açık olduğu için yeni adla yazıldı.',
    copyNote: 'Okuma kopyası açılır, canlı dosya kilitlenmez.',
    every: (n: number) => (n > 1 ? `Word her ${n} parçada yeniden yazılır.` : 'Word her parçada yeniden yazılır.')
  },

  dock: {
    pausing: 'Duraklatılıyor',
    translating: (n: number) => `Parça ${n} çevriliyor`,
    readingRecords: 'Kayıtlar okunuyor',
    inspecting: 'Kitap inceleniyor',
    complete: 'Çeviri tamamlandı',
    stopped: 'Çeviri durdu',
    paused: 'Duraklatıldı',
    ready: 'Çeviriye hazır',
    readLive: 'Canlı oku',
    hint: 'Her parça kaydedilir · duraklatıp sonra devam etmek ücretsiz'
  },

  artifact: {
    word: 'Word çıktısı',
    editions: 'Sürümler',
    wordPending: 'İlk parça bitince Word belgesi burada görünür.',
    partEnd: (n: number) => `Parça ${n} sonu`,
    stillSource: (n: number, src: string) => `Parça ${n} · henüz ${src}`,
    lastWritten: (n: number) => `Son yazılan yer · Parça ${n}`,
    every: (n: number) => (n > 1 ? `her ${n} parçada güncellenir` : 'her parçada güncellenir'),
    structure: 'Korunan yapı',
    headings: 'Başlıklar',
    headingsNote: 'Word stilleriyle',
    tables: 'Tablolar',
    images: 'Resimler',
    imagesNote: 'içindeki yazı çevrilmez',
    sameBook: 'aynı kitap',
    saved: (n: number) => `${n} parça`,
    openInReader: 'Canlı okumada aç'
  },

  reader: {
    title: 'Canlı Okuma',
    focus: 'Odak modu',
    noBook: 'Henüz kitap seçilmedi.',
    running: (src: string, dst: string, tone: string, finish: string) =>
      `${ablative(src)} ${dative(dst)}, ${tone.toLocaleLowerCase('tr')} üslupta çeviriyorum. Bitişi ${finish} civarında bekliyorum.`,
    idle: (src: string, dst: string, tone: string) => `${ablative(src)} ${dative(dst)}, ${tone.toLocaleLowerCase('tr')} üslupta çeviri.`,
    pauseFree: 'Duraklatmak ücretsiz',
    resumes: 'Kaldığı yerden sürer',
    saved: 'Her parça kaydedilir',
    previous: 'Önceki parça',
    next: 'Sonraki parça',
    part: 'Parça',
    follow: 'Son parçayı izle',
    firstPartHere: 'İlk çevrilen parça burada açılır.',
    startToRead: 'Çeviriyi başlatınca biten her parça burada açılır.',
    fromRecord: 'kayıttan',
    paragraphs: (n: number) => `${n} paragraf`,
    following: 'Son parçayı izliyorsun. Sonraki parça bitince burada açılır.'
  },

  library: {
    title: 'Kitap Geçmişi',
    intro: 'Çıktı klasöründe bulunan kitaplar. Birini seçince çıktı dosyaları açılır.',
    empty: (dir: string) => <>Henüz kayıtlı kitap yok. Çevrilen kitaplar <span className="font-mono text-xs">{dir}</span> içinde tutulur.</>,
    counts: (outputs: number, copies: number) => `${outputs} Word çıktısı · ${copies} okuma kopyası`
  },

  outputs: {
    title: 'Çıktı Dosyaları',
    allBooks: 'Tüm kitaplar',
    book: 'Kitap',
    empty: 'Bu seçim için çıktı dosyası yok.',
    pick: 'Önizlemek için bir dosya seç. İlk 20.000 karakter metin olarak gösterilir.',
    readingFile: 'Dosya okunuyor…',
    readingCopy: 'Okuma kopyası'
  },

  settings: {
    title: 'Ayarlar',
    intro: 'Model, üslup, parça boyu, dil çifti ve prompt birlikte bir çeviri sürümü tanımlar. Aynı ayarlara dönersen eski sürüm kaldığı yerden sürer.',
    aside: 'Sürüm ayarları çeviri sürerken değişirse Varak önce sorar. Diğerleri kaydedince geçerli olur.',
    running: (done: number, total: number) => `Çeviri devam ediyor · ${done} / ${total}`,
    sections: { edition: 'Sürüm', prompt: 'Sistem promptu', keys: 'API anahtarları', work: 'Çalışma' },
    unsaved: (from: string, to: string) => `${from} → ${to} · kaydedilmedi`,

    languages: 'Dil çifti',
    languagesSub: (n: number) => `${n} dil arasından`,
    model: 'Çeviri modeli',
    modelSub: (provider: string, status: string) => `${provider} API anahtarı ${status}`,
    keyState: { saved: 'kayıtlı', environment: 'ortamdan', missing: 'yok' },
    tone: 'Çeviri üslubu',
    limit: 'Parça başına karakter',
    limitSub: (range: string, total?: number) => `${range}${total ? ` · kitap ${total} parçaya bölünür` : ''}`,
    units: { characters: 'karakter', tries: 'deneme', parts: 'parça' },

    picker: {
      search: 'Model ara…',
      empty: 'Eşleşen model yok.',
      noKey: 'anahtar yok'
    },

    decision: {
      waiting: 'Seni bekliyor',
      continues: 'Sen karar verene kadar çeviri sürüyor',
      body: (done: number, total: number) => `Bu değişiklik yeni bir sürüm açar. Şimdiki sürüm ${done} / ${total} parçada duraklatılır ve kayıtları korunur.`,
      kept: (done: number, total: number) => `${done} / ${total} · korunur`,
      fresh: 'yeni',
      switch: 'Duraklat ve yeni sürümü aç',
      stay: 'Şimdiki sürümde kal'
    },

    prompt: {
      default: 'Varsayılan',
      custom: 'Özel',
      forPair: (src: string, dst: string) => `${src} → ${dst} için`,
      loadDefault: 'Varsayılanı yükle',
      note: (source: ReactNode, target: ReactNode) => <>{source} ve {target} seçtiğin dillerle değiştirilir. Farklı bir talimat ayrı bir çeviri sürümü oluşturur.</>
    },

    keys: {
      intro: 'Kendi anahtarını kullanırsın. Metin yalnızca seçtiğin modelin sağlayıcısına gider.',
      connected: 'Bağlı',
      fromEnvironment: 'Ortam değişkeninden',
      notConnected: 'Bağlı değil',
      usedByModel: 'Seçili model',
      label: (provider: string) => `${provider} API anahtarı`,
      placeholder: (provider: string) => `${provider} anahtarını yapıştır`,
      replacePlaceholder: 'Kayıtlı · değiştirmek için yeni anahtar yapıştır',
      environmentPlaceholder: (name: string) => `${name} kullanılıyor · değiştirmek için yapıştır`,
      show: 'Göster',
      hide: 'Gizle',
      getKey: 'Anahtar al',
      storedDesktop: 'İşletim sisteminin anahtarlığıyla şifreli saklanır.',
      storedWeb: 'Bu bilgisayarda ~/.varak klasöründe, yalnızca senin okuyabileceğin bir dosyada saklanır.',
      saved: (provider: string) => `${provider} anahtarı kaydedildi.`,
      removed: (provider: string) => `${provider} anahtarı kaldırıldı.`
    },

    work: {
      tries: 'Bağlantı denemesi',
      triesSub: 'Geçici ağ ve sunucu hatalarında',
      interval: 'Word güncelleme aralığı',
      intervalSub: 'Word belgesi kaç parçada bir yeniden yazılır'
    },

    footer: 'Kaydedilmemiş değişiklikler var.',
    saveAll: 'Ayarları kaydet',
    savedWhileRunning: 'Kaydedildi. Çalışan çeviri bunları bir sonraki başlatmada kullanır.',
    saved: 'Ayarlar kaydedildi.',
    switched: 'Şimdiki sürüm duraklatıldı, yeni sürüm başladı.'
  },

  edition: { customPrompt: 'özel prompt' },

  tones: {} as Record<string, string>
}

export type Messages = typeof tr
