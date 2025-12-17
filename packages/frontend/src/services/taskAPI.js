const API_BASE_URL = '/api';

export const taskAPI = {
  // Get all tasks
  getTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  },

  // Create a new task
  createTask: async (taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    return response.json();
  },

  // Update a task
  updateTask: async (id, taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return response.json();
  },

  // Toggle task completion
  toggleComplete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to toggle task completion');
    }
    return response.json();
  },

  // Reorder tasks
  reorderTasks: async (tasks) => {
    const response = await fetch(`${API_BASE_URL}/tasks/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tasks }),
    });
    if (!response.ok) {
      throw new Error('Failed to reorder tasks');
    }
    return response.json();
  },

  // Delete a task
  deleteTask: async (id) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete task');
    }
    return response.json();
  },
};
