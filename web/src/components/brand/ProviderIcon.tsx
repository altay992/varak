import { useId } from 'react'

// Sağlayıcı logoları. OpenAI tek renk olduğu için temaya göre metin rengini alır.
const SPARK = 'M120.6 60.4A87 87 0 0 1 93.2 42 87 87 0 0 1 70.6 2.3a3 3 0 0 0-6 0A87 87 0 0 1 42 42a87 87 0 0 1-27.3 18.4 81 81 0 0 1-12.3 4.2 3 3 0 0 0 0 6 82 82 0 0 1 12.3 4.1A87 87 0 0 1 42 93.2a87 87 0 0 1 22.6 39.7 3 3 0 0 0 6 0 82 82 0 0 1 4.2-12.4 87 87 0 0 1 18.4-27.3A87 87 0 0 1 133 70.6a3 3 0 0 0 0-6 80 80 0 0 1-12.3-4.2'

function Gemini({ size }: { size: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 135 135" fill="none" aria-hidden="true">
      <path fill="#3186ff" d={SPARK} />
      <path fill={`url(#${id}g)`} d={SPARK} />
      <path fill={`url(#${id}r)`} d={SPARK} />
      <path fill={`url(#${id}y)`} d={SPARK} />
      <defs>
        <linearGradient id={`${id}g`} x1="36.9" x2="61.5" y1="89.1" y2="67.6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#08b962" /><stop offset="1" stopColor="#08b962" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="43" x2="64.5" y1="27.6" y2="61.4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f94543" /><stop offset="1" stopColor="#f94543" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}y`} x1="15.4" x2="101.4" y1="76.8" y2="67.6" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fabc12" /><stop offset=".5" stopColor="#fabc12" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function OpenAI({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 600 600" fill="none" aria-hidden="true">
      <path fill="currentColor" d="M557 245.5a150 150 0 0 0-12.8-122.7 151 151 0 0 0-162.8-72.5 151.6 151.6 0 0 0-256.9 54.2 150 150 0 0 0-100 72.5 151 151 0 0 0 18.6 177.5c-13.6 40.8-9 85.6 12.8 122.7 32.8 57 98.6 86.3 162.9 72.5a151.4 151.4 0 0 0 257-54.9A151.4 151.4 0 0 0 557 245.6M331.5 560.7c-26.3 0-51.7-9.1-72-26l3.6-2 119.5-69c6-3.5 9.8-10 9.8-17V278.3l50.5 29.2q.8.4 1 1.3v139.6c-.2 62-50.4 112.2-112.4 112.3M90 457.6a112 112 0 0 1-13.4-75.3l3.6 2 119.5 69c6 3.6 13.5 3.6 19.6 0l146-84.2v58.3a2 2 0 0 1-.8 1.6l-121 69.8A112.5 112.5 0 0 1 90 457.6M58.5 197.4c13.3-23 34.2-40.4 59.2-49.3V290c-.1 7 3.6 13.5 9.7 17l145.3 83.8-50.5 29.2q-.8.5-1.8 0L99.7 350.3a112.6 112.6 0 0 1-41.2-153.5zm415 96.4-146-84.7 50.5-29q.8-.6 1.8 0l120.7 69.7a112.4 112.4 0 0 1-16.9 202.6v-142c-.2-6.9-4-13.2-10.2-16.6m50.2-75.6-3.6-2.1-119.3-69.6c-6-3.5-13.6-3.5-19.6 0l-146 84.2v-58.3q0-1 .7-1.5l120.8-69.7a112.5 112.5 0 0 1 167 116.5zm-316 103.4-50.5-29.1a2 2 0 0 1-1-1.4V151.9a112.5 112.5 0 0 1 184.4-86.4l-3.5 2-119.5 69c-6 3.5-9.8 10-9.8 17zm27.4-59.2 65-37.4 65.2 37.4v75l-65 37.5-65-37.5z" />
    </svg>
  )
}

function Claude({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 600 600" fill="none" aria-hidden="true">
      <path fill="#D97757" d="M119 398.8 236.3 333l2-5.8-2-3.1h-5.7l-19.6-1.2-67-1.9-58.2-2.4-56.3-3-14.2-3L2 295l1.4-8.8 11.9-8 17 1.5 37.8 2.6 56.6 3.9 41 2.4 61 6.3h9.6l1.4-3.9-3.3-2.4-2.6-2.4-58.6-39.7-63.4-42-33.2-24.1-18-12.3-9-11.4-4-25 16.3-18 22 1.4 5.5 1.5 22.2 17.1 47.4 36.7 62 45.6 9 7.5 3.6-2.6.4-1.8-4-6.8-33.7-60.8-36-62L146.5 64l-4.2-15.4a75 75 0 0 1-2.6-18l18.6-25.3L168.4 2l24.8 3.3 10.4 9L219 49.7l25 55.4 38.6 75.3 11.3 22.4 6 20.7 2.3 6.3h4V226l3-42.5 6-52.1 5.7-67 2-19 9.3-22.6 18.6-12.2 14.5 7 11.9 17-1.7 11-7 46.1-14 72.2-9 48.3h5.3l6-6 24.4-32.5 41.1-51.4 18.1-20.3 21.2-22.5 13.6-10.8h25.6L519.7 97l-8.5 29-26.4 33.5-21.9 28.4-31.4 42.3-19.6 33.8 1.8 2.7 4.7-.4 71-15.1 38.3-7 45.7-7.8 20.7 9.6 2.3 9.9-8.2 20-48.9 12.1-57.4 11.5-85.4 20.2-1 .8 1.1 1.5 38.5 3.6 16.5.9h40.3l75 5.6 19.7 13 11.7 15.8-2 12.1-30.1 15.4-40.8-9.7-95.1-22.6-32.6-8.1h-4.5v2.7l27.1 26.5 49.9 45 62.3 58 3.2 14.3-8 11.4-8.5-1.2-54.8-41.3-21.1-18.5-47.9-40.4h-3.2v4.3l11 16.1 58.3 87.6 3 26.9-4.2 8.7-15 5.3-16.7-3-34-48-35.3-53.8L331 400l-3.5 2-16.8 180.4-7.8 9.3-18.1 6.9-15.1-11.5-8-18.5 8-36.7 9.6-48 7.9-38 7-47.2 4.3-15.7-.3-1-3.4.4-35.7 48.9-54.2 73.2-42.9 46-10.2 4-17.8-9.2 1.6-16.5 10-14.6 59.3-75.5 35.8-46.8 23.1-27-.1-4h-1.4L104.6 463.4l-28 3.6-12.1-11.3 1.5-18.6 5.7-6 47.4-32.6-.2.1z" />
    </svg>
  )
}

export function ProviderIcon({ provider, size = 14 }: { provider: string; size?: number }) {
  if (provider === 'OpenAI') return <OpenAI size={size} />
  if (provider === 'Gemini') return <Gemini size={size} />
  if (provider === 'Claude') return <Claude size={size} />
  return <span style={{ width: size, height: size }} className="inline-block rounded-full bg-secondary" />
}
