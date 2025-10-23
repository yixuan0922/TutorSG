import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { insertTutorSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { User, BookOpen, GraduationCap, FileText } from "lucide-react";

const registerFormSchema = insertTutorSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  // Step 1: Personal Information - Make required fields mandatory
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().min(1, "Nationality is required"),
  // Step 2: Tutoring Preferences - Require at least one selection
  levels: z.array(z.string()).min(1, "Please select at least one level"),
  subjects: z.array(z.string()).min(1, "Please select at least one subject"),
  locations: z.array(z.string()).min(1, "Please select at least one location"),
  // Step 3: Qualifications - Make required fields mandatory
  tutorType: z.string().min(1, "Tutor type is required"),
  experienceYears: z.number().min(0, "Experience years is required"),
  education: z.string().min(1, "Highest education level is required"),
  // Step 4: Profile - Make introduction mandatory
  introduction: z.string().min(10, "Please write at least 10 characters for your introduction"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

// Constants for dropdowns
const NATIONALITIES = [
  "Singaporean",
  "Singapore PR",
  "Malaysian",
  "Chinese",
  "Indian",
  "Indonesian",
  "Filipino",
  "Vietnamese",
  "Thai",
  "Myanmar",
  "American",
  "British",
  "Australian",
  "Canadian",
  "Others"
];

const RACES = [
  "Chinese",
  "Malay",
  "Indian",
  "Eurasian",
  "Caucasian",
  "Others"
];

const TUTOR_TYPES = [
  "Poly / A Level Student",
  "Undergraduate",
  "Part-Time Tutor",
  "Full-Time Tutor",
  "NIE Trainee",
  "Ex-MOE Teacher",
  "Current MOE Teacher"
];

const EDUCATION_LEVELS = [
  "Poly Diploma",
  "A Levels",
  "Undergraduate",
  "Bachelor Degree",
  "Post-Graduate Diploma",
  "Masters Degree",
  "PHD",
  "Others"
];

// Subject categories
const SUBJECT_CATEGORIES = {
  "Pre-School": ["English", "Maths", "Chinese", "Creative Writing", "Phonics", "Malay", "Tamil"],
  "Primary School": ["English", "Maths", "Science", "Chinese", "Higher Chinese", "Malay", "Higher Malay", "Tamil", "Higher Tamil", "Hindi"],
  "Secondary School": ["English", "E Maths", "A Maths", "Physics", "Chemistry", "Biology", "Chinese", "Higher Chinese", "Geography", "History", "Literature", "Accounting (POA)", "Social Studies"],
  "Junior College": ["General Paper", "H1 Maths", "H2 Maths", "H2 Physics", "H2 Chemistry", "H2 Biology", "H2 Economics", "H2 Accounting", "H2 History", "H2 Geography", "H2 Literature", "Chinese", "Computing"],
  "IB / IGCSE": ["English Language", "English Literature", "Mathematics", "Physics", "Chemistry", "Biology", "Business & Management", "Economics", "Psychology", "Theory of Knowledge"],
  "Diploma / Degree": ["Business Admin", "Marketing", "Finance", "Accounting", "Mathematics", "Economics", "Law", "Engineering", "Computer Science"],
};

const LEVEL_OPTIONS = Object.keys(SUBJECT_CATEGORIES);

// Singapore regions
const LOCATIONS = [
  "North (Woodlands, Yishun, Sembawang)",
  "East (Tampines, Pasir Ris, Bedok)",
  "West (Jurong, Clementi, Bukit Batok)",
  "South (Harbourfront, Telok Blangah)",
  "North West (Bukit Panjang, Choa Chu Kang)",
  "North East (Punggol, Sengkang, Hougang)",
  "Central (Bishan, Toa Payoh, Orchard, City)"
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  
  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterFormData, "confirmPassword">) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "Your profile is pending admin approval. We'll notify you once approved.",
      });
      setLocation("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobile: "",
      dateOfBirth: "",
      gender: "",
      age: undefined,
      nationality: "Singaporean",
      race: "",
      nricLast4: "",
      subjects: [],
      levels: [],
      locations: [],
      tutorType: "",
      experienceYears: 0,
      education: "",
      qualification: "",
      introduction: "",
      teachingExperience: "",
      studentResults: "",
      otherInfo: "",
      hourlyRates: { min: 0, max: 0 },
      specialNeeds: false,
      languages: [],
      certifications: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...tutorData } = data;
    registerMutation.mutate(tutorData);
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(step);
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const getFieldsForStep = (stepNumber: number): (keyof RegisterFormData)[] => {
    switch (stepNumber) {
      case 1:
        return ["name", "email", "mobile", "password", "confirmPassword", "dateOfBirth", "gender", "nationality"];
      case 2:
        return ["subjects", "levels", "locations"];
      case 3:
        return ["tutorType", "experienceYears", "education"];
      case 4:
        return ["introduction"];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Become a Tutor</CardTitle>
            <CardDescription>
              Register to access daily tuition assignments across Singapore
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 rounded-full mx-1 transition-all ${
                      s <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Step {step} of 4: {
                  step === 1 ? "Personal Information" : 
                  step === 2 ? "Tutoring Preferences" : 
                  step === 3 ? "Qualifications & Experience" : 
                  "Tutor Profile"
                }
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <User className="w-5 h-5" />
                      Personal Information
                    </div>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name (As Per NRIC) *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+65 9123 4567" {...field} data-testid="input-mobile" />
                            </FormControl>
                            <FormDescription>You will be contacted via this number</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} value={field.value || ""} data-testid="input-dob" />
                            </FormControl>
                            <FormDescription>Required for verification</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="25" 
                                {...field} 
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                data-testid="input-age" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-gender">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-nationality">
                                  <SelectValue placeholder="Select nationality" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {NATIONALITIES.map((nat) => (
                                  <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="race"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Race</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-race">
                                  <SelectValue placeholder="Select race" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {RACES.map((race) => (
                                  <SelectItem key={race} value={race}>{race}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nricLast4"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last 4 Digits of NRIC</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="1234" 
                                maxLength={4}
                                {...field} 
                                value={field.value || ""}
                                data-testid="input-nric" 
                              />
                            </FormControl>
                            <FormDescription>For verification purposes</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} data-testid="input-password" />
                            </FormControl>
                            <FormDescription>Minimum 6 characters</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password *</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} data-testid="input-confirm-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <BookOpen className="w-5 h-5" />
                      Tutoring Preferences
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Levels and Subjects You Can Teach</h3>
                      <p className="text-sm text-muted-foreground">Select all that apply. Fill in as many as possible to increase your job matches.</p>
                      
                      <FormField
                        control={form.control}
                        name="levels"
                        render={() => (
                          <FormItem>
                            <FormLabel>Select Levels *</FormLabel>
                            <div className="space-y-2">
                              {LEVEL_OPTIONS.map((level) => (
                                <FormField
                                  key={level}
                                  control={form.control}
                                  name="levels"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(level)}
                                          onCheckedChange={(checked) => {
                                            const newLevels = checked
                                              ? [...(field.value || []), level]
                                              : (field.value || []).filter((value) => value !== level);
                                            field.onChange(newLevels);
                                            setSelectedLevels(newLevels);
                                          }}
                                          data-testid={`checkbox-level-${level.replace(/\s+/g, '-').toLowerCase()}`}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {level}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subjects"
                        render={() => (
                          <FormItem>
                            <FormLabel>Select Subjects *</FormLabel>
                            <FormDescription>
                              Subjects available based on selected levels
                            </FormDescription>
                            <div className="space-y-4 mt-4">
                              {selectedLevels.map((level) => (
                                <div key={level} className="space-y-2 border-l-2 border-primary/20 pl-4">
                                  <h4 className="font-medium text-sm">{level}</h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {SUBJECT_CATEGORIES[level as keyof typeof SUBJECT_CATEGORIES]?.map((subject) => (
                                      <FormField
                                        key={`${level}-${subject}`}
                                        control={form.control}
                                        name="subjects"
                                        render={({ field }) => (
                                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(subject)}
                                                onCheckedChange={(checked) => {
                                                  const newSubjects = checked
                                                    ? [...(field.value || []), subject]
                                                    : (field.value || []).filter((value) => value !== subject);
                                                  field.onChange(newSubjects);
                                                }}
                                                data-testid={`checkbox-subject-${subject.replace(/\s+/g, '-').toLowerCase()}`}
                                              />
                                            </FormControl>
                                            <FormLabel className="text-sm font-normal cursor-pointer">
                                              {subject}
                                            </FormLabel>
                                          </FormItem>
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="locations"
                      render={() => (
                        <FormItem>
                          <FormLabel>Preferred Teaching Locations *</FormLabel>
                          <FormDescription>Select all areas where you are willing to teach</FormDescription>
                          <div className="space-y-2 mt-2">
                            {LOCATIONS.map((location) => (
                              <FormField
                                key={location}
                                control={form.control}
                                name="locations"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(location)}
                                        onCheckedChange={(checked) => {
                                          const newLocations = checked
                                            ? [...(field.value || []), location]
                                            : (field.value || []).filter((value) => value !== location);
                                          field.onChange(newLocations);
                                        }}
                                        data-testid={`checkbox-location-${location.split(' ')[0].toLowerCase()}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {location}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <GraduationCap className="w-5 h-5" />
                      Academic Qualifications & Experience
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tutorType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type of Tutor *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <FormControl>
                                <SelectTrigger data-testid="select-tutor-type">
                                  <SelectValue placeholder="Select tutor type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TUTOR_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="experienceYears"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Teaching Experience *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                data-testid="input-experience-years" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Highest Education Level *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-education">
                                <SelectValue placeholder="Select highest education" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EDUCATION_LEVELS.map((edu) => (
                                <SelectItem key={edu} value={edu}>{edu}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Note: If you are an NIE Trained Teacher, please include NIE Qualifications in the field below
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University and Course</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="E.g., National University of Singapore - Bachelor of Science (Mathematics)" 
                              {...field}
                              value={field.value || ""}
                              data-testid="input-qualification" 
                            />
                          </FormControl>
                          <FormDescription>Include university name and course/major</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hourlyRates.min"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Hourly Rate (SGD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="30" 
                                value={field.value || ""}
                                onChange={(e) => {
                                  const currentRates = form.getValues("hourlyRates") || { min: 0, max: 0 };
                                  form.setValue("hourlyRates", {
                                    ...currentRates,
                                    min: e.target.value ? parseInt(e.target.value) : 0
                                  });
                                }}
                                data-testid="input-rate-min" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hourlyRates.max"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Hourly Rate (SGD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="80" 
                                value={field.value || ""}
                                onChange={(e) => {
                                  const currentRates = form.getValues("hourlyRates") || { min: 0, max: 0 };
                                  form.setValue("hourlyRates", {
                                    ...currentRates,
                                    max: e.target.value ? parseInt(e.target.value) : 0
                                  });
                                }}
                                data-testid="input-rate-max" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <FileText className="w-5 h-5" />
                      Tutor Profile
                    </div>

                    <p className="text-sm text-muted-foreground">
                      The following section will be a key factor in your success rate of assignment matching.
                      Fill in these questions to build a well-rounded profile which will be shown to our clients.
                    </p>

                    <FormField
                      control={form.control}
                      name="introduction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>1. Short Introduction of Yourself *</FormLabel>
                          <FormDescription>
                            Personal qualities (e.g., Patient, Kind, Responsible), teaching styles & methodologies
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Share your personal qualities, teaching approach, and what makes you a great tutor..." 
                              className="min-h-[100px]"
                              maxLength={500}
                              {...field}
                              value={field.value || ""}
                              data-testid="input-introduction"
                            />
                          </FormControl>
                          <FormDescription className="text-right">
                            {field.value?.length || 0}/500 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teachingExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>2. Summary of Teaching Experience & Academic Achievements</FormLabel>
                          <FormDescription>
                            Schools & tuition centers taught in, number of students, academic results, scholarships, etc.
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your teaching experience, where you've taught, and your academic achievements..." 
                              className="min-h-[100px]"
                              maxLength={500}
                              {...field}
                              value={field.value || ""}
                              data-testid="input-teaching-experience"
                            />
                          </FormControl>
                          <FormDescription className="text-right">
                            {field.value?.length || 0}/500 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="studentResults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>3. Results of Students / Track Record</FormLabel>
                          <FormDescription>
                            Past grades/improvement records of previous students
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Share success stories and results your students have achieved..." 
                              className="min-h-[100px]"
                              maxLength={500}
                              {...field}
                              value={field.value || ""}
                              data-testid="input-student-results"
                            />
                          </FormControl>
                          <FormDescription className="text-right">
                            {field.value?.length || 0}/500 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="otherInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>4. Other Selling Points as a Tutor</FormLabel>
                          <FormDescription>
                            Any other information that makes you stand out
                          </FormDescription>
                          <FormControl>
                            <Textarea 
                              placeholder="Highlight any unique skills, certifications, or qualities..." 
                              className="min-h-[100px]"
                              maxLength={500}
                              {...field}
                              value={field.value || ""}
                              data-testid="input-other-info"
                            />
                          </FormControl>
                          <FormDescription className="text-right">
                            {field.value?.length || 0}/500 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="flex-1"
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                  )}
                  
                  {step < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1"
                      data-testid="button-next"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className="flex-1"
                      data-testid="button-submit"
                    >
                      {registerMutation.isPending ? "Submitting..." : "Complete Registration"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
