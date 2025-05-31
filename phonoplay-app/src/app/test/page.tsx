// app/test/page.tsx
import { WordCard } from '@/components/words/WordCard';

const testWords = [
  { word: 'apple', phonemes: ['a', 'p', 'l'] },
  { word: 'cat', phonemes: ['k', 'a', 't'] },
  { word: 'dog', phonemes: ['d', 'o', 'g'] },
  { word: 'fish', phonemes: ['f', 'i', 'sh'] },
  { word: 'house', phonemes: ['h', 'ou', 's'] },
  { word: 'tree', phonemes: ['t', 'r', 'ee'] },
  { word: 'sun', phonemes: ['s', 'u', 'n'] },
  { word: 'moon', phonemes: ['m', 'oo', 'n'] },
];

export default function TestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Word Images Test</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {testWords.map((item, index) => (
          <WordCard 
            key={index}
            word={item.word}
            phonemes={item.phonemes}
            className="hover:shadow-md transition-shadow"
          />
        ))}
      </div>
    </div>
  );
}