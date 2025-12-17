import React, { useState } from 'react';
import { formatDate, getTaskBackgroundColor } from '../utils/dateUtils';
import './TaskItem.css';

function TaskItem({ task, onToggleComplete, onDelete, onEdit, dragHandleProps }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editDueDate, setEditDueDate] = useState(task.due_date || '');

  const handleSave = () => {
    onEdit(task.id, {
      description: editDescription.trim(),
      due_date: editDueDate || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditDescription(task.description);
    setEditDueDate(task.due_date || '');
    setIsEditing(false);
  };

  const backgroundClass = getTaskBackgroundColor(task.due_date, task.completed);

  if (isEditing) {
    return (
      <div className="task-item editing">
        <div className="task-edit-form">
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Task description"
            autoFocus
          />
          <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
          <div className="edit-actions">
            <button onClick={handleSave} className="btn-save">
              Save
            </button>
            <button onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`task-item ${backgroundClass} ${task.completed ? 'completed' : ''}`}>
      <div className="drag-handle" {...dragHandleProps}>
        ⋮⋮
      </div>

      <div className="task-content">
        <div className="task-checkbox">
          <input
            type="checkbox"
            checked={task.completed === 1}
            onChange={() => onToggleComplete(task.id)}
            id={`task-${task.id}`}
          />
          <label htmlFor={`task-${task.id}`}></label>
        </div>

        <div className="task-details">
          <p className="task-description">{task.description}</p>
          {task.due_date && <p className="task-due-date">Due: {formatDate(task.due_date)}</p>}
        </div>
      </div>

      <div className="task-actions">
        <button onClick={() => setIsEditing(true)} className="btn-edit" title="Edit task">
          ✏️
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="btn-delete"
          disabled={!task.completed}
          title={task.completed ? 'Delete task' : 'Complete task first to delete'}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
