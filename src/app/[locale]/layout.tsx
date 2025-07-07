import {NextIntlClientProvider, hasLocale} from 'next-intl';
import { ThemeProvider } from "next-themes";
import {notFound} from 'next/navigation';
import "../globals.css";
import { routing } from '@/i18n/routing';
import { getMessages, setRequestLocale } from 'next-intl/server';

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const messages = await getMessages();
  setRequestLocale(locale)
  return (
    <html suppressHydrationWarning lang={locale}>
      <body >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}