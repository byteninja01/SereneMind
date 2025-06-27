'use client';

import type { SuggestSelfCareActivitiesOutput } from '@/ai/flows/suggest-self-care-activities';
import { Timer } from './timer';
import { BookOpen, Wind, Music, PenSquare, StretchVertical, Sparkles, Coffee, Film, Smile, Leaf, Heart, Gamepad2, Brain, Clock, Activity, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


type ActivityType = SuggestSelfCareActivitiesOutput['activities'][0];

interface ActivityCardProps {
  activity: ActivityType;
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
  Gamepad2,
  Brain,
  Clock,
  default: Activity,
};

const ActivityIcon = ({ name }: { name: string }) => {
  const Icon = iconMap[name] || iconMap.default;
  return <Icon className="h-6 w-6 text-accent-foreground" />;
};

export function ActivityCard({ activity }: ActivityCardProps) {
    const hasTimer = (activity.type === 'exercise' || activity.type === 'mindfulness') && activity.duration && activity.duration > 0;
    
    return (
        <div key={activity.name} className="flex items-start gap-4 p-4 rounded-lg bg-background shadow-sm">
            <div className="p-3 bg-accent rounded-full">
                <ActivityIcon name={activity.icon} />
            </div>
            <div className="flex-1">
                <p className="font-semibold">{activity.name}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                
                {activity.type === 'music' && activity.details && (
                    (() => {
                        const parts = activity.details.split(' by ');
                        const title = parts[0] || 'Unknown Title';
                        const artist = parts.length > 1 ? parts.slice(1).join(' by ') : 'Unknown Artist';
                        const query = encodeURIComponent(activity.details);
                        const youtubeUrl = `https://www.youtube.com/results?search_query=${query}`;

                        return (
                            <div className="mt-2 space-y-2">
                                <div className="text-sm bg-secondary/30 p-3 rounded-md border border-secondary">
                                    <p><strong>Song:</strong> {title.trim()}</p>
                                    <p><strong>Artist:</strong> {artist.trim()}</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                                        <Youtube className="mr-2" />
                                        Play on YouTube
                                    </a>
                                </Button>
                            </div>
                        )
                    })()
                )}

                {activity.type === 'game' && activity.details && (
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mt-2">
                                <Gamepad2 className="mr-2" />
                                Play Game
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{activity.name}</DialogTitle>
                                <DialogDescription>{activity.description}</DialogDescription>
                            </DialogHeader>
                             <div className="mt-4 text-sm">
                                <p className="font-semibold mb-2">How to play:</p>
                                <p className="whitespace-pre-wrap">{activity.details}</p>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {hasTimer && <Timer duration={activity.duration!} />}
            </div>
      </div>
    );
}
