import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({
      apiVersion: "v1beta"
  })],
  model: googleAI('gemini-1.5-flash-latest'),
});
