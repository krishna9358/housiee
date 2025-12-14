"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Building2,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Shield,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    description: "Reach thousands of potential customers actively looking for services",
  },
  {
    icon: Users,
    title: "Easy Management",
    description: "Manage bookings, services, and customers from one dashboard",
  },
  {
    icon: Shield,
    title: "Verified Badge",
    description: "Get verified to build trust and attract more customers",
  },
  {
    icon: Star,
    title: "Build Reputation",
    description: "Collect reviews and ratings to showcase your quality",
  },
];

export default function BecomeProviderPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/become-provider");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.role === "SERVICE_PROVIDER") {
      router.push("/provider");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      businessName: formData.get("businessName") as string,
      description: formData.get("description") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
    };

    try {
      await api.provider.apply(data);
      toast.success("Congratulations! You are now a provider.");
      router.push("/provider");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit application");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/5 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  Join 500+ Verified Providers
                </div>
                <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  Start Earning with{" "}
                  <span className="gradient-text">Housiee</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Join our marketplace and connect with thousands of customers looking
                  for quality accommodation and food services.
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex gap-3 p-4 rounded-xl bg-white shadow-sm border"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{benefit.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Free to join
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  No hidden fees
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  24/7 support
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-2xl">
                <CardHeader>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">Business Information</CardTitle>
                  <CardDescription>
                    Tell us about your business. This will be visible to customers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        placeholder="Your Business Name"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Business Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Tell customers about your business, what makes you unique..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Business Address</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="123 Main St, City, Country"
                        className="h-11"
                      />
                    </div>

                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <h4 className="font-medium text-emerald-800 flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        What happens next?
                      </h4>
                      <ul className="text-sm text-emerald-700 space-y-1.5">
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Your provider account will be created instantly
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Start adding your services right away
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Get verified for a trust badge
                        </li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base shadow-lg shadow-primary/20"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Become a Provider
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <p className="text-center text-sm text-muted-foreground mt-4">
                By submitting, you agree to our{" "}
                <Link href="/provider-terms" className="text-primary hover:underline">
                  Provider Terms
                </Link>{" "}
                and{" "}
                <Link href="/guidelines" className="text-primary hover:underline">
                  Guidelines
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
