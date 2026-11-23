import type { AppState, Step, StepOf } from '@/types/state'

/** Şeritteki parça sayıları. */
export function segmentCounts(s: AppState) {
  let kept = 0
  let done = 0
  for (const seg of s.segments) {
    if (seg === 'kept') kept++
    else if (seg === 'done') done++
  }
  return { kept, done, todo: s.segments.length - kept - done }
}

/** Tahmini bitiş zamanı, epoch ms. */
export const finishTime = (s: AppState) => Date.now() + s.eta * 1000

export const percent = (s: AppState) => (s.total ? Math.floor((100 * s.done) / s.total) : 0)

export const isComplete = (s: AppState) => s.phase === 'Tamamlandı' && !s.busy
export const isPaused = (s: AppState) => s.phase === 'Duraklatıldı' && !s.busy

export function lastStep<K extends Step['kind']>(steps: Step[], kind: K): StepOf<K> | undefined {
  for (let i = steps.length - 1; i >= 0; i--) if (steps[i]!.kind === kind) return steps[i] as StepOf<K>
  return undefined
}

export const isKind = <K extends Step['kind']>(kind: K) => (step: Step): step is StepOf<K> => step.kind === kind
