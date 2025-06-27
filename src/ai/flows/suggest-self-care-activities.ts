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

const ActivitySchema = z.object({
    name: z.string().describe('The name of the activity, including the time bound (e.g., "Meditate for 5 minutes").'),
    description: z.string().describe('A short, encouraging description of the activity and why it might be helpful.'),
    icon: z.string().describe(`A single, relevant lucide-react icon name for the activity. Choose from this specific list: 'BookOpen', 'Wind', 'Music', 'PenSquare', 'StretchVertical', 'Sparkles', 'Coffee', 'Film', 'Smile', 'Leaf', 'Heart'`)
});


const SuggestSelfCareActivitiesOutputSchema = z.object({
  activities: z
    .array(ActivitySchema)
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
suggest a list of 3 personalized and time-bound self-care activities. Also, explain the reasoning behind suggesting these activities.
Activities should be fun and promote well-being.
For each activity, provide:
1.  A 'name' that includes a time-bound, e.g., "Meditate for 5 minutes".
2.  A short, encouraging 'description'.
3.  An 'icon' name from this specific list: 'BookOpen', 'Wind', 'Music', 'PenSquare', 'StretchVertical', 'Sparkles', 'Coffee', 'Film', 'Smile', 'Leaf', 'Heart'. Choose the most relevant icon for the activity.
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
