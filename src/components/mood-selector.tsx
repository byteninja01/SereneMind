'use client';

import { SmilePlus, Smile, Meh, Frown, Angry } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type Mood = {
  name: 'rad' | 'good' | 'meh' | 'bad' | 'awful';
  icon: React.ElementType;
  color: string;
};

const moods: Mood[] = [
  { name: 'rad', icon: SmilePlus, color: 'text-green-500' },
  { name: 'good', icon: Smile, color: 'text-lime-500' },
  { name: 'meh', icon: Meh, color: 'text-yellow-500' },
  { name: 'bad', icon: Frown, color: 'text-orange-500' },
  { name: 'awful', icon: Angry, color: 'text-red-500' },
];

interface MoodSelectorProps {
  onMoodSelect: (mood: Mood) => void;
  selectedMood: Mood | null;
}

export function MoodSelector({ onMoodSelect, selectedMood }: MoodSelectorProps) {
  return (
    <TooltipProvider>
      <div className="flex justify-around items-center p-4 rounded-lg">
        {moods.map((mood) => (
          <Tooltip key={mood.name}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-16 w-16 rounded-full transition-transform duration-200 ease-in-out transform hover:scale-110',
                  selectedMood?.name === mood.name ? 'bg-accent scale-110' : ''
                )}
                onClick={() => onMoodSelect(mood)}
              >
                <mood.icon className={cn('h-10 w-10', mood.color)} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="capitalize">{mood.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
