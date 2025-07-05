"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const testimonialsData = [
    {
        quote: "SereneMind has completely changed how I approach my mental wellness. The personalized suggestions are a game-changer for a busy teacher like me.",
        name: "Yash",
        role: "Teacher",
        avatar: "https://placehold.co/40x40.png",
        hint: "woman portrait"
    },
    {
        quote: "As a student, the daily routine feature helps me stay organized and focused. The little games are a great way to take a quick break between study sessions.",
        name: "Akshatj",
        role: "Student",
        avatar: "https://placehold.co/40x40.png",
        hint: "man student"
    },
    {
        quote: "The journaling and AI feedback have given me insights I never would have discovered on my own. It's like having a supportive friend available 24/7.",
        name: "Swayam",
        role: "Employee",
        avatar: "https://placehold.co/40x40.png",
        hint: "person smiling"
    },
]

export function Testimonials() {
  return (
    <section className="container max-w-4xl py-12 text-center">
        <h2 className="text-3xl font-bold font-headline mb-2">What Our Users Have to Say</h2>
        <p className="text-muted-foreground mb-8">Join thousands of happy users on a journey to better mental well-being.</p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonialsData.map((testimonial, index) => (
                 <Card key={index} className="text-left bg-card/50">
                    <CardContent className="pt-6">
                        <blockquote className="italic">"{testimonial.quote}"</blockquote>
                    </CardContent>
                    <CardFooter className="flex items-center gap-3">
                         <Avatar>
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint={testimonial.hint} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                    </CardFooter>
                 </Card>
            ))}
        </div>
    </section>
  )
}
