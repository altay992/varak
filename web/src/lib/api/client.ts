// Varak sunucusuyla (server/server.py) HTTP üzerinden konuşur. Electron da aynı API'yi kullanır.

/** Sunucunun döndürdüğü hata; mesaj motorun Türkçe metnidir, arayüz çevirir. */
export class ApiError extends Error {}

const HEADERS = { 'X-Varak': '1' }

async function read<T>(response: Response): Promise<T> {
  let payload: { value?: T; error?: string }
  try {
    payload = await response.json()
  } catch {
    throw new ApiError(`HTTP ${response.status}`)
  }
  if (!response.ok || payload.error) throw new ApiError(payload.error || `HTTP ${response.status}`)
  return payload.value as T
}

export async function call<T = void>(name: string, data: unknown = {}): Promise<T> {
  const response = await fetch(`/api/${name}`, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return read<T>(response)
}

export async function upload(file: File): Promise<void> {
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { ...HEADERS, 'X-File-Name': encodeURIComponent(file.name) },
    body: file
  })
  await read<void>(response)
}
