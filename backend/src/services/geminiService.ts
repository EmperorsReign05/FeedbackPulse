import config from '../config';
import { Sentiment } from '@prisma/client';

interface GeminiResponse {
    candidates?: {
        content?: {
            parts?: {
                text?: string;
            }[];
        };
    }[];
}

// Analyzes sentiment of text using Gemini API
export const analyzeSentiment = async (text: string): Promise<Sentiment> => {
    if (!config.geminiApiKey) {
        throw new Error('Gemini API key not configured');
    }

    const prompt = `Analyze the sentiment of the following feedback message and respond with ONLY one word: "positive", "neutral", or "negative". Do not include any other text or explanation.

Feedback message: "${text}"

Sentiment:`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 10,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', errorText);
            throw new Error('Failed to analyze sentiment');
        }

        const data = (await response.json()) as GeminiResponse;
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();

        // Validate and normalize the response
        if (resultText?.includes('positive')) return 'positive';
        if (resultText?.includes('negative')) return 'negative';
        return 'neutral';
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        throw new Error('Failed to analyze sentiment');
    }
};
