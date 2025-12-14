import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "USER" | "SERVICE_PROVIDER" | "ADMIN";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeRole: UserRole | null;
}

const initialState: UserState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  activeRole: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.activeRole = action.payload?.role || null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    switchRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        state.activeRole = action.payload;
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.activeRole = null;
    },
  },
});

export const { setUser, setLoading, switchRole, logout } = userSlice.actions;
export default userSlice.reducer;

