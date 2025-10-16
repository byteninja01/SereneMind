'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { analyzeJournalEntry, type Analysis, type AnalyzeJournalEntryOutput } from '@/ai/flows/analyze-journal-entry';
import { chat, type ChatOutput } from '@/ai/flows/chat';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { MoodSelector, type Mood } from '@/components/mood-selector';
import { JournalEditor } from '@/components/journal-editor';
import { MoodHistoryChart } from '@/components/mood-history-chart';
import { NotificationHistoryChart } from '@/components/notification-history-chart';
import { SmartwatchSync } from '@/components/smartwatch-sync';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { Smile, Loader2, User, LogOut, Bell, Phone, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DailyRoutine } from '@/components/daily-routine';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Confetti } from '@/components/confetti';


// Define interface for chat messages
interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export interface AppNotification {
  message: string;
  time: Date;
}

const quotes = [
    { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "The mind is everything. What you think you become.", author: "Buddha" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Self-care is how you take your power back.", author: "Lalah Delia" }
];

const reminderMessages = [
  "Time for a water break! Staying hydrated is key.",
  "Take a moment to stretch your legs and back.",
  "Rest your eyes for 20 seconds by looking at something 20 feet away.",
  "Think of one thing you're grateful for right now.",
  "A short walk can do wonders for your mood and focus.",
  "Take a few deep, slow breaths to center yourself."
];

export default function DashboardPage() {
  const [mood, setMood] = useState<Mood | null>(null);
  const [journal, setJournal] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [suggestions, setSuggestions] = useState<AnalyzeJournalEntryOutput['suggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // State for chat messages
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatCooldown, setChatCooldown] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [salutation, setSalutation] = useState('');
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);


  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    const phone = localStorage.getItem('userPhone');
    const age = localStorage.getItem('userAge');
    const gender = localStorage.getItem('userGender');

    if (!role || !name || !phone || !age || !gender) {
      router.push('/');
      return;
    } 
    
    setUserRole(role);
    setUserName(name);

    // Set salutation and quote
    const hour = new Date().getHours();
    if (hour < 12) setSalutation('Good Morning');
    else if (hour < 18) setSalutation('Good Afternoon');
    else setSalutation('Good Evening');
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Set initial reminder
    setNotifications([{ message: "Welcome! We'll send you friendly reminders here to help you through your day.", time: new Date() }]);
    
    const intervalId = setInterval(() => {
      const randomMessage = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
      setNotifications(prev => [...prev, {
        message: randomMessage,
        time: new Date()
      }]);
    }, 20000); // 20 seconds

    // Add a welcome message from the bot
    setChatMessages(prev => {
        if(prev.length === 0){
            return [{ id: 1, text: "Hello! I'm MIndLink, your friendly companion. How can I help you today?", sender: 'bot' }];
        }
        return prev;
    });

    return () => clearInterval(intervalId);
  }, [router]);

  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    // Scroll to suggestions when they appear
    if (suggestions && suggestionsRef.current) {
      suggestionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [suggestions]);

  useEffect(() => {
    if (chatCooldown > 0) {
      const timerId = setTimeout(() => setChatCooldown(chatCooldown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [chatCooldown]);

  const handleTaskComplete = () => {
    setShowConfetti(true);
  };

  const handleMoodSelect = async (selectedMood: Mood) => {
    if (!userRole) return;
    setMood(selectedMood);
    setJournal('');
    setAnalysis(null);
    setSuggestions(null);
    setIsLoading(true);

    try {
      const result = await analyzeJournalEntry({
        mood: selectedMood.name,
        userRole: userRole,
      });

      setSuggestions(result.suggestions);

      if (result.isFallback) {
        toast({
          title: 'AI is a bit busy!',
          description: "We're showing some sample suggestions for now. Please try refining with a journal entry later.",
        });
      }
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
      const result = await analyzeJournalEntry({ 
        journalEntry: journalText,
        mood: mood.name,
        userRole: userRole,
      });

      setAnalysis(result.analysis || null);
      setSuggestions(result.suggestions);

      if (result.isFallback) {
        toast({
            title: 'AI is a bit busy!',
            description: "We're showing sample feedback and suggestions due to high demand. Your journal entry was saved.",
        });
      }
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
    if (chatInput.trim() === '' || isChatLoading || chatCooldown > 0) return;

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
      if (aiResponse.isFallback) {
        setChatCooldown(30);
      }
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
  
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userAge');
    localStorage.removeItem('userGender');
    router.push('/');
  }

  const handleFeatureComingSoon = (featureName: string) => {
    toast({
      title: `${featureName} Coming Soon!`,
      description: `We're working hard to bring this feature to you.`,
    });
  };

  if (!userRole || !userName) {
      return (
          <div className="flex h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  const latestNotification = notifications[notifications.length - 1];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Confetti fire={showConfetti} onComplete={() => setShowConfetti(false)} />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Logo className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-xl font-bold font-headline">MIndLink</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  <span className="capitalize">{userName} ({userRole})</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold font-headline">
                    {salutation}, <span className="capitalize">{userName}</span>!
                </h2>
                {quote && (
                    <p className="text-muted-foreground mt-2 italic">
                        &ldquo;{quote.text}&rdquo; &ndash; {quote.author}
                    </p>
                )}
            </div>

          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">How are you feeling today?</CardTitle>
                  <CardDescription>Select your current mood to get personalized suggestions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <MoodSelector onMoodSelect={handleMoodSelect} selectedMood={mood} />
                </CardContent>
              </Card>

              {mood && (
                <div ref={suggestionsRef}>
                  <JournalEditor
                    mood={mood}
                    onJournalSubmit={handleJournalSubmit}
                    analysis={analysis}
                    suggestions={suggestions}
                    isLoading={isLoading}
                    onTaskComplete={handleTaskComplete}
                  />
                </div>
              )}
            </div>

            <div className="lg:col-span-1 grid gap-8 auto-rows-min">
              <DailyRoutine userRole={userRole} />
              
              {/* Talk to a Therapist Card */}
              <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Phone className="h-6 w-6 text-primary" />
                        Talk to a Therapist
                    </CardTitle>
                    <CardDescription>Get professional support when you need it.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Our certified therapists are available 24/7 to provide confidential help. It's a brave step to seek support.</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={() => handleFeatureComingSoon('Therapist on call')}>
                        Call Now
                    </Button>
                </CardFooter>
              </Card>

              {/* Community Chat Card */}
               <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Join Community Chat
                    </CardTitle>
                    <CardDescription>Connect with others in a safe, anonymous space.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Share your thoughts and experiences with a supportive community. You are not alone.</p>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={() => handleFeatureComingSoon('Community Chat')}>
                        Join Community
                    </Button>
                </CardFooter>
              </Card>

              <MoodHistoryChart />
              <SmartwatchSync />
              <NotificationHistoryChart notifications={notifications} />
              <Card className="bg-accent/50 border-accent">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                  <div className="bg-accent rounded-full p-2">
                    <Bell className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="font-headline">A Quick Reminder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{latestNotification?.message}</p>
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
                      placeholder={chatCooldown > 0 ? `Please wait ${chatCooldown}s...` : "Type your message..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                      disabled={isChatLoading || chatCooldown > 0}
                    />
                    <Button onClick={handleSendChatMessage} disabled={isChatLoading || chatCooldown > 0}>Send</Button>
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
