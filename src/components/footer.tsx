import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Marketplace</h3>
            <p className="text-sm text-muted-foreground">
              Your one-stop platform for accommodation and food services.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/services?category=ACCOMMODATION" className="hover:text-foreground transition-colors">
                  Accommodation
                </Link>
              </li>
              <li>
                <Link href="/services?category=FOOD" className="hover:text-foreground transition-colors">
                  Food Services
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">For Providers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/become-provider" className="hover:text-foreground transition-colors">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link href="/provider" className="hover:text-foreground transition-colors">
                  Provider Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
