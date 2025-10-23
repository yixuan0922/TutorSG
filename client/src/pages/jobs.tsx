import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Navbar } from "@/components/navbar";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter } from "lucide-react";
import type { Job } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const { toast } = useToast();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const tutorId = localStorage.getItem("tutorId");
      if (!tutorId) {
        throw new Error("Please log in to apply for jobs");
      }
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, jobId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Application failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted!",
        description: "Your application has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications/tutor"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const subjects = ["Mathematics", "English", "Science", "Physics", "Chemistry", "Biology", "Chinese"];
  const levels = ["Primary 1-3", "Primary 4-6", "Secondary 1-2", "Secondary 3-4", "JC 1-2", "University"];
  const locations = ["Tampines", "Jurong West", "Bishan", "Ang Mo Kio", "Bedok", "Woodlands"];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.level.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || job.subject === selectedSubject;
    const matchesLevel = !selectedLevel || job.level.includes(selectedLevel);
    const matchesLocation = !selectedLocation || job.location === selectedLocation;
    
    return matchesSearch && matchesSubject && matchesLevel && matchesLocation;
  });

  const handleApply = (jobId: string) => {
    applyMutation.mutate(jobId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Browse Tuition Jobs
          </h1>
          <p className="text-muted-foreground">
            Find and apply for tuition assignments that match your expertise
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Filters</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="search" className="mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                      data-testid="input-search"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Subject</Label>
                  <div className="space-y-2">
                    <Button
                      variant={!selectedSubject ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSubject("")}
                      className="w-full justify-start"
                      data-testid="button-filter-subject-all"
                    >
                      All Subjects
                    </Button>
                    {subjects.map((subject) => (
                      <Button
                        key={subject}
                        variant={selectedSubject === subject ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSubject(subject)}
                        className="w-full justify-start"
                        data-testid={`button-filter-subject-${subject.toLowerCase()}`}
                      >
                        {subject}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Level</Label>
                  <div className="space-y-2">
                    <Button
                      variant={!selectedLevel ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLevel("")}
                      className="w-full justify-start"
                      data-testid="button-filter-level-all"
                    >
                      All Levels
                    </Button>
                    {levels.map((level) => (
                      <Button
                        key={level}
                        variant={selectedLevel === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedLevel(level)}
                        className="w-full justify-start"
                        data-testid={`button-filter-level-${level.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Location</Label>
                  <div className="space-y-2">
                    <Button
                      variant={!selectedLocation ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLocation("")}
                      className="w-full justify-start"
                      data-testid="button-filter-location-all"
                    >
                      All Locations
                    </Button>
                    {locations.map((location) => (
                      <Button
                        key={location}
                        variant={selectedLocation === location ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedLocation(location)}
                        className="w-full justify-start"
                        data-testid={`button-filter-location-${location.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
              </p>
            </div>

            {isLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Loading jobs...</p>
                </CardContent>
              </Card>
            ) : filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No jobs found matching your criteria</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedSubject("");
                      setSelectedLevel("");
                      setSelectedLocation("");
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} onApply={handleApply} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
