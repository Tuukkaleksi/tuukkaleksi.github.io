import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { getSecurityHeaders } from "./src/lib/security/csp";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";
    return [
      {
        source: "/(.*)",
        headers: [...getSecurityHeaders(isProduction)],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      {
        source: "/portfolio-eternal.html",
        destination: "/portfolio/eternal-cry",
        permanent: true,
      },
      {
        source: "/portfolio-asiakaprojekti.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/portfolio-tictactoe.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/portfolio-sudoku.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/portfolio-vectorama.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/portfolio-txt-adv.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/portfolio-wordle.html",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
