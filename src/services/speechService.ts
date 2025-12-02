/**
 * Speech Service - Text-to-Speech & Speech-to-Text
 * 
 * Free, built into all modern browsers!
 * - Reads AI explanations aloud (Text-to-Speech)
 * - Listens to voice commands (Speech-to-Text)
 */

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

class SpeechService {
  private synthesis: SpeechSynthesis;
  private recognition: SpeechRecognition | null = null;
  private enabled: boolean = true;
  private voice: SpeechSynthesisVoice | null = null;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private isListening: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadPreferredVoice();
    this.initRecognition();
  }

  /**
   * Initialize speech recognition
   */
  private initRecognition(): void {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      console.log('🎤 Speech recognition available');
    } else {
      console.warn('🎤 Speech recognition not supported in this browser');
    }
  }

  /**
   * Load a good English voice (prefer natural-sounding ones)
   */
  private loadPreferredVoice(): void {
    const loadVoices = () => {
      const voices = this.synthesis.getVoices();
      
      // Prefer these voices (natural sounding)
      const preferredVoices = [
        'Google UK English Female',
        'Google US English',
        'Microsoft Zira',
        'Samantha',
        'Alex',
      ];
      
      for (const preferred of preferredVoices) {
        const found = voices.find(v => v.name.includes(preferred));
        if (found) {
          this.voice = found;
          console.log(`🔊 Using voice: ${found.name}`);
          return;
        }
      }
      
      // Fallback to first English voice
      const englishVoice = voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) {
        this.voice = englishVoice;
        console.log(`🔊 Using voice: ${englishVoice.name}`);
      }
    };

    // Voices may load asynchronously
    if (this.synthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      this.synthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Speak text aloud
   */
  speak(text: string, onEnd?: () => void): void {
    if (!this.enabled || !text) return;

    // Stop any current speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = 1.0;

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.warn('Speech error:', event.error);
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Speak an annotation (title + explanation + fun fact)
   */
  speakAnnotation(annotation: {
    title: string;
    explanation: string;
    funFact?: string;
  }): void {
    const text = `${annotation.title}. ${annotation.explanation}. ${annotation.funFact ? `Fun fact: ${annotation.funFact}` : ''}`;
    this.speak(text);
  }

  /**
   * Stop speaking
   */
  stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  /**
   * Toggle speech on/off
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    console.log(`🔊 Speech ${this.enabled ? 'enabled' : 'disabled'}`);
    return this.enabled;
  }

  /**
   * Enable/disable speech
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Check if speech is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set speech rate (0.5 to 2.0)
   */
  setRate(rate: number): void {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices().filter(v => v.lang.startsWith('en'));
  }

  /**
   * Set voice by name
   */
  setVoice(name: string): void {
    const voice = this.synthesis.getVoices().find(v => v.name === name);
    if (voice) {
      this.voice = voice;
      console.log(`🔊 Voice changed to: ${name}`);
    }
  }

  // ==================== VOICE INPUT ====================

  /**
   * Check if voice input is supported
   */
  isRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Start listening for voice input
   * Returns a promise that resolves with the spoken text
   */
  listen(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      // CRITICAL: Stop any existing recognition FIRST to prevent overlap
      if (this.isListening) {
        this.recognition.abort();
        this.isListening = false;
        // Wait a tiny bit for cleanup
        setTimeout(() => {
          this.startListening(resolve, reject);
        }, 100);
      } else {
        this.startListening(resolve, reject);
      }
    });
  }

  /**
   * Internal method to start listening
   */
  private startListening(resolve: (text: string) => void, reject: (error: Error) => void): void {
    if (!this.recognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    // Stop any current speech output first
    this.stop();

    // Clear any old handlers
    this.recognition.onresult = null;
    this.recognition.onerror = null;
    this.recognition.onend = null;

    this.isListening = true;
    console.log('🎤 Listening...');

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0];
      if (result && result.isFinal) {
        const transcript = result[0].transcript.trim();
        console.log('🎤 Heard:', transcript);
        this.isListening = false;
        resolve(transcript);
      }
    };

    this.recognition.onerror = (event: Event) => {
      const errorEvent = event as any;
      // Ignore "interrupted" errors - they're normal when stopping
      if (errorEvent.error !== 'aborted' && errorEvent.error !== 'no-speech') {
        console.error('🎤 Error:', errorEvent.error);
      }
      this.isListening = false;
      if (errorEvent.error !== 'aborted') {
        reject(new Error('Speech recognition error'));
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (error) {
      this.isListening = false;
      reject(new Error('Failed to start recognition'));
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

// Singleton instance
export const speechService = new SpeechService();

