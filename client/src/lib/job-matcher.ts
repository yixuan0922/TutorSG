import type { Job, Tutor } from "@shared/schema";

interface JobMatch {
  job: Job;
  score: number;
  matchReasons: string[];
}

/**
 * Normalize text for fuzzy matching
 * Handles common variations and abbreviations
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[()]/g, "") // Remove parentheses
    .trim();
}

/**
 * Comprehensive subject mapping for Singapore education system
 */
const SUBJECT_MAPPINGS: Record<string, string[]> = {
  // Mathematics
  "mathematics": ["math", "maths", "e maths", "a maths", "elementary mathematics", "additional mathematics", "h1 math", "h2 math", "h1 maths", "h2 maths"],
  // Sciences
  "science": ["sciences", "combined science", "integrated science"],
  "physics": ["phys", "h1 physics", "h2 physics"],
  "chemistry": ["chem", "h1 chemistry", "h2 chemistry"],
  "biology": ["bio", "h1 biology", "h2 biology"],
  // Languages
  "english": ["eng", "english language", "english literature", "h1 english", "h2 english"],
  "chinese": ["mandarin", "higher chinese", "h1 chinese", "h2 chinese", "hcl", "cl", "mother tongue"],
  "malay": ["higher malay", "h1 malay", "h2 malay"],
  "tamil": ["higher tamil", "h1 tamil", "h2 tamil"],
  // Humanities & Social Sciences
  "general paper": ["gp", "h1 gp", "knowledge and inquiry", "ki"],
  "economics": ["econs", "econ", "h1 economics", "h2 economics", "h1 econs", "h2 econs"],
  "geography": ["geog", "geo", "h1 geography", "h2 geography"],
  "history": ["hist", "h1 history", "h2 history"],
  "literature": ["lit", "english literature", "h1 literature", "h2 literature"],
  // Others
  "accounting": ["acc", "accounts", "accountancy", "h1 accounting", "h2 accounting"],
  "computing": ["comp", "computer science", "cs", "h1 computing", "h2 computing"],
  "art": ["h1 art", "h2 art", "visual arts"],
  "music": ["h1 music", "h2 music"],
};

/**
 * Level mapping for Singapore education system
 */
const LEVEL_MAPPINGS: Record<string, string[]> = {
  "primary school": ["pri", "primary", "p1", "p2", "p3", "p4", "p5", "p6", "primary 1", "primary 2", "primary 3", "primary 4", "primary 5", "primary 6", "primary 1-3", "primary 4-6"],
  "secondary school": ["sec", "secondary", "s1", "s2", "s3", "s4", "s5", "secondary 1", "secondary 2", "secondary 3", "secondary 4", "secondary 5", "secondary 1-2", "secondary 3-4", "o level", "o-level", "n level", "n-level"],
  "junior college": ["jc", "jc1", "jc2", "j1", "j2", "junior college 1", "junior college 2", "jc 1-2", "a level", "a-level"],
  "pre-school": ["preschool", "kindergarten", "k1", "k2", "nursery", "pre school"],
  "ib": ["international baccalaureate", "ib diploma", "ibdp"],
  "igcse": ["international gcse", "cambridge igcse"],
  "diploma": ["polytechnic", "poly", "dip"],
};

/**
 * Check if two strings match with fuzzy logic
 * Handles common educational term variations
 */
