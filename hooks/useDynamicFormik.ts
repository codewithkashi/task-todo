import { useFormik } from "formik";
import * as Yup from "yup";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FlowDefinition,
  StepConfig,
  FormValues,
  FieldConfig,
} from "@/types/onboarding";
interface UseDynamicFormikProps {
  flowDefinition: FlowDefinition;
  initialValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  onStepChange?: (step: number) => void;
}
interface UseDynamicFormikReturn {
  formik: ReturnType<typeof useFormik<FormValues>>;
  currentSteps: StepConfig[];
  totalSteps: number;
  currentStepIndex: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (stepIndex: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  stepProgress: number;
}
export const useDynamicFormik = ({
  flowDefinition,
  initialValues = {},
  onSubmit,
  onStepChange,
}: UseDynamicFormikProps): UseDynamicFormikReturn => {
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const previousStepsLengthRef = useRef<number>(0);
  const previousAccountTypeRef = useRef<string>("");
  const previousNumberOfProductsRef = useRef<number>(0);
  const buildInitialValues = useCallback((): FormValues => {
    const defaults: FormValues = {
      accountType: "buyer",
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      businessName: "",
      registrationNumber: "",
      country: "",
      city: "",
      area: "",
      tradeLicense: null,
      monthlySpendingLimit: undefined,
      numberOfProducts: 0,
      products: [],
      interests: [],
      promotionalOffers: false,
      verificationDocuments: [],
    };
    return { ...defaults, ...initialValues };
  }, [initialValues]);
  const buildValidationSchema = useCallback((): Yup.ObjectSchema<any> => {
    const baseSchema: any = {};
    const addValidation = (
      fieldName: string,
      validationRules: string[],
      fieldType?: string
    ) => {
      let fieldSchema: any;
      if (fieldType === "file") {
        fieldSchema = Yup.mixed();
      } else if (fieldType === "number") {
        fieldSchema = Yup.number();
      } else {
        fieldSchema = Yup.string();
      }
      validationRules.forEach((rule) => {
        if (rule === "required") {
          if (fieldType === "file") {
            fieldSchema = fieldSchema.test(
              "required",
              t("validation.required"),
              (value: any) => {
                return (
                  value && (Array.isArray(value) ? value.length > 0 : true)
                );
              }
            );
          } else {
            fieldSchema = fieldSchema.required(t("validation.required"));
          }
        } else if (rule.startsWith("minLength:")) {
          const min = parseInt(rule.split(":")[1]);
          fieldSchema = fieldSchema.min(
            min,
            t("validation.minLength", { min })
          );
        } else if (rule.startsWith("maxLength:")) {
          const max = parseInt(rule.split(":")[1]);
          fieldSchema = fieldSchema.max(
            max,
            t("validation.maxLength", { max })
          );
        } else if (rule === "email") {
          fieldSchema = fieldSchema.email(t("validation.email"));
        } else if (rule === "passwordMatch") {
        } else if (rule === "age18") {
        } else if (rule.startsWith("minValue:")) {
          const min = parseFloat(rule.split(":")[1]);
          fieldSchema = fieldSchema.min(min, t("validation.minValue", { min }));
        } else if (rule.startsWith("maxValue:")) {
          const max = parseFloat(rule.split(":")[1]);
          fieldSchema = fieldSchema.max(max, t("validation.maxValue", { max }));
        }
      });
      baseSchema[fieldName] = fieldSchema;
    };
    flowDefinition.steps.forEach((step) => {
      step.fields.forEach((field) => {
        if (field.name === "monthlySpendingLimit") {
          return;
        }
        if (
          field.name === "businessName" ||
          field.name === "registrationNumber" ||
          field.name === "country" ||
          field.name === "city" ||
          field.name === "numberOfProducts"
        ) {
          return;
        }
        if (field.validation) {
          const rules = field.validation.split("|");
          addValidation(field.name, rules, field.type);
        }
      });
    });
    baseSchema.confirmPassword = Yup.string()
      .oneOf([Yup.ref("password")], t("validation.passwordMatch"))
      .required(t("validation.required"));
    baseSchema.dateOfBirth = Yup.date()
      .max(new Date(), "Invalid date")
      .test("age", t("validation.age18"), (value) => {
        if (!value) return false;
        const age = new Date().getFullYear() - value.getFullYear();
        return age >= 18;
      });
    baseSchema.products = Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required(t("validation.required")),
        category: Yup.string().required(t("validation.required")),
        price: Yup.number().min(0.01, t("validation.minValue", { min: 0.01 })),
        stockQuantity: Yup.number().min(
          0,
          t("validation.minValue", { min: 0 })
        ),
      })
    );
    baseSchema.verificationDocuments = Yup.mixed().test(
      "conditional-required",
      t("validation.required"),
      function (value) {
        const { accountType, monthlySpendingLimit } = this.parent;
        if (accountType === "buyer" && (monthlySpendingLimit || 0) > 10000) {
          return value && (Array.isArray(value) ? value.length > 0 : true);
        }
        return true;
      }
    );
    baseSchema.tradeLicense = Yup.mixed().nullable();
    baseSchema.monthlySpendingLimit = Yup.number()
      .test("conditional-required", t("validation.required"), function (value) {
        const { accountType } = this.parent;
        if (accountType === "buyer") {
          return value !== undefined && value !== null && value >= 1;
        }
        return true;
      })
      .test(
        "conditional-range",
        t("validation.minValue", { min: 1 }),
        function (value) {
          const { accountType } = this.parent;
          if (accountType === "buyer") {
            return (
              value !== undefined &&
              value !== null &&
              value >= 1 &&
              value <= 1000000
            );
          }
          return true;
        }
      );
    baseSchema.businessName = Yup.string()
      .test("conditional-required", t("validation.required"), function (value) {
        const { accountType } = this.parent;
        if (accountType === "seller") {
          return Boolean(value && value.trim().length >= 2);
        }
        return true;
      })
      .test(
        "conditional-length",
        t("validation.minLength", { min: 2 }),
        function (value) {
          const { accountType } = this.parent;
          if (accountType === "seller" && value) {
            return Boolean(
              value.trim().length >= 2 && value.trim().length <= 100
            );
          }
          return true;
        }
      );
    baseSchema.registrationNumber = Yup.string()
      .test("conditional-required", t("validation.required"), function (value) {
        const { accountType } = this.parent;
        if (accountType === "seller") {
          return Boolean(value && value.trim().length >= 5);
        }
        return true;
      })
      .test(
        "conditional-length",
        t("validation.minLength", { min: 5 }),
        function (value) {
          const { accountType } = this.parent;
          if (accountType === "seller" && value) {
            return Boolean(
              value.trim().length >= 5 && value.trim().length <= 20
            );
          }
          return true;
        }
      );
    baseSchema.country = Yup.string().test(
      "conditional-required",
      t("validation.required"),
      function (value) {
        const { accountType } = this.parent;
        if (accountType === "seller") {
          return Boolean(value && value.trim().length > 0);
        }
        return true;
      }
    );
    baseSchema.city = Yup.string().test(
      "conditional-required",
      t("validation.required"),
      function (value) {
        const { accountType } = this.parent;
        if (accountType === "seller") {
          return Boolean(value && value.trim().length > 0);
        }
        return true;
      }
    );
    baseSchema.numberOfProducts = Yup.number()
      .test("conditional-required", t("validation.required"), function (value) {
        const { accountType } = this.parent;
        if (accountType === "seller") {
          return Boolean(value !== undefined && value !== null && value >= 1);
        }
        return true;
      })
      .test(
        "conditional-range",
        t("validation.minValue", { min: 1 }),
        function (value) {
          const { accountType } = this.parent;
          if (
            accountType === "seller" &&
            value !== undefined &&
            value !== null
          ) {
            return Boolean(value >= 1 && value <= 100);
          }
          return true;
        }
      );
    return Yup.object().shape(baseSchema);
  }, [flowDefinition, t]);
  const getAvailableSteps = useCallback(
    (values: FormValues): StepConfig[] => {
      const baseSteps = flowDefinition.steps.filter((step) => {
        if (!step.condition) {
          return true;
        }
        const shouldInclude = step.condition(values);
        return shouldInclude;
      });

      if (flowDefinition.getDynamicSteps) {
        const dynamicSteps = flowDefinition.getDynamicSteps(values);

        const reviewStepIndex = baseSteps.findIndex(
          (step) => step.id === "review-submit"
        );
        if (reviewStepIndex !== -1) {
          baseSteps.splice(reviewStepIndex, 0, ...dynamicSteps);
        } else {
          baseSteps.push(...dynamicSteps);
        }
      }

      return baseSteps;
    },
    [flowDefinition]
  );
  const formik = useFormik<FormValues>({
    initialValues: buildInitialValues(),
    validationSchema: buildValidationSchema(),
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  });
  const currentSteps = useMemo(() => {
    return getAvailableSteps(formik.values);
  }, [
    getAvailableSteps,
    formik.values.accountType,
    formik.values.numberOfProducts,
    formik.values.monthlySpendingLimit,
  ]);
  const totalSteps = currentSteps.length;
  const goToNextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      const nextStep = currentStepIndex + 1;
      setCurrentStepIndex(nextStep);
      onStepChange?.(nextStep);
    }
  }, [currentStepIndex, totalSteps, onStepChange]);
  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevStep = currentStepIndex - 1;
      setCurrentStepIndex(prevStep);
      onStepChange?.(prevStep);
    }
  }, [currentStepIndex, onStepChange]);
  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < totalSteps) {
        setCurrentStepIndex(stepIndex);
        onStepChange?.(stepIndex);
      }
    },
    [totalSteps, onStepChange]
  );
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const canProceed = currentStepIndex < totalSteps - 1;
  const stepProgress = ((currentStepIndex + 1) / totalSteps) * 100;
  useEffect(() => {
    const currentStepsLength = currentSteps.length;
    const currentAccountType = formik.values.accountType;
    const currentNumberOfProducts = formik.values.numberOfProducts || 0;
    const currentMonthlySpendingLimit = formik.values.monthlySpendingLimit;

    const shouldReset =
      currentStepsLength !== previousStepsLengthRef.current ||
      currentAccountType !== previousAccountTypeRef.current ||
      currentNumberOfProducts !== previousNumberOfProductsRef.current;
    if (shouldReset) {
      if (currentStepIndex >= currentStepsLength) {
        setCurrentStepIndex(0);
        onStepChange?.(0);
      }
      previousStepsLengthRef.current = currentStepsLength;
      previousAccountTypeRef.current = currentAccountType;
      previousNumberOfProductsRef.current = currentNumberOfProducts;
    }
  }, [
    currentSteps.length,
    formik.values.accountType,
    formik.values.numberOfProducts,
    formik.values.monthlySpendingLimit,
    currentStepIndex,
    onStepChange,
  ]);
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const currentStep = currentSteps[currentStepIndex];
    if (!currentStep) return false;
    const stepFieldNames = currentStep.fields.map((field) => field.name);
    const stepValues = stepFieldNames.reduce((acc, fieldName) => {
      acc[fieldName] = formik.values[fieldName as keyof FormValues];
      return acc;
    }, {} as any);
    try {
      await formik.validateForm();
      const stepErrors = Object.keys(formik.errors).filter((key) =>
        stepFieldNames.includes(key)
      );
      return stepErrors.length === 0;
    } catch (error) {
      return false;
    }
  }, [currentSteps, currentStepIndex, formik]);
  const goToNextStepWithValidation = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      goToNextStep();
    }
  }, [validateCurrentStep, goToNextStep]);
  return {
    formik,
    currentSteps,
    totalSteps,
    currentStepIndex,
    goToNextStep: goToNextStepWithValidation,
    goToPreviousStep,
    goToStep,
    isFirstStep,
    isLastStep,
    canProceed,
    stepProgress,
  };
};
export default useDynamicFormik;
