"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { onboardingFlow } from "@/lib/flowDefinition";
import { useDynamicFormik } from "@/hooks/useDynamicFormik";
import { OnboardingStepper } from "./OnboardingStepper";
import { OnboardingStep } from "./OnboardingStep";
import { ReviewStep } from "./ReviewStep";
import { useSubmitOnboardingMutation } from "@/lib/api/onboardingApi";
import { RootState } from "@/store";
import {
  setCurrentStep,
  setTotalSteps,
  updateFormData,
  setLoading,
  setError,
  setComplete,
} from "@/slices/onboardingSlice";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, CheckCircle } from "lucide-react";
export const OnboardingWizard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const { currentStep, formData, isLoading, error, isComplete } = useSelector(
    (state: RootState) => state.onboarding
  );
  const [submitOnboarding, { isLoading: isSubmitting }] =
    useSubmitOnboardingMutation();
  const {
    formik,
    currentSteps,
    totalSteps,
    currentStepIndex,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    isFirstStep,
    isLastStep,
    canProceed,
    stepProgress,
  } = useDynamicFormik({
    flowDefinition: onboardingFlow,
    initialValues: formData,
    onSubmit: handleSubmit,
    onStepChange: handleStepChange,
  });
  useEffect(() => {
    dispatch(setCurrentStep(currentStepIndex));
    dispatch(setTotalSteps(totalSteps));
  }, [currentStepIndex, totalSteps, dispatch]);
  useEffect(() => {
    const essentialValues = {
      accountType: formik.values.accountType,
      firstName: formik.values.firstName,
      lastName: formik.values.lastName,
      email: formik.values.email,
      username: formik.values.username,
      businessName: formik.values.businessName,
      country: formik.values.country,
      city: formik.values.city,
      numberOfProducts: formik.values.numberOfProducts,
      monthlySpendingLimit: formik.values.monthlySpendingLimit,
    };
    dispatch(updateFormData(essentialValues));
  }, [
    formik.values.accountType,
    formik.values.firstName,
    formik.values.lastName,
    formik.values.email,
    formik.values.username,
    formik.values.businessName,
    formik.values.country,
    formik.values.city,
    formik.values.numberOfProducts,
    formik.values.monthlySpendingLimit,
    dispatch,
  ]);
  function handleStepChange(stepIndex: number) {
    dispatch(setCurrentStep(stepIndex));
  }
  async function handleSubmit(values: any) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await submitOnboarding(values).unwrap();
      if (response.success) {
        dispatch(setComplete(true));
        toast.success(response.message || "Onboarding completed successfully!");
      } else {
        throw new Error(response.message || "Submission failed");
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "An error occurred";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setIsLanguageMenuOpen(false);
  };
  const handleEditStep = (stepIndex: number) => {
    goToStep(stepIndex);
  };
  const handleNext = async () => {
    if (isLastStep) {
      const errors = await formik.validateForm();
      if (Object.keys(errors).length === 0) {
        await formik.submitForm();
      } else {
        const touchedFields: any = {};
        Object.keys(errors).forEach((key) => {
          touchedFields[key] = true;
        });
        formik.setTouched(touchedFields);
      }
    } else {
      await goToNextStep();
    }
  };
  const handlePrevious = () => {
    goToPreviousStep();
  };
  const handleStepClick = (stepIndex: number) => {
    goToStep(stepIndex);
  };
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                {t("success.title")}
              </h1>
              <p className="text-gray-600">{t("success.message")}</p>
              <Button
                onClick={() => {
                  dispatch(setComplete(false));
                  formik.resetForm();
                  goToStep(0);
                }}
                className="w-full"
              >
                {t("success.startOver")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {t("app.title")}
              </h1>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>{i18n.language === "ar" ? "العربية" : "English"}</span>
              </Button>
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleLanguageChange("en")}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        i18n.language === "en"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageChange("ar")}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        i18n.language === "ar"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      العربية
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OnboardingStepper
          steps={currentSteps}
          currentStepIndex={currentStepIndex}
          onStepClick={handleStepClick}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          canProceed={canProceed}
          stepProgress={stepProgress}
          isLoading={isLoading || isSubmitting}
        />
        <div className="mt-8">
          {currentSteps.map((step, index) => {
            if (step.id === "review-submit") {
              return (
                <div
                  key={step.id}
                  className={index === currentStepIndex ? "block" : "hidden"}
                >
                  <ReviewStep
                    formValues={formik.values}
                    onEdit={handleEditStep}
                    onSubmit={handleNext}
                    isLoading={isSubmitting}
                  />
                </div>
              );
            }
            return (
              <div
                key={step.id}
                className={index === currentStepIndex ? "block" : "hidden"}
              >
                <OnboardingStep
                  step={step}
                  formValues={formik.values}
                  formik={formik}
                  isActive={index === currentStepIndex}
                />
              </div>
            );
          })}
        </div>
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
