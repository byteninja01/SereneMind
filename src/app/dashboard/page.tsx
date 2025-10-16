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
import { Smile, Loader2, User, LogOut, Bell, Phone, Users, PhoneCall, Send, Bug, Bird, Fish, Shell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DailyRoutine } from '@/components/daily-routine';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Confetti } from '@/components/confetti';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


// Define interface for chat messages
interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

// Define interface for community chat messages
interface CommunityMessage {
    id: number;
    text: string;
    sender: {
        name: string;
        icon: React.ElementType;
    };
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

const therapists = [
    { name: 'Dr. Emily Carter', specialty: 'Cognitive Behavioral Therapy', avatar: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Dr. Ben Miller', specialty: 'Mindfulness & Stress Reduction', avatar: 'https://i.pravatar.cc/150?img=2' },
    { name: 'Dr. Olivia Chen', specialty: 'Anxiety & Relationship Counseling', avatar: 'https://i.pravatar.cc/150?img=3' },
];

const anonymousUsers = [
    { name: "Anonymous Bug", icon: Bug },
    { name: "Anonymous Bird", icon: Bird },
    { name: "Anonymous Fish", icon: Fish },
    { name: "Anonymous Shell", icon: Shell },
];

const initialCommunityMessages: CommunityMessage[] = [
    { id: 1, text: "Feeling a bit overwhelmed today, but trying to push through.", sender: anonymousUsers[0] },
    { id: 2, text: "Just wanted to say you're not alone. We're all in this together.", sender: anonymousUsers[1] },
    { id: 3, text: "I find that a short walk outside really helps clear my head.", sender: anonymousUsers[2] },
    { id: 4, text: "Thank you for sharing that. It's nice to know I'm not the only one.", sender: anonymousUsers[0] },
    { id: 5, text: "Has anyone tried the 5-minute meditation? It really worked for me!", sender: anonymousUsers[3]},
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
  const communityChatContainerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [salutation, setSalutation] = useState('');
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>(initialCommunityMessages);
  const [communityInput, setCommunityInput] = useState('');
  const [myAnonymousIdentity] = useState(() => anonymousUsers[Math.floor(Math.random() * anonymousUsers.length)]);


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
    // Scroll community chat
    if (communityChatContainerRef.current) {
      communityChatContainerRef.current.scrollTop = communityChatContainerRef.current.scrollHeight;
    }
  }, [communityMessages]);

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
  
  const handleSendCommunityMessage = () => {
    if (communityInput.trim() === '') return;

    const newMessage: CommunityMessage = {
      id: communityMessages.length + 1,
      text: communityInput.trim(),
      sender: myAnonymousIdentity,
    };

    setCommunityMessages(prev => [...prev, newMessage]);
    setCommunityInput('');
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userAge');
    localStorage.removeItem('userGender');
    router.push('/');
  }
  
  const handleTherapistCall = (therapistName: string) => {
    toast({
      title: "Connecting...",
      description: `Starting a simulated call with ${therapistName}.`,
    });
  }

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

            <div className="grid gap-8 grid-cols-1">
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

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <div className="lg:col-span-1 md:col-span-2">
                  <DailyRoutine userRole={userRole} />
              </div>
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
              <div className="grid gap-8 auto-rows-min">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Phone className="h-6 w-6 text-primary" />
                            Talk to a Therapist
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Our certified therapists are available 24/7 to provide confidential help.</p>
                    </CardContent>
                    <CardFooter>
                       <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full">
                                    Call Now
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Connect with a Therapist</DialogTitle>
                                    <DialogDescription>
                                        Choose a therapist who feels right for you, or connect with the first available professional.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    {therapists.map((therapist) => (
                                        <div key={therapist.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={therapist.avatar} alt={therapist.name} />
                                                    <AvatarFallback>{therapist.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{therapist.name}</p>
                                                    <p className="text-sm text-muted-foreground">{therapist.specialty}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleTherapistCall(therapist.name)}>
                                                <PhoneCall className="h-5 w-5 text-primary" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                 <Button onClick={() => handleTherapistCall('any available therapist')}>
                                    <PhoneCall className="mr-2" />
                                    Connect to Any Available Therapist
                                </Button>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>

               <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Join Community
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Share your thoughts and connect with others in a safe, anonymous space.</p>
                    </CardContent>
                    <CardFooter>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full">Join Chat</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md flex flex-col h-[70vh]">
                                <DialogHeader>
                                    <DialogTitle>Anonymous Community Chat</DialogTitle>
                                    <DialogDescription>
                                        You are chatting as <span className="font-bold">{myAnonymousIdentity.name}</span>. All messages are ephemeral and not stored.
                                    </DialogDescription>
                                </DialogHeader>
                                <div ref={communityChatContainerRef} className="flex-1 flex flex-col gap-4 overflow-y-auto border p-4 rounded-md bg-muted/20 my-4">
                                    {communityMessages.map((msg) => {
                                        const isYou = msg.sender.name === myAnonymousIdentity.name;
                                        const Icon = msg.sender.icon;
                                        return (
                                            <div key={msg.id} className={`flex items-start gap-3 max-w-[85%] ${isYou ? 'self-end flex-row-reverse' : 'self-start'}`}>
                                                <Avatar className="w-8 h-8 border">
                                                    <AvatarFallback>
                                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className={`p-3 rounded-lg text-sm ${isYou ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                                                    <p className="font-bold text-xs mb-1">{msg.sender.name}</p>
                                                    <p>{msg.text}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Type your message..."
                                        value={communityInput}
                                        onChange={(e) => setCommunityInput(e.target.value)}
                                        onKeyPress={(e) => { if (e.key === 'Enter') handleSendCommunityMessage(); }}
                                    />
                                    <Button onClick={handleSendCommunityMessage}><Send /></Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <MoodHistoryChart />
              <SmartwatchSync />
              <NotificationHistoryChart notifications={notifications} />
            </div>
        </div>
      </main>
    </div>
  );
}

    