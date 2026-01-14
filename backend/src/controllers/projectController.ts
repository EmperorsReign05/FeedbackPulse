import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services';
import { createProjectSchema } from '../utils/validation';

/**
 * POST /api/projects
 * Creates a new project
 */
export const createProject = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const validatedData = createProjectSchema.parse(req.body);
        const project = await projectService.createProject(req.user.userId, validatedData);

        res.status(201).json({
            success: true,
            data: {
                ...project,
                embedSnippet: projectService.getEmbedSnippet(project.projectKey),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/projects
 * Lists all projects for the current user
 */
export const listProjects = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const projects = await projectService.listProjects(req.user.userId);

        res.json({
            success: true,
            data: projects,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/projects/:projectId
 * Gets a single project by ID
 */
export const getProject = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }

        const { projectId } = req.params;
        const project = await projectService.getProject(projectId, req.user.userId);

        if (!project) {
            res.status(404).json({
                success: false,
                error: 'Project not found',
            });
            return;
        }

        res.json({
            success: true,
            data: {
                ...project,
                embedSnippet: projectService.getEmbedSnippet(project.projectKey),
            },
        });
    } catch (error) {
        next(error);
    }
};
