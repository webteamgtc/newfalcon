import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["axios", "tough-cookie", "axios-cookiejar-support"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "gtcfx-bucket.s3.ap-southeast-1.amazonaws.com" }
    ]
  }
};

export default withNextIntl(nextConfig);
