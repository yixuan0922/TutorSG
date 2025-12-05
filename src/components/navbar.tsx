"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, User, Settings, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Tutor } from "@/lib/db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { tutorId, isTutor, isAdmin, clearAuth } = useAuth();

  const isLoggedIn = isTutor || isAdmin;

  const { data: tutor } = useQuery<Tutor>({
    queryKey: [`/api/tutors/${tutorId}`],
    queryFn: async () => {
      const res = await fetch(`/api/tutors/${tutorId}`);
      if (!res.ok) throw new Error("Failed to fetch tutor");
      return res.json();
    },
    enabled: isTutor && !!tutorId,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      router.push("/");
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => pathname === path;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md" data-testid="link-home">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Tutor SG</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {isAdmin ? (
              <>
                <Link href="/admin" data-testid="link-admin">
                  <Button variant={isActive("/admin") ? "default" : "ghost"}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </Button>
              </>
            ) : isTutor ? (
              <>
                <Link href="/dashboard" data-testid="link-dashboard">
                  <Button variant={isActive("/dashboard") ? "default" : "ghost"}>
                    Dashboard
                  </Button>
                </Link>
                <Link href="/jobs" data-testid="link-jobs">
                  <Button variant={isActive("/jobs") ? "default" : "ghost"}>
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/tuition-rates" data-testid="link-rates">
                  <Button variant={isActive("/tuition-rates") ? "default" : "ghost"}>
                    Tuition Rates
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild data-testid="button-profile-menu">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {tutor ? getInitials(tutor.name) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{tutor?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{tutor?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild data-testid="menu-profile">
                      <Link href="/profile" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>View Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild data-testid="menu-settings">
                      <Link href="/settings" className="flex items-center cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      data-testid="menu-logout"
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/request-tutor" data-testid="link-request-tutor-nav">
                  <Button variant={isActive("/request-tutor") ? "default" : "ghost"}>
                    Request Tutor
                  </Button>
                </Link>
                <Link href="/jobs" data-testid="link-jobs">
                  <Button variant={isActive("/jobs") ? "default" : "ghost"}>
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/tuition-rates" data-testid="link-rates">
                  <Button variant={isActive("/tuition-rates") ? "default" : "ghost"}>
                    Tuition Rates
                  </Button>
                </Link>
                <Link href="/login" data-testid="link-login">
                  <Button variant={isActive("/login") ? "default" : "ghost"}>
                    Login
                  </Button>
                </Link>
                <Link href="/register" data-testid="link-register">
                  <Button variant="default">
                    Become a Tutor
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-2">
            {isAdmin ? (
              <>
                <Link href="/admin" data-testid="link-admin-mobile">
                  <Button variant={isActive("/admin") ? "default" : "ghost"} className="w-full justify-start">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout-mobile"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </Button>
              </>
            ) : isTutor ? (
              <>
                <div className="flex items-center gap-3 px-2 py-3 border-b border-border">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {tutor ? getInitials(tutor.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{tutor?.name}</p>
                    <p className="text-xs text-muted-foreground">{tutor?.email}</p>
                  </div>
                </div>
                <Link href="/dashboard" data-testid="link-dashboard-mobile">
                  <Button variant={isActive("/dashboard") ? "default" : "ghost"} className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/jobs" data-testid="link-jobs-mobile">
                  <Button variant={isActive("/jobs") ? "default" : "ghost"} className="w-full justify-start">
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/tuition-rates" data-testid="link-rates-mobile">
                  <Button variant={isActive("/tuition-rates") ? "default" : "ghost"} className="w-full justify-start">
                    Tuition Rates
                  </Button>
                </Link>
                <div className="pt-2 border-t border-border space-y-2">
                  <Link href="/profile" data-testid="link-profile-mobile">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Button>
                  </Link>
                  <Link href="/settings" data-testid="link-settings-mobile">
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    data-testid="button-logout-mobile"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? "Logging out..." : "Log out"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/request-tutor" data-testid="link-request-tutor-mobile">
                  <Button variant={isActive("/request-tutor") ? "default" : "ghost"} className="w-full justify-start">
                    Request Tutor
                  </Button>
                </Link>
                <Link href="/jobs" data-testid="link-jobs-mobile">
                  <Button variant={isActive("/jobs") ? "default" : "ghost"} className="w-full justify-start">
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/tuition-rates" data-testid="link-rates-mobile">
                  <Button variant={isActive("/tuition-rates") ? "default" : "ghost"} className="w-full justify-start">
                    Tuition Rates
                  </Button>
                </Link>
                <Link href="/login" data-testid="link-login-mobile">
                  <Button variant={isActive("/login") ? "default" : "ghost"} className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link href="/register" data-testid="link-register-mobile">
                  <Button variant="default" className="w-full">
                    Become a Tutor
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
