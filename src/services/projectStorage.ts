import { SubForgeProject } from '@/types/Project';

const STORAGE_KEY_PREFIX = 'subforge_project_';
const SCHEMA_VERSION = '1.0.0';

export function saveProject(project: SubForgeProject): void {
    if (typeof window === 'undefined') return;

    const serialized = JSON.stringify({
        ...project,
        version: SCHEMA_VERSION,
        lastModified: new Date().toISOString()
    });

    localStorage.setItem(`${STORAGE_KEY_PREFIX}${project.id}`, serialized);
}

export function loadProject(id: string): SubForgeProject | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
    if (!data) return null;

    try {
        return JSON.parse(data) as SubForgeProject;
    } catch (e) {
        console.error('Failed to parse project data:', e);
        return null;
    }
}

export function listProjects(): Omit<SubForgeProject, 'subtitleLines'>[] {
    if (typeof window === 'undefined') return [];

    const projects: Omit<SubForgeProject, 'subtitleLines'>[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY_PREFIX)) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    const { subtitleLines, ...meta } = parsed;
                    projects.push(meta);
                } catch (e) {
                    console.error('Failed to parse project meta:', e);
                }
            }
        }
    }

    return projects.sort((a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
}

export function deleteProject(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
}
