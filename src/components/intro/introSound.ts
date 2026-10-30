/**
 * Optional intro soundtrack, synthesised with the Web Audio API so no audio
 * files are downloaded. Off by default; only starts after an explicit user
 * gesture (the sound toggle). Replace with a composed score when available.
 */
export class IntroSound {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private drone: OscillatorNode[] = []

  get enabled() {
    return this.ctx !== null
  }

  enable() {
    if (this.ctx) return
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return
    const ctx = new AudioCtor()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.2)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 420
    filter.connect(master)

    // Low, slow drone: two detuned voices a fifth apart.
    this.drone = [55, 82.4, 55.3].map((freq) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      g.gain.value = 0.18
      osc.connect(g).connect(filter)
      osc.start()
      return osc
    })

    this.ctx = ctx
    this.master = master
  }

  /** Short bright tone: the spark, a cut, the reveal. */
  cue(kind: 'spark' | 'cut' | 'reveal') {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    const now = ctx.currentTime
    const notes = kind === 'reveal' ? [440, 659.3, 880, 1318.5] : kind === 'spark' ? [1760] : [880]
    const peak = kind === 'cut' ? 0.035 : 0.08
    const length = kind === 'reveal' ? 3.2 : kind === 'spark' ? 1.6 : 0.5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(peak / (i + 1), now + 0.02 + i * 0.05)
      g.gain.exponentialRampToValueAtTime(0.0001, now + length)
      osc.connect(g).connect(master)
      osc.start(now)
      osc.stop(now + length + 0.1)
    })
  }

  disable() {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master) return
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
    const drone = this.drone
    this.ctx = null
    this.master = null
    this.drone = []
    window.setTimeout(() => {
      drone.forEach((o) => o.stop())
      void ctx.close()
    }, 700)
  }
}
