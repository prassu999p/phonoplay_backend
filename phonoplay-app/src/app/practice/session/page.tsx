"use client";
// Practice Session Screen
// This page displays words one at a time for practice, with navigation and (future) recording.

import * as React from 'react';
// import Image from 'next/image'; // Unused
// import { Button } from '@/components/ui/button'; // Unused
import createClientBrowser from '@/utils/supabase/client';
import { Confetti } from '@/components/ui/confetti';
import { Word } from '@/lib/word-utils'; // allWords removed as unused
// import { WordCard } from '@/components/words/WordCard'; // Unused
import { WordImage } from '@/lib/word-images/WordImageComponent';
import { FiMic, FiStopCircle, FiVolume2 } from 'react-icons/fi';

// We'll use React.createElement for custom elements to avoid TypeScript errors

// Debug function to log important information clearly
function debugLog(message: string, data: unknown) { // Changed data type from any to unknown
  console.log(`%c${message}`, 'background: #222; color: #bada55', data);
}

// Unused PHONEMES, SHORT_VOWELS, LONG_VOWELS definitions removed.

export default function PracticeSessionPage() {
  // State management for practice session
  const [currentWord, setCurrentWord] = React.useState<Word | null>(null);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [sessionWords, setSessionWords] = React.useState<Word[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Audio and recording state
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);

  // Keep currentWord in sync with currentIdx and sessionWords
  React.useEffect(() => {
    if (sessionWords && sessionWords.length > 0) {
      setCurrentWord(sessionWords[currentIdx]);
    }
  }, [currentIdx, sessionWords]);
  const [audioLoading, setAudioLoading] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [audioError, setAudioError] = React.useState<string | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordedUrl, setRecordedUrl] = React.useState<string | null>(null);
  const [recordError, setRecordError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [transcription, setTranscription] = React.useState<string | null>(null);
  
  // Configuration state
  const [sttProvider, setSttProvider] = React.useState<'whisper' | 'elevenlabs'>('elevenlabs');
  const [childName] = React.useState('Alex');
  
  // Refs
  const confettiRef = React.useRef(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const convaiRef = React.useRef<HTMLDivElement | null>(null);

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

  // Computed properties - derived from state
  // These must be declared before the useEffect hooks that use them
  const total = sessionWords?.length || 0;
  const displayWord = currentWord?.word || '';
  // const displayPhonemes = currentWord?.phonemes || []; // displayPhonemes is unused
  const displayImagePath = currentWord?.image_path || null;
  
  // Reference to the latest word for callbacks
  const displayWordRef = React.useRef(displayWord);
  
  // Update ref when displayWord changes
  React.useEffect(() => {
    displayWordRef.current = displayWord;
  }, [displayWord]);
  
  // Create/Update ElevenLabs widget dynamically
  React.useEffect(() => {
    const currentConvaiContainer = convaiRef.current;
    if (!currentConvaiContainer) return; // No container, can't do anything

    let convaiElement = currentConvaiContainer.querySelector('elevenlabs-convai') as HTMLElement | null;

    if (!displayWord) {
      // If no displayWord, ensure the widget is removed if it exists
      if (convaiElement) {
        try {
          currentConvaiContainer.removeChild(convaiElement);
        } catch (error) {
          console.warn("Failed to remove convai widget when displayWord is null:", error);
        }
      }
      return;
    }

    // If widget doesn't exist, create and append it
    if (!convaiElement) {
      convaiElement = document.createElement('elevenlabs-convai');
      // Set agent-id only once during creation, if it's static
      convaiElement.setAttribute('agent-id', 'agent_01jwkam9bke6msyrfezbhhbpf7');
      currentConvaiContainer.appendChild(convaiElement);
    }

    // Always update dynamic variables and context as these can change with the word
    convaiElement.setAttribute('dynamic-variables', JSON.stringify({ word: displayWord, child_name: childName }));
    convaiElement.setAttribute('context', `Help ${childName} pronounce the word "${displayWord}". Listen and give friendly feedback. If the child struggles, guide them with encouragement and tips.`);

    // Cleanup function for component unmount
    return () => {
      // This cleanup will run when the component unmounts.
      // It attempts to remove the widget that might have been managed by this effect.
      // Re-querying inside cleanup for robustness, as `convaiElement` might be stale.
      const elementToRemove = currentConvaiContainer.querySelector('elevenlabs-convai');
      if (elementToRemove) {
        try {
          currentConvaiContainer.removeChild(elementToRemove);
        } catch (error) {
          console.warn("Failed to remove convai widget on component unmount:", error);
        }
      }
    };
  }, [displayWord, childName]); // Re-run if displayWord or childName changes
  
  // Fetch words based on URL parameters
  React.useEffect(() => {
    // Get URL search params
    const params = new URLSearchParams(window.location.search);
    
    async function fetchWords() {
      try {
        setError(null);
        setLoading(true);
        
        // Parse URL parameters
        const selectedPhonemes = params.get('phonemes')?.split(',') || [];
        const selectedCategories = params.get('categories')?.split(',').filter(c => c !== '') || [];
        const selectedSubcategories = params.get('subcategories')?.split(',').filter(c => c !== '') || [];
        
        // Display debug info
        debugLog('URL Parameters:', {
          phonemes: selectedPhonemes,
          categories: selectedCategories,
          subcategories: selectedSubcategories
        });
        
        // Skip if no phonemes selected
        if (!selectedPhonemes.length) {
          setSessionWords([]);
          setLoading(false);
          return;
        }
        
        console.log('Creating Supabase client...');
        // Initialize Supabase client using singleton pattern
        const supabase = createClientBrowser();
        console.log('Supabase client created successfully');
        
        if (!supabase) {
          throw new Error('Failed to initialize Supabase client');
        }

        // IMPORTANT NOTE: The SQL function uses the array overlap operator (&&)
        // which means it returns words that contain ANY of the selected phonemes, not ALL of them.
        // If we need to match ALL phonemes, we would need to filter the results client-side.
        
        // Set up parameters for RPC call
        // Keep phonemes in lowercase to match database format
        const rpcParams = {
          p_limit: 20, // Increased limit to get more results for filtering
          p_phonemes: selectedPhonemes.map((p: string) => p.toUpperCase()),
          p_categories: selectedCategories.length > 0 ? selectedCategories.map((c: string) => c.toUpperCase()) : null,
          p_subcategories: selectedSubcategories.length > 0 ? selectedSubcategories.map((s: string) => s.toUpperCase()) : null
        };
        
        // Call the RPC function and log parameters
        debugLog('Calling Supabase RPC with params:', rpcParams);
        const { data, error } = await supabase.rpc('select_practice_words', rpcParams);
        
        // Log the response status and error (if any)
        debugLog('RPC response:', {
          status: 200,  // Assuming success for now
          error: error,
          dataLength: Array.isArray(data) ? data.length : 0
        });
        
        if (error) {
          throw new Error(`Error fetching words: ${error.message}`);
        }
        
        // Cast data to Word[] to fix TypeScript errors
        const wordsData = data as Word[];
        
        if (!wordsData || wordsData.length === 0) {
          console.log('No words found');
          setSessionWords([]);
          setLoading(false);
          return;
        }
        
        // First, log all the words we got back for debugging
        console.log('Words found from database:', wordsData.map((w: Word) => ({ word: w.word, phonemes: w.phonemes })));
        
        // Optional: Filter results client-side to match ALL phonemes instead of ANY
        // This changes the behavior from the database's ANY match to ALL match
        const filteredData = wordsData.filter((word: Word) => {
          // Check if the word contains ALL selected phonemes (case-insensitive, but DB is uppercase)
          const wordPhonemes = word.phonemes.map((p: string) => p.toUpperCase());
          return selectedPhonemes.every((p: string) => 
            wordPhonemes.includes(p.toUpperCase())
          );
        });
        
        // Log filtered results
        console.log('Filtered words (containing ALL selected phonemes):', 
          filteredData.map((w: Word) => ({ word: w.word, phonemes: w.phonemes }))
        );
        
        // Choose which dataset to use (filtered or original)
        // Uncomment the line below to use ANY phoneme matching (original database behavior)
        // const finalWords = wordsData; 
        
        // Use this for ALL phoneme matching (more restrictive)
        const finalWords = filteredData;
        
        if (finalWords.length === 0) {
          console.log('No words found after filtering');
          setSessionWords([]);
          setLoading(false);
          return;
        }
        
        // Sort so words with images come first
        const sortedWords = finalWords.slice().sort((a, b) => {
          const aHasImage = !!a.image_path && a.image_path.trim() !== '';
          const bHasImage = !!b.image_path && b.image_path.trim() !== '';
          if (aHasImage && !bHasImage) return -1;
          if (!aHasImage && bHasImage) return 1;
          return 0;
        });
        
        // Success - set the words and first word
        setSessionWords(sortedWords);
        setCurrentWord(sortedWords[0]);
        setCurrentIdx(0);
      } catch (err) {
        console.error('Error fetching words:', err);
        setError(`Failed to fetch words: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    // Call the fetchWords function
    fetchWords();
  }, []);  // Empty dependency array to run only once on mount

  // Confetti effect on correct answer
  React.useEffect(() => {
    if (feedback === 'Great job!' && confettiRef.current) {
      // @ts-expect-error TypeScript might not know about the .fire() method on the Confetti component ref
      confettiRef.current.fire();
    }
  }, [feedback]);
  
  // Confetti effect on completing all words
  React.useEffect(() => {
    if (currentIdx >= total && total > 0 && confettiRef.current) {
      // @ts-expect-error TypeScript might not know about the .fire() method on the Confetti component ref
      confettiRef.current.fire();
    }
  }, [currentIdx, total]);
  
  // Update display word reference
  React.useEffect(() => {
    displayWordRef.current = displayWord;
  }, [displayWord]);

  // Handlers for navigation
  function goNext() {
    setCurrentIdx((idx) => idx + 1); 
    setFeedback(null);
    // setTranscription(null); // transcription is unused
    setRecordedUrl(null);
  }
  function goPrev() {
    setCurrentIdx((idx) => Math.max(idx - 1, 0));
    setFeedback(null);
    // setTranscription(null); // transcription is unused
    setRecordedUrl(null);
  }

  // Play TTS audio for the current word
  async function handleReplay() {
    setAudioLoading(true);
    // setAudioError(null); // audioError is unused
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
        // setAudioError('No audio returned.'); 
      }
    } catch {
      // setAudioError('Failed to fetch audio.'); 
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
        // setTranscription(null); // transcription is unused
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
          // Send to selected STT API
          setFeedback(null);
          // setTranscription(null); // transcription is unused
          const formData = new FormData();
          if (sttProvider === 'elevenlabs') {
            formData.append('file', audioBlob, 'recording.webm');
            formData.append('language_code', 'eng');
            formData.append('model_id', 'scribe_v1');
          } else {
            formData.append('audio', audioBlob, 'recording.webm');
          }
          const endpoint = sttProvider === 'elevenlabs'
            ? '/api/elevenlabs-transcribe'
            : '/api/whisper-transcribe';
          try {
            const res = await fetch(endpoint, {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            // ElevenLabs returns 'text', Whisper may return 'text' or 'transcription'
            const transcript = data.text || data.transcription;
            if (transcript) {
              // setTranscription(transcript); // transcription is unused
              // Improved matching logic for kids: forgiving of punctuation, case, and extra words
              function normalize(str: string) {
                return str
                  .toLowerCase()
                  .replace(/[.,/#!$%^&*;:{}=\-_`~()\?\"]/g, "") 
                  .replace(/\s{2,}/g, " ") 
                  .trim();
              }
              const heard = normalize(transcript);
              const target = normalize(displayWordRef.current);
              if (
                heard === target ||
                heard.includes(target) ||
                target.includes(heard)
              ) {
                setFeedback('Great job!');
              } else {
                setFeedback(`Try again! I heard "${transcript}"`);
              }
            } else {
              setFeedback('Sorry, could not understand. Please try again.');
            }
          } catch {
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
      } catch {
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
  if (currentIdx >= total && total > 0) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-white">
        <Confetti ref={confettiRef} manualstart className="absolute left-0 top-0 w-full h-full pointer-events-none z-50" />
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

  // 4. Main Practice UI
  // Ensure currentWord is available before rendering main practice UI
  if (!currentWord) {
    return <div className="p-6 text-center">Loading word...</div>; // Or some other placeholder
  }

  return (
    <div className="relative min-h-screen w-full">
      <Confetti ref={confettiRef} manualstart className="absolute left-0 top-0 w-full h-full pointer-events-none z-50" />
      <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8">
        {/* Display general error if it exists (though handled by early return, good for robustness) */}
        {/* {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>} Already handled by early return */}

        {/* Display audio error if it exists */}
        {audioError && <p className="text-red-500 text-center mb-2">Audio Error: {audioError}</p>}

        <div className="w-full max-w-xl mx-auto flex justify-between items-center pt-4">
          <div /> {/* Placeholder for left side if needed */}
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">?</span> {/* User avatar/menu placeholder */}
          </div>
        </div>

        <div className="flex flex-col items-center mt-2 mb-8 w-full">
          <div className="mb-3 mt-2 text-2xl font-bold text-gray-800 text-center">Practice Time!</div>
          
          {/* Status Messages */}
          {loading && <p className="text-center text-gray-500">Loading words...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && !currentWord && <p className="text-center text-gray-500">No words available. Please select different phonemes.</p>}
          
          {/* STT Provider Toggle */}
          <div className="flex gap-2 items-center mb-4">
            <label htmlFor="stt-provider" className="font-medium text-gray-700">Speech Recognition:</label>
            <select
              id="stt-provider"
              value={sttProvider}
              onChange={e => setSttProvider(e.target.value as 'whisper' | 'elevenlabs')}
              className="border rounded px-2 py-1 text-sm bg-white"
            >
              <option value="elevenlabs">ElevenLabs</option>
              <option value="whisper">Whisper</option>
            </select>
          </div>
          
          <div className="bg-gray-50 rounded-3xl shadow-lg px-8 py-10 flex flex-col items-center w-full max-w-xl">
            {displayImagePath && !displayImagePath.includes('error') ? (
              <div className="bg-gray-50 rounded-3xl shadow-lg px-8 py-10 flex flex-col items-center w-full max-w-xl min-h-[340px]">
                <div className="text-6xl font-bold text-black mb-4 text-center">
                  {displayWord}
                </div>
                <WordImage
                  image_path={displayImagePath}
                  word={displayWord}
                  className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-md mx-auto"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-full max-w-xl min-h-[340px]">
                <div className="text-6xl font-bold text-black text-center w-full">
                  {displayWord}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row items-center justify-center gap-8 mb-6 w-full">
          {/* Record Button */}
          <div className="flex flex-col items-center group">
            <button
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl shadow transition-all duration-150 ${isRecording ? 'bg-pink-500 animate-pulse' : 'bg-pink-400 hover:bg-pink-500'}`}
              onClick={handleRecord}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              type="button"
            >
              {isRecording ? <FiStopCircle /> : <FiMic />}
            </button>
            <span className="mt-1 text-sm text-gray-600 group-hover:text-pink-500 transition-colors duration-150">Record</span>
          </div>
          {/* Play/Listen Button */}
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
            <span className="mt-1 text-sm text-gray-600 group-hover:text-blue-500 transition-colors duration-150">Listen</span>
          </div>
        </div>

        {/* Transcription & Feedback Area */}
        <div className="flex flex-col items-center mb-4 min-h-[60px]"> {/* Added min-height to prevent layout shift */}
          {transcription && <p className="text-gray-600 text-lg mb-1 text-center">I heard: &quot;{transcription}&quot;</p>}
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
            <span className="text-red-500 text-sm mb-2 text-center">{recordError}</span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xl mx-auto h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-pink-400 transition-all duration-500"
            style={{ width: `${total > 0 ? ((currentIdx + 1) / total) * 100 : 0}%` }} // Avoid division by zero
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
            disabled={currentIdx >= total -1 && total > 0} // Disable if it's the last word
          >
            Next Word →
          </button>
        </div>
      </main>

      {/* ElevenLabs Convai Widget for conversational feedback */}
      <div className="w-full flex flex-col items-center my-4">
        <div id="elevenlabs-widget-container" ref={convaiRef}></div>
      </div>

      {/* Audio playback for recorded audio */}
      {recordedUrl && !isRecording && (
        <audio src={recordedUrl || undefined} controls className="mt-2" />
      )}
      {/* TTS playback (hidden, just triggers when needed) */}
      {audioUrl && <audio src={audioUrl || undefined} autoPlay onEnded={() => setAudioUrl(null)} />}
    </div>
  );
}
