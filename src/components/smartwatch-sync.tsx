'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { HeartPulse, Bed, Footprints, Watch } from 'lucide-react';

export function SmartwatchSync() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Watch className="h-6 w-6 text-primary" />
          Smartwatch Sync
        </CardTitle>
        <CardDescription>Your daily wellness at a glance. (Demo)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-6 w-6 text-red-500" />
            <p className="font-medium">Heart Rate</p>
          </div>
          <p className="text-lg font-bold">72 bpm</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bed className="h-6 w-6 text-blue-500" />
            <p className="font-medium">Sleep</p>
          </div>
          <p className="text-lg font-bold">7h 30m</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Footprints className="h-6 w-6 text-green-500" />
            <p className="font-medium">Steps</p>
          </div>
          <p className="text-lg font-bold">8,234</p>
        </div>
      </CardContent>
    </Card>
  );
}
