'use server';

/**
 * @fileOverview A flow to analyze journal entries and suggest activities.
 *
 * - analyzeJournalEntry - A function that handles the journal entry analysis and suggestion process.
 * - AnalyzeJournalEntryInput - The input type for the analyzeJournalEntry function.
 * - AnalyzeJournalEntryOutput - The return type for the analyzeJournalEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeJournalEntryInputSchema = z.object({
  journalEntry: z.string().optional().describe('The journal entry to analyze.'),
  mood: z.string().describe('The current mood of the user (e.g., happy, sad, anxious).'),
  userRole: z.string().describe('The primary role of the user (e.g., student, teacher, employee).'),
});
export type AnalyzeJournalEntryInput = z.infer<typeof AnalyzeJournalEntryInputSchema>;


const AnalysisSchema = z.object({
  feedbackSummary: z.string().describe('A short feedback summary of the journal entry.'),
  emotionalTags: z.array(z.string()).describe('A list of emotional tags identified in the journal entry.'),
});
export type Analysis = z.infer<typeof AnalysisSchema>;


const ActivitySchema = z.object({
    name: z.string().describe('The name of the activity, e.g., "5-Minute Guided Meditation", "Watch a comforting movie", "Browse calming images".'),
    description: z.string().describe('A short, encouraging description of the activity and why it might be helpful.'),
    icon: z.string().describe(`A single, relevant lucide-react icon name for the activity. Choose from this specific list: 'BookOpen', 'Wind', 'Music', 'PenSquare', 'StretchVertical', 'Sparkles', 'Coffee', 'Film', 'Smile', 'Leaf', 'Heart', 'Gamepad2', 'Brain', 'Clock', 'Users', 'Brush', 'Image'`),
    type: z.enum(['music', 'movement', 'game', 'mindfulness', 'creative', 'social', 'movie', 'pinterest']).describe("The category of the activity."),
    duration: z.number().optional().describe("The duration for timer-based activities in seconds (e.g., 300 for 5 minutes)."),
    details: z.string().optional().describe("Specific details for the activity. For 'music' type, provide a YouTube playlist idea. For 'game' type, provide simple game instructions. For 'movie' type, provide the movie title. For 'pinterest' type, provide a search query for calming images.")
});

const SuggestionsSchema = z.object({
  activities: z.array(ActivitySchema).describe('A list of suggested self-care activities.'),
  reasoning: z.string().describe('The AI reasoning behind suggesting these activities.'),
});
export type Suggestions = z.infer<typeof SuggestionsSchema>;


const AnalyzeJournalEntryOutputSchema = z.object({
  analysis: AnalysisSchema.optional(),
  suggestions: SuggestionsSchema,
  isFallback: z.boolean().optional().describe('Indicates if the response is a fallback due to system overload.'),
});
export type AnalyzeJournalEntryOutput = z.infer<typeof AnalyzeJournalEntryOutputSchema>;

const fallbackResponse: AnalyzeJournalEntryOutput = {
    analysis: {
        feedbackSummary: "Our AI is currently processing a high volume of entries. While it's catching up, know that taking the time to write down your thoughts is a valuable step in itself.",
        emotionalTags: ["reflection", "self-awareness"],
    },
    suggestions: {
      reasoning: "We're experiencing high demand for AI suggestions right now. Here are a few popular activities to get you started while we catch up!",
      activities: [
        { name: "2-minute Box Breathing", description: "A simple breathing exercise to calm your nervous system.", icon: "Wind", type: "mindfulness", duration: 120 },
        { name: "Quick Desk Stretch", description: "Relieve tension in your neck and shoulders.", icon: "StretchVertical", type: "movement", duration: 180 },
        { name: "Listen to a calming playlist", description: "Music is a powerful tool for shifting your mood.", icon: "Music", type: "music", details: "Calm instrumental music" }
      ],
    },
    isFallback: true,
};

export async function analyzeJournalEntry(input: AnalyzeJournalEntryInput): Promise<AnalyzeJournalEntryOutput> {
  return analyzeJournalEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAndSuggestPrompt',
  input: {schema: AnalyzeJournalEntryInputSchema},
  output: {schema: AnalyzeJournalEntryOutputSchema},
  prompt: `You are a mental wellness coach. A user with the role '{{{userRole}}}' is feeling '{{{mood}}}'.
{{#if journalEntry}}
The user has written the following journal entry:
---
{{{journalEntry}}}
---

Based on all this information, perform two tasks:

1.  **Analyze the Journal Entry**: Provide a short feedback summary (1-2 sentences) and a list of emotional tags. This goes in the 'analysis' object.

2.  **Suggest Personalized Self-Care Activities**: Suggest a list of 3 personalized self-care activities. Tailor these suggestions based on their role, mood, and journal content. Also provide your reasoning. This goes in the 'suggestions' object.
{{else}}
Based on the user's role and mood, perform one task:

1.  **Suggest Personalized Self-Care Activities**: Suggest a list of 3 personalized self-care activities. Also provide your reasoning. This goes in the 'suggestions' object.
{{/if}}

For all suggestions, tailor them based on the user's role:
- If the user is a 'student', suggest activities for focus, stress management, and effective study breaks.
- If the user is a 'teacher', suggest activities for unwinding, managing classroom stress, and work-life balance.
- For other roles ('employee', 'business owner', 'other'), focus on workplace well-being, like desk-based stretches or mindfulness breaks.

For each suggested activity, provide:
- 'name': Descriptive name.
- 'type': 'music', 'movement', 'game', 'mindfulness', 'creative', 'social', 'movie', or 'pinterest'.
- 'description': Short, encouraging description.
- 'icon': A relevant icon from this list: 'BookOpen', 'Wind', 'Music', 'PenSquare', 'StretchVertical', 'Sparkles', 'Coffee', 'Film', 'Smile', 'Leaf', 'Heart', 'Gamepad2', 'Brain', 'Clock', 'Users', 'Brush', 'Image'.
- 'duration' (optional, in seconds): For 'movement' or 'mindfulness' types.
- 'details' (optional): For 'music' type, provide a YouTube playlist idea. For 'game', give simple game instructions. For 'movie', provide a movie title. For 'pinterest', provide a Pinterest search query for calming images (e.g., "calm nature photography").

Your entire response must be a single JSON object.
{{#if journalEntry}}
The JSON object must contain the 'analysis' and 'suggestions' properties.
{{else}}
The JSON object must contain only the 'suggestions' property.
{{/if}}
`,
});

const analyzeJournalEntryFlow = ai.defineFlow(
  {
    name: 'analyzeJournalEntryFlow',
    inputSchema: AnalyzeJournalEntryInputSchema,
    outputSchema: AnalyzeJournalEntryOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        return output!;
    } catch (e) {
        console.error("Error in analyzeJournalEntryFlow, returning fallback.", e);
        return fallbackResponse;
    }
  }
);
