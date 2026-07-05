import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ayetab/ui", "@ayetab/utils", "@excalidraw/excalidraw"],
};

export default nextConfig;
