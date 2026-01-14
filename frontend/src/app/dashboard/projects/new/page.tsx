'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, CreateProjectFormData } from '@/lib/validation';
import { projectsApi } from '@/lib/api';

export default function NewProjectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateProjectFormData>({
        resolver: zodResolver(createProjectSchema),
    });

    const onSubmit = async (data: CreateProjectFormData) => {
        setIsLoading(true);
        setError(null);

        const response = await projectsApi.create(data.name);

        if (response.success && response.data) {
            router.push(`/dashboard/projects/${response.data.id}`);
        } else {
            setError(response.error || 'Failed to create project. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Back Link */}
            <Link
                href="/dashboard/projects"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Projects
            </Link>

            {/* Form Card */}
            <div className="card p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Project</h1>
                    <p className="text-gray-600">
                        Set up a new project to start collecting user feedback
                    </p>
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-slide-down">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="input-label">
                            Project Name
                        </label>
                        <input
                            {...register('name')}
                            type="text"
                            id="name"
                            placeholder="My Awesome Project"
                            className={`input-field ${errors.name ? 'input-error' : ''}`}
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="error-message">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.name.message}
                            </p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                            Give your project a descriptive name to identify it easily
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Link
                            href="/dashboard/projects"
                            className="btn-secondary flex-1 text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 spinner"></div>
                                    Creating...
                                </span>
                            ) : (
                                'Create Project'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-6 bg-primary-50 rounded-2xl border border-primary-100">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">What happens next?</h3>
                        <p className="text-sm text-gray-600">
                            After creating your project, you'll get a unique project key and an embed snippet
                            that you can add to any website to start collecting feedback.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
