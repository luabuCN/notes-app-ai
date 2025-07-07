import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  // 去掉语言前缀
  const pathWithoutLocale = pathname.replace(/^\/(zh|en)(?=\/|$)/, '');
  const localeMatch = pathname.match(/^\/(zh|en)(?=\/|$)/);
  const localePrefix = localeMatch ? localeMatch[0] : '';
  
  // 登录校验
  if (pathWithoutLocale !== '/' && pathWithoutLocale !== '/signin' && pathWithoutLocale !== '/signup' && pathWithoutLocale !== '') {
    const cookies = getSessionCookie(request);
    if (!cookies) {
      return NextResponse.redirect(new URL(`${localePrefix}/signin`, request.url));
    }
  }
  // 国际化
  const intlResponse = await intlMiddleware(request);
  if (intlResponse) return intlResponse;

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/(zh|en)/:path*']
};