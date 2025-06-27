'use client';

import type { SuggestSelfCareActivitiesOutput } from '@/ai/flows/suggest-self-care-activities';
import { Timer } from './timer';
import { BookOpen, Wind, Music, PenSquare, StretchVertical, Sparkles, Coffee, Film, Smile, Leaf, Heart, Gamepad2, Brain, Clock, Activity } from 'lucide-react';

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
                        return (
                            <div className="mt-2 text-sm bg-secondary/30 p-3 rounded-md border border-secondary">
                                <p><strong>Song:</strong> {title.trim()}</p>
                                <p><strong>Artist:</strong> {artist.trim()}</p>
                            </div>
                        )
                    })()
                )}

                {activity.type === 'game' && activity.details && (
                     <div className="mt-2 text-sm bg-secondary/30 p-3 rounded-md border border-secondary">
                        <p className="font-semibold mb-1">How to play:</p>
                        <p className="whitespace-pre-wrap">{activity.details}</p>
                    </div>
                )}

                {hasTimer && <Timer duration={activity.duration!} />}
            </div>
      </div>
    );
}
