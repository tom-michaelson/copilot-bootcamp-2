import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '../components/TaskForm';

describe('TaskForm', () => {
  it('renders form fields', () => {
    const mockSubmit = jest.fn();
    render(<TaskForm onSubmit={mockSubmit} />);

    expect(screen.getByLabelText(/task description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('submits form with task data', async () => {
    const mockSubmit = jest.fn();
    render(<TaskForm onSubmit={mockSubmit} />);

    const descriptionInput = screen.getByLabelText(/task description/i);
    const dueDateInput = screen.getByLabelText(/due date/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(descriptionInput, { target: { value: 'Test Task' } });
    fireEvent.change(dueDateInput, { target: { value: '2025-12-31' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        description: 'Test Task',
        due_date: '2025-12-31',
      });
    });
  });

  it('clears form after submission when creating new task', async () => {
    const mockSubmit = jest.fn();
    render(<TaskForm onSubmit={mockSubmit} />);

    const descriptionInput = screen.getByLabelText(/task description/i);
    const dueDateInput = screen.getByLabelText(/due date/i);
    const submitButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(descriptionInput, { target: { value: 'Test Task' } });
    fireEvent.change(dueDateInput, { target: { value: '2025-12-31' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(descriptionInput.value).toBe('');
      expect(dueDateInput.value).toBe('');
    });
  });

  it('does not submit empty description', async () => {
    const mockSubmit = jest.fn();
    render(<TaskForm onSubmit={mockSubmit} />);

    const submitButton = screen.getByRole('button', { name: /add task/i });
    fireEvent.click(submitButton);

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('displays update button when editing', () => {
    const mockSubmit = jest.fn();
    const initialData = {
      description: 'Existing Task',
      due_date: '2025-12-25',
    };

    render(<TaskForm onSubmit={mockSubmit} initialData={initialData} />);

    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });

  it('shows cancel button when onCancel is provided', () => {
    const mockSubmit = jest.fn();
    const mockCancel = jest.fn();

    render(<TaskForm onSubmit={mockSubmit} onCancel={mockCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(mockCancel).toHaveBeenCalled();
  });
});
