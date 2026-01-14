import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Feedback Pulse - Collect & Manage User Feedback',
    description: 'A modern SaaS platform for collecting and managing user feedback with AI-powered sentiment analysis.',
    keywords: ['feedback', 'saas', 'user feedback', 'sentiment analysis', 'widget'],
    authors: [{ name: 'Feedback Pulse' }],
    openGraph: {
        title: 'Feedback Pulse',
        description: 'Collect & Manage User Feedback with AI-Powered Insights',
        type: 'website',
    },
    icons: {
        icon: '/icon.svg',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="min-h-screen">
                {children}
            </body>
        </html>
    );
}
