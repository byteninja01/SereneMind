'use server';

/**
 * @fileOverview A flow to analyze journal entries and identify potential mood triggers.
 *
 * - analyzeJournalEntry - A function that handles the journal entry analysis process.
 * - AnalyzeJournalEntryInput - The input type for the analyzeJournalEntry function.
 * - AnalyzeJournalEntryOutput - The return type for the analyzeJournalEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeJournalEntryInputSchema = z.object({
  journalEntry: z
    .string()
    .describe('The journal entry to analyze.'),
});
export type AnalyzeJournalEntryInput = z.infer<typeof AnalyzeJournalEntryInputSchema>;

const AnalyzeJournalEntryOutputSchema = z.object({
  feedbackSummary: z.string().describe('A short feedback summary of the journal entry.'),
  emotionalTags: z.array(z.string()).describe('A list of emotional tags identified in the journal entry.'),
});
export type AnalyzeJournalEntryOutput = z.infer<typeof AnalyzeJournalEntryOutputSchema>;

export async function analyzeJournalEntry(input: AnalyzeJournalEntryInput): Promise<AnalyzeJournalEntryOutput> {
  return analyzeJournalEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeJournalEntryPrompt',
  input: {schema: AnalyzeJournalEntryInputSchema},
  output: {schema: AnalyzeJournalEntryOutputSchema},
  prompt: `Analyze the following journal entry and identify potential mood triggers and provide a short feedback summary and emotional tags.

Journal Entry: {{{journalEntry}}}

Your response should be a JSON object with a feedbackSummary (1-2 sentences) and emotionalTags (array of strings).`,
});

const analyzeJournalEntryFlow = ai.defineFlow(
  {
    name: 'analyzeJournalEntryFlow',
    inputSchema: AnalyzeJournalEntryInputSchema,
    outputSchema: AnalyzeJournalEntryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
