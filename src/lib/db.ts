import Database from '@tauri-apps/plugin-sql';
import { ProjectMetadata } from '../models/projectMetadata';

let dbInstance: Database | null = null;

export const loadDb = async () => {
    console.log("loadDb called");
    if (!dbInstance) {
        try {
            console.log("Attempting to load sqlite:kapivara.db");
            dbInstance = await Database.load('sqlite:kapivara.db');
            console.log("Database loaded successfully", dbInstance);
        } catch (error) {
            console.error("Failed to load database:", error);
            throw error;
        }
    }
    return dbInstance;
};

export const createProject = async (project: ProjectMetadata) => {
    const db = await loadDb();
    await db.execute(
        'INSERT INTO projects (uid, name, description, iconColor, lastOpenAt, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [
            project.id,
            project.name,
            project.description,
            project.iconColor,
            project.lastOpenedAt,
            project.createdAt,
        ]
    );
};

export const getProjects = async (): Promise<ProjectMetadata[]> => {
    const db = await loadDb();
    const result = await db.select<any[]>('SELECT * FROM projects ORDER BY lastOpenAt DESC');

    return result.map((row) => ({
        id: row.uid,
        name: row.name,
        description: row.description,
        iconColor: row.iconColor,
        lastOpenedAt: new Date(row.lastOpenAt),
        createdAt: new Date(row.created_at),
        version: '1.0.0',
    }));
};
