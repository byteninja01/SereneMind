'use client';

import { useState, useEffect } from 'react';
import { analyzeJournalEntry, type AnalyzeJournalEntryOutput } from '@/ai/flows/analyze-journal-entry';
import { suggestSelfCareActivities, type SuggestSelfCareActivitiesOutput } from '@/ai/flows/suggest-self-care-activities';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { MoodSelector, type Mood } from '@/components/mood-selector';
import { JournalEditor } from '@/components/journal-editor';
import { MoodHistoryChart } from '@/components/mood-history-chart';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { Smile } from 'lucide-react';

export default function Home() {
  const [mood, setMood] = useState<Mood | null>(null);
  const [journal, setJournal] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeJournalEntryOutput | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestSelfCareActivitiesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const messages = [
      "You're doing great just by being here.",
      "Every step, big or small, is progress.",
      "Be kind to yourself today.",
      "Your feelings are valid. Acknowledge them.",
      "Taking time for yourself is productive."
    ];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, []);

  const handleMoodSelect = (selectedMood: Mood) => {
    setMood(selectedMood);
    setJournal('');
    setAnalysis(null);
    setSuggestions(null);
  };

  const handleJournalSubmit = async (journalText: string) => {
    if (!mood) return;

    setIsLoading(true);
    setJournal(journalText);

    try {
      const [analysisResult, suggestionsResult] = await Promise.all([
        analyzeJournalEntry({ journalEntry: journalText }),
        suggestSelfCareActivities({ mood: mood.name, journalContent: journalText }),
      ]);
      setAnalysis(analysisResult);
      setSuggestions(suggestionsResult);
    } catch (error) {
      console.error('AI operation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with our AI. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Logo className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-xl font-bold font-headline">SereneMind</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">How are you feeling today?</CardTitle>
                  <CardDescription>Select your current mood to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MoodSelector onMoodSelect={handleMoodSelect} selectedMood={mood} />
                </CardContent>
              </Card>

              {mood && (
                <JournalEditor
                  mood={mood}
                  onJournalSubmit={handleJournalSubmit}
                  analysis={analysis}
                  suggestions={suggestions}
                  isLoading={isLoading}
                />
              )}
            </div>

            <div className="lg:col-span-1 grid gap-8 auto-rows-min">
              <MoodHistoryChart />
              <Card className="bg-accent/50 border-accent">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <div className="bg-accent rounded-full p-2">
                    <Smile className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="font-headline">A Quick Reminder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{message}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
