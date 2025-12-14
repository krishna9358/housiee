import Link from "next/link";
import { Mail, MapPin, Phone, Plane, Utensils, Home, Shirt } from "lucide-react";

const serviceCategories = [
  { name: "Travel", href: "/services?category=TRAVEL", icon: Plane },
  { name: "Food", href: "/services?category=FOOD", icon: Utensils },
  { name: "Accommodation", href: "/services?category=ACCOMMODATION", icon: Home },
  { name: "Laundry", href: "/services?category=LAUNDRY", icon: Shirt },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">H</span>
              </div>
              <span className="font-bold text-lg tracking-tight">Housiee</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted platform for premium services across India.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                hello@housiee.com
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +91 98765 43210
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Bangalore, India
              </p>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {serviceCategories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    href={cat.href}
                    className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">For Providers</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/become-provider"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link
                  href="/provider"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/provider/resources"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground transition-colors"
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
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Housiee. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
