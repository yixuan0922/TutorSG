"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertTutorSchema } from "@/lib/db/schema";
import { useToast } from "@/hooks/use-toast";
import { User, BookOpen, GraduationCap, FileText } from "lucide-react";

const registerFormSchema = insertTutorSchema
  .extend({
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),
    nationality: z.string().min(1, "Nationality is required"),
    levels: z.array(z.string()).min(1, "Please select at least one level"),
    subjects: z.array(z.string()).min(1, "Please select at least one subject"),
    locations: z
      .array(z.string())
      .min(1, "Please select at least one location"),
    tutorType: z.string().min(1, "Tutor type is required"),
    experienceYears: z.number().min(0, "Experience years is required"),
    education: z.string().min(1, "Highest education level is required"),
    introduction: z
      .string()
      .min(10, "Please write at least 10 characters for your introduction"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

const NATIONALITIES = [
  "Singaporean",
  "Singapore PR",
  "Malaysian",
  "Chinese",
  "Indian",
  "Indonesian",
  "Filipino",
  "Others",
];

const TUTOR_TYPES = [
  "Poly / A Level Student",
  "Undergraduate",
  "Part-Time Tutor",
  "Full-Time Tutor",
  "NIE Trainee",
  "Ex-MOE Teacher",
  "Current MOE Teacher",
];

const EDUCATION_LEVELS = [
  "Poly Diploma",
  "A Levels",
  "Undergraduate",
  "Bachelor Degree",
  "Masters Degree",
  "PHD",
  "Others",
];

const LEVEL_OPTIONS = [
  "Pre-School",
  "Primary School",
  "Secondary School",
  "Junior College",
  "IB / IGCSE",
  "Diploma / Degree",
];

const SUBJECTS = [
  "English",
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Chinese",
  "Malay",
  "Tamil",
  "History",
  "Geography",
  "Economics",
];

const LOCATIONS = [
  "North (Woodlands, Yishun)",
  "East (Tampines, Pasir Ris, Bedok)",
  "West (Jurong, Clementi)",
  "Central (Bishan, Toa Payoh)",
  "North East (Punggol, Sengkang)",
];

export default function Register() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { toast } = useToast();

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
        description:
          "Your profile is pending admin approval. We'll notify you once approved.",
      });
      router.push("/login");
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
      nationality: "",
      subjects: [],
      levels: [],
      locations: [],
      tutorType: "",
      experienceYears: 0,
      education: "",
      introduction: "",
      languages: [],
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...submitData } = data;
    registerMutation.mutate(submitData);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];
    if (step === 1) {
      fieldsToValidate = [
        "name",
        "email",
        "password",
        "confirmPassword",
        "mobile",
        "dateOfBirth",
        "gender",
        "nationality",
      ];
    } else if (step === 2) {
      fieldsToValidate = ["subjects", "levels", "locations"];
    } else if (step === 3) {
      fieldsToValidate = ["tutorType", "experienceYears", "education"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const steps = [
    { num: 1, title: "Personal", icon: User },
    { num: 2, title: "Preferences", icon: BookOpen },
    { num: 3, title: "Qualifications", icon: GraduationCap },
    { num: 4, title: "Profile", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {steps.map((s) => (
            <div
              key={s.num}
              className={`flex flex-col items-center ${
                step >= s.num ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">{s.title}</span>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && "Personal Information"}
              {step === 2 && "Tutoring Preferences"}
              {step === 3 && "Qualifications & Experience"}
              {step === 4 && "Your Profile"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "Select your teaching preferences"}
              {step === 3 && "Share your qualifications"}
              {step === 4 && "Write your introduction"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="91234567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
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
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
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
                    </div>

                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select nationality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NATIONALITIES.map((n) => (
                                <SelectItem key={n} value={n}>
                                  {n}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Tutoring Preferences */}
                {step === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="levels"
                      render={() => (
                        <FormItem>
                          <FormLabel>Teaching Levels *</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {LEVEL_OPTIONS.map((level) => (
                              <FormField
                                key={level}
                                control={form.control}
                                name="levels"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(level)}
                                        onCheckedChange={(checked) => {
                                          const updated = checked
                                            ? [...(field.value || []), level]
                                            : field.value?.filter(
                                                (v) => v !== level
                                              );
                                          field.onChange(updated);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
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
                          <FormLabel>Subjects *</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            {SUBJECTS.map((subject) => (
                              <FormField
                                key={subject}
                                control={form.control}
                                name="subjects"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(subject)}
                                        onCheckedChange={(checked) => {
                                          const updated = checked
                                            ? [...(field.value || []), subject]
                                            : field.value?.filter(
                                                (v) => v !== subject
                                              );
                                          field.onChange(updated);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm">
                                      {subject}
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
                      name="locations"
                      render={() => (
                        <FormItem>
                          <FormLabel>Preferred Locations *</FormLabel>
                          <div className="space-y-2">
                            {LOCATIONS.map((location) => (
                              <FormField
                                key={location}
                                control={form.control}
                                name="locations"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(location)}
                                        onCheckedChange={(checked) => {
                                          const updated = checked
                                            ? [...(field.value || []), location]
                                            : field.value?.filter(
                                                (v) => v !== location
                                              );
                                          field.onChange(updated);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm">
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

                {/* Step 3: Qualifications */}
                {step === 3 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="tutorType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tutor Type *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tutor type" />
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
                          <FormLabel>Years of Experience *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Highest Education *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select education level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EDUCATION_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
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
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qualifications (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., NUS Computer Science, A Level 4As"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 4: Profile */}
                {step === 4 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="introduction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Introduction *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write a brief introduction about yourself..."
                              className="min-h-[150px]"
                              {...field}
                              value={field.value || ""}
                            />
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
                          <FormLabel>Teaching Experience (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your teaching experience..."
                              className="min-h-[100px]"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                  ) : (
                    <div />
                  )}

                  {step < 4 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending
                        ? "Registering..."
                        : "Complete Registration"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
