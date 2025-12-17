import { formatDate, isOverdue, isDueSoon, getTaskBackgroundColor } from '../utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const result = formatDate('2025-12-25');
      expect(result).toMatch(/Dec 25, 2025/);
    });

    it('returns empty string for null date', () => {
      const result = formatDate(null);
      expect(result).toBe('');
    });

    it('returns empty string for undefined date', () => {
      const result = formatDate(undefined);
      expect(result).toBe('');
    });
  });

  describe('isOverdue', () => {
    it('returns true for past due date', () => {
      const pastDate = '2020-01-01';
      const result = isOverdue(pastDate, false);
      expect(result).toBe(true);
    });

    it('returns false for future date', () => {
      const futureDate = '2030-12-31';
      const result = isOverdue(futureDate, false);
      expect(result).toBe(false);
    });

    it('returns false for completed task regardless of date', () => {
      const pastDate = '2020-01-01';
      const result = isOverdue(pastDate, true);
      expect(result).toBe(false);
    });

    it('returns false for null date', () => {
      const result = isOverdue(null, false);
      expect(result).toBe(false);
    });
  });

  describe('isDueSoon', () => {
    it('returns true for date due today', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = isDueSoon(today, false);
      expect(result).toBe(true);
    });

    it('returns true for date due tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const result = isDueSoon(tomorrowStr, false);
      expect(result).toBe(true);
    });

    it('returns false for date due in 2 days', () => {
      const twoDaysLater = new Date();
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);
      const dateStr = twoDaysLater.toISOString().split('T')[0];
      const result = isDueSoon(dateStr, false);
      expect(result).toBe(false);
    });

    it('returns false for completed task', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = isDueSoon(today, true);
      expect(result).toBe(false);
    });

    it('returns false for null date', () => {
      const result = isDueSoon(null, false);
      expect(result).toBe(false);
    });
  });

  describe('getTaskBackgroundColor', () => {
    it('returns "overdue" for past due tasks', () => {
      const pastDate = '2020-01-01';
      const result = getTaskBackgroundColor(pastDate, false);
      expect(result).toBe('overdue');
    });

    it('returns "due-soon" for tasks due within 1 day', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = getTaskBackgroundColor(today, false);
      expect(result).toBe('due-soon');
    });

    it('returns empty string for future tasks', () => {
      const futureDate = '2030-12-31';
      const result = getTaskBackgroundColor(futureDate, false);
      expect(result).toBe('');
    });

    it('returns empty string for completed tasks', () => {
      const pastDate = '2020-01-01';
      const result = getTaskBackgroundColor(pastDate, true);
      expect(result).toBe('');
    });
  });
});
