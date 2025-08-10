export type AccountType = "seller" | "buyer";
export interface FieldConfig {
  name: string;
  type:
    | "text"
    | "email"
    | "password"
    | "select"
    | "multiselect"
    | "checkbox"
    | "number"
    | "file"
    | "date";
  labelKey: string;
  placeholderKey?: string;
  required?: boolean;
  validation?: string;
  options?: Array<{ value: string; labelKey: string }>;
  dependsOn?: string;
  condition?: (values: FormValues) => boolean;
  apiValidation?: boolean;
  debounceMs?: number;
}
export interface StepConfig {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  fields: FieldConfig[];
  condition?: (values: FormValues) => boolean;
  isDynamic?: boolean;
  dynamicCount?: number;
  dynamicData?: Record<string, any>;
}
export interface ProductData {
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
}
export interface FormValues {
  accountType: AccountType;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  businessName?: string;
  registrationNumber?: string;
  country?: string;
  city?: string;
  area?: string;
  tradeLicense?: File | null;
  monthlySpendingLimit?: number;
  numberOfProducts?: number;
  products?: ProductData[];
  interests?: string[];
  promotionalOffers?: boolean;
  verificationDocuments?: File[];
}
export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  formData: Partial<FormValues>;
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
}
export interface Country {
  id: string;
  name: string;
  code: string;
}
export interface City {
  id: string;
  name: string;
  countryId: string;
}
export interface Area {
  id: string;
  name: string;
  cityId: string;
}
export interface ValidationResponse {
  available: boolean;
  message?: string;
}
export interface OnboardingSubmitResponse {
  success: boolean;
  userId?: string;
  message?: string;
}
export interface FlowDefinition {
  steps: StepConfig[];
  getDynamicSteps?: (values: FormValues) => StepConfig[];
}
