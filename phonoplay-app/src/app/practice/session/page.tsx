"use client";
// Practice Session Screen
// This page displays words one at a time for practice, with navigation and (future) recording.

import React, { useState } from 'react';
import { allWords, Word } from '@/lib/word-utils';
import { WordCard } from '@/components/words/WordCard';

export default function PracticeSessionPage() {
  // --- All hooks at the top! ---
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionWords, setSessionWords] = useState<Word[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [childName] = useState('Alex'); // Only declare once, at the top
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const convaiRef = React.useRef<any>(null); // Only declare once, at the top

  // Dynamically load the ElevenLabs Convai script once
  React.useEffect(() => {
    if (!document.getElementById('elevenlabs-convai-script')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      script.id = 'elevenlabs-convai-script';
      document.body.appendChild(script);
    }
  }, []);

  // Update widget attributes whenever word or childName changes
  // (displayWord is defined after early returns, so we will handle this in the main render logic)

  // useEffect: Load session words from localStorage
  React.useEffect(() => {
    try {
      const data = window.localStorage.getItem('phonoplay-session-words');
      if (data) {
        setSessionWords(JSON.parse(data));
      } else {
        setError('No practice session found. Please start a new session.');
      }
    } catch (e) {
      setError('Failed to load session words.');
    }
  }, []);

  // If error, show message
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  // If not loaded yet, show loading
  if (!sessionWords) {
    return <div className="p-6 text-center">Loading session...</div>;
  }

  const total = sessionWords?.length || 0;
  const currentWord = sessionWords ? sessionWords[currentIdx] : undefined;
  // Defensive: fallback if LLMWordEntry fields are missing
  // Use optional chaining and fallback for missing properties
  const displayWord = currentWord ? ((currentWord as any).word || (currentWord as any).text || '') : '';
  const displayPhonemes = currentWord ? ((currentWord as any).phonemes || []) : [];
  const displayImagePath = currentWord ? ((currentWord as any).image_path || null) : null;

  // Handlers for navigation
  function goNext() {
    setCurrentIdx((idx) => Math.min(idx + 1, total - 1));
  }
  function goPrev() {
    setCurrentIdx((idx) => Math.max(idx - 1, 0));
  }


  // Play TTS audio for the current word
  async function handleReplay() {
    setAudioLoading(true);
    setAudioError(null);
    setAudioUrl(null);
    try {
      const res = await fetch('/api/tts-elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: displayWord }),
      });
      const data = await res.json();
      if (data.audio_url) {
        setAudioUrl(data.audio_url);
      } else {
        setAudioError('No audio returned.');
      }
    } catch (e) {
      setAudioError('Failed to fetch audio.');
    } finally {
      setAudioLoading(false);
    }
  }

  // Start or stop recording when button is clicked
  async function handleRecord() {
    setRecordError(null);
    if (!isRecording) {
      // Start recording
      try {
        // Ask for microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Create a MediaRecorder instance
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        // When data is available, push it to our array
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        // When recording stops, create a URL for playback
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setRecordedUrl(url);
        };
        // Start recording!
        mediaRecorder.start();
        setIsRecording(true);
        setRecordedUrl(null); // Clear previous recording
      } catch (err) {
        setRecordError('Could not access microphone. Please allow permission.');
      }
    } else {
      // Stop recording
      const mediaRecorder = mediaRecorderRef.current;
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      setIsRecording(false);
    }
  }

  // If finished all words, show session complete
  if (currentIdx >= total) {
    return <div className="p-6 text-center text-green-700 font-bold">Session Complete! 🎉</div>;
  }

  if (!currentWord) {
    return <div className="p-6 text-center">No words available for practice.</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full flex justify-between items-center px-8 pt-4">
        <div />
        {/* Placeholder for user avatar/menu */}
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">?</span>
        </div>
      </div>
      <div className="flex flex-col items-center mt-2 mb-8 w-full">
        <div className="mb-3 mt-2 text-2xl font-bold text-gray-800 text-center">Practice Time!</div>
        <div className="bg-gray-50 rounded-3xl shadow-lg px-10 py-10 flex flex-col items-center w-full max-w-2xl">
          <div className="text-2xl font-bold text-gray-700 text-center mb-2" style={{ letterSpacing: 1 }}>{displayWord}</div>
          <div className="flex flex-col items-center mb-6">
            {displayImagePath && (
              <img
                src={displayImagePath}
                alt={displayWord}
                className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-md mb-2"
              />
            )}
          </div>
          <div className="flex items-center justify-center gap-6 mb-6">
            {/* Record Button */}
            <button
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow transition-all duration-150
                ${isRecording ? 'bg-pink-500 animate-pulse' : 'bg-pink-400 hover:bg-pink-500'}`}
              onClick={handleRecord}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              <span className="material-icons">{isRecording ? 'stop' : 'mic'}</span>
            </button>
            {/* Repeat/Play Button */}
            <button
              className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 text-2xl shadow"
              onClick={handleReplay}
              aria-label="Play word audio"
              disabled={audioLoading}
            >
              <span className="material-icons">volume_up</span>
            </button>
          </div>
          {/* Feedback Checkmark or Error */}
          <div className="flex flex-col items-center mb-4">
            {recordedUrl && !isRecording && (
              <span className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-4xl mb-2">
                ✓
              </span>
            )}
            {recordError && (
              <span className="text-red-500 text-sm mb-2">{recordError}</span>
            )}
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-6">
            <div
              className="h-full bg-pink-400 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
            ></div>
          </div>
          {/* Navigation Buttons */}
          <div className="flex justify-between w-full mt-4 gap-4">
            <button
              className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium text-base shadow disabled:opacity-60"
              onClick={goPrev}
              disabled={currentIdx === 0}
            >
              ← Back
            </button>
            <button
              className="px-6 py-3 rounded-lg bg-pink-600 text-white font-bold text-base shadow disabled:bg-pink-300 transition-colors"
              onClick={goNext}
              disabled={currentIdx === total - 1}
            >
              Next Word →
            </button>
          </div>
        </div>
        {/* ElevenLabs Convai Widget for conversational feedback */}
        <div className="w-full flex flex-col items-center my-4">
          <div>
            <elevenlabs-convai
              ref={convaiRef}
              agent-id="agent_01jwkam9bke6msyrfezbhhbpf7"
              dynamic-variables={JSON.stringify({ word: displayWord, child_name: childName })}
              context={`Help ${childName} pronounce the word \"${displayWord}\". Listen and give friendly feedback. If the child struggles, guide them with encouragement and tips.`}
            ></elevenlabs-convai>
          </div>
        </div>
      </div>
      {/* Audio playback for recorded audio */}
      {recordedUrl && !isRecording && (
        <audio src={recordedUrl} controls className="mt-2" />
      )}
      {/* TTS playback (hidden, just triggers when needed) */}
      {audioUrl && <audio src={audioUrl} autoPlay onEnded={() => setAudioUrl(null)} />}
    </main>
  );
}

// ---
// Explanations:
// - Uses React state to track current word index
// - Uses WordCard to display the word and image
// - Navigation buttons let you move through the list
// - Record button is a stub for now
// - Feedback area is a placeholder
//
// Next: connect to word selection, implement audio recording, and add feedback logic
