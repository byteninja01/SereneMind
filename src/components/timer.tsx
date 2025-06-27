'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  duration: number; // in seconds
}

export function Timer({ duration }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
    setIsActive(false);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (interval) {
        clearInterval(interval);
      }
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
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
            <Button variant="outline" size="icon" onClick={toggleTimer} aria-label={isActive ? 'Pause timer' : 'Start timer'}>
                {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="icon" onClick={resetTimer} aria-label="Reset timer">
                <RotateCcw className="h-5 w-5" />
            </Button>
        </div>
        {timeLeft === 0 && <p className="text-sm font-medium text-green-600">Time's up! Great job!</p>}
    </div>
  );
}
