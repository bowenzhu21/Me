// src/voice/useVoice.ts
import { useEffect, useRef, useState } from "react";

export type Intent = "DJ" | "GYM" | "HOME" | "UNKNOWN";

// Very forgiving classifier for common phrases/accents/typos
function classifyIntent(text: string): Intent {
  const t = text.toLowerCase().trim();

  // normalize common mishears: "deejay", "d j", "dj project", "smart mixer"
  if (/(^|\b)(d\s*j|dee\s*jay|deejay|dj|music|mix|mixer|rave|smart\s*mixer)(\b|$)/i.test(t)) {
    return "DJ";
  }

  // "gym bro", "jim", "workout", "fitness"
  if (/(^|\b)(gym|jim|workout|fitness|bro|gymbro)(\b|$)/i.test(t)) {
    return "GYM";
  }

  // "bridge", "golden gate", "home", "back"
  if (/(^|\b)(bridge|golden\s*gate|home|back|start|return)(\b|$)/i.test(t)) {
    return "HOME";
  }

  return "UNKNOWN";
}

// Minimal Web Speech API shims to avoid non-standard DOM types
type SpeechRecognitionAlternativeLike = { transcript: string; confidence?: number };
type SpeechRecognitionResultLike = { length: number; [index: number]: SpeechRecognitionAlternativeLike };
type SpeechResultListLike = { length: number; [index: number]: SpeechRecognitionResultLike };
type SpeechRecognitionEventLike = { results: SpeechResultListLike; resultIndex?: number };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop?: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
};
type RecognitionConstructor = new () => SpeechRecognitionLike;

export function useVoice(onIntent: (i: Intent, raw: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    interface WindowWithRecognition {
      webkitSpeechRecognition?: RecognitionConstructor;
      SpeechRecognition?: RecognitionConstructor;
    }
    const { webkitSpeechRecognition, SpeechRecognition: WSR } = window as unknown as WindowWithRecognition;
    const SR: RecognitionConstructor | undefined = webkitSpeechRecognition ?? WSR;

    if (!SR) {
      console.warn("[voice] Web Speech API not available in this browser");
      return;
    }

    const rec: SpeechRecognitionLike = new SR();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e: SpeechRecognitionEventLike) => {
      const idx = e.resultIndex ?? Math.max(0, e.results.length - 1);
      const text = e.results?.[idx]?.[0]?.transcript ?? "";
      console.log("[voice] heard:", text);
      const intent = classifyIntent(text);
      console.log("[voice] intent:", intent);
      onIntent(intent, text);
    };

    rec.onerror = (err: unknown) => {
      console.warn("[voice] error:", err);
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
    };

    recRef.current = rec;
  }, [onIntent]);

  const start = () => {
    if (!recRef.current) return;
    try {
      setListening(true);
      recRef.current.start();
      console.log("[voice] listening…");
    } catch (e) {
      console.warn("[voice] start() error:", e);
      setListening(false);
    }
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return { start, speak, listening };
}
