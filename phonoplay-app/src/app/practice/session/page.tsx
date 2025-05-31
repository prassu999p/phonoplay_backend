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
    <main className="max-w-xl mx-auto p-4 flex flex-col items-center">
      <div className="mb-2 text-gray-500 text-sm">
        Word {currentIdx + 1} of {total}
      </div>
      {/* Use correct fields from LLMWordEntry for WordCard, including image_path */}
      <WordCard word={displayWord} phonemes={displayPhonemes} image_path={displayImagePath} />

      {/* ElevenLabs Convai Widget for conversational feedback */}
      <div className="w-full flex flex-col items-center my-4">
        <div>
          <elevenlabs-convai
            ref={convaiRef}
            agent-id="agent_01jwkam9bke6msyrfezbhhbpf7"
            dynamic-variables={JSON.stringify({ word: displayWord, child_name: childName })}
            context={`Help ${childName} pronounce the word "${displayWord}". Listen and give friendly feedback.`}
          ></elevenlabs-convai>
        </div>
      </div>

      <div className="flex gap-2 my-4">
        <button
          className="px-4 py-2 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          onClick={goPrev}
          disabled={currentIdx === 0}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:bg-blue-300"
          onClick={goNext}
          disabled={currentIdx === total - 1}
        >
          Next
        </button>
      </div>
      {/* Replay Button for TTS */}
      <button
        className="px-6 py-3 rounded bg-purple-600 text-white font-bold mt-2"
        onClick={handleReplay}
        disabled={audioLoading}
      >
        {audioLoading ? 'Loading...' : 'Replay'}
      </button>
      {/* Audio player and error state */}
      {audioUrl && (
        <audio src={audioUrl} controls autoPlay className="mt-2" />
      )}
      {audioError && (
        <div className="mt-2 text-red-500">{audioError}</div>
      )}
      <button
        className={`px-6 py-3 rounded font-bold mt-2 ${isRecording ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
        onClick={handleRecord}
      >
        {isRecording ? 'Stop' : 'Record'}
      </button>
      {/* Show playback for the user's recording */}
      {recordedUrl && (
        <audio src={recordedUrl} controls className="mt-2" />
      )}
      {/* Show error if recording fails */}
      {recordError && (
        <div className="mt-2 text-red-500">{recordError}</div>
      )}
      <div className="mt-4 text-gray-400">
        {/* Placeholder for feedback */}
        Feedback will appear here after you record.
      </div>
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
