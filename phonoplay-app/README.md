# PhonoPlay

PhonoPlay is a web-based phonics learning tool for 3–6 year olds. It helps children practice specific phonetic sounds through a simple, engaging interface that combines visual cues, audio playback, and voice feedback.

## Features

- Interactive phoneme selection
- Word practice with visual aids
- Speech recognition for pronunciation practice
- Adaptive learning with AI-powered feedback
- Progress tracking

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Storage, PostgreSQL)
- **AI Services**: OpenAI (GPT-4, Whisper), ElevenLabs (TTS)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase account
- OpenAI API key
- ElevenLabs API key (optional for TTS)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd phonoplay-backend/phonoplay-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                  # App router pages
├── components/           # Reusable UI components
├── lib/                  # Utility functions and API clients
├── public/               # Static assets
│   └── img/              # Word images
├── styles/               # Global styles
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
