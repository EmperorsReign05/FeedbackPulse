'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { projectsApi, Project } from '@/lib/api';
import { formatDate, copyToClipboard } from '@/lib/utils';

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<'key' | 'snippet' | null>(null);

    useEffect(() => {
        loadProject();
    }, [projectId]);

    const loadProject = async () => {
        setIsLoading(true);
        const response = await projectsApi.get(projectId);
        if (response.success && response.data) {
            setProject(response.data);
        } else {
            setError(response.error || 'Failed to load project');
        }
        setIsLoading(false);
    };

    const handleCopy = async (text: string, type: 'key' | 'snippet') => {
        const success = await copyToClipboard(text);
        if (success) {
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="skeleton h-8 w-48 mb-8" />
                <div className="card p-6">
                    <div className="skeleton h-20 w-full mb-4" />
                    <div className="skeleton h-40 w-full" />
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="card p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
                    <p className="text-gray-500 mb-6">{error || 'The project you are looking for does not exist.'}</p>
                    <Link href="/dashboard/projects" className="btn-primary">
                        Back to Projects
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link
                href="/dashboard/projects"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Projects
            </Link>

            {/* Project Header */}
            <div className="card p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl font-bold gradient-text">
                            {project.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.name}</h1>
                        <p className="text-gray-500">Created {formatDate(project.createdAt)}</p>
                    </div>
                    <Link
                        href={`/dashboard/projects/${project.id}/feedback`}
                        className="btn-primary"
                    >
                        View Feedback
                        <svg className="w-4 h-4 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="card p-5">
                    <p className="text-sm text-gray-500 mb-1">Total Feedback</p>
                    <p className="text-2xl font-bold text-gray-900">{project.feedbackCount}</p>
                </div>
                <div className="card p-5">
                    <p className="text-sm text-gray-500 mb-1">Project Key</p>
                    <code className="text-lg font-bold text-primary-600 font-mono">{project.projectKey}</code>
                </div>
                <div className="card p-5">
                    <p className="text-sm text-gray-500 mb-1">Widget Status</p>
                    <p className="text-lg font-bold text-emerald-600">Active</p>
                </div>
            </div>

            {/* Project Key */}
            <div className="card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Project Key</h2>
                    <button
                        onClick={() => handleCopy(project.projectKey, 'key')}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copied === 'key'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {copied === 'key' ? (
                            <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                            </>
                        )}
                    </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                    <code className="text-lg font-mono text-gray-900">{project.projectKey}</code>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                    Use this key to identify your project when integrating the widget.
                </p>
            </div>

            {/* Embed Snippet */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Embed Snippet</h2>
                    <button
                        onClick={() => handleCopy(project.embedSnippet || '', 'snippet')}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copied === 'snippet'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {copied === 'snippet' ? (
                            <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                            </>
                        )}
                    </button>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300">
                        <code>{project.embedSnippet}</code>
                    </pre>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                    Add this script tag to your website's HTML to enable the feedback widget.
                </p>
            </div>

            {/* Quick Links */}
            <div className="mt-8 flex flex-wrap gap-4">
                <Link
                    href={`/dashboard/projects/${project.id}/feedback`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-primary-50 text-primary-700 font-medium rounded-xl hover:bg-primary-100 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    View All Feedback ({project.feedbackCount})
                </Link>
                <Link
                    href={`/dashboard/projects/${project.id}/webhooks`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-orange-50 text-orange-700 font-medium rounded-xl hover:bg-orange-100 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Webhook Settings
                </Link>
            </div>
        </div>
    );
}
