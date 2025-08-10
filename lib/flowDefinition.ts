import { FlowDefinition, StepConfig, FormValues } from "@/types/onboarding";
const productCategories = [
  { value: "electronics", labelKey: "category.electronics" },
  { value: "clothing", labelKey: "category.clothing" },
  { value: "home", labelKey: "category.home" },
  { value: "sports", labelKey: "category.sports" },
  { value: "books", labelKey: "category.books" },
  { value: "beauty", labelKey: "category.beauty" },
  { value: "automotive", labelKey: "category.automotive" },
  { value: "toys", labelKey: "category.toys" },
];
const interestCategories = [
  { value: "electronics", labelKey: "category.electronics" },
  { value: "clothing", labelKey: "category.clothing" },
  { value: "home", labelKey: "category.home" },
  { value: "sports", labelKey: "category.sports" },
  { value: "books", labelKey: "category.books" },
  { value: "beauty", labelKey: "category.beauty" },
  { value: "automotive", labelKey: "category.automotive" },
  { value: "toys", labelKey: "category.toys" },
];
const countries = [
  { value: "uae", labelKey: "country.uae" },
  { value: "usa", labelKey: "country.usa" },
  { value: "uk", labelKey: "country.uk" },
  { value: "canada", labelKey: "country.canada" },
  { value: "australia", labelKey: "country.australia" },
  { value: "germany", labelKey: "country.germany" },
  { value: "france", labelKey: "country.france" },
  { value: "japan", labelKey: "country.japan" },
];
export const onboardingFlow: FlowDefinition = {
  steps: [
    {
      id: "account-type",
      titleKey: "step1.title",
      descriptionKey: "step1.description",
      fields: [
        {
          name: "accountType",
          type: "select",
          labelKey: "step1.title",
          required: true,
          options: [
            { value: "seller", labelKey: "step1.seller" },
            { value: "buyer", labelKey: "step1.buyer" },
          ],
        },
      ],
    },
    {
      id: "basic-info",
      titleKey: "step2.title",
      descriptionKey: "step2.description",
      fields: [
        {
          name: "firstName",
          type: "text",
          labelKey: "step2.firstName",
          required: true,
          validation: "required|minLength:2|maxLength:50",
        },
        {
          name: "lastName",
          type: "text",
          labelKey: "step2.lastName",
          required: true,
          validation: "required|minLength:2|maxLength:50",
        },
        {
          name: "email",
          type: "email",
          labelKey: "step2.email",
          required: true,
          validation: "required|email",
          placeholderKey: "step2.email.placeholder",
          apiValidation: true,
          debounceMs: 500,
        },
        {
          name: "username",
          type: "text",
          labelKey: "step2.username",
          required: true,
          validation: "required|minLength:3|maxLength:20",
          placeholderKey: "step2.username.placeholder",
          apiValidation: true,
          debounceMs: 500,
        },
        {
          name: "password",
          type: "password",
          labelKey: "step2.password",
          required: true,
          validation: "required|minLength:8",
          placeholderKey: "step2.password.placeholder",
        },
        {
          name: "confirmPassword",
          type: "password",
          labelKey: "step2.confirmPassword",
          required: true,
          validation: "required|passwordMatch",
          placeholderKey: "step2.confirmPassword.placeholder",
        },
        {
          name: "dateOfBirth",
          type: "date",
          labelKey: "step2.dateOfBirth",
          required: true,
          validation: "required|age18",
          placeholderKey: "step2.dateOfBirth.placeholder",
        },
      ],
    },
    {
      id: "seller-business",
      titleKey: "step3a.title",
      descriptionKey: "step3a.description",
      condition: (values: FormValues) => values.accountType === "seller",
      fields: [
        {
          name: "businessName",
          type: "text",
          labelKey: "step3a.businessName",
          required: true,
          validation: "required|minLength:2|maxLength:100",
          placeholderKey: "step3a.businessName.placeholder",
        },
        {
          name: "registrationNumber",
          type: "text",
          labelKey: "step3a.registrationNumber",
          required: true,
          validation: "required|minLength:5|maxLength:20",
          placeholderKey: "step3a.registrationNumber.placeholder",
        },
        {
          name: "country",
          type: "select",
          labelKey: "step3a.country",
          required: true,
          validation: "required",
          options: countries,
        },
        {
          name: "city",
          type: "select",
          labelKey: "step3a.city",
          required: true,
          validation: "required",
          dependsOn: "country",
        },
        {
          name: "area",
          type: "select",
          labelKey: "step3a.area",
          required: false,
          dependsOn: "city",
        },
        {
          name: "tradeLicense",
          type: "file",
          labelKey: "step3a.tradeLicense",
          required: false,
          condition: (values: FormValues) => values.country === "uae",
        },
      ],
    },
    {
      id: "buyer-spending",
      titleKey: "step3b.title",
      descriptionKey: "step3b.description",
      condition: (values: FormValues) => values.accountType === "buyer",
      fields: [
        {
          name: "monthlySpendingLimit",
          type: "number",
          labelKey: "step3b.monthlySpendingLimit",
          required: true,
          validation: "required|minValue:1|maxValue:1000000",
          placeholderKey: "step3b.monthlySpendingLimit.placeholder",
        },
      ],
    },
    {
      id: "seller-products",
      titleKey: "step4a.title",
      descriptionKey: "step4a.description",
      condition: (values: FormValues) => values.accountType === "seller",
      isDynamic: true,
      fields: [
        {
          name: "numberOfProducts",
          type: "number",
          labelKey: "step4a.numberOfProducts",
          required: true,
          validation: "required|minValue:1|maxValue:100",
          placeholderKey: "step4a.numberOfProducts.placeholder",
        },
      ],
    },
    {
      id: "buyer-interests",
      titleKey: "step4b.title",
      descriptionKey: "step4b.description",
      condition: (values: FormValues) => values.accountType === "buyer",
      fields: [
        {
          name: "interests",
          type: "multiselect",
          labelKey: "step4b.interests",
          required: false,
          options: interestCategories,
          placeholderKey: "step4b.interests.placeholder",
        },
        {
          name: "promotionalOffers",
          type: "checkbox",
          labelKey: "step4b.promotionalOffers",
          required: false,
        },
      ],
    },
    {
      id: "verification-documents",
      titleKey: "verification.title",
      descriptionKey: "verification.description",
      condition: (values: FormValues) =>
        values.accountType === "buyer" &&
        (values.monthlySpendingLimit || 0) > 10000,
      fields: [
        {
          name: "verificationDocuments",
          type: "file",
          labelKey: "verification.documents",
          required: true,
          validation: "required",
        },
      ],
    },
    {
      id: "review-submit",
      titleKey: "step5.title",
      descriptionKey: "step5.description",
      fields: [],
    },
  ],
  getDynamicSteps: (values: FormValues): StepConfig[] => {
    if (values.accountType !== "seller" || !values.numberOfProducts) {
      return [];
    }
    const numberOfProducts = values.numberOfProducts;
    const stepsPerBatch = 5;
    const totalBatches = Math.ceil(numberOfProducts / stepsPerBatch);
    const dynamicSteps: StepConfig[] = [];
    for (let batch = 0; batch < totalBatches; batch++) {
      const startIndex = batch * stepsPerBatch;
      const endIndex = Math.min(startIndex + stepsPerBatch, numberOfProducts);
      const batchSize = endIndex - startIndex;
      dynamicSteps.push({
        id: `product-batch-${batch + 1}`,
        titleKey: `step4a.batch.title`,
        descriptionKey: `step4a.batch.description`,
        isDynamic: true,
        dynamicCount: batchSize,
        dynamicData: {
          batch: batch + 1,
          start: startIndex + 1,
          end: endIndex,
        },
        fields: Array.from({ length: batchSize }, (_, index) => {
          const productIndex = startIndex + index;
          return [
            {
              name: `products.${productIndex}.name`,
              type: "text" as const,
              labelKey: `step4a.product.name`,
              required: true,
              validation: "required|minLength:2|maxLength:100",
              placeholderKey: `step4a.product.name.placeholder`,
            },
            {
              name: `products.${productIndex}.category`,
              type: "select" as const,
              labelKey: `step4a.product.category`,
              required: true,
              validation: "required",
              options: productCategories,
              placeholderKey: `step4a.product.category.placeholder`,
            },
            {
              name: `products.${productIndex}.price`,
              type: "number" as const,
              labelKey: `step4a.product.price`,
              required: true,
              validation: "required|minValue:0.01",
              placeholderKey: `step4a.product.price.placeholder`,
            },
            {
              name: `products.${productIndex}.stockQuantity`,
              type: "number" as const,
              labelKey: `step4a.product.stockQuantity`,
              required: true,
              validation: "required|minValue:0",
              placeholderKey: `step4a.product.stockQuantity.placeholder`,
            },
          ];
        }).flat(),
      });
    }
    return dynamicSteps;
  },
};
export default onboardingFlow;
