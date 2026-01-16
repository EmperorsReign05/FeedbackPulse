/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    //headers for Google auth compatibility and security
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
        ];
    },
    // Image optimization configuration
    images: {
        domains: [],
        unoptimized: false,
    },
    // Production optimizations
    poweredByHeader: false,
    compress: true,
};

module.exports = nextConfig;

