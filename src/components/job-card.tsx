"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { MapPin, Calendar, DollarSign, User, BookOpen } from "lucide-react";
import type { Job } from "@/lib/db/schema";

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  applied?: boolean;
}

export function JobCard({ job, onApply, applied }: JobCardProps) {
  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-job-${job.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1" data-testid={`text-job-title-${job.id}`}>
            {job.subject}
          </h3>
          <p className="text-sm text-muted-foreground">{job.level}</p>
        </div>
        <StatusBadge status={job.status} />
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-foreground font-medium" data-testid={`text-job-rate-${job.id}`}>{job.rate}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground truncate" data-testid={`text-job-location-${job.id}`}>{job.location}</span>
          </div>

          {job.schedule && (
            <div className="flex items-center gap-2 text-sm col-span-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{job.schedule}</span>
            </div>
          )}

          {job.genderPref && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{job.genderPref} tutor</span>
            </div>
          )}

          {job.lessonsPerWeek && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{job.lessonsPerWeek}x/week</span>
            </div>
          )}
        </div>

        {job.mapUrl && (
          <a
            href={job.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            data-testid={`link-map-${job.id}`}
          >
            <MapPin className="h-3 w-3" />
            View on Google Maps
          </a>
        )}
      </CardContent>

      <CardFooter>
        {job.status === "Open" && onApply && (
          <Button
            className="w-full"
            onClick={() => onApply(job.id)}
            disabled={applied}
            data-testid={`button-apply-${job.id}`}
          >
            {applied ? "Applied" : "Apply Now"}
          </Button>
        )}
        {job.status !== "Open" && (
          <Button className="w-full" disabled>
            {job.status === "Filled" ? "Position Filled" : "Not Available"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
