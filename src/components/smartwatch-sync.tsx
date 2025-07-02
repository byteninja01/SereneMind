'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartPulse, Bed, Footprints, Watch, Bluetooth, BluetoothConnected, BluetoothSearching, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

type SyncStatus = 'disconnected' | 'connecting' | 'syncing' | 'connected';

export function SmartwatchSync() {
  const [status, setStatus] = useState<SyncStatus>('disconnected');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleConnect = () => {
    setStatus('connecting');
    setProgress(0);
    const connectingInterval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(connectingInterval);
                setStatus('syncing');
                return 100;
            }
            return prev + 20;
        });
    }, 300);
  };
  
  useEffect(() => {
    if (status === 'syncing') {
      const syncTimeout = setTimeout(() => {
        setStatus('connected');
        toast({
          title: 'Successfully Connected!',
          description: 'You are successfully connceted!!!',
        });
      }, 1500);
      return () => clearTimeout(syncTimeout);
    }
  }, [status, toast]);


  const handleDisconnect = () => {
    setStatus('disconnected');
    setProgress(0);
  };

  const renderContent = () => {
    switch (status) {
      case 'disconnected':
        return (
          <div className="text-center text-muted-foreground py-8">
            <Bluetooth className="h-10 w-10 mx-auto mb-2" />
            <p>Connect your watch to sync data.</p>
          </div>
        );
      case 'connecting':
        return (
          <div className="text-center py-8">
            <BluetoothSearching className="h-10 w-10 mx-auto mb-2 animate-pulse" />
            <p className="text-muted-foreground mb-4">Searching for devices...</p>
            <Progress value={progress} className="w-full" />
          </div>
        );
      case 'syncing':
        return (
            <div className="text-center py-8">
              <Loader2 className="h-10 w-10 mx-auto mb-2 animate-spin" />
              <p className="text-muted-foreground">Syncing data...</p>
            </div>
        );
      case 'connected':
        return (
          <div className="space-y-4">
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
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Watch className="h-6 w-6 text-primary" />
                Smartwatch Sync
            </div>
            {status === 'connected' && (
                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <BluetoothConnected className="h-4 w-4" />
                    <span>Connected</span>
                </div>
            )}
        </CardTitle>
        <CardDescription>Your daily wellness at a glance.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[210px] flex items-center justify-center">
        {renderContent()}
      </CardContent>
      <CardFooter>
        {status === 'disconnected' && (
          <Button className="w-full" onClick={handleConnect}>
            <Bluetooth className="mr-2" /> Connect Watch
          </Button>
        )}
        {(status === 'connecting' || status === 'syncing') && (
            <Button className="w-full" disabled>
                <Loader2 className="mr-2 animate-spin" />
                {status === 'connecting' ? 'Connecting...' : 'Syncing...'}
            </Button>
        )}
        {status === 'connected' && (
          <Button variant="outline" className="w-full" onClick={handleDisconnect}>
            Disconnect
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
