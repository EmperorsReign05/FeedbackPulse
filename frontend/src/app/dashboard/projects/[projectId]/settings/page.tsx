'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProjectSchema, UpdateProjectFormData, widgetIconOptions, widgetPositionOptions, WidgetIcon, WidgetPosition } from '@/lib/validation';
import { projectsApi, Project } from '@/lib/api';

// Icon SVG components for the widget customizer
const IconComponents: Record<WidgetIcon, React.ReactNode> = {
    chat: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
        </svg>
    ),
    mail: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
    ),
    question: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        </svg>
    ),
    star: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    ),
    settings: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
    ),
    thumbsUp: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
        </svg>
    ),
    envelope: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
        </svg>
    ),
    info: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
        </svg>
    ),
};

// Position arrow icons
const PositionIcons: Record<WidgetPosition, { icon: React.ReactNode; label: string }> = {
    'top-left': {
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
        ),
        label: 'Top Left',
    },
    'top-right': {
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l10 0m0 0l0 10m0-10L7 17" />
            </svg>
        ),
        label: 'Top Right',
    },
    'bottom-left': {
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17L7 7m0 10l0-10m10 0L7 17" />
            </svg>
        ),
        label: 'Bottom Left',
    },
    'bottom-right': {
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
        ),
        label: 'Bottom Right',
    },
};

