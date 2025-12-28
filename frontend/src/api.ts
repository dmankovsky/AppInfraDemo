import { Task, CreateTaskRequest, UpdateTaskRequest } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
    async getTasks(): Promise<Task[]> {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return response.json();
    },

    async getTask(id: number): Promise<Task> {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
        if (!response.ok) throw new Error('Failed to fetch task');
        return response.json();
    },

    async createTask(task: CreateTaskRequest): Promise<Task> {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
        if (!response.ok) throw new Error('Failed to create task');
        return response.json();
    },

    async updateTask(id: number, updates: UpdateTaskRequest): Promise<Task> {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update task');
        return response.json();
    },

    async deleteTask(id: number): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete task');
    },
};
