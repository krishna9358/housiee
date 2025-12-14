import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { api, Booking, ProviderBooking } from "@/lib/api";

interface BookingsState {
  userBookings: Booking[];
  providerBookings: ProviderBooking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  userBookings: [],
  providerBookings: [],
  selectedBooking: null,
  isLoading: false,
  error: null,
};

export const fetchUserBookings = createAsyncThunk(
  "bookings/fetchUserBookings",
  async (status?: string) => {
    return await api.bookings.myBookings(status);
  }
);

export const fetchProviderBookings = createAsyncThunk(
  "bookings/fetchProviderBookings",
  async (status?: string) => {
    return await api.bookings.providerBookings(status);
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    setSelectedBooking: (state, action: PayloadAction<Booking | null>) => {
      state.selectedBooking = action.payload;
    },
    clearBookings: (state) => {
      state.userBookings = [];
      state.providerBookings = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userBookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch bookings";
      })
      .addCase(fetchProviderBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProviderBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.providerBookings = action.payload;
      })
      .addCase(fetchProviderBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch bookings";
      });
  },
});

export const { setSelectedBooking, clearBookings } = bookingsSlice.actions;
export default bookingsSlice.reducer;

