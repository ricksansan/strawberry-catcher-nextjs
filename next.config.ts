import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    // Suppress webpack warnings for MetaMask
    config.ignoreWarnings = [
      /Failed to parse source map/,
      /Module not found: Can't resolve 'pino-pretty'/,
    ];
    
    return config;
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https: chrome-extension:",
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: https: chrome-extension:",
              "connect-src 'self' https: wss: chrome-extension:",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  // Suppress build warnings
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
