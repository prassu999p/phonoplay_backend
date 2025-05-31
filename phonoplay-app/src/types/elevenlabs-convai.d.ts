// TypeScript custom element declaration for ElevenLabs Convai widget
// Place this file anywhere in your project's types directory or root (e.g., src/types/elevenlabs-convai.d.ts)

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'agent-id': string;
        word?: string;
        'dynamic__child_name'?: string;
        context?: string;
      };
    }
  }
}

export {};
