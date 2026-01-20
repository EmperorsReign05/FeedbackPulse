'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { webhooksApi, projectsApi, WebhookSettings, Project } from '@/lib/api';
import { copyToClipboard } from '@/lib/utils';

export default function WebhookSettingsPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [webhookSettings, setWebhookSettings] = useState<WebhookSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [copied, setCopied] = useState(false);

    // Form state
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookEnabled, setWebhookEnabled] = useState(false);

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Load project and webhook settings in parallel
            const [projectResponse, webhookResponse] = await Promise.all([
                projectsApi.get(projectId),
                webhooksApi.get(projectId),
            ]);

            if (projectResponse.success && projectResponse.data) {
                setProject(projectResponse.data);
            } else {
                setError('Failed to load project');
                setIsLoading(false);
                return;
            }

            if (webhookResponse.success && webhookResponse.data) {
                setWebhookSettings(webhookResponse.data);
                setWebhookUrl(webhookResponse.data.webhookUrl || '');
                setWebhookEnabled(webhookResponse.data.webhookEnabled);
            }
        } catch (err) {
            setError('Failed to load settings');
        }

        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        const response = await webhooksApi.update(projectId, {
            webhookUrl: webhookUrl || null,
            webhookEnabled,
        });

        if (response.success && response.data) {
            setWebhookSettings(response.data);
            setSuccess('Webhook settings saved successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } else {
            setError(response.error || 'Failed to save settings');
        }

        setIsSaving(false);
    };

    const handleRegenerateSecret = async () => {
        if (!confirm('Are you sure you want to regenerate the webhook secret? This will invalidate the current secret.')) {
            return;
        }

        setIsRegenerating(true);
        setError(null);

        const response = await webhooksApi.regenerateSecret(projectId);

        if (response.success && response.data) {
            setWebhookSettings(response.data);
            setSuccess('Webhook secret regenerated successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } else {
            setError(response.error || 'Failed to regenerate secret');
        }

        setIsRegenerating(false);
    };

    const handleTest = async () => {
        setIsTesting(true);
        setTestResult(null);
        setError(null);

        const response = await webhooksApi.test(projectId);

        if (response.success) {
            setTestResult({ success: true, message: response.data?.message || 'Test webhook sent successfully!' });
        } else {
            setTestResult({ success: false, message: response.error || 'Test webhook failed' });
        }

        setIsTesting(false);
    };

    const handleCopySecret = async () => {
        if (webhookSettings?.webhookSecret) {
            const success = await copyToClipboard(webhookSettings.webhookSecret);
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
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

    if (!project) {
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
                href={`/dashboard/projects/${projectId}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to {project.name}
            </Link>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Webhook Settings</h1>
                    <p className="text-gray-500">Receive real-time notifications when new feedback is submitted</p>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mb-6 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm animate-slide-down">
                    {success}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-slide-down">
                    {error}
                </div>
            )}

            {/* Webhook Configuration */}
            <div className="card p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuration</h2>

                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b">
                    <div>
                        <label className="font-medium text-gray-900">Enable Webhook</label>
                        <p className="text-sm text-gray-500 mt-1">
                            When enabled, we'll send a POST request to your URL whenever feedback is submitted
                        </p>
                    </div>
                    <button
                        onClick={() => setWebhookEnabled(!webhookEnabled)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${webhookEnabled ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${webhookEnabled ? 'left-7' : 'left-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Webhook URL */}
                <div className="mb-6">
                    <label htmlFor="webhookUrl" className="input-label">
                        Webhook URL
                    </label>
                    <input
                        type="url"
                        id="webhookUrl"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://your-server.com/webhook"
                        className="input-field"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        The URL where we'll send POST requests with feedback data
                    </p>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary"
                >
                    {isSaving ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 spinner" />
                            Saving...
                        </span>
                    ) : (
                        'Save Settings'
                    )}
                </button>
            </div>

            {/* Webhook Secret */}
            {webhookSettings?.webhookSecret && (
                <div className="card p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Webhook Secret</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Use this secret to verify that webhook requests came from FeedbackPulse
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCopySecret}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${copied
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {copied ? (
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
                            <button
                                onClick={handleRegenerateSecret}
                                disabled={isRegenerating}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                            >
                                {isRegenerating ? (
                                    <div className="w-4 h-4 spinner" />
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <code className="text-sm font-mono text-gray-900 break-all">
                            {webhookSettings.webhookSecret}
                        </code>
                    </div>
                </div>
            )}

            {/* Test Webhook */}
            {webhookSettings?.webhookUrl && webhookSettings?.webhookSecret && (
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Test Webhook</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Send a test webhook to verify your endpoint is working correctly
                    </p>

                    {testResult && (
                        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${testResult.success
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                            {testResult.message}
                        </div>
                    )}

                    <button
                        onClick={handleTest}
                        disabled={isTesting || !webhookEnabled}
                        className="btn-secondary"
                    >
                        {isTesting ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 spinner" />
                                Sending...
                            </span>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Send Test Webhook
                            </>
                        )}
                    </button>
                    {!webhookEnabled && (
                        <p className="text-sm text-amber-600 mt-2">
                            Enable the webhook to send a test request
                        </p>
                    )}
                </div>
            )}

            {/* Payload Example */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook Payload Example</h2>
                <p className="text-sm text-gray-500 mb-4">
                    When feedback is submitted, we'll send a POST request with this JSON payload:
                </p>
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300">
                        {`{
  "event": "feedback.created",
  "timestamp": "2026-01-20T12:00:00Z",
  "project": {
    "id": "${projectId}",
    "name": "${project.name}"
  },
  "feedback": {
    "id": "feedback_id_here",
    "type": "Bug",
    "message": "The feedback message content",
    "sentiment": null,
    "createdAt": "2026-01-20T12:00:00Z"
  }
}`}
                    </pre>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="font-medium text-blue-900 mb-2">Verifying Webhooks</h3>
                    <p className="text-sm text-blue-700">
                        Each webhook request includes an <code className="bg-blue-100 px-1 rounded">X-FeedbackPulse-Signature</code> header
                        containing an HMAC-SHA256 signature. Verify this signature using your webhook secret to ensure
                        the request came from FeedbackPulse.
                    </p>
                </div>
            </div>
        </div>
    );
}
