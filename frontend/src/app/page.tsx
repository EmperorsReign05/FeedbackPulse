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
        <div className="min-h-screen font-sans selection:bg-black selection:text-white overflow-x-hidden">
            <div className="bg-primary-500 min-h-screen relative overflow-hidden flex flex-col pt-20">
                <nav className="fixed top-4 left-0 right-0 z-50 px-4 md:px-6">
                    <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-full px-6 py-3 flex items-center justify-between shadow-lg shadow-black/5 border border-white/20">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight text-gray-900">FeedbackPulse</span>
                        </Link>

                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-6 font-medium text-gray-600 text-sm">
                                <Link href="/#features" className="hover:text-black transition-colors">Features</Link>
                                <Link href="/#how-it-works" className="hover:text-black transition-colors">How it works</Link>
                            </div>

                            <div className="hidden md:block w-px h-6 bg-gray-200"></div>

                            <div className="flex items-center gap-3">
                                {mounted && isLoggedIn ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to logout?')) {
                                                    const Cookies = require('js-cookie');
                                                    Cookies.remove('feedback_pulse_token');
                                                    window.location.reload();
                                                }
                                            }}
                                            className="hidden sm:block px-4 py-2 text-gray-600 font-medium hover:text-red-600 hover:bg-red-50 rounded-full transition-colors text-sm"
                                        >
                                            Log out
                                        </button>
                                        <Link href="/dashboard" className="px-5 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 text-sm">
                                            Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="hidden sm:block px-4 py-2 text-gray-900 font-medium hover:bg-gray-100 rounded-full transition-colors text-sm">
                                            Log in
                                        </Link>
                                        <Link href="/signup" className="px-5 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm flex items-center gap-2">
                                            Get Started
                                            <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">➜</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 mt-10">

                    <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl text-gray-900 tracking-tighter mb-6 leading-[0.9] animate-slide-up">
                        Real human<br />
                        <span className="text-white/90">insights</span>
                    </h1>

                    <p className="font-medium text-xl md:text-2xl text-gray-900/80 mb-10 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        The feedback widget that actually understands your users.
                        AI-powered sentiment analysis.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <Link href="/signup" className="group px-8 py-4 bg-white text-black font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3">
                            Start Collecting
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-48 md:h-64 pointer-events-none overflow-hidden">
                        <div className="absolute bottom-[-50px] left-[10%] w-32 h-32 md:w-48 md:h-48 bg-secondary-400 rounded-full animate-blob mix-blend-multiply opacity-90"></div>
                        <div className="absolute bottom-[-20px] left-[20%] w-40 h-40 md:w-56 md:h-56 bg-white rounded-full animate-blob animation-delay-2000 opacity-90"></div>
                        <div className="absolute bottom-[-60px] right-[15%] w-36 h-36 md:w-52 md:h-52 bg-secondary-500 rounded-b-none rounded-t-full rounded-l-full animate-blob animation-delay-4000 mix-blend-multiply opacity-90"></div>
                        <div className="absolute bottom-[-10px] right-[30%] w-24 h-24 md:w-40 md:h-40 bg-black/10 rounded-full animate-float"></div>
                    </div>
                </div>
            </div>
            <section id="features" className="py-24 px-4 md:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 text-center">
                        <span className="text-secondary-600 font-bold uppercase tracking-wider text-sm mb-2 block">Powerful Features</span>
                        <h2 className="font-display font-bold text-4xl md:text-6xl text-gray-900 tracking-tight">
                            Everything you need.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-gray-50 rounded-[2rem] p-8 md:p-12 hover:bg-secondary-50 transition-colors border border-gray-100 group overflow-hidden relative">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold">
                                    AI
                                </div>
                                <h3 className="font-display font-bold text-3xl text-gray-900 mb-4">Sentiment Analysis</h3>
                                <p className="text-gray-600 text-lg max-w-md">
                                    AI automatically reads every piece of feedback and categorizes it by sentiment. Stop guessing how your users feel.
                                </p>
                            </div>
                            <div className="absolute right-0 bottom-0 w-64 h-64 bg-primary-200 rounded-tl-[4rem] opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                        </div>

                        <div className="bg-black text-white rounded-[2rem] p-8 md:p-12 md:row-span-2 flex flex-col justify-between border border-gray-800 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-50"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-primary-500 text-white rounded-2xl flex items-center justify-center mb-6">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <h3 className="font-display font-bold text-3xl mb-4">Easy Install</h3>
                                <p className="text-gray-400 text-lg">
                                    Just copy and paste one line of code. That's it. It works with React, Vue, Svelte, or plain HTML.
                                </p>
                            </div>
                            <div className="mt-8 bg-gray-900/50 rounded-xl p-4 font-mono text-sm text-primary-400 border border-white/10">
                                &lt;script src="..." /&gt;
                            </div>
                        </div>

                        <div className="bg-primary-50 rounded-[2rem] p-8 md:p-12 hover:bg-primary-100 transition-colors border border-primary-100">
                            <div className="w-14 h-14 bg-primary-500 text-white rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l5.414 5.414a1 1 0 01.586 1.414V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="font-display font-bold text-2xl text-gray-900 mb-3">Export Data</h3>
                            <p className="text-gray-600">
                                Download your feedback as CSV or JSON for deeper analysis.
                            </p>
                        </div>

                        <div className="bg-secondary-50 rounded-[2rem] p-8 md:p-12 hover:bg-secondary-100 transition-colors border border-secondary-100">
                            <div className="w-14 h-14 bg-secondary-500 text-white rounded-2xl flex items-center justify-center mb-6">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="font-display font-bold text-2xl text-gray-900 mb-3">Customizable</h3>
                            <p className="text-gray-600">
                                Match your brand colors and style seamlessly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="bg-black py-12 overflow-hidden whitespace-nowrap -rotate-1 scale-105">
                <div className="inline-block animate-float px-4">
                    <span className="text-4xl md:text-6xl font-display font-black text-transparent stroke-text opacity-50 mx-8">FEEDBACK PULSE</span>
                    <span className="text-4xl md:text-6xl font-display font-black text-primary-500 mx-8">INTELLIGENT</span>
                    <span className="text-4xl md:text-6xl font-display font-black text-transparent stroke-text opacity-50 mx-8">INSIGHTS</span>
                    <span className="text-4xl md:text-6xl font-display font-black text-white mx-8">GROWTH</span>
                    <span className="text-4xl md:text-6xl font-display font-black text-transparent stroke-text opacity-50 mx-8">FEEDBACK PULSE</span>
                </div>
            </div>

            <section id="how-it-works" className="py-24 px-4 bg-black text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-900/30 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-900/20 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-primary-400 font-bold uppercase tracking-wider text-sm mb-2 block">Simple Integration</span>
                        <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-6">
                            Up and running in minutes.
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            We built FeedbackPulse to be the easiest feedback tool you've ever used. No complex configurations, no bloat.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        <div className="relative group">
                            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 hover:border-primary-500/50 transition-colors h-full">
                                <div className="text-6xl font-display font-bold text-transparent stroke-text opacity-20 mb-6 group-hover:opacity-40 transition-opacity">01</div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Create Project</h3>
                                <p className="text-gray-400">
                                    Sign up for an account and create your first project to get your unique API key.
                                </p>
                            </div>
                            <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-[1px] bg-gradient-to-r from-gray-800 to-transparent"></div>
                        </div>

                        <div className="relative group">
                            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 hover:border-primary-500/50 transition-colors h-full">
                                <div className="text-6xl font-display font-bold text-transparent stroke-text opacity-20 mb-6 group-hover:opacity-40 transition-opacity">02</div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Embed Script</h3>
                                <p className="text-gray-400">
                                    Copy the generated one-line script tag and paste it into your website's HTML head or body.
                                </p>
                            </div>
                            <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-[1px] bg-gradient-to-r from-gray-800 to-transparent"></div>
                        </div>

                        <div className="relative group">
                            <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 hover:border-primary-500/50 transition-colors h-full">
                                <div className="text-6xl font-display font-bold text-transparent stroke-text opacity-20 mb-6 group-hover:opacity-40 transition-opacity">03</div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Collect & Analyze</h3>
                                <p className="text-gray-400">
                                    Watch feedback stream into your dashboard. Let AI handle the sentiment analysis for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-24 px-4 bg-white">
                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary-500 blur-[100px] opacity-20 -z-10 rounded-full"></div>
                    <h2 className="font-display font-black text-5xl md:text-7xl text-gray-900 mb-8 tracking-tighter">
                        Start listening<br />to your users.
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto">
                        Join hundreds of developers building better products with FeedbackPulse.
                    </p>
                    <Link href="/signup" className="inline-flex items-center gap-3 px-10 py-5 bg-primary-500 text-white font-bold text-xl rounded-full hover:bg-primary-600 hover:scale-105 transition-all shadow-xl shadow-primary-500/30">
                        Get Started for Free
                    </Link>
                </div>
            </section>

            <footer className="py-12 px-6 border-t border-gray-100 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                                <span className="font-bold">F</span>
                            </div>
                            <span className="font-bold text-gray-900">FeedbackPulse</span>
                        </div>
                        <div className="flex gap-8 text-gray-500 font-medium">
                            <Link href="/privacy" className="hover:text-black">Privacy</Link>
                            <Link href="/terms" className="hover:text-black">Terms</Link>
                            <Link href="https://x.com/almanfarooqui_1" target="_blank" className="hover:text-black">Twitter</Link>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 pt-6 border-t border-gray-200">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} Feedback Pulse.
                        </p>
                        <a
                            href="https://github.com/EmperorsReign05"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-400 text-sm hover:text-black transition-colors"
                        >
                            Made by EmperorsReign05
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>

            {/* Peerlist Badge - Fixed Bottom Right */}
            <a
                href="https://peerlist.io/alman/project/feedbackpulse"
                target="_blank"
                rel="noreferrer"
                className="fixed bottom-4 right-4 z-50 hover:scale-105 transition-transform"
            >
                <img
                    src="https://peerlist.io/api/v1/projects/embed/PRJH7B8PEDKENANRD1REB6LMPJ86GB?showUpvote=true&theme=light"
                    alt="FeedbackPulse on Peerlist"
                    style={{ width: 'auto', height: '72px' }}
                />
            </a>

            <style jsx global>{`
                .stroke-text {
                    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div >
    );
}
