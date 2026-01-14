/**
 * Format a date string to a human-readable format
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format a date string with time
 */
export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return formatDate(dateString);
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

/**
 * Get sentiment color classes
 */
export const getSentimentColor = (sentiment: string | null): string => {
    switch (sentiment) {
        case 'positive':
            return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'negative':
            return 'bg-red-100 text-red-700 border-red-200';
        case 'neutral':
            return 'bg-gray-100 text-gray-700 border-gray-200';
        default:
            return 'bg-gray-50 text-gray-500 border-gray-200';
    }
};

/**
 * Get feedback type color classes
 */
export const getFeedbackTypeColor = (type: string): string => {
    switch (type) {
        case 'Bug':
            return 'bg-red-100 text-red-700';
        case 'Feature':
            return 'bg-blue-100 text-blue-700';
        case 'Other':
            return 'bg-gray-100 text-gray-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
};
