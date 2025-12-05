"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, Star } from "lucide-react";
import type { Job, Tutor } from "@/lib/db/schema";
import { useToast } from "@/hooks/use-toast";
import { sortJobsByRelevance } from "@/lib/job-matcher";
import { Badge } from "@/components/ui/badge";

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [tutorId, setTutorId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTutorId(localStorage.getItem("tutorId"));
  }, []);

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: tutor } = useQuery<Tutor>({
    queryKey: ["/api/tutors", tutorId],
    enabled: !!tutorId,
  });

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const storedTutorId = localStorage.getItem("tutorId");
      if (!storedTutorId) {
        throw new Error("Please log in to apply for jobs");
      }
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId: storedTutorId, jobId }),
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

  const subjects = [
    "Mathematics",
    "English",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
    "Chinese",
  ];
  const levels = [
    "Primary 1-3",
    "Primary 4-6",
    "Secondary 1-2",
    "Secondary 3-4",
    "JC 1-2",
    "University",
  ];
  const locations = [
    "Tampines",
    "Jurong West",
    "Bishan",
    "Ang Mo Kio",
    "Bedok",
    "Woodlands",
  ];

  const manuallyFilteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.level.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || job.subject === selectedSubject;
    const matchesLevel = !selectedLevel || job.level.includes(selectedLevel);
    const matchesLocation =
      !selectedLocation || job.location === selectedLocation;

    return matchesSearch && matchesSubject && matchesLevel && matchesLocation;
  });

  const sortedJobs = tutor
    ? sortJobsByRelevance(manuallyFilteredJobs, tutor)
    : manuallyFilteredJobs.map((job) => ({ job, score: 0, matchReasons: [] }));

  const filteredJobs = sortedJobs.map((match) => match.job);

  const handleApply = (jobId: string) => {
    applyMutation.mutate(jobId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-foreground mb-2"
            data-testid="text-page-title"
          >
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
                  <Label htmlFor="search" className="mb-2 block">
                    Search
                  </Label>
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
                    >
                      All Subjects
                    </Button>
                    {subjects.map((subject) => (
                      <Button
                        key={subject}
                        variant={
                          selectedSubject === subject ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedSubject(subject)}
                        className="w-full justify-start"
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
                    >
                      All Locations
                    </Button>
                    {locations.map((location) => (
                      <Button
                        key={location}
                        variant={
                          selectedLocation === location ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedLocation(location)}
                        className="w-full justify-start"
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
              <p className="text-sm text-muted-foreground">
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1 ? "job" : "jobs"} found
                {tutor && tutorId && (
                  <span className="ml-2 text-primary">
                    <Star className="w-3 h-3 inline mb-1" /> Sorted by relevance
                    to your profile
                  </span>
                )}
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
                  <p className="text-muted-foreground">
                    No jobs found matching your criteria
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedSubject("");
                      setSelectedLevel("");
                      setSelectedLocation("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {sortedJobs.map((match) => (
                  <div key={match.job.id} className="space-y-2">
                    <JobCard job={match.job} onApply={handleApply} />
                    {tutor && tutorId && match.matchReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {match.matchReasons.map((reason, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
