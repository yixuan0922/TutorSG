import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { 
  GraduationCap, 
  Users, 
  CheckCircle, 
  BookOpen, 
  Calculator, 
  Globe, 
  Briefcase,
  Star,
  TrendingUp
} from "lucide-react";
import heroImage from "@assets/generated_images/Tutor_teaching_student_professionally_bc0a54d9.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Professional tutor teaching student" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-hero-title">
            Find Quality Tutors in Singapore
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Connect with experienced tutors across all subjects and levels. 
            Start your tutoring journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/request-tutor" data-testid="link-request-tutor">
              <Button size="lg" variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px]">
                Request a Tutor
              </Button>
            </Link>
            <Link href="/jobs" data-testid="link-browse-jobs">
              <Button size="lg" variant="outline" className="bg-background/20 backdrop-blur border-white text-white hover:bg-background/30 min-w-[200px]">
                Browse Tuition Jobs
              </Button>
            </Link>
            <Link href="/register" data-testid="link-become-tutor">
              <Button size="lg" variant="outline" className="bg-background/20 backdrop-blur border-white text-white hover:bg-background/30 min-w-[200px]">
                Become a Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Active Tutors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-sm text-muted-foreground">Jobs Posted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4.8★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Create Profile</h3>
                <p className="text-muted-foreground">
                  Register as a tutor and complete your comprehensive profile with qualifications and experience.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Browse Jobs</h3>
                <p className="text-muted-foreground">
                  Explore available tuition assignments that match your expertise and preferences.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Apply & Teach</h3>
                <p className="text-muted-foreground">
                  Submit your application and start teaching once approved by parents and admins.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subject Categories */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Popular Subjects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find tutors for all major subjects across primary to university levels
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, name: "English", color: "text-chart-1" },
              { icon: Calculator, name: "Mathematics", color: "text-chart-2" },
              { icon: Globe, name: "Science", color: "text-chart-3" },
              { icon: GraduationCap, name: "Chinese", color: "text-chart-4" },
              { icon: Star, name: "Physics", color: "text-chart-5" },
              { icon: TrendingUp, name: "Chemistry", color: "text-chart-1" },
              { icon: BookOpen, name: "Biology", color: "text-chart-2" },
              { icon: Calculator, name: "Economics", color: "text-chart-3" },
            ].map((subject) => (
              <Card key={subject.name} className="hover-elevate cursor-pointer transition-all duration-200">
                <CardContent className="p-6 text-center">
                  <subject.icon className={`h-8 w-8 ${subject.color} mx-auto mb-3`} />
                  <h3 className="font-medium text-foreground">{subject.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Teaching?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of tutors making a difference in students' lives across Singapore.
          </p>
          <Link href="/register">
            <Button size="lg" variant="default" data-testid="button-cta-register">
              Create Your Tutor Profile
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground">Tutor SG</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Tutor SG. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
