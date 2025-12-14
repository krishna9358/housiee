const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type FetchOptions = RequestInit & { params?: Record<string, string> };

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  let url = `${API_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const res = await fetch(url, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}

export const api = {
  services: {
    list: (params?: Record<string, string>) =>
      fetchAPI<{
        services: Service[];
        pagination: Pagination;
      }>("/api/services", { params }),
    get: (id: string) => fetchAPI<ServiceDetail>(`/api/services/${id}`),
    create: (data: FormData) =>
      fetch(`${API_URL}/api/services`, {
        method: "POST",
        credentials: "include",
        body: data,
      }).then((r) => r.json()),
    update: (id: string, data: FormData) =>
      fetch(`${API_URL}/api/services/${id}`, {
        method: "PUT",
        credentials: "include",
        body: data,
      }).then((r) => r.json()),
    delete: (id: string) =>
      fetchAPI(`/api/services/${id}`, { method: "DELETE" }),
    myServices: () => fetchAPI<Service[]>("/api/services/provider/my-services"),
  },
  bookings: {
    create: (data: BookingCreate) =>
      fetchAPI<Booking>("/api/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    myBookings: (status?: string) =>
      fetchAPI<Booking[]>("/api/bookings/my-bookings", {
        params: status ? { status } : undefined,
      }),
    providerBookings: (status?: string) =>
      fetchAPI<ProviderBooking[]>("/api/bookings/provider-bookings", {
        params: status ? { status } : undefined,
      }),
    updateStatus: (id: string, status: string) =>
      fetchAPI(`/api/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    get: (id: string) => fetchAPI<BookingDetail>(`/api/bookings/${id}`),
  },
  reviews: {
    create: (data: { serviceId: string; rating: number; comment?: string }) =>
      fetchAPI("/api/reviews", { method: "POST", body: JSON.stringify(data) }),
    forService: (serviceId: string, page?: string) =>
      fetchAPI<{ reviews: Review[]; pagination: Pagination }>(
        `/api/reviews/service/${serviceId}`,
        { params: page ? { page } : undefined }
      ),
  },
  provider: {
    apply: (data: ProviderApply) =>
      fetchAPI("/api/provider/apply", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    profile: () => fetchAPI<ProviderProfile>("/api/provider/profile"),
    updateProfile: (data: Partial<ProviderApply>) =>
      fetchAPI("/api/provider/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    dashboardStats: () =>
      fetchAPI<ProviderStats>("/api/provider/dashboard-stats"),
  },
  admin: {
    users: (params?: Record<string, string>) =>
      fetchAPI<{ users: User[]; pagination: Pagination }>("/api/admin/users", {
        params,
      }),
    providers: (params?: Record<string, string>) =>
      fetchAPI<{ providers: Provider[]; pagination: Pagination }>(
        "/api/admin/providers",
        { params }
      ),
    verifyProvider: (id: string, isVerified: boolean) =>
      fetchAPI(`/api/admin/providers/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ isVerified }),
      }),
    updateRole: (id: string, role: string) =>
      fetchAPI(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    statistics: () => fetchAPI<AdminStats>("/api/admin/statistics"),
    deleteUser: (id: string) =>
      fetchAPI(`/api/admin/users/${id}`, { method: "DELETE" }),
  },
};

export interface Service {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: "ACCOMMODATION" | "FOOD";
  basePrice: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  provider: { businessName: string; isVerified: boolean };
  avgRating: number | null;
  reviewCount: number;
  accommodationDetails?: AccommodationDetails;
  foodDetails?: FoodDetails;
}

export interface ServiceDetail extends Service {
  reviews: Review[];
}

export interface AccommodationDetails {
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  checkInTime?: string;
  checkOutTime?: string;
}

export interface FoodDetails {
  cuisineType: string;
  mealTypes: string[];
  dietaryOptions: string[];
  servingSize?: string;
  deliveryAvailable: boolean;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { name: string; image?: string };
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  startDate: string;
  endDate?: string;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string;
  createdAt: string;
  service: {
    id: string;
    title: string;
    category: string;
    images: string[];
    provider: { businessName: string };
  };
}

export interface ProviderBooking extends Booking {
  user: { name: string; email: string };
}

export interface BookingDetail extends Booking {
  user: { name: string; email: string };
}

export interface BookingCreate {
  serviceId: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface ProviderApply {
  businessName: string;
  description?: string;
  phone?: string;
  address?: string;
}

export interface ProviderProfile {
  id: string;
  businessName: string;
  description?: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  services: { id: string; title: string; category: string; isActive: boolean }[];
}

export interface ProviderStats {
  totalServices: number;
  activeServices: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  serviceProvider?: { id: string; isVerified: boolean };
}

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  isVerified: boolean;
  createdAt: string;
  user: { name: string; email: string };
  _count: { services: number };
}

export interface AdminStats {
  overview: {
    totalUsers: number;
    totalProviders: number;
    verifiedProviders: number;
    totalServices: number;
    activeServices: number;
    totalBookings: number;
    totalRevenue: number;
  };
  usersByRole: Record<string, number>;
  bookingsByStatus: Record<string, number>;
  recentBookings: {
    id: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    user: { name: string };
    service: { title: string };
  }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
