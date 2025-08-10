import React from "react";
import { useTranslation } from "react-i18next";
import { StepConfig, FormValues } from "@/types/onboarding";
import { DynamicField } from "./DynamicField";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
interface OnboardingStepProps {
  step: StepConfig;
  formValues: FormValues;
  formik: any;
  isActive: boolean;
}
export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  step,
  formValues,
  formik,
  isActive,
}) => {
  const { t } = useTranslation();
  if (!isActive) {
    return null;
  }
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t(step.titleKey)}</CardTitle>
        {step.descriptionKey && (
          <CardDescription className="text-lg text-gray-600">
            {t(step.descriptionKey)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {step.fields.map((field) => (
          <DynamicField
            key={field.name}
            field={field}
            value={formik.values[field.name as keyof FormValues]}
            onChange={(value) => formik.setFieldValue(field.name, value)}
            onBlur={() => formik.setFieldTouched(field.name, true)}
            error={formik.errors[field.name as keyof FormValues]}
            touched={formik.touched[field.name as keyof FormValues]}
            formValues={formValues}
          />
        ))}
      </CardContent>
    </Card>
  );
};
