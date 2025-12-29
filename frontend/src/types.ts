export interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    created_at: string;
    updated_at: string;
}

export interface CreateTaskRequest {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
}
