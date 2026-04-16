import { Mic, MicOff, RotateCcw, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useState, useEffect, useRef } from 'react';

interface RecordingPanelProps {
  onTranscriptChange: (transcript: string) => void;
}

export function RecordingPanel({ onTranscriptChange }: RecordingPanelProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isSupported
  } = useSpeechRecognition();

  // Local state for editable transcript
  const [editableText, setEditableText] = useState('');
  const lastTranscriptRef = useRef('');

  // Update editable text when speech recognition provides new transcript
  useEffect(() => {
    const currentTranscript = transcript + interimTranscript;
    
    // Only update if speech recognition has new content
    if (currentTranscript !== lastTranscriptRef.current) {
      // If we have new speech content, append it to existing text
      if (transcript && transcript !== lastTranscriptRef.current.replace(interimTranscript, '')) {
        const newSpeechOnly = transcript.replace(lastTranscriptRef.current.replace(interimTranscript, ''), '');
        setEditableText(prev => {
          const updated = prev + newSpeechOnly;
          onTranscriptChange(updated);
          return updated;
        });
      } else if (currentTranscript && !editableText) {
        // Initial population
        setEditableText(currentTranscript);
        onTranscriptChange(currentTranscript);
      }
      lastTranscriptRef.current = currentTranscript;
    }
  }, [transcript, interimTranscript]);

  // Handle manual text editing
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditableText(newText);
    onTranscriptChange(newText);
    
    // Update ref to prevent speech from overriding manual edits
    lastTranscriptRef.current = transcript + interimTranscript;
  };

  // Update parent component with transcript
  const handleReset = () => {
    resetTranscript();
    setEditableText('');
    lastTranscriptRef.current = '';
    onTranscriptChange('');
  };

  if (!isSupported) {
    return (
      <div className="visual-card p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Browser Not Supported
        </h3>
        <p className="text-gray-600 mb-4">
          {error}
        </p>
        <p className="text-sm text-gray-500">
          Please use Google Chrome, Microsoft Edge, or Safari for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className="visual-card p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Recorder</h2>
          <p className="text-gray-500 mt-1">
            Click the button below to start recording your meeting
          </p>
        </div>
        {isListening && (
          <div className="flex items-center gap-2 text-red-500">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm font-medium">Recording</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && !isListening && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Main Control */}
      <div className="flex flex-col items-center gap-6">
        {/* Record Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`
            relative w-24 h-24 rounded-full flex items-center justify-center
            transition-all duration-300 ease-out
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 recording-pulse' 
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30'
            }
          `}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>

        {/* Recording Status */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            {isListening ? 'Recording in Progress' : 'Ready to Record'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {isListening 
              ? 'Click the button to stop recording' 
              : 'Click the button to start recording your meeting'
            }
          </p>
        </div>

        {/* Wave Animation (only when recording) */}
        {isListening && (
          <div className="wave-animation">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="wave-bar"></div>
            ))}
          </div>
        )}
      </div>

      {/* Transcript Display */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Live Transcript
          </h3>
          {editableText && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
        
        <div className="relative">
          <textarea
            value={editableText}
            onChange={handleTextChange}
            placeholder="Your meeting transcript will appear here... You can also type or edit the text directly."
            className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700 leading-relaxed"
          />
          {isListening && interimTranscript && (
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none bg-gray-50/80 rounded px-2">
              <span className="text-indigo-500 italic">Listening: {interimTranscript}</span>
            </div>
          )}
        </div>
        
        {/* Character Count */}
        <div className="flex justify-end mt-2">
          <span className={`text-xs ${editableText.length > 100 ? 'text-gray-600' : 'text-gray-400'}`}>
            {editableText.length} characters
          </span>
        </div>
      </div>
    </div>
  );
}
