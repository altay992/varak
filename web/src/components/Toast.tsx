/** Ekranın altında beliren kısa bildirim. Boş metinde gizlenir. */
export function Toast({ text }: { text: string }) {
  return (
    <div role="status" data-hidden={text ? undefined : ''} className="fixed bottom-6 left-1/2 z-50 max-w-[520px] -translate-x-1/2 rounded-[10px] bg-popover px-3.5 py-2.5 text-[13px] text-text shadow-float transition-[opacity,translate] duration-200 ease-nobet data-[hidden]:pointer-events-none data-[hidden]:translate-y-1.5 data-[hidden]:opacity-0">
      {text}
    </div>
  )
}
