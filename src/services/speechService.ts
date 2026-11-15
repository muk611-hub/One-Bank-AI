// Speech Synthesis & Voice Audio Engine for ONE AI Banking

export type VoiceLanguage = 'en' | 'hi';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  language?: VoiceLanguage;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

// Convert numbers into fluent Indian English spoken words (e.g. 200000 -> "two lakh", 50000 -> "fifty thousand")
function convertNumberToIndianWords(num: number): string {
  if (isNaN(num) || num === 0) return 'zero';

  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function convertBelowHundred(n: number): string {
    if (n < 10) return units[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    const ten = Math.floor(n / 10);
    const rem = n % 10;
    return tens[ten] + (rem > 0 ? ' ' + units[rem] : '');
  }

  function convertBelowThousand(n: number): string {
    if (n < 100) return convertBelowHundred(n);
    const hundred = Math.floor(n / 100);
    const rem = n % 100;
    return units[hundred] + ' hundred' + (rem > 0 ? ' ' + convertBelowHundred(rem) : '');
  }

  // Exact round lakhs special cases for natural sound
  if (num === 200000) return 'two lakh';
  if (num === 100000) return 'one lakh';
  if (num === 300000) return 'three lakh';
  if (num === 500000) return 'five lakh';
  if (num === 750000) return 'seven lakh fifty thousand';
  if (num === 800000) return 'eight lakh';
  if (num === 1000000) return 'ten lakh';
  if (num === 1200000) return 'twelve lakh';
  if (num === 1500000) return 'fifteen lakh';
  if (num === 2000000) return 'twenty lakh';
  if (num === 2500000) return 'twenty five lakh';
  if (num === 4200000) return 'forty two lakh';

  let result = '';

  // Crores (>= 1,00,00,000)
  if (num >= 10000000) {
    const crores = Math.floor(num / 10000000);
    result += convertBelowHundred(crores) + ' crore ';
    num %= 10000000;
  }

  // Lakhs (>= 1,00,000)
  if (num >= 100000) {
    const lakhs = Math.floor(num / 100000);
    result += convertBelowHundred(lakhs) + ' lakh ';
    num %= 100000;
  }

  // Thousands (>= 1,00,000)
  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    result += convertBelowHundred(thousands) + ' thousand ';
    num %= 1000;
  }

  // Hundreds & units
  if (num > 0) {
    result += convertBelowThousand(num);
  }

  return result.trim();
}

// Tiny silent WAV (44 bytes) for unlocking HTMLAudioElement on first user gesture
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

function base64ToBlobUrl(base64: string, mimeType = 'audio/wav'): string {
  const binaryStr = atob(base64);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

function pcm16BytesToFloat32(bytes: Uint8Array): Float32Array {
  const sampleCount = Math.floor(bytes.byteLength / 2);
  const float32 = new Float32Array(sampleCount);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < sampleCount; i++) {
    float32[i] = view.getInt16(i * 2, true) / 32768;
  }
  return float32;
}

class SpeechService {
  private isUnlocked = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private selectedEnglishVoice: SpeechSynthesisVoice | null = null;
  private selectedHindiVoice: SpeechSynthesisVoice | null = null;
  private isMuted = false;
  private language: VoiceLanguage = 'en';

  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private activeSources = new Set<AudioBufferSourceNode>();
  private nextPlayTime = 0;

  private isPlayingAudio = false;
  private activeAbortController: AbortController | null = null;
  private playbackToken = 0;
  private audioCache = new Map<string, string>();
  private pcmCache = new Map<string, Float32Array>();
  private inFlightCache = new Map<string, Promise<string | null>>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioEl = new Audio();
      this.audioEl.preload = 'auto';

