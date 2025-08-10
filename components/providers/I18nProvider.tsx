"use client";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getDirection } from "@/lib/i18n";
interface I18nProviderProps {
  children: React.ReactNode;
}
export function I18nProvider({ children }: I18nProviderProps) {
  const { i18n } = useTranslation();
  useEffect(() => {
    const direction = getDirection(i18n.language);
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  return <>{children}</>;
}
