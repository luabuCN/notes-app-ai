import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";
import { CustomProviders } from "@/components/custom-provider";
import { Toaster } from "@/components/ui/sonner";
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const messages = await getMessages();
  setRequestLocale(locale);
  return (
    <html suppressHydrationWarning lang={locale}>
      <body>
        <CustomProviders locale={locale} messages={messages}>
          {children}
          <Toaster />
        </CustomProviders>
      </body>
    </html>
  );
}
