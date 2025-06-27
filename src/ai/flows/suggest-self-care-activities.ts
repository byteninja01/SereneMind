'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting personalized self-care activities based on the user's mood and journal content.
 *
 * - suggestSelfCareActivities - A function that suggests self-care activities.
 * - SuggestSelfCareActivitiesInput - The input type for the suggestSelfCareActivities function.
 * - SuggestSelfCareActivitiesOutput - The return type for the suggestSelfCareActivities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSelfCareActivitiesInputSchema = z.object({
  mood: z
    .string()
    .describe('The current mood of the user (e.g., happy, sad, anxious).'),
  journalContent: z
    .string()
    .describe('The content of the user\'s journal entry.'),
});
export type SuggestSelfCareActivitiesInput = z.infer<
  typeof SuggestSelfCareActivitiesInputSchema
>;

const SuggestSelfCareActivitiesOutputSchema = z.object({
  activities: z
    .array(z.string())
    .describe('A list of suggested self-care activities.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind suggesting these activities.'),
});
export type SuggestSelfCareActivitiesOutput = z.infer<
  typeof SuggestSelfCareActivitiesOutputSchema
>;

export async function suggestSelfCareActivities(
  input: SuggestSelfCareActivitiesInput
): Promise<SuggestSelfCareActivitiesOutput> {
  return suggestSelfCareActivitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSelfCareActivitiesPrompt',
  input: {schema: SuggestSelfCareActivitiesInputSchema},
  output: {schema: SuggestSelfCareActivitiesOutputSchema},
  prompt: `Based on the user's current mood: {{{mood}}} and their journal content: {{{journalContent}}},
suggest a list of personalized and time-bound self-care activities. Also, explain the reasoning behind suggesting these activities.
Activities should be fun and promote well-being.
Keep activities time-bound and provide the time in minutes, e.g., meditate for 5 minutes.
`,
});

const suggestSelfCareActivitiesFlow = ai.defineFlow(
  {
    name: 'suggestSelfCareActivitiesFlow',
    inputSchema: SuggestSelfCareActivitiesInputSchema,
    outputSchema: SuggestSelfCareActivitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
