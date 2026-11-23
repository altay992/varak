import type { Messages, Route } from './tr'

const route = (r: Route) => <>“{r.title}” from {r.src} into {r.dst} with {r.model}, in a {r.tone.toLowerCase()} tone</>
const parts = (n: number | string) => `${n} ${n === 1 ? 'part' : 'parts'}`

export const en: Messages = {
  locale: { name: 'English', short: 'EN' },

  common: {
    parts,
    part: (n) => `Part ${n}`,
    of: (done, total) => `${done} / ${total}`,
    openInWord: 'Open in Word',
    openFolder: 'Open folder',
    revealInFolder: 'Show in folder',
    chooseBook: 'Choose book',
    refresh: 'Refresh',
    loading: 'Loading…',
    cancel: 'Cancel',
    save: 'Save',
    remove: 'Remove',
    start: 'Start',
    resume: 'Resume',
    pause: 'Pause',
    unknownError: 'Something went wrong.'
  },

  app: {
    opening: 'Opening Varak…',
    serverDown: (detail) => `Couldn’t reach the Varak server: ${detail}`,
    status: {
      running: 'running',
      runningPart: (n) => `running · Part ${n}`,
      stopped: 'stopped',
      complete: 'finished',
      paused: 'paused',
      ready: 'ready',
      decision: '1 decision'
    },
    nav: {
      dashboard: 'Dashboard',
      reader: 'Live reading',
      library: 'Book history',
      outputs: 'Output files',
      settings: 'Settings'
    },
    books: 'Books',
    noBooks: 'No saved books yet.',
    theme: 'Theme',
    themes: { dark: 'Dark', light: 'Light' },
    language: 'Language',
    togglePane: 'Toggle side panel',
    needKey: (provider) => `Enter and save your ${provider} API key.`
  },

  dashboard: {
    empty: {
      title: 'Give me a Word book; I’ll translate it part by part and write it back to Word.',
      body: 'Every part is saved, so you can pause any time and pick up later.'
    },
    started: (clock) => `started ${clock}`,
    elapsed: (duration) => `running for ${duration}`,
    reading: 'Reading the book and saved parts…'
  },

  plan: {
    error: (done, total) => <>Translation stopped. {done} / {total} parts are saved; once the problem is fixed I’ll continue where I left off.</>,
    complete: (title, dst, total) => <>The {dst} translation of “{title}” is done: all {total} parts are in the Word file.</>,
    paused: (done, total) => <>I paused the translation. {done} / {total} parts are saved; resuming costs nothing and starts where I left off.</>,
    running: (r, kept, todo, finish) => <>Translating {route(r)}. {kept} parts came from saved work, {todo} to go; I expect to finish around {finish}.</>,
    upToDate: (r) => <>Translation of {route(r)} is complete for this edition. If you start, I’ll rewrite the Word file from the saved parts.</>,
    ready: (r, kept, todo, eta) => <>I’ll translate {route(r)}. {kept} parts come from saved work and {todo} will be translated, taking about {eta}.</>
  },

  progress: {
    remaining: (eta, finish) => `≈ ${eta} left · done at ${finish}`,
    perPart: (seconds) => `${seconds} per part`,
    kept: (n) => `Saved ${n}`,
    done: (n) => `This session ${n}`,
    todo: (n) => `Left ${n}`
  },

  steps: {
    summary: (n, duration) => `${parts(n)} translated · ${duration}`,
    foldedTitle: (first, last) => `Parts ${first}–${last} translated`,
    foldedMeta: (n, avg) => `${parts(n)} · ${avg} on average`,
    read: 'Read the book and saved parts',
    readSub: (total, kept, resume) => `${parts(total)} · ${kept} saved${resume ? ` · continuing at Part ${resume}` : ''}`,
    chunk: (n) => `Part ${n} translated`,
    retried: (n) => `Temporary error, retried ${n} ${n === 1 ? 'time' : 'times'}`,
    wordUpdated: 'Word updated',
    paused: (done, total) => `Translation paused · ${done} / ${total}`,
    pausedSub: 'Every part is saved; resuming costs nothing.',
    complete: (total, duration) => `Translation complete · ${total} parts · ${duration}`,
    structureKept: (h, t, i) => `Structure kept: ${h} headings, ${t} tables, ${i} images.`,
    errorSaved: (done, total) => `${done} / ${total} parts saved.`,
    goToSettings: 'Go to Settings',
    retry: 'Try again',
    pausingAfter: (n) => `Pausing after Part ${n}`,
    translating: (n) => `Translating Part ${n}`,
    next: (n) => `${parts(n)} queued, then the final Word file`
  },

  receipt: {
    updated: 'Word document updated',
    renamed: 'Word document written under a new name',
    partial: (upTo, dst, src) => `first ${parts(upTo)} in ${dst}, the rest in ${src}`,
    whole: (dst) => `all in ${dst}`,
    lockedNote: 'The Word file was open, so it was written under a new name.',
    copyNote: 'A reading copy opens, so the live file never gets locked.',
    every: (n) => (n > 1 ? `Word is rewritten every ${n} parts.` : 'Word is rewritten after every part.')
  },

  dock: {
    pausing: 'Pausing',
    translating: (n) => `Translating Part ${n}`,
    readingRecords: 'Reading saved parts',
    inspecting: 'Inspecting book',
    complete: 'Translation complete',
    stopped: 'Translation stopped',
    paused: 'Paused',
    ready: 'Ready to translate',
    readLive: 'Read live',
    hint: 'Every part is saved · pausing and resuming costs nothing'
  },

  artifact: {
    word: 'Word output',
    editions: 'Editions',
    wordPending: 'The Word document shows up here after the first part.',
    partEnd: (n) => `End of Part ${n}`,
    stillSource: (n, src) => `Part ${n} · still in ${src}`,
    lastWritten: (n) => `Last written · Part ${n}`,
    every: (n) => (n > 1 ? `updated every ${n} parts` : 'updated after every part'),
    structure: 'Preserved structure',
    headings: 'Headings',
    headingsNote: 'with Word styles',
    tables: 'Tables',
    images: 'Images',
    imagesNote: 'text inside is not translated',
    sameBook: 'same book',
    saved: (n) => parts(n),
    openInReader: 'Open in live reading'
  },

  reader: {
    title: 'Live reading',
    focus: 'Focus mode',
    noBook: 'No book selected yet.',
    running: (src, dst, tone, finish) => `Translating from ${src} into ${dst} in a ${tone.toLowerCase()} tone. I expect to finish around ${finish}.`,
    idle: (src, dst, tone) => `${src} into ${dst}, ${tone.toLowerCase()} tone.`,
    pauseFree: 'Pausing costs nothing',
    resumes: 'Continues where it left off',
    saved: 'Every part is saved',
    previous: 'Previous part',
    next: 'Next part',
    part: 'Part',
    follow: 'Follow latest part',
    firstPartHere: 'The first translated part opens here.',
    startToRead: 'Start translating and every finished part opens here.',
    fromRecord: 'from saved work',
    paragraphs: (n) => `${n} ${n === 1 ? 'paragraph' : 'paragraphs'}`,
    following: 'You’re following the latest part. The next one opens here when it’s done.'
  },

  library: {
    title: 'Book history',
    intro: 'Books found in the output folder. Pick one to see its output files.',
    empty: (dir) => <>No saved books yet. Translated books are kept in <span className="font-mono text-xs">{dir}</span>.</>,
    counts: (outputs, copies) => `${outputs} Word ${outputs === 1 ? 'output' : 'outputs'} · ${copies} reading ${copies === 1 ? 'copy' : 'copies'}`
  },

  outputs: {
    title: 'Output files',
    allBooks: 'All books',
    book: 'Book',
    empty: 'No output files for this selection.',
    pick: 'Pick a file to preview. The first 20,000 characters are shown as text.',
    readingFile: 'Reading file…',
    readingCopy: 'Reading copy'
  },

  settings: {
    title: 'Settings',
    intro: 'Model, tone, part size, language pair and prompt together define a translation edition. Switch back to the same settings and the old edition continues where it stopped.',
    aside: 'If edition settings change while translating, Varak asks first. Everything else applies when you save.',
    running: (done, total) => `Translating · ${done} / ${total}`,
    sections: { edition: 'Edition', prompt: 'System prompt', keys: 'API keys', work: 'Behaviour' },
    unsaved: (from, to) => `${from} → ${to} · not saved`,

    languages: 'Language pair',
    languagesSub: (n) => `${n} languages available`,
    model: 'Translation model',
    modelSub: (provider, status) => `${provider} API key ${status}`,
    keyState: { saved: 'saved', environment: 'from environment', missing: 'missing' },
    tone: 'Tone',
    limit: 'Characters per part',
    limitSub: (range, total) => `${range}${total ? ` · book splits into ${total} parts` : ''}`,
    units: { characters: 'characters', tries: 'tries', parts: 'parts' },

    picker: {
      search: 'Search models…',
      empty: 'No matching model.',
      noKey: 'no key'
    },

    decision: {
      waiting: 'Waiting for you',
      continues: 'Translation keeps going until you decide',
      body: (done, total) => `This change opens a new edition. The current edition pauses at ${done} / ${total} and keeps its saved parts.`,
      kept: (done, total) => `${done} / ${total} · kept`,
      fresh: 'new',
      switch: 'Pause and open new edition',
      stay: 'Stay on current edition'
    },

    prompt: {
      default: 'Default',
      custom: 'Custom',
      forPair: (src, dst) => `For ${src} → ${dst}`,
      loadDefault: 'Load default',
      note: (source, target) => <>{source} and {target} are replaced with the languages you pick. A different instruction creates a separate edition.</>
    },

    keys: {
      intro: 'Bring your own key. Text only goes to the provider of the model you pick.',
      connected: 'Connected',
      fromEnvironment: 'From environment',
      notConnected: 'Not connected',
      usedByModel: 'Selected model',
      label: (provider) => `${provider} API key`,
      placeholder: (provider) => `Paste your ${provider} key`,
      replacePlaceholder: 'Saved · paste a new key to replace it',
      environmentPlaceholder: (name) => `Using ${name} · paste to override`,
      show: 'Show',
      hide: 'Hide',
      getKey: 'Get a key',
      storedDesktop: 'Stored encrypted in your system keychain.',
      storedWeb: 'Stored on this computer in ~/.varak, in a file only you can read.',
      saved: (provider) => `${provider} key saved.`,
      removed: (provider) => `${provider} key removed.`
    },

    work: {
      tries: 'Connection attempts',
      triesSub: 'On temporary network and server errors',
      interval: 'Word update interval',
      intervalSub: 'How many parts between Word rewrites'
    },

    footer: 'You have unsaved changes.',
    saveAll: 'Save settings',
    savedWhileRunning: 'Saved. The running translation uses these on its next start.',
    saved: 'Settings saved.',
    switched: 'Current edition paused, new edition started.'
  },

  edition: { customPrompt: 'custom prompt' },

  tones: { 'Doğal': 'Natural', 'Akademik': 'Academic', 'Edebî': 'Literary', 'Sade': 'Plain' }
}
