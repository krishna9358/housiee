import Link from "next/link";
import { Sparkles, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-b from-slate-50 to-white">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-8 md:p-12 text-center">
          <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">
            Stay Updated
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get the latest services and exclusive offers delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-white border-0 shadow-sm"
            />
            <Button className="h-12 px-6 shadow-lg shadow-primary/20">
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Housiee</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted platform for premium accommodation and food services.
              Connect with verified providers for unforgettable experiences.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                hello@housiee.com
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +1 (555) 000-0000
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                San Francisco, CA
              </p>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Services
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/services"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Browse All
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=ACCOMMODATION"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Accommodation
                </Link>
              </li>
              <li>
                <Link
                  href="/services?category=FOOD"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Food Services
                </Link>
              </li>
              <li>
                <Link
                  href="/services?featured=true"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Featured
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              For Providers
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/become-provider"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link
                  href="/provider"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/provider/resources"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/provider/guidelines"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Housiee. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
