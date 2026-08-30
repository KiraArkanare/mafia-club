import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    basePath: '/mafia-club',
    assetPrefix: '/mafia-club/',
};

export default nextConfig;