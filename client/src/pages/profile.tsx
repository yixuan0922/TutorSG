import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Tutor } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  DollarSign,
  Calendar,
  Award,
  Edit
} from "lucide-react";

export default function Profile() {
  const [, setLocation] = useLocation();
  const tutorId = localStorage.getItem("tutorId");

  const { data: tutor, isLoading } = useQuery<Tutor>({
    queryKey: ["/api/tutors", tutorId],
    enabled: !!tutorId,
  });

  if (!tutorId) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Profile not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(tutor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight" data-testid="text-tutor-name">{tutor.name}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant={tutor.status === "Active" ? "default" : "secondary"} data-testid="badge-status">
                      {tutor.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button onClick={() => setLocation("/settings")} data-testid="button-edit-profile">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How to reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium" data-testid="text-email">{tutor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium" data-testid="text-mobile">{tutor.mobile}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Teaching Details</CardTitle>
                <CardDescription>Your preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tutor.hourlyRates && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Hourly Rates</p>
                      <p className="font-medium" data-testid="text-rates">
                        ${tutor.hourlyRates.min} - ${tutor.hourlyRates.max}/hour
                      </p>
                    </div>
                  </div>
                )}
                {tutor.specialNeeds && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Special Needs</p>
                      <p className="font-medium">Experienced with special needs students</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subjects & Levels
              </CardTitle>
              <CardDescription>What you teach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Subjects</h3>
                <div className="flex flex-wrap gap-2" data-testid="container-subjects">
                  {tutor.subjects.map((subject, index) => (
                    <Badge key={index} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Levels</h3>
                <div className="flex flex-wrap gap-2" data-testid="container-levels">
                  {tutor.levels.map((level, index) => (
                    <Badge key={index} variant="secondary">
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Preferred Locations
              </CardTitle>
              <CardDescription>Areas you're willing to teach in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2" data-testid="container-locations">
                {tutor.locations.map((location, index) => (
                  <Badge key={index} variant="outline">
                    {location}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Qualifications & Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tutor.tutorType && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Tutor Type</h3>
                  <p className="font-medium" data-testid="text-tutor-type">{tutor.tutorType}</p>
                </div>
              )}
              {tutor.education && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Education</h3>
                  <p className="font-medium" data-testid="text-education">{tutor.education}</p>
                </div>
              )}
              {tutor.qualification && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Qualification</h3>
                  <p className="font-medium" data-testid="text-qualification">{tutor.qualification}</p>
                </div>
              )}
              {tutor.experienceYears !== null && tutor.experienceYears !== undefined && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Years of Experience</h3>
                  <p className="font-medium" data-testid="text-experience">
                    {tutor.experienceYears} {tutor.experienceYears === 1 ? "year" : "years"}
                  </p>
                </div>
              )}
              {tutor.introduction && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Introduction</h3>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-introduction">{tutor.introduction}</p>
                </div>
              )}
              {tutor.teachingExperience && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Teaching Experience</h3>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-teaching-experience">{tutor.teachingExperience}</p>
                </div>
              )}
              {tutor.studentResults && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Student Results</h3>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-student-results">{tutor.studentResults}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
