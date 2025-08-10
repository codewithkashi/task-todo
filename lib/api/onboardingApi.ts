import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Country,
  City,
  Area,
  ValidationResponse,
  OnboardingSubmitResponse,
  FormValues,
} from "@/types/onboarding";
const API_BASE_URL = "/api";
export const onboardingApi = createApi({
  reducerPath: "onboardingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Countries", "Cities", "Areas"],
  endpoints: (builder) => ({
    getCountries: builder.query<Country[], void>({
      query: () => "countries",
      providesTags: ["Countries"],
    }),
    getCities: builder.query<City[], string>({
      query: (countryId) => `cities?countryId=${countryId}`,
      providesTags: (result, error, countryId) =>
        result ? [{ type: "Cities", id: countryId }] : ["Cities"],
    }),
    getAreas: builder.query<Area[], string>({
      query: (cityId) => `areas?cityId=${cityId}`,
      providesTags: (result, error, cityId) =>
        result ? [{ type: "Areas", id: cityId }] : ["Areas"],
    }),
    checkUsername: builder.query<ValidationResponse, string>({
      query: (username) => `check-username?username=${username}`,
    }),
    checkEmail: builder.query<ValidationResponse, string>({
      query: (email) => `check-email?email=${email}`,
    }),
    submitOnboarding: builder.mutation<OnboardingSubmitResponse, FormValues>({
      query: (data) => ({
        url: "onboarding",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {}
      },
    }),
  }),
});
export const {
  useGetCountriesQuery,
  useGetCitiesQuery,
  useGetAreasQuery,
  useCheckUsernameQuery,
  useCheckEmailQuery,
  useSubmitOnboardingMutation,
} = onboardingApi;
