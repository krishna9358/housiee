import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  commandPaletteOpen: boolean;
  theme: "light" | "dark" | "system";
}

const initialState: UiState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  commandPaletteOpen: false,
  theme: "system",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    setCommandPaletteOpen: (state, action: PayloadAction<boolean>) => {
      state.commandPaletteOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },
  },
});

export const {
  setSidebarOpen,
  toggleSidebar,
  setMobileMenuOpen,
  setCommandPaletteOpen,
  setTheme,
} = uiSlice.actions;
export default uiSlice.reducer;
