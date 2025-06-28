'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { analyzeJournalEntry, type AnalyzeJournalEntryOutput } from '@/ai/flows/analyze-journal-entry';
import { suggestSelfCareActivities, type SuggestSelfCareActivitiesOutput } from '@/ai/flows/suggest-self-care-activities';
import { chat, type ChatOutput } from '@/ai/flows/chat';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { MoodSelector, type Mood } from '@/components/mood-selector';
import { JournalEditor } from '@/components/journal-editor';
import { MoodHistoryChart } from '@/components/mood-history-chart';
import { SmartwatchSync } from '@/components/smartwatch-sync';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { Smile, Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Define interface for chat messages
interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export default function DashboardPage() {
  const [mood, setMood] = useState<Mood | null>(null);
  const [journal, setJournal] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeJournalEntryOutput | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestSelfCareActivitiesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [message, setMessage] = useState(''); // State for the random reminder message
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // State for chat messages
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!role) {
      router.push('/');
    } else {
      setUserRole(role);
    }

    const messages = [
      "You're doing great just by being here.",
      "Every step, big or small, is progress.",
      "Be kind to yourself today.",
      "Your feelings are valid. Acknowledge them.",
      "Taking time for yourself is productive."
    ];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    // Add a welcome message from the bot
    setChatMessages([{ id: 1, text: "Hello! I'm SereneMind, your friendly companion. How can I help you today?", sender: 'bot' }]);
  }, [router]);

  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleMoodSelect = async (selectedMood: Mood) => {
    if (!userRole) return;
    setMood(selectedMood);
    setJournal('');
    setAnalysis(null);
    setSuggestions(null);
    setIsLoading(true);

    try {
      const suggestionsResult = await suggestSelfCareActivities({
        mood: selectedMood.name,
        journalContent: '',
        userRole: userRole,
      });
      setSuggestions(suggestionsResult);
    } catch (error) {
      console.error('AI operation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem getting suggestions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJournalSubmit = async (journalText: string) => {
    if (!mood || !userRole) return;

    setIsLoading(true);
    setJournal(journalText);
    setAnalysis(null);
    setSuggestions(null);

    try {
      const [analysisResult, suggestionsResult] = await Promise.all([
        analyzeJournalEntry({ journalEntry: journalText }),
        suggestSelfCareActivities({ mood: mood.name, journalContent: journalText, userRole: userRole }),
      ]);
      setAnalysis(analysisResult);
      setSuggestions(suggestionsResult);
    } catch (error) {
      console.error('AI operation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with our AI. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (chatInput.trim() === '' || isChatLoading) return;

    const newMessage: ChatMessage = {
      id: chatMessages.length + 1,
      text: chatInput.trim(),
      sender: 'user',
    };
    
    setChatMessages(prevMessages => [...prevMessages, newMessage]);
    const currentInput = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    try {
      const aiResponse = await chat({ message: currentInput });
      const botResponse: ChatMessage = {
        id: chatMessages.length + 2,
        text: aiResponse.response,
        sender: 'bot',
      };
      setChatMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
       console.error('Chat AI operation failed:', error);
       const errorResponse: ChatMessage = {
        id: chatMessages.length + 2,
        text: "Sorry, I'm having a little trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
      };
      setChatMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsChatLoading(false);
    }
  };
  
  const handleChangeRole = () => {
    localStorage.removeItem('userRole');
    router.push('/');
  }

  if (!userRole) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Logo className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-xl font-bold font-headline">SereneMind</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={handleChangeRole}>
              <User className="mr-2 h-4 w-4" />
              <span className="capitalize">{userRole}</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">How are you feeling today?</CardTitle>
                  <CardDescription>Select your current mood to get started.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MoodSelector onMoodSelect={handleMoodSelect} selectedMood={mood} />
                </CardContent>
              </Card>

              {mood && (
                <JournalEditor
                  mood={mood}
                  onJournalSubmit={handleJournalSubmit}
                  analysis={analysis}
                  suggestions={suggestions}
                  isLoading={isLoading}
                />
              )}
            </div>

            <div className="lg:col-span-1 grid gap-8 auto-rows-min">
              <MoodHistoryChart />
              <SmartwatchSync />
              <Card className="bg-accent/50 border-accent">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <div className="bg-accent rounded-full p-2">
                    <Smile className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="font-headline">A Quick Reminder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{message}</p>
                </CardContent>
              </Card>

              {/* Basic Chat Interface Card */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline">Chat with Me</CardTitle>
                  <CardDescription>Your friendly companion is here to listen.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 gap-4">
                  <div ref={chatContainerRef} className="flex-1 flex flex-col gap-3 h-72 overflow-y-auto border p-4 rounded-md bg-muted/20">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground self-end' : 'bg-secondary text-secondary-foreground self-start'}`}>
                        {msg.text}
                      </div>
                    ))}
                     {isChatLoading && (
                      <div className="self-start flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                      disabled={isChatLoading}
                    />
                    <Button onClick={handleSendChatMessage} disabled={isChatLoading}>Send</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
