// A simple mapping from common example words to emojis for phoneme display
export const EXAMPLE_EMOJI_MAP: Record<string, string> = {
  apple: '🍎',
  bed: '🛏️',
  pig: '🐷',
  hot: '🔥',
  cup: '☕',
  cake: '🍰',
  feet: '🦶',
  kite: '🪁',
  boat: '⛵',
  unicorn: '🦄',
  bat: '🦇',
  cat: '🐱',
  dog: '🐶',
  fish: '🐟',
  goat: '🐐',
  hat: '🎩',
  jam: '🍓',
  kite2: '🪁',
  lamp: '💡',
  man: '👨',
  net: '🕸️',
  pig2: '🐷',
  queen: '👑',
  rat: '🐀',
  sun: '☀️',
  top: '🔝',
  van: '🚐',
  wet: '💧',
  box: '📦',
  yes: '👍',
  zoo: '🦓',
  chip: '🍟',
  ship: '🚢',
  thin: '🦷',
  this: '👉',
  whale: '🐋',
  phone: '📱',
  ring: '💍',
  blue: '💙',
  clap: '👏',
  flag: '🏳️',
  glue: '🧴',
  plant: '🪴',
  brick: '🧱',
  crab: '🦀',
  drum: '🥁',
  frog: '🐸',
  green: '🟩',
  prize: '🏆',
  tree: '🌳',
  skate: '⛸️',
  slide: '🛝',
  smile: '😄',
  snow: '❄️',
  spoon: '🥄',
  star: '⭐',
  swim: '🏊',
  twin: '👯',
};

export function getEmojiForExample(example: string) {
  if (!example) return '🔤';
  // Try exact match first
  if (EXAMPLE_EMOJI_MAP[example.toLowerCase()]) return EXAMPLE_EMOJI_MAP[example.toLowerCase()];
  // Try first letter as emoji fallback
  const letter = example[0].toLowerCase();
  const alphabetEmoji: Record<string, string> = {
    a: '🅰️', b: '🅱️', c: '🌜', d: '🌛', e: '📧', f: '🎏', g: '🌀', h: '♓', i: '🎐', j: '🎷', k: '🎋', l: '👢', m: '〽️', n: '🎶', o: '⚽', p: '🅿️', q: '🍳', r: '🌱', s: '💲', t: '🌴', u: '⛎', v: '✅', w: '🔱', x: '❌', y: '🍸', z: '💤',
  };
  return alphabetEmoji[letter] || '🔤';
}
