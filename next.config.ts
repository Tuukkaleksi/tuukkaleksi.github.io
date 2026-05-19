import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
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
        destination: "/portfolio/asiakasprojekti",
        permanent: true,
      },
      {
        source: "/portfolio-tictactoe.html",
        destination: "/portfolio/tic-tac-toe",
        permanent: true,
      },
      {
        source: "/portfolio-sudoku.html",
        destination: "/portfolio/sudoku",
        permanent: true,
      },
      {
        source: "/portfolio-vectorama.html",
        destination: "/portfolio/vectorama",
        permanent: true,
      },
      {
        source: "/portfolio-txt-adv.html",
        destination: "/portfolio/text-adventure",
        permanent: true,
      },
      {
        source: "/portfolio-wordle.html",
        destination: "/portfolio/wordle",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
