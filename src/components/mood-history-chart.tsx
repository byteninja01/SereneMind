'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const chartData = [
  { day: 'Mon', mood: 4 },
  { day: 'Tue', mood: 3 },
  { day: 'Wed', mood: 5 },
  { day: 'Thu', mood: 4 },
  { day: 'Fri', mood: 2 },
  { day: 'Sat', mood: 5 },
  { day: 'Sun', mood: 3 },
];

const chartConfig = {
  mood: {
    label: 'Mood',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const moodLabels: { [key: number]: string } = {
  1: 'Awful',
  2: 'Bad',
  3: 'Meh',
  4: 'Good',
  5: 'Rad',
};

export function MoodHistoryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Weekly Mood Summary</CardTitle>
        <CardDescription>Here's a look at your mood this week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis 
                tickFormatter={(value) => moodLabels[value] || ''}
                domain={[0, 5]}
                ticks={[1,2,3,4,5]}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                content={<ChartTooltipContent 
                    formatter={(value, name, item) => (
                        <div className="flex flex-col">
                            <span className="font-bold">{moodLabels[item.payload.mood]}</span>
                        </div>
                    )}
                />}
              />
              <Bar dataKey="mood" fill="var(--color-mood)" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
