"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Tutor, UpdateTutor } from "@/lib/db/schema";
import { updateTutorSchema } from "@/lib/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Lock, Bell, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";

const SUBJECTS = [
  "Mathematics", "English", "Science", "Physics", "Chemistry", "Biology",
  "Chinese", "Malay", "Tamil", "General Paper", "Economics", "Geography",
  "History", "Literature", "Accounting", "Computing", "Art", "Music"
];

const LEVELS = [
  "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
  "Secondary 1", "Secondary 2", "Secondary 3", "Secondary 4", "Secondary 5",
  "JC 1", "JC 2", "IB", "IGCSE", "Polytechnic"
];

const LOCATIONS = [
  "North", "South", "East", "West", "Central", "North-East",
  "Ang Mo Kio", "Bedok", "Bishan", "Bukit Batok", "Bukit Merah",
  "Bukit Panjang", "Bukit Timah", "Choa Chu Kang", "Clementi",
  "Geylang", "Hougang", "Jurong East", "Jurong West", "Kallang",
  "Marine Parade", "Pasir Ris", "Punggol", "Queenstown", "Sembawang",
  "Sengkang", "Serangoon", "Tampines", "Toa Payoh", "Woodlands", "Yishun"
];

const TUTOR_TYPES = ["Full-Time Tutor", "Part-Time Tutor", "Ex/Current MOE Teacher", "Undergraduate"];

const LANGUAGES = ["English", "Chinese", "Malay", "Tamil", "Others"];

