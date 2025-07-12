import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@lobehub/ui'],
};

export default withNextIntl(nextConfig);
;
