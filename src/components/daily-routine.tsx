'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { generateDailyRoutine, type GenerateDailyRoutineOutput } from '@/ai/flows/generate-daily-routine';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CalendarPlus, AlertTriangle, Sparkles, Sunrise, Coffee, BrainCircuit, BedDouble, BookOpen, Dumbbell, Salad, Briefcase, DraftingCompass } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyRoutineProps {
  userRole: string;
}

const iconMap: { [key: string]: React.ElementType<LucideProps> } = {
  Sunrise,
  Coffee,
  BrainCircuit,
  BedDouble,
  BookOpen,
  Dumbbell,
  Salad,
  Briefcase,
  DraftingCompass,
  default: Sparkles,
};

const RoutineIcon = ({ name, className }: { name: string, className?: string }) => {
  const Icon = iconMap[name] || iconMap.default;
  return <Icon className={cn("h-6 w-6", className)} />;
};

const fallbackRoutine: GenerateDailyRoutineOutput = {
  title: "A Gentle Daily Flow (Sample)",
  routine: [
    { time: "7:00 AM - 7:30 AM", activity: "Mindful Morning", description: "Start your day with 10 minutes of meditation or stretching.", icon: "Sunrise" },
    { time: "8:00 AM - 8:30 AM", activity: "Nourishing Breakfast", description: "Enjoy a healthy breakfast to fuel your body and mind.", icon: "Salad" },
    { time: "12:00 PM - 1:00 PM", activity: "Mindful Lunch Break", description: "Step away from your desk and eat without distractions.", icon: "Coffee" },
    { time: "3:00 PM - 3:15 PM", activity: "Quick Recharge", description: "Take a short walk or do some simple stretches to reset.", icon: "Dumbbell" },
    { time: "8:00 PM - 9:00 PM", activity: "Unwind Hour", description: "Read a book, listen to calming music, or do something creative.", icon: "BookOpen" },
  ]
};


export function DailyRoutine({ userRole }: DailyRoutineProps) {
  const [routine, setRoutine] = useState<GenerateDailyRoutineOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRoutine = async () => {
      if (!userRole) return;
      setIsLoading(true);
      setError(null);

      // Check for cached routine in localStorage
      const cachedRoutineKey = `dailyRoutine-${userRole}`;
      const cachedRoutine = localStorage.getItem(cachedRoutineKey);
      if (cachedRoutine) {
        try {
          setRoutine(JSON.parse(cachedRoutine));
          setIsLoading(false);
          return;
        } catch (e) {
          console.error("Failed to parse cached routine:", e);
          // Clear invalid cache entry
          localStorage.removeItem(cachedRoutineKey);
        }
      }

      // If not cached, fetch from AI
      try {
        const result = await generateDailyRoutine({ userRole });
        setRoutine(result);
        // Cache the new routine
        localStorage.setItem(cachedRoutineKey, JSON.stringify(result));
      } catch (err: any) {
        console.error("Failed to generate daily routine:", err);
        const errorMessage = err?.message || '';
        
        // Always show a fallback routine on any error to prevent crashing
        setRoutine(fallbackRoutine);

        if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            setError("You've reached the daily limit for AI routines. Here is a sample to get you started!");
        } else {
            setError("Could not generate a personalized routine at this time. Here's a sample to get you going!");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutine();
  }, [userRole]);

  const handleAddToCalendar = () => {
    toast({
      title: "Feature Coming Soon!",
      description: "Google Calendar integration is planned for a future update.",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Personalized Daily Routine
        </CardTitle>
        <CardDescription>
            {isLoading ? <Skeleton className="h-4 w-3/4" /> : routine?.title || 'A plan to help you thrive.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[200px]">
        {isLoading && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
             <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
             <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        )}
        {error && (
            <Alert variant={routine ? 'default' : 'destructive'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{routine ? 'Note' : 'Error'}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {routine && (
          <div className={cn("relative", error ? "mt-4" : "")}>
             <div className="absolute left-10 top-2 bottom-2 w-0.5 bg-border -z-10" />
             <ul className="space-y-6">
                {routine.routine.map((item, index) => (
                    <li key={index} className="flex items-start gap-4">
                        <div className="w-20 text-right">
                            <p className="text-sm font-semibold text-primary">{item.time.split(' - ')[0]}</p>
                            <p className="text-xs text-muted-foreground">{item.time.split(' - ')[1]}</p>
                        </div>
                        <div className="flex-shrink-0 z-10 p-2 bg-background border rounded-full">
                           <RoutineIcon name={item.icon} className="text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{item.activity}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                    </li>
                ))}
             </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleAddToCalendar}>
            <CalendarPlus className="mr-2" />
            Add to Google Calendar
        </Button>
      </CardFooter>
    </Card>
  );
}
