'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PartyPopper, Target } from 'lucide-react';

interface PlayableGameProps {
  instructions: string;
}

const GAME_DURATION = 15; // 15 seconds

export function PlayableGame({ instructions }: PlayableGameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
    }
  }, [timeLeft, gameState]);


  const handleStart = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
  };
  
  const handleRestart = () => {
      setScore(0);
      setTimeLeft(GAME_DURATION);
      setGameState('ready');
  }

  const handleClick = () => {
    if (gameState === 'playing') {
      setScore(score + 1);
    }
  };

  if (gameState === 'ready') {
    return (
      <div className="text-center space-y-4 py-4">
        <p className="text-sm text-muted-foreground">{instructions}</p>
        <Button onClick={handleStart} size="lg">
          Start Game
        </Button>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="text-center space-y-4 py-4 flex flex-col items-center">
        <div className="flex justify-around items-center w-full mb-4">
            <div className="text-lg">Time: <span className="font-bold tabular-nums">{timeLeft}s</span></div>
            <div className="text-lg">Score: <span className="font-bold tabular-nums">{score}</span></div>
        </div>
        <Button 
            onClick={handleClick} 
            className="w-40 h-40 rounded-full text-2xl transition-transform duration-100 ease-in-out active:scale-95"
        >
            <Target className="w-16 h-16"/>
        </Button>
      </div>
    );
  }
  
  if (gameState === 'finished') {
    return (
        <div className="text-center space-y-4 py-4 flex flex-col items-center">
            <PartyPopper className="w-16 h-16 text-yellow-500" />
            <h3 className="text-2xl font-bold">Great Job!</h3>
            <p className="text-lg">Your score: <span className="font-bold">{score}</span></p>
            <Button onClick={handleRestart} variant="outline" className="mt-4">
                Play Again
            </Button>
        </div>
    )
  }

  return null;
}
