export interface ArchiveBook {
  id: string
  title: string
  outputs: number
  copies: number
  date: number
}

export interface ArchiveFile {
  id: string
  name: string
  book: string
  project: string
  edition: string
  kind: 'Çeviri' | 'Okuma kopyası'
  size: number
  date: number
}

export interface Archive {
  books: ArchiveBook[]
  files: ArchiveFile[]
}
