import crypto from 'crypto';
import { FeedbackType, Sentiment } from '@prisma/client';

export interface WebhookPayload {
    event: 'feedback.created' | 'feedback.deleted' | 'feedback.updated';
    timestamp: string;
    project: {
        id: string;
        name: string;
    };
    feedback: {
        id: string;
        type: FeedbackType;
        message: string;
        sentiment: Sentiment | null;
        createdAt: string;
    };
}

export interface WebhookConfig {
    webhookUrl: string;
    webhookSecret: string;
    projectId: string;
    projectName: string;
}

/**
 * Generates a secure webhook secret
 * Format: whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (32 random characters)
 */
export const generateWebhookSecret = (): string => {
    const randomBytes = crypto.randomBytes(24);
    const base64 = randomBytes.toString('base64url').substring(0, 32);
    return `whsec_${base64}`;
};

/**
 * Creates HMAC-SHA256 signature for webhook payload
 */
export const createSignature = (payload: string, secret: string): string => {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
};

/**
 * Verifies webhook signature (for testing or future use)
 */
export const verifySignature = (
    payload: string,
    signature: string,
    secret: string
): boolean => {
    const expectedSignature = createSignature(payload, secret);
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};

/**
 * Sends a webhook notification
 * Returns true if successful, false otherwise
 */
export const sendWebhook = async (
    config: WebhookConfig,
    feedback: {
        id: string;
        type: FeedbackType;
        message: string;
        sentiment: Sentiment | null;
        createdAt: Date;
    },
    event: WebhookPayload['event'] = 'feedback.created'
): Promise<{ success: boolean; statusCode?: number; error?: string }> => {
    try {
        const payload: WebhookPayload = {
            event,
            timestamp: new Date().toISOString(),
            project: {
                id: config.projectId,
                name: config.projectName,
            },
            feedback: {
                id: feedback.id,
                type: feedback.type,
                message: feedback.message,
                sentiment: feedback.sentiment,
                createdAt: feedback.createdAt.toISOString(),
            },
        };

        const payloadString = JSON.stringify(payload);
        const signature = createSignature(payloadString, config.webhookSecret);

        // Set a timeout for the webhook request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-FeedbackPulse-Signature': signature,
                'X-FeedbackPulse-Event': event,
                'X-FeedbackPulse-Timestamp': payload.timestamp,
                'User-Agent': 'FeedbackPulse-Webhook/1.0',
            },
            body: payloadString,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            console.log(`[Webhook] Successfully delivered to ${config.webhookUrl} for project ${config.projectId}`);
            return { success: true, statusCode: response.status };
        } else {
            console.warn(`[Webhook] Failed delivery to ${config.webhookUrl}: ${response.status} ${response.statusText}`);
            return {
                success: false,
                statusCode: response.status,
                error: `HTTP ${response.status}: ${response.statusText}`
            };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Webhook] Error delivering to ${config.webhookUrl}:`, errorMessage);
        return { success: false, error: errorMessage };
    }
};

/**
 * Validates webhook URL format
 */
export const isValidWebhookUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        // Only allow http and https
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};
