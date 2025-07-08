import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: ["three", "framer-motion", "@react-three/fiber", "@react-three/drei"],
    webpackBuildWorker: true,
  },
  
  // Enable modern JS features
  swcMinify: true,
  modularizeImports: {
    "framer-motion": {
      transform: "framer-motion/{{member}}",
    },
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // WebGL and audio support
  webpack: (config) => {
    // Audio file support
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      type: "asset/resource",
    });

    // GLSL shader support
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: "asset/source",
    });

    // WebGL optimization
    config.resolve.alias = {
      ...config.resolve.alias,
      "three/examples/jsm": "three/examples/jsm",
    };

    return config;
  },

  // Headers for WebGL and audio
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },

  // Bundle splitting
  experimental: {
    ...nextConfig.experimental,
    esmExternals: true,
  },
};

export default withBundleAnalyzer(nextConfig);
