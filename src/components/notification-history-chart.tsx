'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { AppNotification } from '@/app/dashboard/page';
import { Bell } from 'lucide-react';

const chartConfig = {
  notifications: {
    label: 'Notifications',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

interface NotificationHistoryChartProps {
    notifications: AppNotification[];
}

export function NotificationHistoryChart({ notifications }: NotificationHistoryChartProps) {
  const chartData = notifications.slice(-10).map(n => ({
    time: n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sent: 1,
    message: n.message,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Reminder History
        </CardTitle>
        <CardDescription>A log of your recent reminders.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart 
                data={chartData} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                aria-label="Chart showing the times when reminders were sent."
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} />
              <YAxis hide={true} domain={[0, 1]} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                content={<ChartTooltipContent 
                    formatter={(value, name, item) => (
                        <div className="flex flex-col">
                            <span className="font-bold">{item.payload.time}</span>
                            <span>{item.payload.message}</span>
                        </div>
                    )}
                    label="Reminder"
                />}
              />
              <Bar dataKey="sent" fill="var(--color-notifications)" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
