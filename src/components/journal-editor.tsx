'use client';

import { useState } from 'react';
import type { AnalyzeJournalEntryOutput } from '@/ai/flows/analyze-journal-entry';
import type { SuggestSelfCareActivitiesOutput } from '@/ai/flows/suggest-self-care-activities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb, Bot, Activity, BookOpen, Wind, Music, PenSquare, StretchVertical, Sparkles, Coffee, Film, Smile, Leaf, Heart } from 'lucide-react';
import type { Mood } from './mood-selector';

interface JournalEditorProps {
  mood: Mood;
  onJournalSubmit: (journalText: string) => void;
  analysis: AnalyzeJournalEntryOutput | null;
  suggestions: SuggestSelfCareActivitiesOutput | null;
  isLoading: boolean;
}

const iconMap: { [key: string]: React.ElementType } = {
  BookOpen,
  Wind,
  Music,
  PenSquare,
  StretchVertical,
  Sparkles,
  Coffee,
  Film,
  Smile,
  Leaf,
  Heart,
  default: Activity,
};

const ActivityIcon = ({ name }: { name: string }) => {
  const Icon = iconMap[name] || iconMap.default;
  return <Icon className="h-6 w-6 text-accent-foreground" />;
};


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
    if (journalText.trim()) {
      onJournalSubmit(journalText);
    }
  };

  return (
    <Card className="transition-all duration-500 ease-in-out">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <mood.icon className={`h-8 w-8 mr-2 ${mood.color}`} />
          Tell me more about feeling {mood.name}...
        </CardTitle>
        <CardDescription>
          Writing can be a great way to understand your feelings. What's on your mind?
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
          <Button type="submit" className="mt-4" disabled={isLoading || !journalText.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze My Entry'
            )}
          </Button>
        </form>

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
              {suggestions.activities.map((activity) => (
                <div key={activity.name} className="flex items-start gap-4 p-4 rounded-lg bg-background shadow-sm">
                  <div className="p-3 bg-accent rounded-full">
                    <ActivityIcon name={activity.icon} />
                  </div>
                  <div>
                    <p className="font-semibold">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
