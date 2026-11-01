import { useEffect, useRef, useState } from 'react'
import { CameraOff } from 'lucide-react'

type Props = {
  /** Called with the text of each newly seen code. */
  onScan: (text: string) => void
  /** Pause decoding (e.g. while a result is on screen). The camera stays on. */
  paused?: boolean
}

type CameraState = 'starting' | 'live' | 'denied' | 'unavailable'

const FRAME_MS = 120
const REPEAT_MS = 2500

/**
 * In-page QR scanner using the device camera. Frames are decoded with jsQR
 * (works on iPhone and Android alike). The same code isn't reported twice in
 * a row, so holding a ticket in view doesn't trigger repeated scans.
 */
export function QrScanner({ onScan, paused = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<CameraState>('starting')
  const pausedRef = useRef(paused)
  const onScanRef = useRef(onScan)
  pausedRef.current = paused
  onScanRef.current = onScan

  useEffect(() => {
    let stream: MediaStream | null = null
    let timer = 0
    let stopped = false
    let last = { text: '', at: 0 }
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setState('unavailable')
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
      } catch (err) {
        return setState((err as DOMException)?.name === 'NotAllowedError' ? 'denied' : 'unavailable')
      }
      if (stopped) return stream.getTracks().forEach((t) => t.stop())
      const video = videoRef.current!
      video.srcObject = stream
      await video.play().catch(() => {})
      setState('live')
      const { default: jsQR } = await import('jsqr')

      const tick = () => {
        if (stopped) return
        if (!pausedRef.current && ctx && video.readyState >= 2 && video.videoWidth) {
          // Decode a downscaled frame: faster, and plenty for a ticket QR.
          const scale = Math.min(1, 720 / Math.max(video.videoWidth, video.videoHeight))
          canvas.width = Math.round(video.videoWidth * scale)
          canvas.height = Math.round(video.videoHeight * scale)
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'dontInvert' })
          const now = Date.now()
          if (code?.data && (code.data !== last.text || now - last.at > REPEAT_MS)) {
            last = { text: code.data, at: now }
            onScanRef.current(code.data)
          }
        }
        timer = window.setTimeout(tick, FRAME_MS)
      }
      tick()
    }

    void start()
    return () => {
      stopped = true
      window.clearTimeout(timer)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div
      className={
        paused
          ? 'relative aspect-[16/7] w-full overflow-hidden rounded-[20px] bg-black opacity-60 transition-[aspect-ratio,opacity] duration-500'
          : 'relative aspect-square w-full overflow-hidden rounded-[20px] bg-black transition-[aspect-ratio,opacity] duration-500'
      }
    >
      <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
      {state === 'live' && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className={paused ? 'h-[62%] w-[72%] rounded-[24px] border-2 border-cream/30' : 'h-[62%] w-[72%] rounded-[24px] border-2 border-electric shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]'} />
        </div>
      )}
      {state === 'starting' && <p className="absolute inset-0 grid place-items-center text-cream/70">Starting camera…</p>}
      {(state === 'denied' || state === 'unavailable') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center text-cream/80">
          <CameraOff className="h-8 w-8 text-rust" aria-hidden="true" />
          <p>
            {state === 'denied'
              ? 'Camera access was blocked. Allow camera access for this site in your browser settings, then reload.'
              : 'No camera available here. Use “Look up” to enter ticket IDs instead.'}
          </p>
        </div>
      )}
    </div>
  )
}
