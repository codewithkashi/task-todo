import React from "react";
import { useTranslation } from "react-i18next";
import { StepConfig } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { getDirection, isRTL } from "@/lib/i18n";
interface OnboardingStepperProps {
  steps: StepConfig[];
  currentStepIndex: number;
  onStepClick: (stepIndex: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  stepProgress: number;
  isLoading?: boolean;
}
export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  canProceed,
  stepProgress,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation();
  const direction = getDirection(i18n.language);
  const rtl = isRTL(i18n.language);
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            {t("step")} {currentStepIndex + 1} {t("of")} {steps.length}
          </span>
          <span>{Math.round(stepProgress)}%</span>
        </div>
        <Progress value={stepProgress} className="h-2" />
      </div>
      <div className="flex justify-center">
        <div
          className={`flex ${rtl ? "flex-row-reverse" : "flex-row"} space-x-2 ${
            rtl ? "space-x-reverse" : ""
          }`}
        >
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isClickable = index <= currentStepIndex + 1;
            return (
              <button
                key={step.id}
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                  ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-gray-200 border-gray-300 text-gray-500"
                  }
                  ${
                    isClickable
                      ? "cursor-pointer hover:scale-110"
                      : "cursor-not-allowed"
                  }
                `}
                title={t(step.titleKey)}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {t(steps[currentStepIndex]?.titleKey || "")}
        </h2>
        {steps[currentStepIndex]?.descriptionKey && (
          <p className="text-gray-600 mt-1">
            {t(steps[currentStepIndex].descriptionKey)}
          </p>
        )}
      </div>

      <div
        className={`flex ${
          rtl ? "flex-row-reverse" : "flex-row"
        } justify-between items-center`}
      >
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep || isLoading}
          className={`flex items-center space-x-2 ${
            rtl ? "space-x-reverse" : ""
          }`}
        >
          {rtl ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
          <span>{t("previous")}</span>
        </Button>
        <div className="flex space-x-2">
          {steps.map((step, index) => (
            <Button
              key={step.id}
              variant={index === currentStepIndex ? "default" : "outline"}
              size="sm"
              onClick={() => onStepClick(index)}
              disabled={index > currentStepIndex + 1}
              className="min-w-[100px]"
            >
              {t(step.titleKey)}
            </Button>
          ))}
        </div>
        <Button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className={`flex items-center space-x-2 ${
            rtl ? "space-x-reverse" : ""
          }`}
        >
          <span>{isLastStep ? t("submit") : t("next")}</span>
          {!rtl ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">{t("loading")}</p>
        </div>
      )}
    </div>
  );
};
