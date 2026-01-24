'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, CreateProjectFormData, widgetIconOptions, widgetPositionOptions, WidgetIcon, WidgetPosition } from '@/lib/validation';
import { projectsApi } from '@/lib/api';

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

export default function NewProjectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateProjectFormData>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            name: '',
            widgetIcon: 'chat',
            widgetText: 'Feedback',
            widgetPrimary: '#2563EB',
            widgetTextColor: '#FFFFFF',
            widgetBackground: '#FFFFFF',
            widgetPosition: 'bottom-right',
            allowedDomains: '',
            customIconUrl: '',
            webhookUrl: '',
            webhookEnabled: false,
        },
    });

    // Watch widget settings for live preview
    const widgetIcon = watch('widgetIcon');
    const widgetText = watch('widgetText');
    const widgetPrimary = watch('widgetPrimary');
    const widgetTextColor = watch('widgetTextColor');
    const widgetPosition = watch('widgetPosition');
    const customIconUrl = watch('customIconUrl');

    const onSubmit = async (data: CreateProjectFormData) => {
        setIsLoading(true);
        setError(null);

        const response = await projectsApi.create(data.name, {
            widgetIcon: data.widgetIcon,
            widgetText: data.widgetText,
            widgetPrimary: data.widgetPrimary,
            widgetTextColor: data.widgetTextColor,
            widgetBackground: data.widgetBackground,
            widgetPosition: data.widgetPosition,
            allowedDomains: data.allowedDomains || undefined,
            customIconUrl: data.customIconUrl || undefined,
            webhookUrl: data.webhookUrl || undefined,
            webhookEnabled: data.webhookEnabled || false,
        });

        if (response.success && response.data) {
            router.push(`/dashboard/projects/${response.data.id}`);
        } else {
            setError(response.error || 'Failed to create project. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="card p-8">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Project</h1>
                        <p className="text-gray-600">
                            Set up a new project and customize your feedback widget
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-slide-down">
                            {error}
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
                                        <div className="grid grid-cols-5 gap-2">
                                            {widgetIconOptions.map((icon) => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => {
                                                        field.onChange(icon);
                                                        // Clear custom icon when selecting preset
                                                        setValue('customIconUrl', '');
                                                    }}
                                                    className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${field.value === icon && !customIconUrl
                                                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                                                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {IconComponents[icon]}
                                                </button>
                                            ))}
                                            {/* Custom Icon Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const customInput = document.getElementById('customIconUrl');
                                                    customInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    customInput?.focus();
                                                }}
                                                className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${customIconUrl
                                                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                                                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                title="Use custom icon URL"
                                            >
                                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Select a preset icon or click <strong>+</strong> to use a custom image URL.
                                </p>
                            </div>

                            {/* Launcher Text */}
                            <div className="mb-6">
                                <label htmlFor="widgetText" className="input-label">
                                    Launcher Text <span className="text-gray-400 font-normal">(Leave empty for icon-only)</span>
                                </label>
                                <input
                                    {...register('widgetText')}
                                    type="text"
                                    id="widgetText"
                                    placeholder="Feedback"
                                    className="input-field"
                                    disabled={isLoading}
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
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1"
                                                        disabled={isLoading}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="input-field flex-1 !py-2 !px-3 text-sm font-mono"
                                                        disabled={isLoading}
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
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1"
                                                        disabled={isLoading}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="input-field flex-1 !py-2 !px-3 text-sm font-mono"
                                                        disabled={isLoading}
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
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1"
                                                        disabled={isLoading}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        className="input-field flex-1 !py-2 !px-3 text-sm font-mono"
                                                        disabled={isLoading}
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
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Restrict the widget to only work on specific domains. Separate multiple domains with commas.
                                </p>
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Supported formats:</p>
                                    <ul className="text-xs text-gray-500 space-y-1">
                                        <li>• Custom domains: <code className="bg-gray-200 px-1 rounded">example.com</code></li>
                                        <li>• Netlify: <code className="bg-gray-200 px-1 rounded">myapp.netlify.app</code></li>
                                        <li>• Vercel: <code className="bg-gray-200 px-1 rounded">myapp.vercel.app</code></li>
                                        <li>• Cloudflare Pages: <code className="bg-gray-200 px-1 rounded">myapp.pages.dev</code></li>
                                        <li>• Development: <code className="bg-gray-200 px-1 rounded">localhost</code></li>
                                        <li>• Wildcards: <code className="bg-gray-200 px-1 rounded">*.example.com</code></li>
                                    </ul>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Leave empty to allow the widget on any domain.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Settings Section */}
                        <div className="border-t pt-6">
                            <div className="flex items-center gap-2 mb-6">
                                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                                <h2 className="text-lg font-semibold text-gray-900">Advanced Settings</h2>
                                <span className="text-xs text-gray-400">(Optional)</span>
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
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Use a shareable <strong>Google Drive</strong> link or <strong>Imgur</strong> direct link.
                                    For Google Drive: Upload image → Right-click → Share → Anyone with link → Copy link.
                                </p>
                            </div>

                            {/* Webhook URL */}
                            <div className="mb-6">
                                <label htmlFor="webhookUrl" className="input-label">
                                    Webhook URL <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    {...register('webhookUrl')}
                                    type="url"
                                    id="webhookUrl"
                                    placeholder="https://your-server.com/webhook"
                                    className="input-field"
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Receive real-time notifications when new feedback is submitted.
                                    We&apos;ll send a POST request with the feedback data to this URL.
                                </p>
                            </div>

                            {/* Webhook Enabled */}
                            <div className="mb-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        {...register('webhookEnabled')}
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        disabled={isLoading}
                                    />
                                    <span className="text-sm font-medium text-gray-700">Enable webhook notifications</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-2 ml-8">
                                    You can configure and test webhooks later in project settings.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
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
                            className={`absolute flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all ${widgetPosition === 'top-left' ? 'top-4 left-4' :
                                widgetPosition === 'top-right' ? 'top-4 right-4' :
                                    widgetPosition === 'bottom-left' ? 'bottom-4 left-4' :
                                        'bottom-4 right-4'
                                }`}
                            style={{
                                backgroundColor: widgetPrimary,
                                color: widgetTextColor,
                            }}
                        >
                            <span className="[&>svg]:w-4 [&>svg]:h-4">
                                {IconComponents[widgetIcon as WidgetIcon]}
                            </span>
                            <span className="text-sm font-semibold">{widgetText || 'Feedback'}</span>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">What happens next?</h3>
                                <p className="text-xs text-gray-600">
                                    After creating your project, you&apos;ll get an embed snippet that you can add to any website to start collecting feedback with your customized widget.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
