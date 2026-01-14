'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/api';

export default function HomePage() {
    const [mounted, setMounted] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsLoggedIn(isAuthenticated());
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold gradient-text">Feedback Pulse</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {mounted && isLoggedIn ? (
                            <Link href="/dashboard" className="btn-primary">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="btn-ghost">
                                    Sign In
                                </Link>
                                <Link href="/signup" className="btn-primary">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium mb-8 animate-fade-in">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        Now with AI-Powered Sentiment Analysis
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight animate-slide-up">
                        Collect Feedback<br />
                        <span className="gradient-text">That Matters</span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        A lightweight, embeddable widget that lets you collect user feedback seamlessly.
                        Powered by AI sentiment analysis to understand your users better.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Link href="/signup" className="btn-primary text-lg px-8 py-4">
                            Start Collecting Feedback
                            <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link href="#features" className="btn-secondary text-lg px-8 py-4">
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Widget Preview */}
                <div className="max-w-4xl mx-auto mt-20 animate-float">
                    <div className="glass-card p-8 shadow-glass-lg">
                        <div className="bg-gray-900 rounded-xl p-6 text-left">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <pre className="text-sm text-gray-300 overflow-x-auto">
                                <code>{`<!-- Just add this script to your website -->
<script 
  src="https://api.feedbackpulse.com/widget.js?key=fp_xxxxxxxxxx" 
  async
></script>

<!-- That's it! The widget appears automatically -->`}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6 bg-white/50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-gray-600 max-w-xl mx-auto">
                            A complete feedback collection solution with powerful features
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="card p-8 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Integration</h3>
                            <p className="text-gray-600">
                                Add a single script tag to your website. No complex setup or configuration needed.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card p-8 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">AI Sentiment Analysis</h3>
                            <p className="text-gray-600">
                                Powered by Gemini AI to automatically classify feedback as positive, neutral, or negative.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card p-8 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Labels & Organization</h3>
                            <p className="text-gray-600">
                                Tag and organize feedback with custom labels. Filter by type, sentiment, or your own categories.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card p-8 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Multiple Projects</h3>
                            <p className="text-gray-600">
                                Manage feedback for multiple websites or products from a single dashboard.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="card p-8 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Filtering</h3>
                            <p className="text-gray-600">
                                Filter feedback by Bug, Feature Request, or Other. Find exactly what you're looking for.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="card p-8 hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private</h3>
                            <p className="text-gray-600">
                                Your data is secure. Each project has a unique key, and admin access is protected with JWT.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-primary-500/30">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Collect Better Feedback?
                        </h2>
                        <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                            Start collecting and analyzing user feedback in minutes. No credit card required.
                        </p>
                        <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                            Get Started Free
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-gray-100">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="font-semibold text-gray-700">Feedback Pulse</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Feedback Pulse. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
