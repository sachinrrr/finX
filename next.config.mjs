/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "randomuser.me",
          },
        ],
      },

    eslint: {
      ignoreDuringBuilds: true,
    },

    experimental:{
      serverActions: {
        bodySizeLimit:"10mb"
      }
    },

    // Disable caching for dynamic routes
    async headers() {
      return [
        {
          source: '/dashboard',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
          ],
        },
        {
          source: '/account/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
          ],
        },
      ];
    },
  };

export default nextConfig;


