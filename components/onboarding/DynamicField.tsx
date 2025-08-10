import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FieldConfig, FormValues } from "@/types/onboarding";
import {
  useGetCountriesQuery,
  useGetCitiesQuery,
  useGetAreasQuery,
  useCheckUsernameQuery,
  useCheckEmailQuery,
} from "@/lib/api/onboardingApi";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Upload, CheckCircle, XCircle } from "lucide-react";
interface DynamicFieldProps {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  touched?: boolean;
  formValues: FormValues;
}
export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  onBlur,
  error,
  touched,
  formValues,
}) => {
  if (field.condition && !field.condition(formValues)) {
    return null;
  }
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState(value);
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const previousLocalValueRef = useRef<string>("");
  const { data: countries } = useGetCountriesQuery();
  const { data: cities } = useGetCitiesQuery(formValues.country || "", {
    skip: !formValues.country,
  });
  const { data: areas } = useGetAreasQuery(formValues.city || "", {
    skip: !formValues.city,
  });
  const { data: usernameValidation } = useCheckUsernameQuery(localValue, {
    skip:
      !field.apiValidation ||
      field.name !== "username" ||
      !localValue ||
      localValue.length < 3,
  });
  const { data: emailValidation } = useCheckEmailQuery(localValue, {
    skip:
      !field.apiValidation ||
      field.name !== "email" ||
      !localValue ||
      !localValue.includes("@"),
  });
  useEffect(() => {
    if (field.dependsOn) {
      const dependentValue = formValues[field.dependsOn as keyof FormValues];
      console.log(
        `Field ${field.name} depends on ${field.dependsOn}, value: ${dependentValue}, localValue: ${localValue}`
      );
      if (!dependentValue && localValue !== "") {
        console.log(
          `Clearing field ${field.name} because dependent field ${field.dependsOn} is empty`
        );
        setLocalValue("");
        if (
          previousLocalValueRef.current !== "" &&
          previousLocalValueRef.current !== undefined
        ) {
          try {
            onChange("");
          } catch (error) {
            console.warn("Error calling onChange for dependent field:", error);
          }
        }
      }
    }
    previousLocalValueRef.current = localValue;
  }, [
    field.dependsOn,
    formValues[field.dependsOn as keyof FormValues],
    localValue,
  ]);
  useEffect(() => {
    previousLocalValueRef.current = value || "";
  }, [value]);
  useEffect(() => {
    if (field.apiValidation) {
      if (field.name === "username" && usernameValidation) {
        setValidationMessage(usernameValidation.message || "");
        setIsValidating(false);
      } else if (field.name === "email" && emailValidation) {
        setValidationMessage(emailValidation.message || "");
        setIsValidating(false);
      }
    }
  }, [field.apiValidation, field.name, usernameValidation, emailValidation]);
  useEffect(() => {
    if (field.apiValidation && field.debounceMs && localValue) {
      setIsValidating(true);
      const timer = setTimeout(() => {
        setIsValidating(false);
      }, field.debounceMs);
      return () => clearTimeout(timer);
    }
  }, [localValue, field.apiValidation, field.debounceMs]);
  const handleChange = useCallback(
    (newValue: any) => {
      try {
        setLocalValue(newValue);
        onChange(newValue);
      } catch (error) {
        console.warn("Error in handleChange:", error);
        setLocalValue(newValue);
      }
    },
    [onChange]
  );
  const renderField = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "password":
        return (
          <Input
            type={field.type}
            value={localValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholderKey ? t(field.placeholderKey) : ""}
            className={error && touched ? "border-red-500" : ""}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={localValue || ""}
            onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
            onBlur={onBlur}
            placeholder={field.placeholderKey ? t(field.placeholderKey) : ""}
            className={error && touched ? "border-red-500" : ""}
          />
        );
      case "select":
        let options = field.options || [];
        if (field.name === "city" && cities) {
          options = cities.map((city) => ({
            value: city.id,
            labelKey: city.name,
          }));
        } else if (field.name === "area" && areas) {
          options = areas.map((area) => ({
            value: area.id,
            labelKey: area.name,
          }));
        } else if (field.name === "country" && countries) {
          options = countries.map((country) => ({
            value: country.id,
            labelKey: country.name,
          }));
        }
        return (
          <Select value={localValue || ""} onValueChange={handleChange}>
            <SelectTrigger className={error && touched ? "border-red-500" : ""}>
              <SelectValue
                placeholder={
                  field.placeholderKey
                    ? t(field.placeholderKey)
                    : "Select an option"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "multiselect":
        const selectedValues = Array.isArray(localValue) ? localValue : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((selectedValue: string) => (
                <Badge
                  key={selectedValue}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {t(`category.${selectedValue}`)}
                  <button
                    type="button"
                    onClick={() => {
                      const newValues = selectedValues.filter(
                        (v) => v !== selectedValue
                      );
                      handleChange(newValues);
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
            <Select
              onValueChange={(newValue) => {
                if (!selectedValues.includes(newValue)) {
                  handleChange([...selectedValues, newValue]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    field.placeholderKey
                      ? t(field.placeholderKey)
                      : "Select categories"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={localValue || false}
              onCheckedChange={(checked) => handleChange(checked)}
              onBlur={onBlur}
            />
            <Label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t(field.labelKey)}
            </Label>
          </div>
        );
      case "date":
        return (
          <Input
            type="date"
            value={localValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            className={error && touched ? "border-red-500" : ""}
          />
        );
      case "file":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById(`file-${field.name}`)?.click()
                }
              >
                <Upload className="mr-2 h-4 w-4" />
                {localValue ? "Change File" : "Upload File"}
              </Button>
              {localValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChange(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input
              id={`file-${field.name}`}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleChange(file);
              }}
              accept={field.name === "tradeLicense" ? ".pdf,.doc,.docx" : "*/*"}
            />
            {localValue && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{localValue.name}</span>
              </div>
            )}
          </div>
        );
      default:
        return (
          <Input
            value={localValue || ""}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholderKey ? t(field.placeholderKey) : ""}
            className={error && touched ? "border-red-500" : ""}
          />
        );
    }
  };
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium">
        {t(field.labelKey)}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {error && touched && <p className="text-sm text-red-500">{error}</p>}
      {field.apiValidation && validationMessage && (
        <div className="flex items-center space-x-2 text-sm">
          {validationMessage.includes("available") ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span
            className={
              validationMessage.includes("available")
                ? "text-green-600"
                : "text-red-600"
            }
          >
            {validationMessage}
          </span>
        </div>
      )}
      {field.apiValidation && isValidating && (
        <p className="text-sm text-gray-500">Validating...</p>
      )}
    </div>
  );
};
