'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { feedbackApi, labelsApi, projectsApi, Feedback, Project } from '@/lib/api';
import { formatDateTime, getSentimentColor, getFeedbackTypeColor } from '@/lib/utils';

type FilterType = 'All' | 'Bug' | 'Feature' | 'Other';

export default function FeedbackPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [newLabel, setNewLabel] = useState<{ [key: string]: string }>({});
    const [addingLabelId, setAddingLabelId] = useState<string | null>(null);

    const loadProject = useCallback(async () => {
        const response = await projectsApi.get(projectId);
        if (response.success && response.data) {
            setProject(response.data);
        }
    }, [projectId]);

    const loadFeedback = useCallback(async () => {
        setIsLoading(true);
        const response = await feedbackApi.list(projectId, page, 10, filter);
        if (response.success && response.data) {
            setFeedback(response.data.data);
            setTotalPages(response.data.totalPages);
            setTotal(response.data.total);
        }
        setIsLoading(false);
    }, [projectId, page, filter]);

    useEffect(() => {
        loadProject();
    }, [loadProject]);

    useEffect(() => {
        loadFeedback();
    }, [loadFeedback]);

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setPage(1);
    };

    const handleAnalyzeSentiment = async (feedbackId: string) => {
        setAnalyzingId(feedbackId);
        const response = await feedbackApi.analyzeSentiment(feedbackId);
        if (response.success && response.data) {
            setFeedback((prev) =>
                prev.map((f) =>
                    f.id === feedbackId ? { ...f, sentiment: response.data!.sentiment as any } : f
                )
            );
        }
        setAnalyzingId(null);
    };

    const handleAddLabel = async (feedbackId: string) => {
        const label = newLabel[feedbackId]?.trim();
        if (!label) return;

        setAddingLabelId(feedbackId);
        const response = await labelsApi.add(feedbackId, label);
        if (response.success && response.data) {
            setFeedback((prev) =>
                prev.map((f) =>
                    f.id === feedbackId
                        ? { ...f, labels: [...f.labels, response.data!] }
                        : f
                )
            );
            setNewLabel((prev) => ({ ...prev, [feedbackId]: '' }));
        }
        setAddingLabelId(null);
    };

    const handleRemoveLabel = async (feedbackId: string, labelId: string) => {
        const response = await labelsApi.remove(feedbackId, labelId);
        if (response.success) {
            setFeedback((prev) =>
                prev.map((f) =>
                    f.id === feedbackId
                        ? { ...f, labels: f.labels.filter((l) => l.id !== labelId) }
                        : f
                )
            );
        }
    };

    const filters: FilterType[] = ['All', 'Bug', 'Feature', 'Other'];

    return (
        <div className="max-w-5xl mx-auto">
            {/* Back Link */}
            <Link
                href={`/dashboard/projects/${projectId}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Project
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="page-title">
                        Feedback {project && `- ${project.name}`}
                    </h1>
                    <p className="page-description">
                        {total} feedback items total
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => handleFilterChange(f)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === f
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feedback List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="card p-6">
                            <div className="flex gap-4">
                                <div className="skeleton w-16 h-6 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="skeleton h-4 w-3/4" />
                                    <div className="skeleton h-4 w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : feedback.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No feedback yet</h2>
                    <p className="text-gray-500">
                        {filter === 'All'
                            ? 'Start collecting feedback by embedding the widget on your website.'
                            : `No ${filter.toLowerCase()} feedback found. Try a different filter.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {feedback.map((item) => (
                        <div key={item.id} className="card p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`badge ${getFeedbackTypeColor(item.type)}`}
                                    >
                                        {item.type}
                                    </span>
                                    {item.sentiment && (
                                        <span
                                            className={`badge border ${getSentimentColor(item.sentiment)}`}
                                        >
                                            {item.sentiment}
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm text-gray-500 flex-shrink-0">
                                    {formatDateTime(item.createdAt)}
                                </span>
                            </div>

                            {/* Message */}
                            <p className="text-gray-800 mb-4 leading-relaxed">{item.message}</p>

                            {/* Labels */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {item.labels.map((label) => (
                                    <span
                                        key={label.id}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                                    >
                                        {label.label}
                                        <button
                                            onClick={() => handleRemoveLabel(item.id, label.id)}
                                            className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                                {/* Add Label */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add label..."
                                        value={newLabel[item.id] || ''}
                                        onChange={(e) =>
                                            setNewLabel((prev) => ({ ...prev, [item.id]: e.target.value }))
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddLabel(item.id);
                                        }}
                                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                        disabled={addingLabelId === item.id}
                                    />
                                    <button
                                        onClick={() => handleAddLabel(item.id)}
                                        disabled={addingLabelId === item.id || !newLabel[item.id]?.trim()}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        {addingLabelId === item.id ? '...' : 'Add'}
                                    </button>
                                </div>

                                {/* Analyze Sentiment */}
                                {!item.sentiment && (
                                    <button
                                        onClick={() => handleAnalyzeSentiment(item.id)}
                                        disabled={analyzingId === item.id}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-100 text-accent-700 rounded-lg text-sm font-medium hover:bg-accent-200 transition-colors disabled:opacity-50"
                                    >
                                        {analyzingId === item.id ? (
                                            <>
                                                <div className="w-4 h-4 spinner border-accent-600"></div>
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                                Analyze Sentiment
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <span className="text-gray-600">
                        Page <span className="font-semibold">{page}</span> of{' '}
                        <span className="font-semibold">{totalPages}</span>
                    </span>

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
