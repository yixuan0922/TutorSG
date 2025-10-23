import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md" data-testid="link-home">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Tutor SG</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
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
          </div>
        </div>
      )}
    </nav>
  );
}
