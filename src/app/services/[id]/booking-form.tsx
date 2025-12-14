"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers";
import { api, ServiceCategory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { CalendarIcon, Loader2, Minus, Plus, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";

interface BookingFormProps {
  serviceId: string;
  basePrice: number;
  category: ServiceCategory;
  availableSeats: number;
}

export function BookingForm({ serviceId, basePrice, category, availableSeats }: BookingFormProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const needsEndDate = category === "ACCOMMODATION";
  const showQuantity = category !== "ACCOMMODATION";

  const calculateTotal = () => {
    if (!startDate) return basePrice * quantity;

    if (needsEndDate && endDate) {
      const days = Math.max(
        1,
        Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      return basePrice * days;
    }

    return basePrice * quantity;
  };

  const totalPrice = calculateTotal();

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= availableSeats) {
      setQuantity(newQty);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/services/${serviceId}`);
      return;
    }

    if (!startDate) {
      toast.error("Please select a date");
      return;
    }

    if (needsEndDate && !endDate) {
      toast.error("Please select check-out date");
      return;
    }

    setIsLoading(true);

    try {
      await api.bookings.create({
        serviceId,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        quantity: showQuantity ? quantity : 1,
        notes: notes || undefined,
      });

      toast.success("Booking confirmed!", {
        description: "You will receive a confirmation email shortly.",
      });

      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create booking"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabels = () => {
    switch (category) {
      case "ACCOMMODATION":
        return { dateLabel: "Check-in", endDateLabel: "Check-out", unit: "night" };
      case "TRAVEL":
        return { dateLabel: "Travel Date", unit: "seat" };
      case "FOOD":
        return { dateLabel: "Delivery Date", unit: "order" };
      case "LAUNDRY":
        return { dateLabel: "Pickup Date", unit: "kg" };
      default:
        return { dateLabel: "Date", unit: "unit" };
    }
  };

  const labels = getCategoryLabels();

  return (
    <Card className="border shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{formatCurrency(basePrice)}</span>
          <span className="text-sm font-normal text-muted-foreground">
            /{labels.unit}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label>{labels.dateLabel}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date for Accommodation */}
        {needsEndDate && (
          <div className="space-y-2">
            <Label>{labels.endDateLabel}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) =>
                    date < new Date() || (startDate ? date <= startDate : false)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Quantity for non-accommodation */}
        {showQuantity && (
          <div className="space-y-2">
            <Label>Quantity ({labels.unit}s)</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, val), availableSeats));
                }}
                className="w-20 text-center"
                min={1}
                max={availableSeats}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= availableSeats}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {availableSeats} available
            </p>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Special Requests (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any special requirements..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Price Breakdown */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(basePrice)} × {showQuantity ? quantity : 1}{" "}
              {needsEndDate && startDate && endDate
                ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} nights`
                : labels.unit + (quantity !== 1 ? "s" : "")}
            </span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button
          className="w-full h-11"
          onClick={handleSubmit}
          disabled={isLoading || !startDate || (needsEndDate && !endDate)}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : !isAuthenticated ? (
            "Sign in to Book"
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Booking
            </>
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          You won&apos;t be charged yet
        </p>
      </CardFooter>
    </Card>
  );
}
