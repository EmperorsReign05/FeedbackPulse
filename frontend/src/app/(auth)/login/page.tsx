'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validation';
import { authApi, setToken } from '@/lib/api';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        const response = await authApi.login(data.email, data.password);

        if (response.success && response.data) {
            setToken(response.data.token);
            router.push('/dashboard');
        } else {
            setError(response.error || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
                <div className="max-w-md w-full mx-auto">
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-display font-bold text-gray-900 tracking-tight">Feedback Pulse</span>
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
                        <p className="text-gray-600">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-slide-down">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="input-label">
                                    Email address
                                </label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    className={`input-field ${errors.email ? 'input-error' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <p className="error-message">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="input-label">
                                    Password
                                </label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    className={`input-field ${errors.password ? 'input-error' : ''}`}
                                    disabled={isLoading}
                                />
                                {errors.password && (
                                    <p className="error-message">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full btn-primary py-4"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 spinner"></div>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or</span>
                                </div>
                            </div>

                            <div className="w-full">
                                <GoogleLogin
                                    onSuccess={async (credentialResponse: CredentialResponse) => {
                                        if (credentialResponse.credential) {
                                            setIsLoading(true);
                                            try {
                                                const response = await authApi.googleLogin(credentialResponse.credential);
                                                if (response.success && response.data) {
                                                    setToken(response.data.token);
                                                    router.push('/dashboard');
                                                } else {
                                                    setError(response.error || 'Google login failed');
                                                    setIsLoading(false);
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                setError('An unexpected error occurred');
                                                setIsLoading(false);
                                            }
                                        }
                                    }}
                                    onError={() => {
                                        setError('Google Login Failed');
                                    }}
                                    theme="outline"
                                    size="large"
                                    width="100%" // This works when parent has defined width
                                    text="continue_with"
                                    shape="rectangular" // Changed to match the primary button shape better
                                />
                            </div>
                        </form>
                    </GoogleOAuthProvider>

                    {/* Footer */}
                    <p className="mt-8 text-center text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-primary-600 font-medium hover:text-primary-700">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Decorative */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-900 to-black items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                <div className="max-w-lg text-center text-white relative z-10">
                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-xl border border-white/20">
                        <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-display font-bold mb-6">Collect Feedback Effortlessly</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Integrate our widget in seconds and start receiving valuable insights from your users.
                    </p>
                </div>
            </div>
        </div>
    );
}
