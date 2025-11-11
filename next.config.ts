import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental:{
    serverActions: {
      bodySizeLimit: '10mb',
    }
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@lobehub/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm5ey4tjnnk.ufs.sh',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
;
