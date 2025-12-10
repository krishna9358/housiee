import { z } from "zod";

export enum Role {
  USER = "USER",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

export enum ListingCategory {
  ACCOMMODATION = "ACCOMMODATION",
  TRAVEL = "TRAVEL",
  FOOD = "FOOD",
  LAUNDRY = "LAUNDRY",
}

export enum ListingStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.nativeEnum(Role).default(Role.USER),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AddressSchema = z.object({
  street: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string().optional(),
  country: z.string().default("India"),
});

export const CreateListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  category: z.nativeEnum(ListingCategory),
  type: z.string(),
  address: AddressSchema,
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  price: z.number().positive(),
  priceUnit: z.string().default("per night"),
  images: z.array(z.string().url()).default([]),
  amenities: z.array(z.string()).default([]),
  availability: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    slots: z.number().optional(),
  }).optional(),
});

export const UpdateListingSchema = CreateListingSchema.partial();

export const CreateBookingSchema = z.object({
  listingId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  quantity: z.number().positive().default(1),
  notes: z.string().optional(),
});

export const CreateReviewSchema = z.object({
  listingId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type UpdateListingInput = z.infer<typeof UpdateListingSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: ListingCategory;
  type: string;
  address: {
    street?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
  };
  latitude?: number;
  longitude?: number;
  price: number;
  priceUnit: string;
  images: string[];
  amenities: string[];
  availability?: {
    startDate?: string;
    endDate?: string;
    slots?: number;
  };
  status: ListingStatus;
  avgRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
  provider?: User;
}

export interface Booking {
  id: string;
  userId: string;
  listingId: string;
  providerId: string;
  status: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  quantity: number;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  listing?: Listing;
}

export interface Review {
  id: string;
  userId: string;
  listingId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
