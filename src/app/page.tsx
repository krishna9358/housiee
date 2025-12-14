import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Utensils, Star, Shield, Clock, Users } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl space-y-6">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Discover Exceptional Experiences
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl">
              Connect with verified providers for premium accommodation and gourmet food services.
              Your perfect experience is just a click away.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-slate-100">
                <Link href="/services">Explore Services</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                <Link href="/become-provider">List Your Service</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our curated selection of premium services from verified providers
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/services?category=ACCOMMODATION" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=500&fit=crop"
                    alt="Accommodation"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-5 w-5" />
                      <h3 className="text-xl font-semibold">Accommodation</h3>
                    </div>
                    <p className="text-sm text-white/80">
                      Find your perfect stay from cozy apartments to luxury villas
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/services?category=FOOD" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop"
                    alt="Food Services"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils className="h-5 w-5" />
                      <h3 className="text-xl font-semibold">Food Services</h3>
                    </div>
                    <p className="text-sm text-white/80">
                      Discover culinary delights from local chefs and caterers
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We connect you with the best service providers for an unforgettable experience
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <CardContent className="pt-6 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Verified Providers</h3>
                <p className="text-sm text-muted-foreground">
                  All providers are thoroughly vetted for quality and reliability
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Honest Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  Read genuine reviews from real customers who booked
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Easy Booking</h3>
                <p className="text-sm text-muted-foreground">
                  Simple and fast booking process with instant confirmation
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-6">
              <CardContent className="pt-6 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Our team is always here to help with any questions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Ready to List Your Service?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8">
            Join our community of providers and reach thousands of potential customers.
            Easy setup, transparent pricing, and dedicated support.
          </p>
          <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-slate-100">
            <Link href="/become-provider">Become a Provider</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
