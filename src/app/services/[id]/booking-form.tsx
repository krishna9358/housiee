"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Calendar } from "lucide-react";

interface BookingFormProps {
  serviceId: string;
  basePrice: number;
  category: "ACCOMMODATION" | "FOOD";
}

export function BookingForm({ serviceId, basePrice, category }: BookingFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const calculateTotal = () => {
    if (category === "ACCOMMODATION" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return nights > 0 ? basePrice * nights : basePrice;
    }
    return basePrice;
  };

  const getNights = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push(`/login?redirect=/services/${serviceId}`);
      return;
    }

    if (!startDate) {
      toast.error("Please select a date");
      return;
    }

    if (category === "ACCOMMODATION" && !endDate) {
      toast.error("Please select check-out date");
      return;
    }

    setIsLoading(true);
    try {
      await api.bookings.create({
        serviceId,
        startDate,
        endDate: category === "ACCOMMODATION" ? endDate : undefined,
        notes: notes || undefined,
      });
      toast.success("Booking created successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Book Now</span>
          <span className="text-2xl">
            ${basePrice}
            <span className="text-sm font-normal text-muted-foreground">
              {category === "ACCOMMODATION" ? "/night" : ""}
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">
              {category === "ACCOMMODATION" ? "Check-in Date" : "Date"}
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="pl-10"
                required
              />
            </div>
          </div>

          {category === "ACCOMMODATION" && (
            <div className="space-y-2">
              <Label htmlFor="endDate">Check-out Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or notes..."
              rows={3}
            />
          </div>

          {category === "ACCOMMODATION" && getNights() > 0 && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  ${basePrice} x {getNights()} night{getNights() !== 1 ? "s" : ""}
                </span>
                <span>${calculateTotal()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${calculateTotal()}</span>
              </div>
            </div>
          )}

          {category === "FOOD" && (
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${basePrice}</span>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {isAuthenticated ? "Book Now" : "Sign in to Book"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
