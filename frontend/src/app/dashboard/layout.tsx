'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, removeToken, authApi, User } from '@/lib/api';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        authApi.me().then((response) => {
            if (response.success && response.data) {
                setUser(response.data);
            }
        });
    }, [router]);

    const handleLogout = () => {
        removeToken();
        router.push('/login');
    };

    const navItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            name: 'Projects',
            href: '/dashboard/projects',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6 border-b border-gray-100">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold gradient-text">Feedback Pulse</span>
                    </Link>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    {user && (
                        <div className="mb-3 px-4 py-2">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                    <div className="px-6 py-4 flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex-1" />

                        <Link
                            href="/dashboard/projects/new"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 font-medium rounded-xl hover:bg-primary-100 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Project
                        </Link>
                    </div>
                </header>

                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
