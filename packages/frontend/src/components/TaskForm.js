import React, { useState } from 'react';
import './TaskForm.css';

function TaskForm({ onSubmit, onCancel, initialData = null }) {
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.due_date || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSubmit({
      description: description.trim(),
      due_date: dueDate || null,
    });

    if (!initialData) {
      // Reset form only if creating new task
      setDescription('');
      setDueDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <label htmlFor="description">Task Description</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="dueDate">Due Date (Optional)</label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Update Task' : 'Add Task'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