function fuzzyMatch(value1: string, value2: string): boolean {
  const norm1 = normalize(value1);
  const norm2 = normalize(value2);
  
  // Exact match after normalization
  if (norm1 === norm2) return true;
  
  // Substring match (bidirectional)
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
  // Check subject mappings
  for (const [canonical, variants] of Object.entries(SUBJECT_MAPPINGS)) {
    const allForms = [canonical, ...variants];
    const match1 = allForms.some(form => norm1.includes(form) || form.includes(norm1));
    const match2 = allForms.some(form => norm2.includes(form) || form.includes(norm2));
    if (match1 && match2) return true;
  }
  
  // Check level mappings
  for (const [canonical, variants] of Object.entries(LEVEL_MAPPINGS)) {
    const allForms = [canonical, ...variants];
    const match1 = allForms.some(form => norm1.includes(form) || form.includes(norm1));
    const match2 = allForms.some(form => norm2.includes(form) || form.includes(norm2));
    if (match1 && match2) return true;
  }
  
  // Check for number matches in educational context (e.g., "Primary 3" matches "P3" or "3")
  // Also handle ranges (e.g., "Primary 1-3" matches "Primary 2")
  const nums1 = norm1.match(/\d+/g);
  const nums2 = norm2.match(/\d+/g);
  
  if (nums1 && nums2) {
    const isLevel1 = /primary|secondary|p\d|s\d|jc|grade|year/.test(norm1);
    const isLevel2 = /primary|secondary|p\d|s\d|jc|grade|year/.test(norm2);
    
    if (isLevel1 && isLevel2) {
      // Check if one is a range and the other is a single number
      if (nums1.length === 2 && nums2.length === 1) {
        // norm1 is a range, norm2 is single
        const min = parseInt(nums1[0]);
        const max = parseInt(nums1[1]);
        const value = parseInt(nums2[0]);
        if (value >= min && value <= max) return true;
      } else if (nums1.length === 1 && nums2.length === 2) {
        // norm2 is a range, norm1 is single
        const value = parseInt(nums1[0]);
        const min = parseInt(nums2[0]);
        const max = parseInt(nums2[1]);
        if (value >= min && value <= max) return true;
      } else if (nums1.length === 1 && nums2.length === 1) {
        // Both are single numbers
        if (nums1[0] === nums2[0]) return true;
      } else if (nums1.length === 2 && nums2.length === 2) {
        // Both are ranges - check if they overlap
        const min1 = parseInt(nums1[0]);
        const max1 = parseInt(nums1[1]);
        const min2 = parseInt(nums2[0]);
        const max2 = parseInt(nums2[1]);
        if (max1 >= min2 && max2 >= min1) return true; // Ranges overlap
      }
    }
  }
  
  return false;
}

/**
 * Parse rate from string, handling ranges and different formats
 * Examples: "$50/hour", "$40-$60/hour", "$40 to $60", "S$40–$60/hr", "50"
 * Returns the midpoint for ranges, or the single value
 */
function parseRate(rateString: string): number | null {
  // Remove common text and normalize
  const cleaned = rateString
    .toLowerCase()
    .replace(/\/hour|\/hr|per hour|per hr|hour|hr|s\$/g, "")
    .replace(/\$/g, "") // Remove all $ signs
    .trim();
  
  // Try to match range patterns with various separators
  // Handles: "40-60", "40–60" (en dash), "40 - 60", "40 to 60", "40~60"
  const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*[-–~]|to\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    // Extract both numbers from the full string
    const numbers = cleaned.match(/(\d+(?:\.\d+)?)/g);
    if (numbers && numbers.length >= 2) {
      const min = parseFloat(numbers[0]);
      const max = parseFloat(numbers[1]);
      return (min + max) / 2; // Return midpoint
    }
  }
  
  // Try to match single value: "50" or "50.5"
  const singleMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (singleMatch) {
    return parseFloat(singleMatch[1]);
  }
  
  return null;
}

/**
 * Calculate how well a job matches a tutor's profile
 * Returns a score from 0-100 (higher = better match)
 */
export function calculateJobMatchScore(job: Job, tutor: Tutor): number {
  let score = 0;
  
  // Subject match (30 points)
  if (tutor.subjects.some(subject => fuzzyMatch(job.subject, subject))) {
    score += 30;
  }
  
  // Level match (30 points)
  if (tutor.levels.some(level => fuzzyMatch(job.level, level))) {
    score += 30;
  }
  
  // Location match (20 points)
  if (tutor.locations.some(location => fuzzyMatch(job.location, location))) {
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
  const jobRateValue = parseRate(jobRate);
  if (jobRateValue === null) return 0;
  
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
  const subjectMatch = tutor.subjects.find(subject => fuzzyMatch(job.subject, subject));
  if (subjectMatch) {
    reasons.push(`Matches your subject: ${subjectMatch}`);
  }
  
  // Check level match
  const levelMatch = tutor.levels.find(level => fuzzyMatch(job.level, level));
  if (levelMatch) {
    reasons.push(`Matches your level: ${levelMatch}`);
  }
  
  // Check location match
  const locationMatch = tutor.locations.find(location => fuzzyMatch(job.location, location));
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
