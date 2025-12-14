import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api, Service, Pagination } from "@/lib/api";

interface ServicesState {
  items: Service[];
  selectedService: Service | null;
  pagination: Pagination | null;
  filters: {
    category: string | null;
    search: string;
    minPrice: number | null;
    maxPrice: number | null;
    sortBy: "price_asc" | "price_desc" | "rating" | "newest";
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  items: [],
  selectedService: null,
  pagination: null,
  filters: {
    category: null,
    search: "",
    minPrice: null,
    maxPrice: null,
    sortBy: "newest",
  },
  isLoading: false,
  error: null,
};

export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async (params: Record<string, string> = {}) => {
    const response = await api.services.list(params);
    return response;
  }
);

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setPriceRange: (
      state,
      action: PayloadAction<{ min: number | null; max: number | null }>
    ) => {
      state.filters.minPrice = action.payload.min;
      state.filters.maxPrice = action.payload.max;
    },
    setSortBy: (
      state,
      action: PayloadAction<"price_asc" | "price_desc" | "rating" | "newest">
    ) => {
      state.filters.sortBy = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedService: (state, action: PayloadAction<Service | null>) => {
      state.selectedService = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.services;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch services";
      });
  },
});

export const {
  setCategory,
  setSearch,
  setPriceRange,
  setSortBy,
  clearFilters,
  setSelectedService,
} = servicesSlice.actions;

export default servicesSlice.reducer;