export default function Settings() {
  const router = useRouter();
  const { toast } = useToast();
  const { tutorId, isTutor } = useAuth();

  useEffect(() => {
    if (!isTutor) {
      router.push("/login");
    }
  }, [isTutor, router]);

  const { data: tutor, isLoading } = useQuery<Tutor>({
    queryKey: [`/api/tutors/${tutorId}`],
    queryFn: async () => {
      const res = await fetch(`/api/tutors/${tutorId}`);
      if (!res.ok) throw new Error("Failed to fetch tutor");
      return res.json();
    },
    enabled: !!tutorId,
  });

  const form = useForm<UpdateTutor>({
    resolver: zodResolver(updateTutorSchema),
    defaultValues: {
      name: "",
      mobile: "",
      dateOfBirth: "",
      gender: "",
      age: undefined,
      nationality: "",
      race: "",
      nricLast4: "",
      subjects: [],
      levels: [],
      locations: [],
      tutorType: "",
      experienceYears: undefined,
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

  // Reset form when tutor data loads
  useEffect(() => {
    if (tutor) {
      form.reset({
        name: tutor.name,
        mobile: tutor.mobile,
        dateOfBirth: tutor.dateOfBirth || "",
        gender: tutor.gender || "",
        age: tutor.age || undefined,
        nationality: tutor.nationality || "",
        race: tutor.race || "",
        nricLast4: tutor.nricLast4 || "",
        subjects: tutor.subjects,
        levels: tutor.levels,
        locations: tutor.locations,
        tutorType: tutor.tutorType || "",
        experienceYears: tutor.experienceYears || undefined,
        education: tutor.education || "",
        qualification: tutor.qualification || "",
        introduction: tutor.introduction || "",
        teachingExperience: tutor.teachingExperience || "",
        studentResults: tutor.studentResults || "",
        otherInfo: tutor.otherInfo || "",
        hourlyRates: tutor.hourlyRates || { min: 0, max: 0 },
        specialNeeds: tutor.specialNeeds,
        languages: tutor.languages,
        certifications: tutor.certifications || "",
      });
    }
  }, [tutor, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateTutor) => {
      const response = await fetch(`/api/tutors/${tutorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tutors/${tutorId}`] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isTutor || !tutorId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded-lg w-64" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Profile not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const onSubmit = (data: UpdateTutor) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-settings">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="account" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="account" data-testid="tab-account">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="security" data-testid="tab-security">
                    <Lock className="mr-2 h-4 w-4" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="notifications" data-testid="tab-notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="account" className="space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>
                        Your contact details and personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <Label>Email (Read-only)</Label>
                        <Input value={tutor.email} disabled data-testid="input-email" />
                        <p className="text-xs text-muted-foreground">
                          Contact support to change your email
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" data-testid="input-mobile" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Personal Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Details</CardTitle>
                      <CardDescription>
                        Additional personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" value={field.value || ""} />
                              </FormControl>
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
                                  {...field}
                                  type="number"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
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
                              <FormLabel>Nationality</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g. Singaporean" value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="race"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Race</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select race" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Chinese">Chinese</SelectItem>
                                  <SelectItem value="Malay">Malay</SelectItem>
                                  <SelectItem value="Indian">Indian</SelectItem>
                                  <SelectItem value="Eurasian">Eurasian</SelectItem>
                                  <SelectItem value="Others">Others</SelectItem>
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
                              <FormLabel>NRIC Last 4 Digits</FormLabel>
                              <FormControl>
                                <Input {...field} maxLength={4} placeholder="e.g. 123A" value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tutoring Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tutoring Preferences</CardTitle>
                      <CardDescription>
                        Subjects, levels, and locations you teach
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="subjects"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subjects</FormLabel>
                            <div className="space-y-2">
                              <Select
                                onValueChange={(value) => {
                                  const currentValue = field.value || [];
                                  if (!currentValue.includes(value)) {
                                    field.onChange([...currentValue, value]);
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-subject">
                                    <SelectValue placeholder="Add subjects" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SUBJECTS.map((subject) => (
                                    <SelectItem key={subject} value={subject}>
                                      {subject}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex flex-wrap gap-2">
                                {(field.value || []).map((subject) => (
                                  <Badge key={subject} variant="secondary" className="gap-1">
                                    {subject}
                                    <button
                                      type="button"
                                      onClick={() => field.onChange((field.value || []).filter((s) => s !== subject))}
                                      className="hover:opacity-70 rounded-full"
                                      data-testid={`remove-subject-${subject}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="levels"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Levels</FormLabel>
                            <div className="space-y-2">
                              <Select
                                onValueChange={(value) => {
                                  const currentValue = field.value || [];
                                  if (!currentValue.includes(value)) {
                                    field.onChange([...currentValue, value]);
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-level">
                                    <SelectValue placeholder="Add levels" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {LEVELS.map((level) => (
                                    <SelectItem key={level} value={level}>
                                      {level}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex flex-wrap gap-2">
                                {(field.value || []).map((level) => (
                                  <Badge key={level} variant="secondary" className="gap-1">
                                    {level}
                                    <button
                                      type="button"
                                      onClick={() => field.onChange((field.value || []).filter((l) => l !== level))}
                                      className="hover:opacity-70 rounded-full"
                                      data-testid={`remove-level-${level}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="locations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Locations</FormLabel>
                            <div className="space-y-2">
                              <Select
                                onValueChange={(value) => {
                                  const currentValue = field.value || [];
                                  if (!currentValue.includes(value)) {
                                    field.onChange([...currentValue, value]);
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-location">
                                    <SelectValue placeholder="Add locations" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {LOCATIONS.map((location) => (
                                    <SelectItem key={location} value={location}>
                                      {location}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex flex-wrap gap-2">
                                {(field.value || []).map((location) => (
                                  <Badge key={location} variant="secondary" className="gap-1">
                                    {location}
                                    <button
                                      type="button"
                                      onClick={() => field.onChange((field.value || []).filter((l) => l !== location))}
                                      className="hover:opacity-70 rounded-full"
                                      data-testid={`remove-location-${location}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Qualifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Qualifications & Experience</CardTitle>
                      <CardDescription>
                        Your professional background and expertise
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="tutorType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tutor Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TUTOR_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
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
                              <FormLabel>Years of Experience</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                            <FormLabel>Education</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. Bachelor of Science, NUS" value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="qualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qualification</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. NIE Trained Teacher" value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="certifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certifications</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="List any relevant certifications" value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Profile Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Details</CardTitle>
                      <CardDescription>
                        Tell parents about your teaching approach and achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="introduction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Introduction</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Introduce yourself to potential students and parents" rows={4} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="teachingExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teaching Experience</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Describe your teaching experience and methodology" rows={4} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="studentResults"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student Results & Achievements</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Share notable student achievements and improvements" rows={4} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="otherInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Other Information</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Any other relevant information" rows={3} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Additional Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Settings</CardTitle>
                      <CardDescription>
                        Rates, languages, and special needs teaching
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="hourlyRates.min"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Hourly Rate ($)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
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
                              <FormLabel>Maximum Hourly Rate ($)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="languages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Languages Spoken</FormLabel>
                            <div className="space-y-2">
                              <Select
                                onValueChange={(value) => {
                                  const currentValue = field.value || [];
                                  if (!currentValue.includes(value)) {
                                    field.onChange([...currentValue, value]);
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Add languages" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {LANGUAGES.map((language) => (
                                    <SelectItem key={language} value={language}>
                                      {language}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex flex-wrap gap-2">
                                {(field.value || []).map((language) => (
                                  <Badge key={language} variant="secondary" className="gap-1">
                                    {language}
                                    <button
                                      type="button"
                                      onClick={() => field.onChange((field.value || []).filter((l) => l !== language))}
                                      className="hover:opacity-70 rounded-full"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialNeeds"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Special Needs Experience</FormLabel>
                              <FormDescription>
                                I have experience teaching students with special needs
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={updateMutation.isPending}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>
                        Change your password to keep your account secure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Password management features coming soon. Contact support if you need to reset your password.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Manage how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Notification settings coming soon. You'll be able to customize your preferences here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
