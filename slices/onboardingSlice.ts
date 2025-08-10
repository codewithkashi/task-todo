import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OnboardingState, FormValues } from "@/types/onboarding";
const initialState: OnboardingState = {
  currentStep: 0,
  totalSteps: 0,
  formData: {},
  isLoading: false,
  error: null,
  isComplete: false,
};
const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setTotalSteps: (state, action: PayloadAction<number>) => {
      state.totalSteps = action.payload;
    },
    updateFormData: (state, action: PayloadAction<Partial<FormValues>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setFormData: (state, action: PayloadAction<FormValues>) => {
      state.formData = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setComplete: (state, action: PayloadAction<boolean>) => {
      state.isComplete = action.payload;
    },
    resetOnboarding: (state) => {
      state.currentStep = 0;
      state.totalSteps = 0;
      state.formData = {};
      state.isLoading = false;
      state.error = null;
      state.isComplete = false;
    },
    goToNextStep: (state) => {
      if (state.currentStep < state.totalSteps - 1) {
        state.currentStep += 1;
      }
    },
    goToPreviousStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1;
      }
    },
    goToStep: (state, action: PayloadAction<number>) => {
      const stepIndex = action.payload;
      if (stepIndex >= 0 && stepIndex < state.totalSteps) {
        state.currentStep = stepIndex;
      }
    },
  },
});
export const {
  setCurrentStep,
  setTotalSteps,
  updateFormData,
  setFormData,
  setLoading,
  setError,
  setComplete,
  resetOnboarding,
  goToNextStep,
  goToPreviousStep,
  goToStep,
} = onboardingSlice.actions;
export default onboardingSlice.reducer;
