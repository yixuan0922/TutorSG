import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Navbar } from "@/components/navbar";
import { StatusBadge } from "@/components/status-badge";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Briefcase, 
  CheckCircle, 
  Clock,
  Eye,
  Edit,
  Send
} from "lucide-react";
import { SiTelegram } from "react-icons/si";
import type { Tutor, Job, ApplicationWithRelations } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [profileComplete, setProfileComplete] = useState(65);
  const [publicProfile, setPublicProfile] = useState(false);
  const { toast } = useToast();
  const tutorId = localStorage.getItem("tutorId");

  useEffect(() => {
    if (!tutorId) {
      window.location.href = "/login";
    }
  }, [tutorId]);

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, jobId }),
      });
      if (!response.ok) {
        throw new Error("Application failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted!",
        description: "Your application has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/tutor", tutorId] });
    },
    onError: () => {
      toast({
        title: "Application failed",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: tutor } = useQuery<Tutor>({
    queryKey: ["/api/tutors", tutorId],
    enabled: !!tutorId,
  });

  const { data: applications = [] } = useQuery<ApplicationWithRelations[]>({
    queryKey: ["/api/applications/tutor", tutorId],
    enabled: !!tutorId,
  });

  const { data: recommendedJobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  if (!tutor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const mockTutor = tutor;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Welcome back, {mockTutor.name}!
          </h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={mockTutor.status} />
            <span className="text-sm text-muted-foreground">
              Account Status
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Applications</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-stat-applications">
                    {mockApplications.length}
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Profile</p>
                  <p className="text-3xl font-bold text-foreground">{profileComplete}%</p>
                </div>
                <User className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Subjects</p>
                  <p className="text-3xl font-bold text-foreground">{mockTutor.subjects.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Experience</p>
                  <p className="text-3xl font-bold text-foreground">{mockTutor.experienceYears}y</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion */}
        {profileComplete < 100 && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add more details to increase your chances of getting matched with students
                  </p>
                  <Progress value={profileComplete} className="mb-2" />
                  <p className="text-sm text-muted-foreground">{profileComplete}% complete</p>
                </div>
                <Button variant="default" data-testid="button-complete-profile">
                  Complete Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Join Telegram */}
        <Card className="mb-8 bg-gradient-to-r from-chart-1/10 to-chart-2/10 border-chart-1/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-chart-1 rounded-lg flex items-center justify-center">
                  <SiTelegram className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Join Our Telegram Channel</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant notifications for new job postings
                  </p>
                </div>
              </div>
              <Button variant="default" data-testid="button-join-telegram">
                <Send className="h-4 w-4 mr-2" />
                Join Channel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="applications" data-testid="tab-applications">My Applications</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
                <CardDescription>Based on your profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {recommendedJobs.slice(0, 4).map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onApply={(jobId) => applyMutation.mutate(jobId)} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">You haven't applied to any jobs yet</p>
                    <Button variant="outline" className="mt-4" data-testid="button-browse-jobs">
                      Browse Available Jobs
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <Card key={app.id} data-testid={`card-application-${app.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">
                                {app.job.subject} - {app.job.level}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">{app.job.location}</p>
                              <p className="text-sm text-foreground">{app.job.rate}</p>
                            </div>
                            <StatusBadge status={app.status} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your tutor profile and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={mockTutor.name} data-testid="input-name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={mockTutor.email} data-testid="input-email" />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input id="mobile" defaultValue={mockTutor.mobile} data-testid="input-mobile" />
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input id="experience" type="number" defaultValue={mockTutor.experienceYears} data-testid="input-experience" />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border border-border">
                  <Checkbox 
                    id="public-profile" 
                    checked={publicProfile}
                    onCheckedChange={(checked) => setPublicProfile(checked as boolean)}
                    data-testid="checkbox-public-profile"
                  />
                  <div className="flex-1">
                    <Label htmlFor="public-profile" className="cursor-pointer font-medium">
                      Enable Public Profile
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow parents and students to view your profile publicly
                    </p>
                  </div>
                  {publicProfile && (
                    <Button variant="outline" size="sm" data-testid="button-view-profile">
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button variant="default" data-testid="button-save-profile">
                    <Edit className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" data-testid="button-change-password">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
