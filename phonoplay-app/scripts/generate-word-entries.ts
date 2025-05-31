import { writeFileSync } from 'fs';
import { join } from 'path';

// Sample word entries with image paths
const wordEntries = [
  {
    "word": "cat",
    "phonemes": ["k", "a", "t"],
    "image_path": "/img/cat.jpg"
  },
  {
    "word": "dog",
    "phonemes": ["d", "o", "g"],
    "image_path": "/img/dog.jpg"
  },
  {
    "word": "hat",
    "phonemes": ["h", "a", "t"],
    "image_path": "/img/hat.jpg"
  },
  {
    "word": "bat",
    "phonemes": ["b", "a", "t"],
    "image_path": "/img/bat.jpg"
  },
  {
    "word": "rat",
    "phonemes": ["r", "a", "t"],
    "image_path": "/img/rat.jpg"
  }
];

// Write to file
const outputPath = join(__dirname, '../../wordEntries.json');
writeFileSync(outputPath, JSON.stringify(wordEntries, null, 2));

console.log(`✅ Generated word entries file at: ${outputPath}`);
