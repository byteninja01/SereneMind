'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Testimonials } from '@/components/testimonials';

export default function LoginPage() {
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const router = useRouter();

  const handleContinue = () => {
    if (role && name.trim() && phone.trim().length === 10 && age && gender) {
      localStorage.setItem('userRole', role);
      localStorage.setItem('userName', name.trim());
      localStorage.setItem('userPhone', phone.trim());
      localStorage.setItem('userAge', age);
      localStorage.setItem('userGender', gender);
      router.push('/dashboard');
    }
  };

  const isContinueDisabled = !role || !name.trim() || phone.trim().length !== 10 || !age || !gender;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Logo className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-xl font-bold font-headline">SereneMind</h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">Welcome to SereneMind</CardTitle>
            <CardDescription className="text-center">First, let's get to know you a little better.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-2">
                <Label htmlFor="name-input">What should we call you?</Label>
                <Input 
                    id="name-input" 
                    placeholder="Enter your name..." 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="grid w-full items-center gap-2">
                <Label htmlFor="age-input">How old are you?</Label>
                <Input 
                    id="age-input" 
                    type="number"
                    placeholder="Enter your age..." 
                    value={age} 
                    onChange={(e) => setAge(e.target.value)}
                />
            </div>
            <div className="grid w-full items-center gap-2">
                <Label htmlFor="gender-select">What is your gender?</Label>
                <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender-select">
                        <SelectValue placeholder="Select your gender..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid w-full items-center gap-2">
                <Label htmlFor="phone-input">What is your phone number?</Label>
                <Input 
                    id="phone-input" 
                    type="tel"
                    maxLength={10}
                    placeholder="Enter your 10-digit phone number..." 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <p className="text-xs text-muted-foreground">We'll use this to send you friendly reminders (feature simulation).</p>
            </div>
            <div className="grid w-full items-center gap-2">
                <Label htmlFor="role-select">Tell us your primary role</Label>
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role-select">
                        <SelectValue placeholder="Select your role..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="business owner">Business Owner</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleContinue} disabled={isContinueDisabled}>
              Continue to Dashboard
            </Button>
          </CardFooter>
        </Card>
        <Testimonials />
      </main>
    </div>
  );
}