export default function ProjectSettingsPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
    const [project, setProject] = useState<Project | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors, isDirty },
    } = useForm<UpdateProjectFormData>({
        resolver: zodResolver(updateProjectSchema),
    });

    // Watch widget settings for live preview
    const widgetIcon = watch('widgetIcon');
    const widgetText = watch('widgetText');
    const widgetPrimary = watch('widgetPrimary');
    const widgetTextColor = watch('widgetTextColor');
    const widgetPosition = watch('widgetPosition');
    const customIconUrl = watch('customIconUrl');

    useEffect(() => {
        const loadProject = async () => {
            const response = await projectsApi.get(projectId);
            if (response.success && response.data) {
                setProject(response.data);
                // Reset form with project data
                reset({
                    name: response.data.name,
                    widgetIcon: response.data.widgetIcon as WidgetIcon,
                    widgetText: response.data.widgetText,
                    widgetPrimary: response.data.widgetPrimary,
                    widgetTextColor: response.data.widgetTextColor,
                    widgetBackground: response.data.widgetBackground,
                    widgetPosition: response.data.widgetPosition as WidgetPosition,
                    allowedDomains: response.data.allowedDomains || '',
                    customIconUrl: response.data.customIconUrl || '',
                });
            } else {
                setError(response.error || 'Failed to load project');
            }
            setIsLoading(false);
        };

        loadProject();
    }, [projectId, reset]);

    const onSubmit = async (data: UpdateProjectFormData) => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        const response = await projectsApi.update(projectId, data);

        if (response.success && response.data) {
            setProject(response.data);
            setSuccess('Settings saved successfully!');
            // Reset dirty state
            reset(data);
        } else {
            setError(response.error || 'Failed to save settings');
        }

        setIsSaving(false);
    };

    const handleRegenerateKey = async () => {
        setIsRegeneratingKey(true);
        setError(null);
        setSuccess(null);

        const response = await projectsApi.regenerateKey(projectId);

        if (response.success && response.data) {
            setProject(response.data);
            setSuccess('API key regenerated successfully! Please update your embed snippet.');
            setShowRegenerateConfirm(false);
        } else {
            setError(response.error || 'Failed to regenerate key');
        }

        setIsRegeneratingKey(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 spinner"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
                <p className="text-gray-600 mb-6">The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
                <Link href="/dashboard/projects" className="btn-primary">
                    Back to Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Back Link */}
            <Link
                href={`/dashboard/projects/${projectId}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Project
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="card p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Settings</h1>
                        <p className="text-gray-600">
                            Customize your widget appearance and settings
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-slide-down">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm animate-slide-down">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Project Name */}
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
                                disabled={isSaving}
                            />
                            {errors.name && (
                                <p className="error-message">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Widget Appearance Section */}
                        <div className="border-t pt-6">
                            <div className="flex items-center gap-2 mb-6">
                                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                                <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                            </div>

                            {/* Launcher Icon */}
                            <div className="mb-6">
                                <label className="input-label">Launcher Icon</label>
                                <Controller
                                    name="widgetIcon"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="grid grid-cols-4 gap-2">
                                            {widgetIconOptions.map((icon) => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => field.onChange(icon)}
                                                    className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${field.value === icon
                                                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                                                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {IconComponents[icon]}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Custom Icon URL */}
                            <div className="mb-6">
                                <label htmlFor="customIconUrl" className="input-label">
                                    Custom Icon URL <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    {...register('customIconUrl')}
                                    type="url"
                                    id="customIconUrl"
                                    placeholder="https://drive.google.com/file/d/FILE_ID/view?usp=sharing"
                                    className="input-field"
                                    disabled={isSaving}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Use a shareable <strong>Google Drive</strong> link or <strong>Imgur</strong> direct link.
                                    For Google Drive: Upload image → Right-click → Share → Anyone with link → Copy link.
                                </p>
                            </div>

                            {/* Launcher Text */}
                            <div className="mb-6">
                                <label htmlFor="widgetText" className="input-label">
                                    Launcher Text
                                </label>
                                <input
                                    {...register('widgetText')}
                                    type="text"
                                    id="widgetText"
                                    placeholder="Feedback"
                                    className="input-field"
                                    disabled={isSaving}
                                    maxLength={20}
                                />
                            </div>

                            {/* Colors */}
                            <div className="mb-6">
                                <label className="input-label">Colors</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {/* Primary Color */}
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-2">Primary</label>
                                        <Controller
                                            name="widgetPrimary"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={field.value || '#2563EB'}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1"
                                                        disabled={isSaving}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={field.value || '#2563EB'}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="input-field flex-1 !py-2 !px-3 text-sm font-mono"
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>

                                    {/* Text Color */}
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-2">Text</label>
                                        <Controller
                                            name="widgetTextColor"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={field.value || '#FFFFFF'}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1"
                                                        disabled={isSaving}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={field.value || '#FFFFFF'}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="input-field flex-1 !py-2 !px-3 text-sm font-mono"
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>

                                    {/* Background Color */}
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-2">Background</label>
                                        <Controller
                                            name="widgetBackground"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={field.value || '#FFFFFF'}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1"
                                                        disabled={isSaving}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={field.value || '#FFFFFF'}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="input-field flex-1 !py-2 !px-3 text-sm font-mono"
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Position */}
                            <div className="mb-6">
                                <label className="input-label">Position on Screen</label>
                                <Controller
                                    name="widgetPosition"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="grid grid-cols-2 gap-2">
                                            {widgetPositionOptions.map((pos) => (
                                                <button
                                                    key={pos}
                                                    type="button"
                                                    onClick={() => field.onChange(pos)}
                                                    className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${field.value === pos
                                                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                                                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {PositionIcons[pos].icon}
                                                    <span className="text-sm font-medium">{PositionIcons[pos].label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="border-t pt-6">
                            <div className="flex items-center gap-2 mb-6">
                                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                            </div>

                            {/* Allowed Domains */}
                            <div className="mb-6">
                                <label htmlFor="allowedDomains" className="input-label">
                                    Allowed Domains <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    {...register('allowedDomains')}
                                    id="allowedDomains"
                                    placeholder="example.com, myapp.netlify.app, myapp.vercel.app"
                                    className="input-field min-h-[80px] resize-y"
                                    disabled={isSaving}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Restrict the widget to only work on specific domains. Separate multiple domains with commas.
                                </p>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                className="btn-primary flex-1"
                                disabled={isSaving || !isDirty}
                            >
                                {isSaving ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 spinner"></div>
                                        Saving...
                                    </span>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* API Key Section */}
                    <div className="border-t pt-6 mt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            <h2 className="text-lg font-semibold text-gray-900">API Key</h2>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <p className="text-sm font-mono text-gray-700 break-all">{project.projectKey}</p>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 mb-4">
                            <p className="text-sm text-orange-800">
                                <strong>Warning:</strong> Regenerating your API key will immediately invalidate the old key.
                                You will need to update the embed snippet on all websites using this project.
                            </p>
                        </div>

                        {showRegenerateConfirm ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRegenerateKey}
                                    disabled={isRegeneratingKey}
                                    className="btn-primary !bg-red-600 hover:!bg-red-700 flex-1"
                                >
                                    {isRegeneratingKey ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 spinner"></div>
                                            Regenerating...
                                        </span>
                                    ) : (
                                        'Yes, Regenerate Key'
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowRegenerateConfirm(false)}
                                    className="btn-secondary flex-1"
                                    disabled={isRegeneratingKey}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowRegenerateConfirm(true)}
                                className="btn-secondary w-full"
                            >
                                Regenerate API Key
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview Section */}
                <div className="card p-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Widget Preview</h2>
                        <p className="text-sm text-gray-500">
                            This is how your feedback widget will appear on your website
                        </p>
                    </div>

                    {/* Preview Container */}
                    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-96 overflow-hidden border border-gray-200">
                        {/* Mock website content */}
                        <div className="p-6">
                            <div className="h-4 w-32 bg-gray-300 rounded mb-4"></div>
                            <div className="h-3 w-full bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 w-3/4 bg-gray-300 rounded mb-4"></div>
                            <div className="h-20 w-full bg-gray-300 rounded mb-4"></div>
                            <div className="h-3 w-full bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 w-2/3 bg-gray-300 rounded"></div>
                        </div>

                        {/* Widget Button Preview */}
                        <div
                            className={`absolute flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${(widgetPosition || project.widgetPosition) === 'top-left' ? 'top-4 left-4' :
                                (widgetPosition || project.widgetPosition) === 'top-right' ? 'top-4 right-4' :
                                    (widgetPosition || project.widgetPosition) === 'bottom-left' ? 'bottom-4 left-4' :
                                        'bottom-4 right-4'
                                }`}
                            style={{
                                backgroundColor: widgetPrimary || project.widgetPrimary,
                                color: widgetTextColor || project.widgetTextColor,
                            }}
                        >
                            {customIconUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={customIconUrl} alt="Custom icon" className="w-5 h-5 object-contain" />
                            ) : (
                                <span className="[&>svg]:w-4 [&>svg]:h-4">
                                    {IconComponents[(widgetIcon || project.widgetIcon) as WidgetIcon]}
                                </span>
                            )}
                            <span className="text-sm font-semibold">{widgetText || project.widgetText || 'Feedback'}</span>
                        </div>
                    </div>

                    {/* Current Embed Snippet */}
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Embed Snippet</h3>
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                            <code className="text-sm text-green-400 break-all">
                                {project.embedSnippet}
                            </code>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Copy this snippet and paste it into your website&apos;s HTML before the closing &lt;/body&gt; tag.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
