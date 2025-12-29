import { useState, useEffect } from 'react';
import { Task, CreateTaskRequest } from './types';
import { api } from './api';

function App() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<CreateTaskRequest>({
        title: '',
        description: '',
        priority: 'medium',
    });

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const data = await api.getTasks();
            setTasks(data);
            setError(null);
        } catch (err) {
            setError('Failed to load tasks');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createTask(formData);
            setFormData({ title: '', description: '', priority: 'medium' });
            setShowForm(false);
            loadTasks();
        } catch (err) {
            setError('Failed to create task');
            console.error(err);
        }
    };

    const handleToggleComplete = async (task: Task) => {
        try {
            await api.updateTask(task.id, { completed: !task.completed });
            loadTasks();
        } catch (err) {
            setError('Failed to update task');
            console.error(err);
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.deleteTask(id);
            loadTasks();
        } catch (err) {
            setError('Failed to delete task');
            console.error(err);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                        Task Manager
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Organize your work with style
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="card text-center">
                        <div className="text-3xl font-bold text-primary-400">{tasks.length}</div>
                        <div className="text-slate-400 text-sm mt-1">Total Tasks</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-3xl font-bold text-yellow-400">{activeTasks.length}</div>
                        <div className="text-slate-400 text-sm mt-1">Active</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-3xl font-bold text-green-400">{completedTasks.length}</div>
                        <div className="text-slate-400 text-sm mt-1">Completed</div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="card bg-red-500/10 border-red-500/20 mb-6">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Create Task Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary w-full md:w-auto"
                    >
                        {showForm ? '✕ Cancel' : '+ New Task'}
                    </button>
                </div>

                {/* Create Task Form */}
                {showForm && (
                    <div className="card mb-8 animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter task title..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter task description..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Priority
                                </label>
                                <select
                                    className="input"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary">
                                    Create Task
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                        <p className="text-slate-400 mt-4">Loading tasks...</p>
                    </div>
                )}

                {/* Tasks List */}
                {!loading && (
                    <div className="space-y-6">
                        {/* Active Tasks */}
                        {activeTasks.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-slate-200">
                                    Active Tasks
                                </h2>
                                <div className="space-y-3">
                                    {activeTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="card hover:border-primary-500/50 transition-all duration-200 group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <button
                                                    onClick={() => handleToggleComplete(task)}
                                                    className="mt-1 w-6 h-6 rounded border-2 border-slate-600 hover:border-primary-500 transition-colors flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <h3 className="text-lg font-medium text-white">
                                                            {task.title}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                    {task.description && (
                                                        <p className="text-slate-400 text-sm mb-3">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-slate-500">
                                                            Created {new Date(task.created_at).toLocaleDateString()}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="text-red-400 hover:text-red-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Tasks */}
                        {completedTasks.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-semibold mb-4 text-slate-200">
                                    Completed Tasks
                                </h2>
                                <div className="space-y-3">
                                    {completedTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="card opacity-60 hover:opacity-100 transition-all duration-200 group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <button
                                                    onClick={() => handleToggleComplete(task)}
                                                    className="mt-1 w-6 h-6 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center flex-shrink-0"
                                                >
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <h3 className="text-lg font-medium text-slate-400 line-through">
                                                            {task.title}
                                                        </h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                                            {task.priority}
                                                        </span>
                                                    </div>
                                                    {task.description && (
                                                        <p className="text-slate-500 text-sm mb-3 line-through">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-slate-600">
                                                            Completed {new Date(task.updated_at).toLocaleDateString()}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            className="text-red-400 hover:text-red-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {tasks.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-xl font-medium text-slate-300 mb-2">
                                    No tasks yet
                                </h3>
                                <p className="text-slate-400">
                                    Create your first task to get started!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
