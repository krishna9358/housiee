"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Utensils,
  Star,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: Shield,
    title: "Verified Providers",
    description: "Every provider is thoroughly vetted for quality and reliability",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Star,
    title: "Genuine Reviews",
    description: "Real feedback from customers who actually booked",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Book in seconds with our streamlined process",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Heart,
    title: "24/7 Support",
    description: "We're always here when you need assistance",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

const stats = [
  { value: "10K+", label: "Happy Customers" },
  { value: "500+", label: "Verified Providers" },
  { value: "15K+", label: "Successful Bookings" },
  { value: "4.9", label: "Average Rating" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-pattern">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        
        <div className="container mx-auto px-4 lg:px-8 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <Badge className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-0 hover:bg-primary/15">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Premium Services Platform
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]"
              >
                Discover{" "}
                <span className="gradient-text">Exceptional</span>
                <br />
                Experiences
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed"
              >
                Connect with verified providers for premium accommodation and gourmet food services. 
                Your perfect experience is just a click away.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  asChild
                  className="h-12 px-8 text-base shadow-xl shadow-primary/20 btn-interactive bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Link href="/services">
                    Explore Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 px-8 text-base border-2 hover:bg-primary/5"
                >
                  <Link href="/become-provider">List Your Service</Link>
                </Button>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4"
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column - Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=750&fit=crop"
                      alt="Luxury accommodation"
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-white/90 text-foreground">
                        <Home className="w-3 h-3 mr-1" />
                        Accommodation
                      </Badge>
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=450&fit=crop"
                      alt="Gourmet food"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-white/90 text-foreground">
                        <Utensils className="w-3 h-3 mr-1" />
                        Food Services
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=450&fit=crop"
                      alt="Luxury hotel"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=750&fit=crop"
                      alt="Fine dining"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -left-8 top-1/2 -translate-y-1/2 glass rounded-2xl p-4 shadow-xl border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Verified Provider</p>
                    <p className="text-xs text-muted-foreground">100% trusted services</p>
                  </div>
                </div>
              </motion.div>

              {/* Rating card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-4 bottom-24 glass rounded-2xl p-4 shadow-xl border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-sm">4.9</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From 2,500+ reviews
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-0">
              Our Services
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              What We Offer
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our curated selection of premium services from verified providers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link href="/services?category=ACCOMMODATION" className="group block">
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 card-hover">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop"
                      alt="Accommodation"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Home className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Accommodation</h3>
                          <p className="text-white/80 text-sm">500+ properties</p>
                        </div>
                      </div>
                      <p className="text-white/90">
                        Find your perfect stay from cozy apartments to luxury villas
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore Now <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/services?category=FOOD" className="group block">
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 card-hover">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop"
                      alt="Food Services"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Utensils className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">Food Services</h3>
                          <p className="text-white/80 text-sm">300+ chefs & caterers</p>
                        </div>
                      </div>
                      <p className="text-white/90">
                        Discover culinary delights from local chefs and caterers
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore Now <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-0">
              Why Housiee
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Why Choose Us
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We connect you with the best service providers for an unforgettable experience
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow card-hover h-full">
                  <CardContent className="pt-6 space-y-4">
                    <div
                      className={`mx-auto w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center`}
                    >
                      <feature.icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-0">
              Simple Process
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Book your perfect service in just three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Browse Services",
                description: "Explore our curated selection of verified providers and find exactly what you need",
                icon: TrendingUp,
              },
              {
                step: "02",
                title: "Book Instantly",
                description: "Select your dates, review the details, and book with confidence in seconds",
                icon: Clock,
              },
              {
                step: "03",
                title: "Enjoy & Review",
                description: "Experience premium service and share your feedback to help others",
                icon: Award,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="mb-6 relative">
                  <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <item.icon className="h-9 w-9 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shadow-lg">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to List Your Service?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join our community of providers and reach thousands of potential customers.
              Easy setup, transparent pricing, and dedicated support.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="h-12 px-8 text-base bg-white text-primary hover:bg-white/90 shadow-xl btn-interactive"
              >
                <Link href="/become-provider">
                  Become a Provider
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 px-8 text-base border-2 border-white/30 text-white hover:bg-white/10"
              >
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
