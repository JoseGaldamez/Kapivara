import { loadDb } from "@/lib/db";
import { ProjectMetadata } from "@/models/projectMetadata";


export const getAllProjects = async () => {
    const db = await loadDb();
    const result = await db.select<any[]>('SELECT * FROM projects ORDER BY lastOpenAt DESC');
    return result;
}

export const deleteProject = async (project: ProjectMetadata) => {
    const db = await loadDb();
    const result = await db.execute(
        'DELETE FROM projects WHERE uid = $1',
        [project.uid]
    );
    return result;
}


export const createProject = async (project: ProjectMetadata) => {
    const db = await loadDb();
    const result = await db.execute(
        'INSERT INTO projects (uid, name, description, iconColor, lastOpenAt, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [
            project.uid,
            project.name,
            project.description,
            project.iconColor,
            project.lastOpenedAt,
            project.createdAt,
        ]
    );
    return result;
};
