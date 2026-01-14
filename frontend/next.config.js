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
    },
};

module.exports = nextConfig;
