'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { projectsApi, Project } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalFeedback: 0,
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setIsLoading(true);
        const response = await projectsApi.list();
        if (response.success && response.data) {
            setProjects(response.data);
            setStats({
                totalProjects: response.data.length,
                totalFeedback: response.data.reduce((acc, p) => acc + p.feedbackCount, 0),
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-description">Welcome to your Feedback Pulse dashboard</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Projects</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {isLoading ? '...' : stats.totalProjects}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Feedback</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {isLoading ? '...' : stats.totalFeedback}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Widgets</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {isLoading ? '...' : stats.totalProjects}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">AI Analysis</p>
                            <p className="text-2xl font-bold text-gray-900">Ready</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/dashboard/projects/new"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Project
                    </Link>
                    <Link
                        href="/dashboard/projects"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        View All Projects
                    </Link>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                    <Link
                        href="/dashboard/projects"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        View all
                    </Link>
                </div>

                {isLoading ? (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="skeleton w-12 h-12 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <div className="skeleton h-4 w-1/3" />
                                    <div className="skeleton h-3 w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No projects yet</h3>
                        <p className="text-gray-500 mb-6">Get started by creating your first project</p>
                        <Link href="/dashboard/projects/new" className="btn-primary">
                            Create Project
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {projects.slice(0, 5).map((project) => (
                            <Link
                                key={project.id}
                                href={`/dashboard/projects/${project.id}`}
                                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center">
                                    <span className="text-lg font-bold gradient-text">
                                        {project.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {project.feedbackCount} feedback · Created {formatDate(project.createdAt)}
                                    </p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
