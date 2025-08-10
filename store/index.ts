import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import onboardingReducer from "@/slices/onboardingSlice";
import { onboardingApi } from "@/lib/api/onboardingApi";

export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
    [onboardingApi.reducerPath]: onboardingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(onboardingApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
