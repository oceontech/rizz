import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos enviadas pelo painel (Vercel Blob).
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    // Site e painel têm root layouts separados; o 404 global cobre os dois.
    globalNotFound: true,
    // Upload de fotos de pratos e promoções pelo painel (limite de 4,5 MB + folga).
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
