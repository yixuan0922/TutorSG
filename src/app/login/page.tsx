"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loginSchema, type LoginData } from "@/lib/db/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth/auth-context";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const { setTutorAuth, setAdminAuth } = useAuth();

  const tutorLoginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch("/api/auth/login/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: (tutor) => {
      setTutorAuth(tutor.id);
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch("/api/auth/login/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: (admin) => {
      setAdminAuth(admin.id);
      router.push("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Admin login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const tutorForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const adminForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onTutorSubmit = (data: LoginData) => {
    tutorLoginMutation.mutate(data);
  };

  const onAdminSubmit = (data: LoginData) => {
    adminLoginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Login</CardTitle>
            <CardDescription>
              Access your tutor dashboard or admin panel
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="tutor" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="tutor" data-testid="tab-tutor">
                  Tutor
                </TabsTrigger>
                <TabsTrigger value="admin" data-testid="tab-admin">
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tutor">
                <Form {...tutorForm}>
                  <form
                    onSubmit={tutorForm.handleSubmit(onTutorSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={tutorForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="tutor@example.com"
                              {...field}
                              data-testid="input-tutor-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={tutorForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              data-testid="input-tutor-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={tutorLoginMutation.isPending}
                      data-testid="button-tutor-login"
                    >
                      {tutorLoginMutation.isPending
                        ? "Logging in..."
                        : "Login as Tutor"}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/register"
                      className="text-primary hover:underline"
                      data-testid="link-register-tutor"
                    >
                      Register as Tutor
                    </Link>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="admin">
                <Form {...adminForm}>
                  <form
                    onSubmit={adminForm.handleSubmit(onAdminSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={adminForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="admin@tutorsg.com"
                              {...field}
                              data-testid="input-admin-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={adminForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              data-testid="input-admin-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={adminLoginMutation.isPending}
                      data-testid="button-admin-login"
                    >
                      {adminLoginMutation.isPending
                        ? "Logging in..."
                        : "Login as Admin"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
