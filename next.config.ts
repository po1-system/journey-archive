import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BASE_PATH: isGitHubPages && repositoryName ? `/${repositoryName}` : "" },
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages && repositoryName ? `/${repositoryName}` : "",
  assetPrefix: isGitHubPages && repositoryName ? `/${repositoryName}/` : "",
  trailingSlash: true,
};

export default nextConfig;
