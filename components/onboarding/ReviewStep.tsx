import React from "react";
import { useTranslation } from "react-i18next";
import { FormValues, AccountType } from "@/types/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  FileText,
  Building,
  ShoppingCart,
  Package,
  CreditCard,
} from "lucide-react";
interface ReviewStepProps {
  formValues: FormValues;
  onEdit: (stepIndex: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
}
export const ReviewStep: React.FC<ReviewStepProps> = ({
  formValues,
  onEdit,
  onSubmit,
  isLoading,
}) => {
  const { t } = useTranslation();
  const formatValue = (value: any, fieldName: string): string => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    if (fieldName === "dateOfBirth") {
      return new Date(value).toLocaleDateString();
    }
    if (fieldName === "monthlySpendingLimit") {
      return `$${value.toLocaleString()}`;
    }
    if (fieldName === "price") {
      return `$${parseFloat(value).toFixed(2)}`;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return "None selected";
      return value.map((v) => t(`category.${v}`)).join(", ");
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (fieldName === "country") {
      return t(`country.${value}`);
    }
    if (fieldName === "category") {
      return t(`category.${value}`);
    }
    return String(value);
  };
  const renderSection = (
    title: string,
    icon: React.ReactNode,
    data: Record<string, any>,
    stepIndex: number
  ) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(stepIndex)}
          className="flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>{t("step5.edit")}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(data).map(([key, value]) => {
          if (value === null || value === undefined || value === "")
            return null;
          return (
            <div key={key} className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-700">
                {t(`review.${key}`) || key}
              </span>
              <span className="text-gray-900">{formatValue(value, key)}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
  const renderProductsSection = () => {
    if (!formValues.products || formValues.products.length === 0) {
      return null;
    }
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <CardTitle className="text-lg">
              {t("review.products")} ({formValues.products.length})
            </CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(3)}
            className="flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>{t("step5.edit")}</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formValues.products.map((product, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{product.name}</h4>
                  <Badge variant="secondary">
                    {t(`category.${product.category}`)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Price: </span>
                    {formatValue(product.price, "price")}
                  </div>
                  <div>
                    <span className="font-medium">Stock: </span>
                    {product.stockQuantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">{t("step5.title")}</h2>
        <p className="text-gray-600">{t("step5.description")}</p>
      </div>

      {renderSection(
        t("review.accountType"),
        <Badge
          variant={
            formValues.accountType === "seller" ? "default" : "secondary"
          }
        >
          {t(`step1.${formValues.accountType}`)}
        </Badge>,
        { accountType: formValues.accountType },
        0
      )}
      <Separator />

      {renderSection(
        t("review.basicInfo"),
        <FileText className="w-5 h-5" />,
        {
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          email: formValues.email,
          username: formValues.username,
          dateOfBirth: formValues.dateOfBirth,
        },
        1
      )}
      <Separator />

      {formValues.accountType === "seller" && (
        <>
          {renderSection(
            t("review.businessDetails"),
            <Building className="w-5 h-5" />,
            {
              businessName: formValues.businessName,
              registrationNumber: formValues.registrationNumber,
              country: formValues.country,
              city: formValues.city,
              area: formValues.area,
              tradeLicense: formValues.tradeLicense
                ? "Uploaded"
                : "Not uploaded",
            },
            2
          )}
          <Separator />
        </>
      )}

      {formValues.accountType === "buyer" && (
        <>
          {renderSection(
            t("review.spendingPreferences"),
            <CreditCard className="w-5 h-5" />,
            {
              monthlySpendingLimit: formValues.monthlySpendingLimit,
            },
            2
          )}
          <Separator />
        </>
      )}

      {formValues.accountType === "seller" && renderProductsSection()}

      {formValues.accountType === "buyer" && (
        <>
          {renderSection(
            t("review.interests"),
            <ShoppingCart className="w-5 h-5" />,
            {
              interests: formValues.interests,
              promotionalOffers: formValues.promotionalOffers,
            },
            3
          )}
          <Separator />
        </>
      )}

      {formValues.accountType === "buyer" &&
        (formValues.monthlySpendingLimit || 0) > 10000 && (
          <>
            {renderSection(
              t("review.verificationDocuments"),
              <FileText className="w-5 h-5" />,
              {
                verificationDocuments:
                  formValues.verificationDocuments?.length || 0,
              },
              4
            )}
            <Separator />
          </>
        )}

      <div className="flex justify-center pt-6">
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          size="lg"
          className="px-8 py-3"
        >
          {isLoading ? t("loading") : t("step5.submit")}
        </Button>
      </div>
    </div>
  );
};
