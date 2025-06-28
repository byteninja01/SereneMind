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
    .describe("The content of the user's journal entry."),
  userRole: z
    .string()
    .describe('The primary role of the user (e.g., student, teacher, employee).'),
});
export type SuggestSelfCareActivitiesInput = z.infer<
  typeof SuggestSelfCareActivitiesInputSchema
>;

const ActivitySchema = z.object({
    name: z.string().describe('The name of the activity, e.g., "5-Minute Guided Meditation", "Listen to a calming playlist", "Quick Desk Stretch".'),
    description: z.string().describe('A short, encouraging description of the activity and why it might be helpful.'),
    icon: z.string().describe(`A single, relevant lucide-react icon name for the activity. Choose from this specific list: 'BookOpen', 'Wind', 'Music', 'PenSquare', 'StretchVertical', 'Sparkles', 'Coffee', 'Film', 'Smile', 'Leaf', 'Heart', 'Gamepad2', 'Brain', 'Clock', 'Users', 'Brush'`),
    type: z.enum(['music', 'movement', 'game', 'mindfulness', 'creative', 'social']).describe("The category of the activity."),
    duration: z.number().optional().describe("The duration for timer-based activities in seconds (e.g., movement, mindfulness). For a 5 minute timer, this would be 300."),
    details: z.string().optional().describe("Specific details for the activity. For 'music' type, provide a YouTube playlist idea (e.g., \"Lo-fi beats for studying\"). For 'game' type, provide simple game instructions.")
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
  prompt: `Based on the user's primary role as a {{{userRole}}}, their current mood: {{{mood}}}, and their journal content: {{{journalContent}}},
suggest a list of 3 personalized self-care activities. The activities should be tailored to the user's role. For example, a student might need focus-related activities, while an employee might need desk-based stretches.
Also, explain the reasoning behind suggesting these activities based on their role and mood.
Activities should be fun and promote well-being. Include a mix of activity types: 'music', 'movement', 'game', 'mindfulness', 'creative', 'social'.

For each activity, provide:
1.  A 'name' that is descriptive, e.g., "15-Second Focus Game", "Listen to a Calming Playlist", "Quick Desk Stretch", "2-minute Box Breathing".
2.  A 'type' from the list: 'music', 'movement', 'game', 'mindfulness', 'creative', 'social'.
3.  A short, encouraging 'description' of why it's helpful.
4.  An 'icon' name from this specific list: 'BookOpen', 'Wind', 'Music', 'PenSquare', 'StretchVertical', 'Sparkles', 'Coffee', 'Film', 'Smile', 'Leaf', 'Heart', 'Gamepad2', 'Brain', 'Clock', 'Users', 'Brush'. Choose the most relevant icon.
5.  If the activity is timer-based ('movement', 'mindfulness'), provide a 'duration' in seconds (e.g., 300 for 5 minutes).
6.  If the activity is 'music', provide a YouTube playlist idea in the 'details' field (e.g., "Lo-fi beats for studying", "Upbeat 80s pop classics"). If the activity is 'game', provide simple game instructions in the 'details' field for a clicker-style game. For example: "Click the target as many times as you can in 15 seconds to practice focus." For other types, this field can be omitted.
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
