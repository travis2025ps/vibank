import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  label: string;
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isRecording,
  onToggleRecording,
  label,
  className = '',
}) => {
  return (
    <button
      onClick={onToggleRecording}
      className={`
        relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl
        font-semibold text-lg transition-all duration-200 transform
        ${isRecording 
          ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 scale-105' 
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:scale-105'
        }
        focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
        active:scale-95 ${className}
      `}
      aria-label={label}
      aria-pressed={isRecording}
    >
      {isRecording ? (
        <>
          <MicOff className="w-6 h-6" />
          <span>Recording... (Release Space)</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
        </>
      ) : (
        <>
          <Mic className="w-6 h-6" />
          <span>Press Space to Record</span>
        </>
      )}
    </button>
  );
};