      if ('speechSynthesis' in window) {
        this.initVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => this.initVoices();
        }
      }
    }
  }

  public setLanguage(lang: VoiceLanguage) {
    if (this.language !== lang) {
      this.language = lang;
      this.cancel();
    }
  }

  public getLanguage(): VoiceLanguage {
    return this.language;
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    const isFemaleName = (nameLower: string) =>
      nameLower.includes('female') ||
      nameLower.includes('veena') ||
      nameLower.includes('heera') ||
      nameLower.includes('neerja') ||
      nameLower.includes('swara') ||
      nameLower.includes('lekha') ||
      nameLower.includes('aditi') ||
      nameLower.includes('kavya') ||
      nameLower.includes('sunita') ||
      nameLower.includes('priya') ||
      nameLower.includes('google');

    const indianEnglishFemale = voices.find((v) => {
      const nameLower = v.name.toLowerCase();
      const langLower = (v.lang || '').toLowerCase();
      const isIndianEng =
        langLower.includes('en-in') || langLower.includes('en_in') || nameLower.includes('india');
      return isIndianEng && isFemaleName(nameLower);
    });

    const hindiFemale = voices.find((v) => {
      const nameLower = v.name.toLowerCase();
      const langLower = (v.lang || '').toLowerCase();
      const isHindi = langLower.includes('hi-in') || langLower.includes('hi_in') || nameLower.includes('hindi');
      return isHindi && isFemaleName(nameLower);
    });

    const anyHindi = voices.find((v) => {
      const nameLower = v.name.toLowerCase();
      const langLower = (v.lang || '').toLowerCase();
      return langLower.includes('hi-in') || langLower.includes('hi_in') || nameLower.includes('hindi');
    });

    const anyIndianVoice = voices.find((v) => {
      const nameLower = v.name.toLowerCase();
      const langLower = (v.lang || '').toLowerCase();
      return (
        langLower.includes('en-in') ||
        langLower.includes('en_in') ||
        nameLower.includes('india')
      );
    });

    const naturalFemaleEnglishVoice = voices.find((v) => {
      const nameLower = v.name.toLowerCase();
      const langLower = (v.lang || '').toLowerCase();
      const isEnglish = langLower.startsWith('en');
      const isFemale =
        nameLower.includes('female') ||
        nameLower.includes('samantha') ||
        nameLower.includes('victoria') ||
        nameLower.includes('karen') ||
        nameLower.includes('zira') ||
        nameLower.includes('jenny') ||
        nameLower.includes('aria') ||
        nameLower.includes('sonia') ||
        nameLower.includes('natural') ||
        nameLower.includes('neural');
      return isEnglish && isFemale;
    });

    const fallbackEnglishVoice = voices.find((v) =>
      (v.lang || '').toLowerCase().startsWith('en')
    );

    this.selectedEnglishVoice =
      indianEnglishFemale ||
      anyIndianVoice ||
      naturalFemaleEnglishVoice ||
      fallbackEnglishVoice ||
      voices[0];

    this.selectedHindiVoice =
      hindiFemale || anyHindi || this.selectedEnglishVoice;
  }

  private async ensureAudioContext(): Promise<AudioContext | null> {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        // ignore
      }
    }
    return this.audioCtx;
  }

  // Ensure browser allows audio playback after user gesture
  public unlockAudio() {
    if (typeof window !== 'undefined') {
      this.ensureAudioContext().catch(() => {});

      if (this.isUnlocked) return;
      this.isUnlocked = true;

      if (this.audioEl) {
        try {
          this.audioEl.src = SILENT_WAV_DATA_URI;
          this.audioEl.volume = 0.01;
          const p = this.audioEl.play();
          if (p && typeof p.then === 'function') {
            p.then(() => {
              if (this.audioEl && !this.isPlayingAudio) {
                this.audioEl.pause();
                this.audioEl.volume = 1.0;
              }
            }).catch(() => {});
          }
        } catch {
          // ignore
        }
      }

      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.resume();
          const silentUtterance = new SpeechSynthesisUtterance(' ');
          silentUtterance.volume = 0.01;
          silentUtterance.rate = 2;
          window.speechSynthesis.speak(silentUtterance);
        } catch (e) {
          console.warn('Speech unlock attempt:', e);
        }
      }
    }
  }

  // Convert text into fluent, human-sounding banking speech with Indian numbers spoken in words
  public formatTextForSpeech(rawText: string): string {
    if (!rawText) return '';

    let text = rawText;

    // Remove markdown symbols & emojis
    text = text.replace(/[*_~`#]/g, '');
    text = text.replace(/[\u{1F300}-\u{1FAFF}]/gu, '');

    // Replace shorthand currency notations e.g. 2L, 2.0 Lakh, 50k, 5k
    text = text.replace(/₹?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l)\b/gi, (_, n) => {
      const val = parseFloat(n);
      if (val === 1) return 'one lakh rupees';
      if (val === 2) return 'two lakh rupees';
      if (val === 1.5) return 'one point five lakh rupees';
      if (val === 3) return 'three lakh rupees';
      if (val === 5) return 'five lakh rupees';
      if (val === 7.5) return 'seven point five lakh rupees';
      if (val === 8) return 'eight lakh rupees';
      if (val === 10) return 'ten lakh rupees';
      if (val === 12) return 'twelve lakh rupees';
      if (val === 15) return 'fifteen lakh rupees';
      if (val === 20) return 'twenty lakh rupees';
      if (val === 25) return 'twenty five lakh rupees';
      if (val === 42) return 'forty two lakh rupees';
      return `${n} lakh rupees`;
    });

    // Replace text 'lacs' or 'lac' with correctly pronounced phonetic 'lakh'
    text = text.replace(/\blacs\b/gi, 'lakh');
    text = text.replace(/\blac\b/gi, 'lakh');

    text = text.replace(/₹\s*5k\b/gi, 'five thousand rupees');
    text = text.replace(/₹\s*10k\b/gi, 'ten thousand rupees');
    text = text.replace(/₹\s*25k\b/gi, 'twenty five thousand rupees');
    text = text.replace(/₹\s*50k\b/gi, 'fifty thousand rupees');
    text = text.replace(/₹\s*75k\b/gi, 'seventy five thousand rupees');
    text = text.replace(/₹\s*(\d+)k\b/gi, (_, n) => `${n} thousand rupees`);

    // Replace currency symbols e.g. ₹2,00,000 or ₹200000 or ₹12,00,000 with spoken words "two lakh rupees"
    text = text.replace(/₹\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?|\d+)/g, (_, numStr) => {
      const cleanNum = parseInt(numStr.replace(/,/g, ''), 10);
      if (!isNaN(cleanNum)) {
        const words = convertNumberToIndianWords(cleanNum);
        return `${words} rupees`;
      }
      return `${numStr} rupees`;
    });

    // Replace stand-alone large numbers (>= 1000) e.g. 200000 or 50000 to prevent digit-by-digit spelling
    text = text.replace(/\b(\d{1,3}(?:,\d{2,3})+|\d{4,9})\b/g, (match) => {
      const cleanNum = parseInt(match.replace(/,/g, ''), 10);
      if (!isNaN(cleanNum)) {
        return convertNumberToIndianWords(cleanNum);
      }
      return match;
    });

    text = text.replace(/(\d+)\/mo/gi, '$1 per month');
    text = text.replace(/(\d+(?:\.\d+)?)\s*%\s*p\.a\./gi, '$1 percent per annum');
    text = text.replace(/(\d+(?:\.\d+)?)\s*%/g, '$1 percent');
    text = text.replace(/\bp\.a\.\b/gi, 'per annum');
    text = text.replace(/\bCIBIL\b/g, 'Cibil');
    text = text.replace(/\bTXN-[A-Z0-9-]+\b/gi, 'transaction reference');
    text = text.replace(/✓/g, 'confirmed');
    text = text.replace(/•/g, ',');
    text = text.replace(/\bhrs\b/gi, 'hours');
    text = text.replace(/\byrs\b/gi, 'years');
    text = text.replace(/\bmin\b/gi, 'minutes');

    // Clean up multiple spaces and line breaks
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  private setCache(key: string, blobUrl: string) {
    if (this.audioCache.size >= 30) {
      const oldestKey = this.audioCache.keys().next().value;
      if (oldestKey) {
        const oldUrl = this.audioCache.get(oldestKey);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        this.audioCache.delete(oldestKey);
      }
    }
    this.audioCache.set(key, blobUrl);
  }

  private async fetchGeminiTtsUrl(
    speechText: string,
    lang: VoiceLanguage,
    signal?: AbortSignal
  ): Promise<string | null> {
    const cacheKey = `${lang}:${speechText}`;
    const cached = this.audioCache.get(cacheKey);
    if (cached) return cached;

    const existingPromise = this.inFlightCache.get(cacheKey);
    if (existingPromise && !signal) {
      return existingPromise;
    }

    const requestPromise = (async () => {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: speechText, language: lang }),
          signal,
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data?.hasAudio && data?.audioBase64) {
          const url = base64ToBlobUrl(data.audioBase64, data.mimeType || 'audio/wav');
          this.setCache(cacheKey, url);
          return url;
        }
        return null;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          throw err;
        }
        return null;
      } finally {
        this.inFlightCache.delete(cacheKey);
      }
    })();

    if (!signal) {
      this.inFlightCache.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  private setPcmCache(key: string, samples: Float32Array) {
    if (this.pcmCache.size >= 30) {
      const oldestKey = this.pcmCache.keys().next().value;
      if (oldestKey) this.pcmCache.delete(oldestKey);
    }
    this.pcmCache.set(key, samples);
  }

  private schedulePcmBuffer(
    ctx: AudioContext,
    samples: Float32Array,
    rate: number,
    token: number,
    onFirstStart: () => void,
    isStreamDoneRef: { done: boolean },
    onAllEnded: () => void
  ) {
    if (samples.length === 0 || token !== this.playbackToken) return;

    const audioBuffer = ctx.createBuffer(1, samples.length, 24000);
    audioBuffer.getChannelData(0).set(samples);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = rate;
    source.connect(ctx.destination);

    const startAt = Math.max(ctx.currentTime + 0.015, this.nextPlayTime);
    this.nextPlayTime = startAt + audioBuffer.duration / rate;

    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
      if (
        token === this.playbackToken &&
        isStreamDoneRef.done &&
        this.activeSources.size === 0
      ) {
        this.isPlayingAudio = false;
        onAllEnded();
      }
    };

    source.start(startAt);
    if (!this.isPlayingAudio) {
      this.isPlayingAudio = true;
      onFirstStart();
    }
  }

  // Pre-warm audio (e.g. login welcome message) so it plays instantly
  public prefetch(rawText: string, lang?: VoiceLanguage) {
    if (this.isMuted || typeof window === 'undefined') return;
    const effectiveLang = lang || this.language;
    const speechText = this.formatTextForSpeech(rawText);
    const cacheKey = `${effectiveLang}:${speechText}`;
    if (!speechText || this.audioCache.has(cacheKey) || this.pcmCache.has(cacheKey)) return;
    this.fetchGeminiTtsUrl(speechText, effectiveLang).catch(() => {});
  }

  public async speak(text: string, options: SpeechOptions = {}) {
    if (this.isMuted || typeof window === 'undefined') return;

    const speechText = this.formatTextForSpeech(text);
    if (!speechText) return;

    const effectiveLang = options.language || this.language;
    const rate = options.rate ?? 1.0;
    const cacheKey = `${effectiveLang}:${speechText}`;

    this.cancel();
    const token = ++this.playbackToken;

    // 1. Instant cached PCM playback (0ms network delay)
    const cachedPcm = this.pcmCache.get(cacheKey);
    if (cachedPcm) {
      const ctx = await this.ensureAudioContext();
      if (token !== this.playbackToken || this.isMuted) return;
      if (ctx) {
        this.nextPlayTime = ctx.currentTime + 0.01;
        const doneRef = { done: true };
        this.schedulePcmBuffer(
          ctx,
          cachedPcm,
          rate,
          token,
          () => options.onStart?.(),
          doneRef,
          () => options.onEnd?.()
        );
        return;
      }
    }

    // 2. Instant cached WAV playback (e.g. pre-warmed welcome greeting)
    const cachedWavUrl = this.audioCache.get(cacheKey);
    if (cachedWavUrl && this.audioEl) {
      const played = await this.playWavUrl(cachedWavUrl, rate, token, options, speechText, effectiveLang);
      if (played) return;
    }

    // 3. Progressive Streaming PCM via /api/tts/stream (low latency ~300-800ms to first word)
    const abortController = new AbortController();
    this.activeAbortController = abortController;
    let skipUnary = false;
    let fallbackSpokenText = speechText;

    try {
      const ctx = await this.ensureAudioContext();
      if (token !== this.playbackToken || this.isMuted) return;

      const res = await fetch('/api/tts/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText, language: effectiveLang }),
        signal: abortController.signal,
      });

      if (res.status === 429) {
        skipUnary = true;
        const errData = await res.json().catch(() => null);
        if (errData?.spokenText) {
          fallbackSpokenText = errData.spokenText;
        }
      } else if (res.ok && res.body && ctx) {
        const reader = res.body.getReader();
        const isStreamDoneRef = { done: false };
        let remainderByte: number | null = null;
        const collectedFloatChunks: Float32Array[] = [];
        let totalSamples = 0;
        let receivedAnyAudio = false;
        this.nextPlayTime = ctx.currentTime + 0.02;

        while (true) {
          const { done, value } = await reader.read();
          if (token !== this.playbackToken || this.isMuted) {
            await reader.cancel().catch(() => {});
            return;
          }

          if (done) {
            isStreamDoneRef.done = true;
            break;
          }

          if (!value || value.byteLength === 0) continue;

          // Combine leftover odd byte from previous chunk if needed
          let bytes = value;
          if (remainderByte !== null) {
            const combined = new Uint8Array(value.byteLength + 1);
            combined[0] = remainderByte;
            combined.set(value, 1);
            bytes = combined;
            remainderByte = null;
          }

          if (bytes.byteLength % 2 !== 0) {
            remainderByte = bytes[bytes.byteLength - 1];
            bytes = bytes.subarray(0, bytes.byteLength - 1);
          }

          if (bytes.byteLength >= 2) {
            const float32 = pcm16BytesToFloat32(bytes);
            collectedFloatChunks.push(float32);
            totalSamples += float32.length;
            receivedAnyAudio = true;

            this.schedulePcmBuffer(
              ctx,
              float32,
              rate,
              token,
              () => options.onStart?.(),
              isStreamDoneRef,
              () => options.onEnd?.()
            );
          }
        }

        if (receivedAnyAudio && token === this.playbackToken) {
          // Save combined Float32 PCM to cache for instant replays
          const fullSamples = new Float32Array(totalSamples);
          let offset = 0;
          for (const chunk of collectedFloatChunks) {
            fullSamples.set(chunk, offset);
            offset += chunk.length;
          }
          this.setPcmCache(cacheKey, fullSamples);

          // Edge case: all scheduled sources finished before reader.read() returned done=true
          if (this.activeSources.size === 0 && this.isPlayingAudio) {
            this.isPlayingAudio = false;
            options.onEnd?.();
          }
          return;
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || token !== this.playbackToken) {
        return;
      }
      console.warn('Streaming TTS failed, trying fallback:', err);
    } finally {
      if (this.activeAbortController === abortController) {
        this.activeAbortController = null;
      }
    }

    // 4. Unary /api/tts fallback (only if streaming failed without 429)
    if (!skipUnary && token === this.playbackToken && !this.isMuted) {
      try {
        const unaryController = new AbortController();
        this.activeAbortController = unaryController;
        const wavUrl = await this.fetchGeminiTtsUrl(
          speechText,
          effectiveLang,
          unaryController.signal
        );
        if (token !== this.playbackToken || this.isMuted) return;
        if (wavUrl) {
          const played = await this.playWavUrl(wavUrl, rate, token, options, speechText, effectiveLang);
          if (played) return;
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || token !== this.playbackToken) return;
      } finally {
        this.activeAbortController = null;
      }
    }

    // 5. Instant Browser Web Speech fallback (uses translated Hindi text if available)
    if (token === this.playbackToken && !this.isMuted) {
      this.speakWithBrowserFallback(fallbackSpokenText, options, effectiveLang, token);
    }
  }

  private async playWavUrl(
    audioUrl: string,
    rate: number,
    token: number,
    options: SpeechOptions,
    speechText: string,
    effectiveLang: VoiceLanguage
  ): Promise<boolean> {
    if (!this.audioEl) return false;
    const audio = this.audioEl;
    audio.pause();
    audio.currentTime = 0;
    audio.src = audioUrl;
    audio.volume = 1.0;
    audio.playbackRate = rate;

    audio.onplay = () => {
      if (token !== this.playbackToken) return;
      this.isPlayingAudio = true;
      options.onStart?.();
    };

    audio.onended = () => {
      if (token !== this.playbackToken) return;
      this.isPlayingAudio = false;
      options.onEnd?.();
    };

    audio.onerror = () => {
      if (token !== this.playbackToken) return;
      this.isPlayingAudio = false;
      this.speakWithBrowserFallback(speechText, options, effectiveLang, token);
    };

    try {
      await audio.play();
      return true;
    } catch {
      this.isPlayingAudio = false;
      return false;
    }
  }

  private speakWithBrowserFallback(
    speechText: string,
    options: SpeechOptions,
    lang: VoiceLanguage,
    token: number
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options.onError) options.onError(new Error('SpeechSynthesis unsupported'));
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.05;
      utterance.volume = 1.0;

      if (!this.selectedEnglishVoice && !this.selectedHindiVoice) {
        this.initVoices();
      }

      const fallbackVoice =
        lang === 'hi' ? this.selectedHindiVoice : this.selectedEnglishVoice;
      if (fallbackVoice) {
        utterance.voice = fallbackVoice;
        utterance.lang = fallbackVoice.lang;
      } else {
        utterance.lang = options.lang || (lang === 'hi' ? 'hi-IN' : 'en-IN');
      }

      utterance.onstart = () => {
        if (token !== this.playbackToken) return;
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (token !== this.playbackToken) return;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        if (token !== this.playbackToken) return;
        if (options.onError) options.onError(e);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);

      const resumeInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking || token !== this.playbackToken) {
          clearInterval(resumeInterval);
        } else {
          window.speechSynthesis.resume();
        }
      }, 5000);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      if (options.onError) options.onError(e);
    }
  }

  public cancel() {
    this.playbackToken++;

    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }

    if (this.activeSources.size > 0) {
      for (const src of this.activeSources) {
        try {
          src.onended = null;
          src.stop();
          src.disconnect();
        } catch {
          // ignore
        }
      }
      this.activeSources.clear();
    }
    this.nextPlayTime = 0;

    if (this.audioEl) {
      try {
        this.audioEl.onplay = null;
        this.audioEl.onended = null;
        this.audioEl.onerror = null;
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      } catch {
        // ignore
      }
    }
    this.isPlayingAudio = false;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
  }

  public pause() {
    if (this.audioCtx && this.activeSources.size > 0 && this.audioCtx.state === 'running') {
      this.audioCtx.suspend().catch(() => {});
      return;
    }
    if (this.isPlayingAudio && this.audioEl) {
      this.audioEl.pause();
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resume() {
    if (this.audioCtx && this.activeSources.size > 0 && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
      return;
    }
    if (this.audioEl && this.audioEl.src && this.audioEl.paused && !this.audioEl.ended) {
      this.audioEl.play().catch(() => {});
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  public isSpeaking(): boolean {
    if (this.isPlayingAudio) return true;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.cancel();
    }
  }
}

export const speechService = new SpeechService();
