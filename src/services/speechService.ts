// Speech Synthesis & Voice Audio Engine for ONE AI Banking

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
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

class SpeechService {
  private isUnlocked = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isMuted = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Pre-load voices
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // 1. High priority: Indian English / Hindi Female voices (e.g. Veena, Heera, Neerja, Swara, Aditi, Google en-IN)
    const indianFemaleVoice = voices.find((v) => {
      const nameLower = v.name.toLowerCase();
      const langLower = (v.lang || '').toLowerCase();
      const isIndian = langLower.includes('en-in') || langLower.includes('en_in') || langLower.includes('hi-in') || nameLower.includes('india');
      const isFemale = nameLower.includes('female') || nameLower.includes('veena') || nameLower.includes('heera') || 
                       nameLower.includes('neerja') || nameLower.includes('swara') || nameLower.includes('aditi') || 
                       nameLower.includes('kavya') || nameLower.includes('sunita') || nameLower.includes('priya') ||
                       nameLower.includes('google english (india)') || nameLower.includes('google');
      return isIndian && isFemale;
    });

    // 2. Any Indian voice
    const anyIndianVoice = voices.find((v) => {
      const nameLower = v.name.toLowerCase();
      const langLower = (v.lang || '').toLowerCase();
      return langLower.includes('en-in') || langLower.includes('en_in') || nameLower.includes('india');
    });

    // 3. High quality natural English Female voice
    const naturalFemaleEnglishVoice = voices.find((v) => {
      const nameLower = v.name.toLowerCase();
      const langLower = (v.lang || '').toLowerCase();
      const isEnglish = langLower.startsWith('en');
      const isFemale = nameLower.includes('female') || nameLower.includes('samantha') || nameLower.includes('victoria') || 
                       nameLower.includes('karen') || nameLower.includes('zira') || nameLower.includes('jenny') || 
                       nameLower.includes('aria') || nameLower.includes('sonia') || nameLower.includes('natural') || 
                       nameLower.includes('neural');
      return isEnglish && isFemale;
    });

    const fallbackEnglishVoice = voices.find((v) => (v.lang || '').toLowerCase().startsWith('en'));

    this.selectedVoice = indianFemaleVoice || anyIndianVoice || naturalFemaleEnglishVoice || fallbackEnglishVoice || voices[0];
  }

  // Ensure browser allows speech after user gesture
  public unlockAudio() {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        // Speak a silent empty utterance to unlock Chrome/Safari audio context
        const silentUtterance = new SpeechSynthesisUtterance(' ');
        silentUtterance.volume = 0.01;
        silentUtterance.rate = 2;
        window.speechSynthesis.speak(silentUtterance);
      } catch (e) {
        console.warn('Speech unlock attempt:', e);
      }
    }
  }

  // Convert text into fluent, human-sounding banking speech with Indian numbers spoken in words
  public formatTextForSpeech(rawText: string): string {
    if (!rawText) return '';

    let text = rawText;

    // Remove markdown symbols
    text = text.replace(/[*_~`#]/g, '');

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
    text = text.replace(/\bEMI\b/g, 'E M I');
    text = text.replace(/\bCIBIL\b/g, 'Cibil');
    text = text.replace(/\bIFSC\b/g, 'I F S C');
    text = text.replace(/\bOTP\b/g, 'O T P');
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

  public speak(text: string, options: SpeechOptions = {}) {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported on this browser.');
      return;
    }

    try {
      this.cancel(); // Stop ongoing speech

      const speechText = this.formatTextForSpeech(text);
      if (!speechText) return;

      // Chrome speech freeze workaround
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(speechText);
      // Standard 1X natural voice rate (1.0)
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.05;
      utterance.volume = 1.0;

      if (!this.selectedVoice) {
        this.initVoices();
      }
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang = this.selectedVoice.lang;
      } else {
        utterance.lang = options.lang || 'en-IN';
      }

      utterance.onstart = () => {
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        this.currentUtterance = null;
        if (options.onError) options.onError(e);
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);

      // Web Speech timeout keeper for longer sentences (prevents Chrome cutting off after 15s)
      const resumeInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
    this.currentUtterance = null;
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  public isSpeaking(): boolean {
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
