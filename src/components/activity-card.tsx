'use client';

import type { AnalyzeJournalEntryOutput } from '@/ai/flows/analyze-journal-entry';
import { Timer } from './timer';
import { BookOpen, Wind, Music, PenSquare, StretchVertical, Sparkles, Coffee, Film, Smile, Leaf, Heart, Gamepad2, Brain, Clock, Activity, Youtube, Users, Brush, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlayableGame } from './playable-game';


type ActivityType = AnalyzeJournalEntryOutput['suggestions']['activities'][0];

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
  Users,
  Brush,
  Image,
  default: Activity,
};

const ActivityIcon = ({ name }: { name: string }) => {
  const Icon = iconMap[name] || iconMap.default;
  return <Icon className="h-6 w-6 text-accent-foreground" />;
};

export function ActivityCard({ activity }: ActivityCardProps) {
    const hasTimer = (activity.type === 'movement' || activity.type === 'mindfulness') && activity.duration && activity.duration > 0;
    
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
                        const query = encodeURIComponent(activity.details);
                        const youtubeUrl = `https://www.youtube.com/results?search_query=${query}`;

                        return (
                            <div className="mt-2 space-y-2">
                                <div className="text-sm bg-secondary/30 p-3 rounded-md border border-secondary">
                                    <p><strong>Playlist Idea:</strong> {activity.details}</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                                        <Youtube className="mr-2" />
                                        Find on YouTube
                                    </a>
                                </Button>
                            </div>
                        )
                    })()
                )}

                 {activity.type === 'movie' && activity.details && (
                    (() => {
                        const query = encodeURIComponent(`${activity.details} movie`);
                        const googleUrl = `https://www.google.com/search?q=${query}`;

                        return (
                            <div className="mt-2 space-y-2">
                                <div className="text-sm bg-secondary/30 p-3 rounded-md border border-secondary">
                                    <p><strong>Movie Suggestion:</strong> {activity.details}</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={googleUrl} target="_blank" rel="noopener noreferrer">
                                        <Film className="mr-2" />
                                        Find on Google
                                    </a>
                                </Button>
                            </div>
                        )
                    })()
                )}

                {activity.type === 'pinterest' && activity.details && (
                    (() => {
                        const query = encodeURIComponent(activity.details);
                        const pinterestUrl = `https://www.pinterest.com/search/pins/?q=${query}`;

                        return (
                            <div className="mt-2 space-y-2">
                                <div className="text-sm bg-secondary/30 p-3 rounded-md border border-secondary">
                                    <p><strong>Image Idea:</strong> {activity.details}</p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={pinterestUrl} target="_blank" rel="noopener noreferrer">
                                        <Image className="mr-2" />
                                        Browse on Pinterest
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
                             <div className="mt-4">
                                <PlayableGame instructions={activity.details} />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {hasTimer && <Timer duration={activity.duration!} />}
            </div>
      </div>
    );
}
