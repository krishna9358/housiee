import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import uiReducer from "./slices/uiSlice";
import servicesReducer from "./slices/servicesSlice";
import bookingsReducer from "./slices/bookingsSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      ui: uiReducer,
      services: servicesReducer,
      bookings: bookingsReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

