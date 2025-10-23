import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Navbar } from "@/components/navbar";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  CheckCircle,
  UserCheck,
  UserX,
  Plus,
  Search,
  Edit,
  Trash2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Tutor, Job } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    subject: "",
    level: "",
    rate: "",
    location: "",
    schedule: "",
    genderPref: "",
    lessonsPerWeek: 0,
  });
  const { toast } = useToast();
  const adminId = localStorage.getItem("adminId");

  useEffect(() => {
    if (!adminId) {
      window.location.href = "/login";
    }
  }, [adminId]);

  const { data: tutors = [] } = useQuery<Tutor[]>({
    queryKey: ["/api/tutors"],
  });

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const activeTutors = tutors.filter(t => t.status === "Active").length;
  const openJobs = jobs.filter(j => j.status === "Open").length;
  const filledJobs = jobs.filter(j => j.status === "Filled").length;

  const approveTutorMutation = useMutation({
    mutationFn: async (tutorId: string) => {
      const response = await fetch(`/api/tutors/${tutorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Active" }),
      });
      if (!response.ok) throw new Error("Failed to approve tutor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
      toast({
        title: "Tutor approved",
        description: "The tutor has been approved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const suspendTutorMutation = useMutation({
    mutationFn: async (tutorId: string) => {
      const response = await fetch(`/api/tutors/${tutorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Suspended" }),
      });
      if (!response.ok) throw new Error("Failed to suspend tutor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutors"] });
      toast({
        title: "Tutor suspended",
        description: "The tutor has been suspended successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Suspension failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete job");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job deleted",
        description: "The job posting has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: typeof newJob) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) throw new Error("Failed to create job");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setJobDialogOpen(false);
      setNewJob({
        subject: "",
        level: "",
        rate: "",
        location: "",
        schedule: "",
        genderPref: "",
        lessonsPerWeek: 0,
      });
      toast({
        title: "Job created",
        description: "The job posting has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApproveTutor = (tutorId: string) => {
    approveTutorMutation.mutate(tutorId);
  };

  const handleSuspendTutor = (tutorId: string) => {
    suspendTutorMutation.mutate(tutorId);
  };

  const handleDeleteJob = (jobId: string) => {
    deleteJobMutation.mutate(jobId);
  };

  const handleCreateJob = () => {
    createJobMutation.mutate(newJob);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage tutors, jobs, and platform analytics
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Tutors</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-stat-active-tutors">
                    {activeTutors}
                  </p>
                </div>
                <Users className="h-8 w-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Open Jobs</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-stat-open-jobs">
                    {openJobs}
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
                  <p className="text-sm text-muted-foreground mb-1">Filled Jobs</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-stat-filled-jobs">
                    {filledJobs}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-foreground">95%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tutors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="tutors" data-testid="tab-tutors">Tutors</TabsTrigger>
            <TabsTrigger value="jobs" data-testid="tab-jobs">Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="tutors" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>Manage Tutors</CardTitle>
                  <CardDescription>Approve, suspend, or manage tutor accounts</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tutors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-[250px]"
                    data-testid="input-search-tutors"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tutors.map((tutor) => (
                        <TableRow key={tutor.id} data-testid={`row-tutor-${tutor.id}`}>
                          <TableCell className="font-medium">{tutor.name}</TableCell>
                          <TableCell>{tutor.email}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {tutor.subjects.slice(0, 2).map((subject) => (
                                <span 
                                  key={subject}
                                  className="text-xs bg-muted px-2 py-1 rounded"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{tutor.experienceYears}y</TableCell>
                          <TableCell>
                            <StatusBadge status={tutor.status} variant="sm" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {tutor.status === "Pending" && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApproveTutor(tutor.id)}
                                  disabled={approveTutorMutation.isPending}
                                  data-testid={`button-approve-${tutor.id}`}
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  {approveTutorMutation.isPending ? "Approving..." : "Approve"}
                                </Button>
                              )}
                              {tutor.status === "Active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSuspendTutor(tutor.id)}
                                  disabled={suspendTutorMutation.isPending}
                                  data-testid={`button-suspend-${tutor.id}`}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  {suspendTutorMutation.isPending ? "Suspending..." : "Suspend"}
                                </Button>
                              )}
                              {tutor.status === "Suspended" && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApproveTutor(tutor.id)}
                                  data-testid={`button-reactivate-${tutor.id}`}
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Reactivate
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>Manage Jobs</CardTitle>
                  <CardDescription>Post, edit, or close tuition assignments</CardDescription>
                </div>
                <Dialog open={jobDialogOpen} onOpenChange={setJobDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" data-testid="button-post-job">
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Post New Tuition Job</DialogTitle>
                      <DialogDescription>
                        Create a new tuition assignment for tutors to apply
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input 
                            id="subject" 
                            placeholder="Mathematics" 
                            value={newJob.subject}
                            onChange={(e) => setNewJob({ ...newJob, subject: e.target.value })}
                            data-testid="input-job-subject" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="level">Level</Label>
                          <Input 
                            id="level" 
                            placeholder="Secondary 3" 
                            value={newJob.level}
                            onChange={(e) => setNewJob({ ...newJob, level: e.target.value })}
                            data-testid="input-job-level" 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rate">Hourly Rate</Label>
                          <Input 
                            id="rate" 
                            placeholder="$50-60/hr" 
                            value={newJob.rate}
                            onChange={(e) => setNewJob({ ...newJob, rate: e.target.value })}
                            data-testid="input-job-rate" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input 
                            id="location" 
                            placeholder="Tampines" 
                            value={newJob.location}
                            onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                            data-testid="input-job-location" 
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="schedule">Schedule</Label>
                        <Input 
                          id="schedule" 
                          placeholder="Weekends 2-4pm" 
                          value={newJob.schedule}
                          onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })}
                          data-testid="input-job-schedule" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gender">Gender Preference</Label>
                          <Input 
                            id="gender" 
                            placeholder="Female (optional)" 
                            value={newJob.genderPref || ""}
                            onChange={(e) => setNewJob({ ...newJob, genderPref: e.target.value })}
                            data-testid="input-job-gender" 
                          />
                        </div>
                        <div>
                          <Label htmlFor="lessons">Lessons Per Week</Label>
                          <Input 
                            id="lessons" 
                            type="number" 
                            placeholder="2" 
                            value={newJob.lessonsPerWeek || ""}
                            onChange={(e) => setNewJob({ ...newJob, lessonsPerWeek: parseInt(e.target.value) || 0 })}
                            data-testid="input-job-lessons" 
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleCreateJob}
                        disabled={createJobMutation.isPending}
                        data-testid="button-create-job"
                      >
                        {createJobMutation.isPending ? "Creating..." : "Create Job Posting"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Applicants</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                          <TableCell className="font-medium">{job.subject}</TableCell>
                          <TableCell>{job.level}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>{job.rate}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>
                            <StatusBadge status={job.status} variant="sm" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                data-testid={`button-edit-${job.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteJob(job.id)}
                                disabled={deleteJobMutation.isPending}
                                data-testid={`button-delete-${job.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
