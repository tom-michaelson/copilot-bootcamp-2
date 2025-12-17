import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../components/TaskItem';

describe('TaskItem', () => {
  const mockTask = {
    id: 1,
    description: 'Test Task',
    due_date: '2025-12-31',
    completed: 0,
    sort_order: 1,
  };

  it('renders task information', () => {
    const mockToggle = jest.fn();
    const mockDelete = jest.fn();
    const mockEdit = jest.fn();

    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
        dragHandleProps={{}}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText(/Dec 31, 2025/i)).toBeInTheDocument();
  });

  it('calls onToggleComplete when checkbox is clicked', () => {
    const mockToggle = jest.fn();
    const mockDelete = jest.fn();
    const mockEdit = jest.fn();

    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
        dragHandleProps={{}}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledWith(mockTask.id);
  });

  it('disables delete button for incomplete tasks', () => {
    const mockToggle = jest.fn();
    const mockDelete = jest.fn();
    const mockEdit = jest.fn();

    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
        dragHandleProps={{}}
      />
    );

    const deleteButton = screen.getByTitle(/complete task first/i);
    expect(deleteButton).toBeDisabled();
  });

  it('enables delete button for completed tasks', () => {
    const completedTask = { ...mockTask, completed: 1 };
    const mockToggle = jest.fn();
    const mockDelete = jest.fn();
    const mockEdit = jest.fn();

    render(
      <TaskItem
        task={completedTask}
        onToggleComplete={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
        dragHandleProps={{}}
      />
    );

    const deleteButton = screen.getByTitle(/delete task/i);
    expect(deleteButton).not.toBeDisabled();
  });

  it('calls onDelete when delete button is clicked', () => {
    const completedTask = { ...mockTask, completed: 1 };
    const mockToggle = jest.fn();
    const mockDelete = jest.fn();
    const mockEdit = jest.fn();

    render(
      <TaskItem
        task={completedTask}
        onToggleComplete={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
        dragHandleProps={{}}
      />
    );

    const deleteButton = screen.getByTitle(/delete task/i);
    fireEvent.click(deleteButton);

    expect(mockDelete).toHaveBeenCalledWith(completedTask.id);
  });

  it('enters edit mode when edit button is clicked', () => {
    const mockToggle = jest.fn();
    const mockDelete = jest.fn();
    const mockEdit = jest.fn();

    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
        dragHandleProps={{}}
      />
    );

    const editButton = screen.getByTitle(/edit task/i);
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onEdit when save button is clicked in edit mode', () => {
    const mockToggle = jest.fn();
    const mockDelete = jest.fn();
    const mockEdit = jest.fn();

    render(
      <TaskItem
        task={mockTask}
        onToggleComplete={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
        dragHandleProps={{}}
      />
    );

    const editButton = screen.getByTitle(/edit task/i);
    fireEvent.click(editButton);

    const descriptionInput = screen.getByDisplayValue('Test Task');
    fireEvent.change(descriptionInput, { target: { value: 'Updated Task' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(mockEdit).toHaveBeenCalledWith(mockTask.id, {
      description: 'Updated Task',
      due_date: '2025-12-31',
    });
  });

  it('applies overdue styling for past due tasks', () => {
    const overdueTask = { ...mockTask, due_date: '2020-01-01' };
    const mockToggle = jest.fn();
    const mockDelete = jest.fn();
    const mockEdit = jest.fn();

    const { container } = render(
      <TaskItem
        task={overdueTask}
        onToggleComplete={mockToggle}
        onDelete={mockDelete}
        onEdit={mockEdit}
        dragHandleProps={{}}
      />
    );

    const taskItem = container.querySelector('.task-item');
    expect(taskItem).toHaveClass('overdue');
  });
});
