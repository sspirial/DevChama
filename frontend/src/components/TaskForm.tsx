import React, { useState } from 'react';
import http from '../api/http';
import type { Task, Membership } from '../types';

type Props = {
  chamaId: number;
  members: Membership[];
  onCreated: (t: Task) => void;
};

const TaskForm: React.FC<Props> = ({ chamaId, members, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(null);

    if (!title || title.trim().length === 0) {
      setError('Title is required');
      setLoading(false);
      return;
    }
    try {
      type TaskPayload = {
        chama: number;
        title: string;
        description?: string;
        assigned_to_user_id?: number | null;
        due_date?: string | null;
      };
      const payload: TaskPayload = { chama: chamaId, title };
      if (description) payload.description = description;
      payload.assigned_to_user_id = assignedTo || null;
      payload.due_date = dueDate || null;

      const res = await http.post('tasks/', payload);
      onCreated(res.data as Task);
      setTitle('');
      setDescription('');
      setAssignedTo(null);
      setDueDate('');
      setSuccess('Task created');
    } catch (err) {
      console.error(err);
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <input placeholder="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input placeholder="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <select value={assignedTo ?? ''} onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : null)}>
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m.user.id} value={m.user.id}>{m.user.username}</option>
        ))}
      </select>
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <button type="submit" disabled={loading}>Create Task</button>
      {error && <span className="alert alert-error">{error}</span>}
      {success && <span className="alert alert-success">{success}</span>}
    </form>
  );
};

export default TaskForm;
