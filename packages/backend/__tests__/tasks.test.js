const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createTask = async (description = 'Test Task', due_date = null) => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ description, due_date })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('Task API Endpoints', () => {
  describe('GET /api/tasks', () => {
    it('should return a list of tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('due_date');
      expect(response.body[0]).toHaveProperty('completed');
      expect(response.body[0]).toHaveProperty('sort_order');
    });

    it('should return tasks ordered by sort_order', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      for (let i = 1; i < response.body.length; i++) {
        expect(response.body[i].sort_order).toBeGreaterThanOrEqual(response.body[i - 1].sort_order);
      }
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with description and due_date', async () => {
      const newTask = { 
        description: 'Test Task with Date', 
        due_date: '2025-12-25' 
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.description).toBe(newTask.description);
      expect(response.body.due_date).toBe(newTask.due_date);
      expect(response.body.completed).toBe(0);
      expect(response.body).toHaveProperty('sort_order');
    });

    it('should create a new task without due_date', async () => {
      const newTask = { description: 'Task without due date' };

      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .expect(201);

      expect(response.body.description).toBe(newTask.description);
      expect(response.body.due_date).toBeNull();
    });

    it('should return 400 if description is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('description');
    });

    it('should return 400 if description is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: '   ' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task description', async () => {
      const task = await createTask('Original Task');
      const updatedDescription = 'Updated Task Description';

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ description: updatedDescription })
        .expect(200);

      expect(response.body.description).toBe(updatedDescription);
      expect(response.body.id).toBe(task.id);
    });

    it('should update task due_date', async () => {
      const task = await createTask('Task with date');
      const newDueDate = '2025-12-31';

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ due_date: newDueDate })
        .expect(200);

      expect(response.body.due_date).toBe(newDueDate);
    });

    it('should update both description and due_date', async () => {
      const task = await createTask('Original Task');
      const updates = {
        description: 'Updated Description',
        due_date: '2026-01-01'
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.description).toBe(updates.description);
      expect(response.body.due_date).toBe(updates.due_date);
    });

    it('should return 404 if task does not exist', async () => {
      const response = await request(app)
        .put('/api/tasks/9999')
        .send({ description: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if no fields to update', async () => {
      const task = await createTask('Task');

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({})
        .expect(400);

      expect(response.body.error).toContain('No fields');
    });
  });

  describe('PATCH /api/tasks/:id/complete', () => {
    it('should toggle task completion status from incomplete to complete', async () => {
      const task = await createTask('Task to complete');

      const response = await request(app)
        .patch(`/api/tasks/${task.id}/complete`)
        .expect(200);

      expect(response.body.completed).toBe(1);
      expect(response.body.id).toBe(task.id);
    });

    it('should toggle task completion status from complete to incomplete', async () => {
      const task = await createTask('Task to toggle');

      // First, mark as complete
      await request(app)
        .patch(`/api/tasks/${task.id}/complete`)
        .expect(200);

      // Then toggle back to incomplete
      const response = await request(app)
        .patch(`/api/tasks/${task.id}/complete`)
        .expect(200);

      expect(response.body.completed).toBe(0);
    });

    it('should return 404 if task does not exist', async () => {
      const response = await request(app)
        .patch('/api/tasks/9999/complete')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PATCH /api/tasks/reorder', () => {
    it('should reorder tasks', async () => {
      const task1 = await createTask('Task 1');
      const task2 = await createTask('Task 2');
      const task3 = await createTask('Task 3');

      const reorderData = {
        tasks: [
          { id: task3.id, sort_order: 1 },
          { id: task1.id, sort_order: 2 },
          { id: task2.id, sort_order: 3 }
        ]
      };

      const response = await request(app)
        .patch('/api/tasks/reorder')
        .send(reorderData)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      const reorderedTask3 = response.body.find(t => t.id === task3.id);
      const reorderedTask1 = response.body.find(t => t.id === task1.id);
      const reorderedTask2 = response.body.find(t => t.id === task2.id);
      
      expect(reorderedTask3.sort_order).toBe(1);
      expect(reorderedTask1.sort_order).toBe(2);
      expect(reorderedTask2.sort_order).toBe(3);
    });

    it('should return 400 if tasks array is missing', async () => {
      const response = await request(app)
        .patch('/api/tasks/reorder')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('array');
    });

    it('should return 400 if tasks array is empty', async () => {
      const response = await request(app)
        .patch('/api/tasks/reorder')
        .send({ tasks: [] })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a completed task', async () => {
      const task = await createTask('Task to Delete');

      // Mark as completed
      await request(app)
        .patch(`/api/tasks/${task.id}/complete`)
        .expect(200);

      // Then delete it
      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.id).toBe(task.id);

      // Verify it's deleted
      const getResponse = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .expect(404);
    });

    it('should return 400 when trying to delete an incomplete task', async () => {
      const task = await createTask('Incomplete Task');

      const response = await request(app)
        .delete(`/api/tasks/${task.id}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('completed');
    });

    it('should return 404 if task does not exist', async () => {
      const response = await request(app)
        .delete('/api/tasks/9999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid task id', async () => {
      const response = await request(app)
        .delete('/api/tasks/invalid')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
