import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Если деплоим на GitHub Pages, указываем имя репозитория
  basePath: isGithubActions ? '/mafia-club' : '',
  assetPrefix: isGithubActions ? '/mafia-club/' : '',
};

export default nextConfig;