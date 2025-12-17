import React, { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { taskAPI } from './services/taskAPI';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const result = await taskAPI.getTasks();
      setTasks(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks: ' + err.message);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskAPI.createTask(taskData);
      setTasks([...tasks, newTask]);
      setError(null);
    } catch (err) {
      setError('Error creating task: ' + err.message);
      console.error('Error creating task:', err);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      const updatedTask = await taskAPI.updateTask(id, taskData);
      setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
      setError(null);
    } catch (err) {
      setError('Error updating task: ' + err.message);
      console.error('Error updating task:', err);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      const updatedTask = await taskAPI.toggleComplete(id);
      setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
      setError(null);
    } catch (err) {
      setError('Error toggling task: ' + err.message);
      console.error('Error toggling task:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskAPI.deleteTask(id);
      setTasks(tasks.filter((task) => task.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting task:', err);
    }
  };

  const handleReorderTasks = async (reorderedTasks) => {
    // Optimistic update
    const newTasks = tasks.map((task) => {
      const updated = reorderedTasks.find((t) => t.id === task.id);
      return updated ? { ...task, sort_order: updated.sort_order } : task;
    });
    newTasks.sort((a, b) => a.sort_order - b.sort_order);
    setTasks(newTasks);

    try {
      await taskAPI.reorderTasks(reorderedTasks);
      setError(null);
    } catch (err) {
      setError('Error reordering tasks: ' + err.message);
      console.error('Error reordering tasks:', err);
      // Revert on error
      fetchTasks();
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>✨ TODO App ✨</h1>
        <p>Organize your tasks with style</p>
      </header>

      <main className="App-main">
        <div className="container">
          {error && <div className="error-message">{error}</div>}

          <section className="add-task-section">
            <h2>Create New Task</h2>
            <TaskForm onSubmit={handleCreateTask} />
          </section>

          <section className="tasks-section">
            <h2>My Tasks</h2>
            {loading ? (
              <div className="loading">Loading tasks...</div>
            ) : (
              <TaskList
                tasks={tasks}
                onReorder={handleReorderTasks}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onEdit={handleUpdateTask}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
