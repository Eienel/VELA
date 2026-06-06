'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Microphone, MicrophoneSlash } from '@phosphor-icons/react';

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceButton({ onTranscript, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const autoSubmitTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current);
    };
  }, []);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  };

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled}
      className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors disabled:opacity-40"
      style={{ background: recording ? 'rgba(245,158,11,0.15)' : 'transparent' }}
    >
      {recording && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-[#1D1D1F]"
        />
      )}
      {recording ? (
        <MicrophoneSlash size={20} color="#1D1D1F" weight="fill" />
      ) : (
        <Microphone size={20} color="#71717a" />
      )}
    </button>
  );
}
