/**
 * Speech Service - Text-to-Speech using Web Speech API
 * 
 * Free, built into all modern browsers!
 * Reads AI explanations aloud for a more immersive experience.
 */

class SpeechService {
  private synthesis: SpeechSynthesis;
  private enabled: boolean = true;
  private voice: SpeechSynthesisVoice | null = null;
  private rate: number = 1.0;
  private pitch: number = 1.0;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadPreferredVoice();
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
}

// Singleton instance
export const speechService = new SpeechService();

