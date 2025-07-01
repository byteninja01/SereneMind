'use server';

/**
 * @fileOverview A flow to generate a personalized daily routine for the user.
 *
 * - generateDailyRoutine - A function that handles the routine generation process.
 * - GenerateDailyRoutineInput - The input type for the generateDailyRoutine function.
 * - GenerateDailyRoutineOutput - The return type for the generateDailyRoutine function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyRoutineInputSchema = z.object({
  userRole: z
    .string()
    .describe(
      'The primary role of the user (e.g., student, teacher, employee).'
    ),
});
export type GenerateDailyRoutineInput = z.infer<
  typeof GenerateDailyRoutineInputSchema
>;

const RoutineItemSchema = z.object({
  time: z
    .string()
    .describe('The time for the routine item, e.g., "6:00 AM - 7:00 AM".'),
  activity: z
    .string()
    .describe('The name of the activity, e.g., "Mindful Morning Routine".'),
  description: z.string().describe('A short description of the activity.'),
  icon: z
    .string()
    .describe(
      "A single, relevant lucide-react icon name for the activity. Choose from: 'Sunrise', 'Coffee', 'BrainCircuit', 'BedDouble', 'BookOpen', 'Dumbbell', 'Salad', 'Briefcase', 'DraftingCompass'"
    ),
});

const GenerateDailyRoutineOutputSchema = z.object({
  routine: z
    .array(RoutineItemSchema)
    .describe('A list of personalized daily routine activities.'),
  title: z
    .string()
    .describe(
      "A catchy title for the routine, e.g., 'A Balanced Day for a Teacher'."
    ),
  isFallback: z.boolean().optional().describe('Indicates if the response is a fallback due to system overload.'),
});
export type GenerateDailyRoutineOutput = z.infer<
  typeof GenerateDailyRoutineOutputSchema
>;

const fallbackRoutine: GenerateDailyRoutineOutput = {
  title: "A Gentle Daily Flow (Sample)",
  routine: [
    { time: "7:00 AM - 7:30 AM", activity: "Mindful Morning", description: "Start your day with 10 minutes of meditation or stretching.", icon: "Sunrise" },
    { time: "8:00 AM - 8:30 AM", activity: "Nourishing Breakfast", description: "Enjoy a healthy breakfast to fuel your body and mind.", icon: "Salad" },
    { time: "12:00 PM - 1:00 PM", activity: "Mindful Lunch Break", description: "Step away from your desk and eat without distractions.", icon: "Coffee" },
    { time: "3:00 PM - 3:15 PM", activity: "Quick Recharge", description: "Take a short walk or do some simple stretches to reset.", icon: "Dumbbell" },
    { time: "8:00 PM - 9:00 PM", activity: "Unwind Hour", description: "Read a book, listen to calming music, or do something creative.", icon: "BookOpen" },
  ],
  isFallback: true,
};

export async function generateDailyRoutine(
  input: GenerateDailyRoutineInput
): Promise<GenerateDailyRoutineOutput> {
  return generateDailyRoutineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyRoutinePrompt',
  input: {schema: GenerateDailyRoutineInputSchema},
  output: {schema: GenerateDailyRoutineOutputSchema},
  prompt: `You are a productivity and wellness coach. Create a personalized daily routine for a user with the role of {{{userRole}}}.
    
    The routine should be balanced, including time for work/study, breaks, meals, exercise, and relaxation.
    
    For a 'student', focus on structured study blocks, memory-boosting breaks, and stress-reducing evening activities.
    For a 'teacher', focus on de-stressing after school, managing energy levels, and activities to switch off from work.
    For an 'employee' or 'business owner', suggest routines that promote work-life balance, combat sedentary behavior, and include networking or skill development.
    
    Generate a list of about 5-7 routine items for a typical weekday.
    For each item, provide:
    1. A 'time' slot (e.g., "7:00 AM - 8:00 AM").
    2. A short, engaging 'activity' name.
    3. A brief 'description' of the activity.
    4. A relevant 'icon' name from this specific list: 'Sunrise', 'Coffee', 'BrainCircuit', 'BedDouble', 'BookOpen', 'Dumbbell', 'Salad', 'Briefcase', 'DraftingCompass'.
    5. A catchy 'title' for the whole routine.
    `,
});

const generateDailyRoutineFlow = ai.defineFlow(
  {
    name: 'generateDailyRoutineFlow',
    inputSchema: GenerateDailyRoutineInputSchema,
    outputSchema: GenerateDailyRoutineOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        return output!;
    } catch (e) {
        console.error("Error in generateDailyRoutineFlow, returning fallback.", e);
        return fallbackRoutine;
    }
  }
);
