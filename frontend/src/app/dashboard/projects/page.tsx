'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { projectsApi, Project } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; project: Project | null }>({
        isOpen: false,
        project: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setIsLoading(true);
        const response = await projectsApi.list();
        if (response.success && response.data) {
            setProjects(response.data);
        }
        setIsLoading(false);
    };

    const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteModal({ isOpen: true, project });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.project) return;

        setIsDeleting(true);
        const response = await projectsApi.delete(deleteModal.project.id);

        if (response.success) {
            setProjects(projects.filter(p => p.id !== deleteModal.project?.id));
            setDeleteModal({ isOpen: false, project: null });
        }
        setIsDeleting(false);
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, project: null });
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="page-title">Projects</h1>
                    <p className="page-description">Manage your feedback collection projects</p>
                </div>
                <Link href="/dashboard/projects/new" className="btn-primary">
                    <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Project
                </Link>
            </div>

            {/* Projects Grid */}
            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card p-6">
                            <div className="skeleton w-12 h-12 rounded-xl mb-4" />
                            <div className="skeleton h-5 w-2/3 mb-2" />
                            <div className="skeleton h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="card p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Create your first project to start collecting feedback from your users
                    </p>
                    <Link href="/dashboard/projects/new" className="btn-primary">
                        Create Your First Project
                    </Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative group"
                        >
                            <Link
                                href={`/dashboard/projects/${project.id}`}
                                className="block"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center">
                                        <span className="text-2xl font-bold gradient-text">
                                            {project.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                        </svg>
                                        {project.feedbackCount}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Created {formatDate(project.createdAt)}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                                        {project.projectKey}
                                    </code>
                                    <span className="text-primary-600 font-medium text-sm">
                                        View →
                                    </span>
                                </div>
                            </Link>

                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDeleteClick(e, project)}
                                className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all duration-200"
                                title="Delete project"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}

                    {/* Add New Project Card */}
                    <Link
                        href="/dashboard/projects/new"
                        className="card p-6 border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 flex flex-col items-center justify-center min-h-[200px]"
                    >
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-gray-600 font-medium">Add New Project</span>
                    </Link>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-up">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                            Delete Project
                        </h3>
                        <p className="text-gray-500 text-center mb-6">
                            Are you sure you want to delete <span className="font-medium text-gray-900">&quot;{deleteModal.project?.name}&quot;</span>?
                            This will permanently delete all associated feedback. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteCancel}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </span>
                                ) : (
                                    'Delete Project'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

