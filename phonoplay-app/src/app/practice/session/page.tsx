"use client";
// Practice Session Screen
// This page displays words one at a time for practice, with navigation and (future) recording.

import React, { useState, useRef, useEffect } from 'react';

import { Confetti } from '@/components/ui/confetti';
import { allWords, Word } from '@/lib/word-utils';
import { WordCard } from '@/components/words/WordCard';
import { WordImage } from '@/lib/word-images/WordImageComponent';
import { FiMic, FiStopCircle, FiVolume2 } from 'react-icons/fi';

export default function PracticeSessionPage() {
  const confettiRef = useRef(null);
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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
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

  // Confetti effect on correct answer
  useEffect(() => {
    if (feedback === 'Great job!' && confettiRef.current) {
      // @ts-ignore
      confettiRef.current.fire();
    }
  }, [feedback]);

  const total = sessionWords?.length || 0;
  const currentWord = sessionWords ? sessionWords[currentIdx] : undefined;
  // Defensive: fallback if LLMWordEntry fields are missing
  // Use optional chaining and fallback for missing properties
  const displayWord = currentWord ? ((currentWord as any).word || (currentWord as any).text || '') : '';
  const displayPhonemes = currentWord ? ((currentWord as any).phonemes || []) : [];
  const displayImagePath = currentWord ? ((currentWord as any).image_path || null) : null;

  // Track the latest displayWord to avoid stale closure in callbacks
  const displayWordRef = useRef(displayWord);
  useEffect(() => {
    displayWordRef.current = displayWord;
  }, [displayWord]);

  // Handlers for navigation
  function goNext() {
    setCurrentIdx((idx) => idx + 1); // allow increment past last word to trigger session complete
    setFeedback(null);
    setTranscription(null);
    setRecordedUrl(null);
  }
  function goPrev() {
    setCurrentIdx((idx) => Math.max(idx - 1, 0));
    setFeedback(null);
    setTranscription(null);
    setRecordedUrl(null);
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
        setFeedback(null);
        setTranscription(null);
        setRecordedUrl(null); // Clear previous recording
        // When data is available, push it to our array
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        // When recording stops, create a URL for playback and process feedback
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setRecordedUrl(url);
          // Send to Whisper API
          setFeedback(null);
          setTranscription(null);
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          try {
            const res = await fetch('/api/whisper-transcribe', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            if (data.text) {
              setTranscription(data.text);
              // Improved matching logic for kids: forgiving of punctuation, case, and extra words
              function normalize(str: string) {
                return str
                  .toLowerCase()
                  .replace(/[.,/#!$%^&*;:{}=\-_`~()\?\"]/g, "") // Remove punctuation
                  .replace(/\s{2,}/g, " ") // Remove extra spaces
                  .trim();
              }
              const heard = normalize(data.text);
              const target = normalize(displayWordRef.current);
              if (
                heard === target ||
                heard.includes(target) ||
                target.includes(heard)
              ) {
                setFeedback('Great job!');
              } else {
                setFeedback(`Try again! I heard "${data.text}"`);
              }
            } else {
              setFeedback('Sorry, could not understand. Please try again.');
            }
          } catch (err) {
            setFeedback('Error transcribing audio. Please try again.');
          }
        };
        // Start recording!
        mediaRecorder.start();
        setIsRecording(true);
        // Automatically stop after 3 seconds
        setTimeout(() => {
          if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
          }
        }, 3000);
      } catch (err) {
        setRecordError('Could not access microphone. Please allow permission.');
      }
    } else {
      // Manual stop (should rarely be needed)
      const mediaRecorder = mediaRecorderRef.current;
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    }
  }

  // If finished all words, show session complete
  if (currentIdx >= total) {
    useEffect(() => {
      if (currentIdx >= total && confettiRef.current) {
        // @ts-ignore
        confettiRef.current.fire();
      }
    }, [currentIdx, total]);
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-white">
        <Confetti manualstart ref={confettiRef} className="absolute left-0 top-0 w-full h-full pointer-events-none z-50" />
        <div className="relative z-10 flex flex-col items-center justify-center gap-8 p-8">
          <div className="text-3xl font-extrabold text-green-700 mb-2">Session Complete! 🎉</div>
          <div className="text-lg text-gray-700 mb-4">Great job practicing! You finished the session.</div>
          <button
            className="px-8 py-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xl font-bold shadow-lg transition-all duration-150"
            onClick={() => window.location.href = '/'}
            type="button"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return <div className="p-6 text-center">No words available for practice.</div>;
  }

  return (
    <div className="relative min-h-screen w-full">
      <Confetti ref={confettiRef} manualstart className="absolute left-0 top-0 w-full h-full pointer-events-none z-50" />
      <main className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-full max-w-xl mx-auto flex justify-between items-center px-4 pt-4">
          <div />
          {/* Placeholder for user avatar/menu */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">?</span>
          </div>
        </div>
        <div className="flex flex-col items-center mt-2 mb-8 w-full">
          <div className="mb-3 mt-2 text-2xl font-bold text-gray-800 text-center">Practice Time!</div>
          <div className="bg-gray-50 rounded-3xl shadow-lg px-8 py-10 flex flex-col items-center w-full max-w-xl">
            <div className="text-2xl font-bold text-gray-700 text-center mb-2" style={{ letterSpacing: 1 }}>{displayWord}</div>
            <div className="flex flex-col items-center mb-6 w-full">
              <div className="flex justify-center">
                <WordImage image_path={displayImagePath} word={displayWord} className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-md" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center gap-8 mb-6 w-full">
          {/* Record Button with tooltip */}
          <div className="flex flex-col items-center group">
            <button
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl shadow transition-all duration-150 ${isRecording ? 'bg-pink-500 animate-pulse' : 'bg-pink-400 hover:bg-pink-500'}`}
              onClick={handleRecord}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              type="button"
            >
              {isRecording ? <FiStopCircle /> : <FiMic />}
            </button>
            {/* Tooltip */}
            <span className="mt-1 text-sm text-gray-600 group-hover:text-pink-500 transition-colors duration-150">Record</span>
          </div>
          {/* Play/Listen Button with tooltip */}
          <div className="flex flex-col items-center group">
            <button
              className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 text-3xl shadow"
              onClick={handleReplay}
              aria-label="Play word audio"
              disabled={audioLoading}
              type="button"
            >
              <FiVolume2 />
            </button>
            {/* Tooltip */}
            <span className="mt-1 text-sm text-gray-600 group-hover:text-blue-500 transition-colors duration-150">Listen</span>
          </div>
        </div>
        {/* Feedback Checkmark or Error */}
        <div className="flex flex-col items-center mb-4">
          {feedback && (
            <span className={`w-full flex flex-col items-center mb-2`}>
              {feedback === 'Great job!' ? (
                <span className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-4xl mb-2">✓</span>
              ) : (
                <span className="w-14 h-14 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 text-2xl mb-2">🤔</span>
              )}
              <span className={feedback === 'Great job!' ? 'text-green-600 font-bold' : 'text-yellow-700'}>{feedback}</span>
            </span>
          )}
          {recordError && (
            <span className="text-red-500 text-sm mb-2">{recordError}</span>
          )}
        </div>
        {/* Progress Bar */}
        <div className="w-full max-w-xl mx-auto h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-pink-400 transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
          />
        </div>
        {/* Navigation Buttons */}
        <div className="flex justify-between w-full mt-4 gap-4 max-w-xl mx-auto">
          <button
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium text-base shadow disabled:opacity-60"
            onClick={goPrev}
            disabled={currentIdx === 0}
          >
            ← Back
          </button>
          <button
            className="px-6 py-3 rounded-lg bg-pink-500 text-white font-medium text-base shadow"
            onClick={goNext}
          >
            Next Word →
          </button>
        </div>
      </main>
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
      {/* Audio playback for recorded audio */}
      {recordedUrl && !isRecording && (
        <audio src={recordedUrl} controls className="mt-2" />
      )}
      {/* TTS playback (hidden, just triggers when needed) */}
      {audioUrl && <audio src={audioUrl} autoPlay onEnded={() => setAudioUrl(null)} />}
    </div>
  );
}

// - Navigation buttons let you move through the list
// - Record button is a stub for now
// - Feedback area is a placeholder
//
// Next: connect to word selection, implement audio recording, and add feedback logic
