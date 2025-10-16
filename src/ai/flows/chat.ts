'use server';
/**
 * @fileOverview A conversational AI flow.
 *
 * - chat - A function that handles a single turn of a conversation.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s message.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
    response: z.string().describe("The AI's response."),
    isFallback: z.boolean().optional().describe('Indicates if the response is a fallback due to system overload.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const fallbackResponse: ChatOutput = {
    response: "My circuits are a bit busy at the moment! I'm still here to listen, but my AI responses are on a short break. Please try again in a moment.",
    isFallback: true,
};

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    try {
        const llmResponse = await ai.generate({
            prompt: `You are MIndLink, a friendly and supportive AI companion. Your goal is to have a pleasant and encouraging conversation with the user. Keep your responses concise and helpful.

User message: ${input.message}
`,
            model: 'gemini-pro',
            output: {
                schema: ChatOutputSchema
            }
        });
        
        return llmResponse.output()!;

    } catch (e) {
        console.error("Error in chatFlow, returning fallback.", e);
        return fallbackResponse;
    }
  }
);
