import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskItem from './TaskItem';
import './TaskList.css';

function TaskList({ tasks, onReorder, onToggleComplete, onDelete, onEdit }) {
  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sort_order for all affected tasks
    const updatedTasks = items.map((task, index) => ({
      id: task.id,
      sort_order: index + 1,
    }));

    onReorder(updatedTasks);
  };

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>No tasks yet. Add your first task above! 🎯</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided, snapshot) => (
          <div
            className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? 'dragging' : ''}
                  >
                    <TaskItem
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default TaskList;
