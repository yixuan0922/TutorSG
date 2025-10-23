import type { Job, Tutor } from "@shared/schema";

interface JobMatch {
  job: Job;
  score: number;
  matchReasons: string[];
}

/**
 * Calculate how well a job matches a tutor's profile
 * Returns a score from 0-100 (higher = better match)
 */
export function calculateJobMatchScore(job: Job, tutor: Tutor): number {
  let score = 0;
  
  // Subject match (30 points)
  if (tutor.subjects.some(subject => 
    job.subject.toLowerCase().includes(subject.toLowerCase()) ||
    subject.toLowerCase().includes(job.subject.toLowerCase())
  )) {
    score += 30;
  }
  
  // Level match (30 points)
  if (tutor.levels.some(level => 
    job.level.toLowerCase().includes(level.toLowerCase()) ||
    level.toLowerCase().includes(job.level.toLowerCase())
  )) {
    score += 30;
  }
  
  // Location match (20 points)
  if (tutor.locations.some(location => 
    job.location.toLowerCase().includes(location.toLowerCase()) ||
    location.toLowerCase().includes(job.location.toLowerCase())
  )) {
    score += 20;
  }
  
  // Rate compatibility (20 points)
  if (tutor.hourlyRates) {
    const rateScore = calculateRateCompatibility(job.rate, tutor.hourlyRates);
    score += rateScore;
  }
  
  return score;
}

/**
 * Calculate rate compatibility between job rate and tutor's hourly rates
 * Returns a score from 0-20
 */
function calculateRateCompatibility(
  jobRate: string, 
  tutorRates: { min: number; max: number }
): number {
  // Extract numeric value from job rate string (e.g., "$50/hour" -> 50)
  const rateMatch = jobRate.match(/\$?(\d+)/);
  if (!rateMatch) return 0;
  
  const jobRateValue = parseInt(rateMatch[1]);
  
  // Perfect match: job rate is within tutor's range
  if (jobRateValue >= tutorRates.min && jobRateValue <= tutorRates.max) {
    return 20;
  }
  
  // Close match: job rate is within 20% of tutor's range
  const tolerance = 0.2;
  const minWithTolerance = tutorRates.min * (1 - tolerance);
  const maxWithTolerance = tutorRates.max * (1 + tolerance);
  
  if (jobRateValue >= minWithTolerance && jobRateValue <= maxWithTolerance) {
    return 10;
  }
  
  // Partial match: job rate is within 40% of tutor's range
  const wideTolerance = 0.4;
  const minWide = tutorRates.min * (1 - wideTolerance);
  const maxWide = tutorRates.max * (1 + wideTolerance);
  
  if (jobRateValue >= minWide && jobRateValue <= maxWide) {
    return 5;
  }
  
  return 0;
}

/**
 * Get match reasons for display purposes
 */
export function getMatchReasons(job: Job, tutor: Tutor): string[] {
  const reasons: string[] = [];
  
  // Check subject match
  const subjectMatch = tutor.subjects.find(subject => 
    job.subject.toLowerCase().includes(subject.toLowerCase()) ||
    subject.toLowerCase().includes(job.subject.toLowerCase())
  );
  if (subjectMatch) {
    reasons.push(`Matches your subject: ${subjectMatch}`);
  }
  
  // Check level match
  const levelMatch = tutor.levels.find(level => 
    job.level.toLowerCase().includes(level.toLowerCase()) ||
    level.toLowerCase().includes(job.level.toLowerCase())
  );
  if (levelMatch) {
    reasons.push(`Matches your level: ${levelMatch}`);
  }
  
  // Check location match
  const locationMatch = tutor.locations.find(location => 
    job.location.toLowerCase().includes(location.toLowerCase()) ||
    location.toLowerCase().includes(job.location.toLowerCase())
  );
  if (locationMatch) {
    reasons.push(`Near your location: ${locationMatch}`);
  }
  
  // Check rate compatibility
  if (tutor.hourlyRates) {
    const rateScore = calculateRateCompatibility(job.rate, tutor.hourlyRates);
    if (rateScore >= 20) {
      reasons.push("Rate matches your range");
    } else if (rateScore >= 10) {
      reasons.push("Rate close to your range");
    }
  }
  
  return reasons;
}

/**
 * Sort jobs by relevance to tutor profile
 * Returns jobs sorted by match score (best matches first)
 */
export function sortJobsByRelevance(jobs: Job[], tutor: Tutor): JobMatch[] {
  return jobs
    .map(job => ({
      job,
      score: calculateJobMatchScore(job, tutor),
      matchReasons: getMatchReasons(job, tutor),
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Get recommended jobs (only jobs with good match scores)
 * Returns top matches with score >= 30 (at least one criteria matched)
 */
export function getRecommendedJobs(jobs: Job[], tutor: Tutor, limit: number = 4): JobMatch[] {
  const sortedJobs = sortJobsByRelevance(jobs, tutor);
  return sortedJobs.filter(match => match.score >= 30).slice(0, limit);
}
