import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-journal-entry.ts';
import '@/ai/flows/suggest-self-care-activities.ts';
import '@/ai/flows/chat.ts';
import '@/ai/flows/generate-daily-routine.ts';
