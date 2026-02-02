import config from '../config';
import { Sentiment } from '@prisma/client';

interface GroqResponse {
    choices?: {
        message?: {
            content?: string;
        };
    }[];
}

export const analyzeSentiment = async (text: string): Promise<Sentiment> => {
    if (!config.geminiApiKey) {
        throw new Error('Gemini API key not configured');
    }

    const prompt = `Analyze the sentiment of the following feedback message and respond with ONLY one word: "positive", "neutral", or "negative". Do not include any other text or explanation.

Feedback message: "${text}"

Sentiment:`;

    try {
        const response = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.geminiApiKey}`,
                },
                body: JSON.stringify({
                    model: 'moonshotai/kimi-k2-instruct-0905',
                    messages: [
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature: 0.1,
                    max_tokens: 10,
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', errorText);
            throw new Error('Failed to analyze sentiment');
        }

        const data = (await response.json()) as GroqResponse;
        const resultText = data.choices?.[0]?.message?.content?.trim().toLowerCase();

        // Validate and normalize the response
        if (resultText?.includes('positive')) return 'positive';
        if (resultText?.includes('negative')) return 'negative';
        return 'neutral';
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        throw new Error('Failed to analyze sentiment');
    }
};
