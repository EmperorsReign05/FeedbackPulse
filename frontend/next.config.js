/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Enable experimental features for server components
    experimental: {
        serverActions: true,
    },
    // Environment variables that will be available in the browser
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    },
    // Configure headers for Google OAuth compatibility
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;

