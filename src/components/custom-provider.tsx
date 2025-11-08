"use client";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModelConfigProvider } from "@/lib/provider/model-config-provider";

export function CustomProviders({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: any;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ModelConfigProvider>
            {children}
          </ModelConfigProvider>
        </NextIntlClientProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
