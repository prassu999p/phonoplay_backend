// TypeScript declaration for ElevenLabs Convai custom element

import React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // Define the elevenlabs-convai custom element with its props
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'agent-id': string;
        'dynamic-variables'?: string;
        'context'?: string;
        ref?: React.RefObject<HTMLElement | null>;
      };
    }
  }
}
