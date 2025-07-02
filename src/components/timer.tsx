'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimerProps {
  duration: number; // in seconds
  onComplete: () => void;
}

export function Timer({ duration, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTimeLeft(duration);
    setIsActive(false);
    setIsCompleted(false);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsCompleted(true);
      const stressReduced = Math.floor(Math.random() * 10) + 5; // 5-14%
      toast({
        title: (
          <div className="flex items-center gap-2">
            <PartyPopper className="h-5 w-5 text-yellow-500" />
            <span>Task Complete!</span>
          </div>
        ),
        description: `You've reduced your stress by ${stressReduced}%. Great job!`,
      });
      onComplete();
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft, toast, onComplete]);

  const toggleTimer = () => {
    if (isCompleted) return;
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsCompleted(false);
    setTimeLeft(duration);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-4 p-3 rounded-md bg-secondary/30 border border-secondary">
      <p className="text-3xl font-mono font-semibold text-primary">{formatTime(timeLeft)}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={toggleTimer} aria-label={isActive ? 'Pause timer' : 'Start timer'} disabled={isCompleted}>
          {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button variant="outline" size="icon" onClick={resetTimer} aria-label="Reset timer">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
      {isCompleted && <p className="text-sm font-medium text-green-600 flex items-center gap-1"><PartyPopper className="h-4 w-4" />Time's up! Great job!</p>}
    </div>
  );
}
