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
}

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
    };
};

// Gets project by projectKey (for public widget use)
export const getProjectByKey = async (projectKey: string) => {
    return prisma.project.findUnique({
        where: { projectKey },
    });
};

// Generates the embed snippet for a project
export const getEmbedSnippet = (projectKey: string): string => {
    const backendUrl = config.isProduction
        ? process.env.BACKEND_URL || 'https://feedbackpulse.onrender.com'
        : `http://localhost:${config.port}`;

    return `<script src="${backendUrl}/widget.js?key=${projectKey}" async></script>`;
};
