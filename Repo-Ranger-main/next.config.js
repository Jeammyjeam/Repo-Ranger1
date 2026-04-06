/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@genkit-ai/core',
      'genkit',
      '@grpc/grpc-js',
      '@opentelemetry/sdk-node',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle 'require-in-the-middle' for the client.
      config.resolve.alias['require-in-the-middle'] = false;
    }
    return config;
  },
  devIndicators: {
    allowedDevOrigins: [
        'https://*.cloudworkstations.dev',
    ],
  },
};

module.exports = nextConfig;
