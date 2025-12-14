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
  activeRole: UserRole;
}

const initialState: UserState = {
  user: null,
  activeRole: "USER",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      if (action.payload) {
        state.activeRole = action.payload.role;
      } else {
        state.activeRole = "USER";
      }
    },
    switchRole: (state, action: PayloadAction<UserRole>) => {
      if (state.user) {
        // Only allow switching to roles user has access to
        const canSwitch =
          state.user.role === "ADMIN" ||
          (state.user.role === "SERVICE_PROVIDER" &&
            (action.payload === "USER" || action.payload === "SERVICE_PROVIDER")) ||
          action.payload === "USER";

        if (canSwitch) {
          state.activeRole = action.payload;
        }
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.activeRole = "USER";
    },
  },
});

export const { setUser, switchRole, clearUser } = userSlice.actions;
export default userSlice.reducer;
