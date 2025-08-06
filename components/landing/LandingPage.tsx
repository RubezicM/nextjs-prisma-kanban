"use client";

import { ArrowRight, Smartphone, Monitor, X } from "lucide-react";

import { useState, useEffect } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function LandingPage() {
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    // Check if user is on mobile device
    const isMobile = window.innerWidth < 768; // md breakpoint
    setShowMobileWarning(isMobile);
  }, []);

  return (
    <div>
      {/* Mobile Warning Banner */}
      {showMobileWarning && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800/30 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                For the best experience, recommend using a desktop or tablet
              </p>
            </div>
            <button
              onClick={() => setShowMobileWarning(false)}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-100 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-full px-3 py-1">
                <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                  Demo Experience
                </span>
              </div>
            </div>

            <h1 className="h1-bold text-foreground">
              Organize Your Work with <span className="text-primary">Visual Kanban Boards</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your productivity with intuitive drag-and-drop boards.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button asChild size="lg" className="font-semibold">
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Device Recommendation Section */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-card border rounded-lg p-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Monitor className="h-8 w-8 text-primary" />
              <span className="text-2xl">+</span>
              <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                <div className="w-4 h-6 bg-primary rounded-sm"></div>
              </div>
            </div>

            <h3 className="h3-bold text-foreground mb-4">Optimized for Desktop</h3>

            <p className="text-muted-foreground mb-6">
              Experience is optimized for desktop screens where drag-and-drop feels most natural.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
