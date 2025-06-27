'use client';

import { useState } from 'react';
import type { AnalyzeJournalEntryOutput } from '@/ai/flows/analyze-journal-entry';
import type { SuggestSelfCareActivitiesOutput } from '@/ai/flows/suggest-self-care-activities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb, Bot } from 'lucide-react';
import type { Mood } from './mood-selector';
import { ActivityCard } from './activity-card';
import { Skeleton } from './ui/skeleton';

interface JournalEditorProps {
  mood: Mood;
  onJournalSubmit: (journalText: string) => void;
  analysis: AnalyzeJournalEntryOutput | null;
  suggestions: SuggestSelfCareActivitiesOutput | null;
  isLoading: boolean;
}

export function JournalEditor({
  mood,
  onJournalSubmit,
  analysis,
  suggestions,
  isLoading,
}: JournalEditorProps) {
  const [journalText, setJournalText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJournalSubmit(journalText);
  };

  return (
    <Card className="transition-all duration-500 ease-in-out">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <mood.icon className={`h-8 w-8 mr-2 ${mood.color}`} />
          Tell me more about feeling {mood.name}...
        </CardTitle>
        <CardDescription>
          Your personalized suggestions are below. You can also write about what's on your mind to get AI feedback and refined suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Textarea
            placeholder="Let it all out. Your thoughts are safe here."
            className="min-h-[150px] text-base"
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="mt-4"
            disabled={isLoading || !journalText.trim()}
          >
            {isLoading && journalText.trim() ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze & Refine Suggestions'
            )}
          </Button>
        </form>

        {isLoading && !analysis && !suggestions && (
          <div className="mt-6 space-y-4">
             <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Thinking of some suggestions for you...</span>
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        )}

        {analysis && (
          <Card className="mt-6 bg-secondary/50">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2"><Bot /> AI Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{analysis.feedbackSummary}</p>
              <div className="flex flex-wrap gap-2">
                {analysis.emotionalTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {suggestions && (
          <Card className="mt-6 bg-secondary/50">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2"><Lightbulb /> Activity Suggestions</CardTitle>
               <CardDescription>{suggestions.reasoning}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {suggestions.activities.map((activity, index) => (
                <ActivityCard key={index} activity={activity} />
              ))}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
