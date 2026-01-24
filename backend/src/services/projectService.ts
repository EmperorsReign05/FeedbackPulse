import { PrismaClient } from '@prisma/client';
import { generateProjectKey } from '../utils/keyGenerator';
import { CreateProjectInput, UpdateProjectInput } from '../utils/validation';
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
    // Custom icon URL
    customIconUrl: string | null;
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
            customIconUrl: input.customIconUrl || null,
            webhookUrl: input.webhookUrl || null,
            webhookEnabled: input.webhookEnabled || false,
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
        customIconUrl: project.customIconUrl,
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
        customIconUrl: project.customIconUrl,
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

// Updates a project's settings (verifies ownership)
export const updateProject = async (
    projectId: string,
    userId: string,
    input: UpdateProjectInput
): Promise<ProjectWithStats | null> => {
    // First verify ownership
    const existing = await prisma.project.findFirst({
        where: {
            id: projectId,
            userId,
        },
    });

    if (!existing) {
        return null;
    }

    // Build update data, only including provided fields
    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.widgetIcon !== undefined) updateData.widgetIcon = input.widgetIcon;
    if (input.widgetText !== undefined) updateData.widgetText = input.widgetText;
    if (input.widgetPrimary !== undefined) updateData.widgetPrimary = input.widgetPrimary;
    if (input.widgetTextColor !== undefined) updateData.widgetTextColor = input.widgetTextColor;
    if (input.widgetBackground !== undefined) updateData.widgetBackground = input.widgetBackground;
    if (input.widgetPosition !== undefined) updateData.widgetPosition = input.widgetPosition;
    if (input.allowedDomains !== undefined) updateData.allowedDomains = input.allowedDomains || null;
    if (input.customIconUrl !== undefined) updateData.customIconUrl = input.customIconUrl || null;
    if (input.webhookUrl !== undefined) updateData.webhookUrl = input.webhookUrl || null;
    if (input.webhookEnabled !== undefined) updateData.webhookEnabled = input.webhookEnabled;

    const project = await prisma.project.update({
        where: { id: projectId },
        data: updateData,
        include: {
            _count: {
                select: { feedback: true },
            },
        },
    });

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
        customIconUrl: project.customIconUrl,
        allowedDomains: project.allowedDomains,
    };
};

// Regenerates project key (verifies ownership)
export const regenerateProjectKey = async (
    projectId: string,
    userId: string
): Promise<ProjectWithStats | null> => {
    // First verify ownership
    const existing = await prisma.project.findFirst({
        where: {
            id: projectId,
            userId,
        },
    });

    if (!existing) {
        return null;
    }

    // Generate new unique key
    let newProjectKey = generateProjectKey();
    let attempts = 0;
    while (attempts < 5) {
        const collision = await prisma.project.findUnique({
            where: { projectKey: newProjectKey },
        });
        if (!collision) break;
        newProjectKey = generateProjectKey();
        attempts++;
    }

    const project = await prisma.project.update({
        where: { id: projectId },
        data: { projectKey: newProjectKey },
        include: {
            _count: {
                select: { feedback: true },
            },
        },
    });

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
        customIconUrl: project.customIconUrl,
        allowedDomains: project.allowedDomains,
    };
};

// Widget settings interface for embed snippet
export interface WidgetSettings {
    widgetIcon: string;
    widgetText: string;
    widgetPrimary: string;
    widgetTextColor: string;
    widgetBackground: string;
    widgetPosition: string;
    customIconUrl?: string | null;
}

// Convert Google Drive shareable link to direct image URL
// Input: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// Output: https://drive.google.com/uc?export=view&id=FILE_ID
const convertGoogleDriveUrl = (url: string): string => {
    if (!url) return url;

    // Check if it's a Google Drive shareable link
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
        return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }

    // Return as-is if not a Drive link (could be Imgur, etc.)
    return url;
};

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
        // Add custom icon URL if provided (convert Google Drive URLs)
        if (settings.customIconUrl) {
            const directUrl = convertGoogleDriveUrl(settings.customIconUrl);
            params.set('customIcon', directUrl);
        }
        return `<script src="${backendUrl}/widget.js?${params.toString()}" async></script>`;
    }

    return `<script src="${backendUrl}/widget.js?key=${projectKey}" async></script>`;
};

