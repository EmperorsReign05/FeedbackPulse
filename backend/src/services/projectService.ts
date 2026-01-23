import { PrismaClient } from '@prisma/client';
import { generateProjectKey } from '../utils/keyGenerator';
import { CreateProjectInput } from '../utils/validation';
import config from '../config';

const prisma = new PrismaClient();

export interface ProjectWithStats {
    id: string;
    name: string;
    projectKey: string;
    createdAt: Date;
    feedbackCount: number;
    // Widget customization
    widgetIcon: string;
    widgetText: string;
    widgetPrimary: string;
    widgetTextColor: string;
    widgetBackground: string;
    widgetPosition: string;
    // Domain restriction
    allowedDomains: string | null;
}

/**
 * Checks if a request origin is allowed based on the project's allowedDomains
 * Supports:
 * - Exact domains: example.com
 * - Full URLs: https://example.com
 * - Free hosting: myapp.netlify.app, myapp.vercel.app, myapp.pages.dev
 * - Localhost: localhost, localhost:3000
 * - Wildcards: *.example.com
 * 
 * @param origin - The Origin or Referer header from the request
 * @param allowedDomains - Comma-separated list of allowed domains (null = allow all)
 * @returns true if origin is allowed, false otherwise
 */
export const isOriginAllowed = (origin: string | undefined, allowedDomains: string | null): boolean => {
    // If no domain restriction is set, allow all origins
    if (!allowedDomains || allowedDomains.trim() === '') {
        return true;
    }

    // If no origin provided, reject (safety measure)
    if (!origin) {
        return false;
    }

    // Extract hostname from origin (handles both "https://example.com" and "example.com")
    let hostname: string;
    try {
        // Try parsing as URL first
        if (origin.startsWith('http://') || origin.startsWith('https://')) {
            const url = new URL(origin);
            hostname = url.hostname;
        } else {
            hostname = origin.split(':')[0]; // Handle "localhost:3000" format
        }
    } catch {
        hostname = origin;
    }

    // Parse allowed domains (comma-separated)
    const domains = allowedDomains
        .split(',')
        .map(d => d.trim().toLowerCase())
        .filter(d => d.length > 0);

    const hostnameLC = hostname.toLowerCase();

    for (const domain of domains) {
        // Handle wildcard domains (e.g., *.example.com)
        if (domain.startsWith('*.')) {
            const baseDomain = domain.slice(2); // Remove "*."
            // Check if hostname ends with the base domain or equals it exactly
            if (hostnameLC === baseDomain || hostnameLC.endsWith('.' + baseDomain)) {
                return true;
            }
        }
        // Handle full URL format (https://example.com)
        else if (domain.startsWith('http://') || domain.startsWith('https://')) {
            try {
                const allowedUrl = new URL(domain);
                if (hostnameLC === allowedUrl.hostname.toLowerCase()) {
                    return true;
                }
            } catch {
                // Invalid URL, try as plain domain
                if (hostnameLC === domain) {
                    return true;
                }
            }
        }
        // Handle plain domain (example.com, localhost)
        else {
            // Exact match
            if (hostnameLC === domain) {
                return true;
            }
        }
    }

    return false;
};

// Creates a new project for a user
export const createProject = async (
    userId: string,
    input: CreateProjectInput
): Promise<ProjectWithStats> => {
    // Generate unique project key
    let projectKey = generateProjectKey();

    // Ensure uniqueness (very unlikely to collide, but check anyway)
    let attempts = 0;
    while (attempts < 5) {
        const existing = await prisma.project.findUnique({
            where: { projectKey },
        });
        if (!existing) break;
        projectKey = generateProjectKey();
        attempts++;
    }

    const project = await prisma.project.create({
        data: {
            userId,
            name: input.name,
            projectKey,
            widgetIcon: input.widgetIcon,
            widgetText: input.widgetText,
            widgetPrimary: input.widgetPrimary,
            widgetTextColor: input.widgetTextColor,
            widgetBackground: input.widgetBackground,
            widgetPosition: input.widgetPosition,
            allowedDomains: input.allowedDomains || null,
        },
    });

    return {
        ...project,
        feedbackCount: 0,
    };
};

// Lists all projects for a user with feedback counts
export const listProjects = async (userId: string): Promise<ProjectWithStats[]> => {
    const projects = await prisma.project.findMany({
        where: { userId },
        include: {
            _count: {
                select: { feedback: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => ({
        id: project.id,
        name: project.name,
        projectKey: project.projectKey,
        createdAt: project.createdAt,
        feedbackCount: project._count.feedback,
        widgetIcon: project.widgetIcon,
        widgetText: project.widgetText,
        widgetPrimary: project.widgetPrimary,
        widgetTextColor: project.widgetTextColor,
        widgetBackground: project.widgetBackground,
        widgetPosition: project.widgetPosition,
        allowedDomains: project.allowedDomains,
    }));
};

// Gets a single project by ID (verifies ownership)
export const getProject = async (
    projectId: string,
    userId: string
): Promise<ProjectWithStats | null> => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            userId,
        },
        include: {
            _count: {
                select: { feedback: true },
            },
        },
    });

    if (!project) return null;

    return {
        id: project.id,
        name: project.name,
        projectKey: project.projectKey,
        createdAt: project.createdAt,
        feedbackCount: project._count.feedback,
        widgetIcon: project.widgetIcon,
        widgetText: project.widgetText,
        widgetPrimary: project.widgetPrimary,
        widgetTextColor: project.widgetTextColor,
        widgetBackground: project.widgetBackground,
        widgetPosition: project.widgetPosition,
        allowedDomains: project.allowedDomains,
    };
};

// Gets project by projectKey (for public widget use)
export const getProjectByKey = async (projectKey: string) => {
    return prisma.project.findUnique({
        where: { projectKey },
    });
};

// Deletes a project (verifies ownership) - cascades to feedback
export const deleteProject = async (
    projectId: string,
    userId: string
): Promise<boolean> => {
    // First verify ownership
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            userId,
        },
    });

    if (!project) {
        return false;
    }

    // Delete the project (feedback will cascade delete per schema)
    await prisma.project.delete({
        where: { id: projectId },
    });

    return true;
};

// Widget settings interface for embed snippet
export interface WidgetSettings {
    widgetIcon: string;
    widgetText: string;
    widgetPrimary: string;
    widgetTextColor: string;
    widgetBackground: string;
    widgetPosition: string;
}

// Generates the embed snippet for a project
export const getEmbedSnippet = (projectKey: string, settings?: WidgetSettings): string => {
    const backendUrl = config.isProduction
        ? process.env.BACKEND_URL || 'https://feedbackpulse.onrender.com'
        : `http://localhost:${config.port}`;

    // If settings provided, include them as query params for the widget
    if (settings) {
        const params = new URLSearchParams({
            key: projectKey,
            icon: settings.widgetIcon,
            text: settings.widgetText,
            primary: settings.widgetPrimary,
            textColor: settings.widgetTextColor,
            bg: settings.widgetBackground,
            pos: settings.widgetPosition,
        });
        return `<script src="${backendUrl}/widget.js?${params.toString()}" async></script>`;
    }

    return `<script src="${backendUrl}/widget.js?key=${projectKey}" async></script>`;
};

