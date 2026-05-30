import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMusicStore = defineStore('music', () => {
  const isPlaying = ref(false)
  let ctx = null
  let masterGain = null
  let nodes = []

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }

  function createOsc(type, freq, gainVal, detune = 0) {
    const c = getCtx()
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.value = freq
    osc.detune.value = detune
    g.gain.value = gainVal
    osc.connect(g)
    g.connect(masterGain)
    nodes.push(osc, g)
    return { osc, gain: g }
  }

  function start() {
    if (isPlaying.value) return

    const c = getCtx()
    masterGain = c.createGain()
    masterGain.gain.value = 0.08
    masterGain.connect(c.destination)

    const now = c.currentTime

    // === 低音嗡鸣 (Bass Drone) ===
    const bass = createOsc('sawtooth', 55, 0)
    const bassFilter = c.createBiquadFilter()
    bassFilter.type = 'lowpass'
    bassFilter.frequency.value = 120
    bassFilter.Q.value = 2
    bass.gain.disconnect()
    bass.gain.connect(bassFilter)
    bassFilter.connect(masterGain)
    nodes.push(bassFilter)

    // LFO 调制滤波器的截止频率
    const lfo = c.createOscillator()
    const lfoGain = c.createGain()
    lfo.type = 'sine'
    lfo.frequency.value = 0.12
    lfoGain.gain.value = 60
    lfo.connect(lfoGain)
    lfoGain.connect(bassFilter.frequency)
    lfo.start()
    nodes.push(lfo, lfoGain)

    bass.gain.gain.setValueAtTime(0.22, now)
    bass.osc.start(now)

    // === 打击垫和弦 (Pad) ===
    const padNotes = [110, 130.81, 164.81, 196] // A2 C3 E3 G3
    const padGains = [0.04, 0.035, 0.03, 0.035]
    padNotes.forEach((freq, i) => {
      const p = createOsc('triangle', freq, 0)
      p.gain.gain.setValueAtTime(padGains[i], now)
      p.osc.start(now)
    })

    // === 琶音器 (Arpeggiator) ===
    const arpNotes = [220, 261.63, 329.63, 392, 440, 523.25] // A3 C4 E4 G4 A4 C5 (A minor pentatonic)
    const arpGain = c.createGain()
    arpGain.gain.value = 0.06
    arpGain.connect(masterGain)
    nodes.push(arpGain)

    const arpOsc = c.createOscillator()
    arpOsc.type = 'square'
    arpOsc.connect(arpGain)
    nodes.push(arpOsc)

    let arpIndex = 0
    const arpPattern = [0, 2, 4, 2, 1, 3, 5, 3] // 琶音模式
    function arpStep() {
      if (!isPlaying.value) return
      const noteIdx = arpPattern[arpIndex % arpPattern.length]
      const freq = arpNotes[noteIdx]
      arpOsc.frequency.setTargetAtTime(freq, c.currentTime, 0.02)
      arpGain.gain.setTargetAtTime(0.07, c.currentTime, 0.02)
      setTimeout(() => {
        arpGain.gain.setTargetAtTime(0.005, c.currentTime, 0.05)
      }, 180)
      arpIndex++
      setTimeout(arpStep, 320)
    }
    arpOsc.start(now)
    arpStep()

    // === 高音闪烁 (Sparkle) ===
    const sparkOsc = c.createOscillator()
    const sparkGain = c.createGain()
    sparkOsc.type = 'sine'
    sparkOsc.frequency.value = 880
    sparkGain.gain.value = 0
    sparkOsc.connect(sparkGain)
    sparkGain.connect(masterGain)
    nodes.push(sparkOsc, sparkGain)

    function sparkle() {
      if (!isPlaying.value) return
      sparkOsc.frequency.setValueAtTime(660 + Math.random() * 880, c.currentTime)
      sparkGain.gain.setValueAtTime(0.03 + Math.random() * 0.04, c.currentTime)
      sparkGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5 + Math.random() * 0.8)
      setTimeout(sparkle, 1200 + Math.random() * 2500)
    }
    sparkOsc.start(now)
    sparkle()

    isPlaying.value = true
    localStorage.setItem('arcadeMusic', 'on')
  }

  function stop() {
    if (!isPlaying.value) return
    isPlaying.value = false
    nodes.forEach(n => {
      try { n.stop?.(); n.disconnect() } catch (e) { /* already stopped */ }
    })
    nodes = []
    masterGain?.disconnect()
    masterGain = null
    localStorage.setItem('arcadeMusic', 'off')
  }

  function toggle() {
    if (isPlaying.value) stop()
    else start()
  }

  function init() {
    const saved = localStorage.getItem('arcadeMusic')
    if (saved === 'off') return
    // 需要等用户交互后才能播放（浏览器自动播放策略）
    const resume = () => {
      if (!isPlaying.value && localStorage.getItem('arcadeMusic') !== 'off') {
        start()
      }
      document.removeEventListener('click', resume)
      document.removeEventListener('keydown', resume)
    }
    document.addEventListener('click', resume, { once: true })
    document.addEventListener('keydown', resume, { once: true })
  }

  return { isPlaying, start, stop, toggle, init }
})
