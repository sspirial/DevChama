import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../api/http';

const CreateChama: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || title.trim().length === 0) {
      setError('Title is required');
      return;
    }
    try {
      const resp = await http.post('chamas/', { title, description });
      const created = resp.data as { id: number };
      navigate(`/chamas/${created.id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create chama.');
    }
  };

  return (
    <div>
      <h2>Create Chama</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 600 }}>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <button type="submit">Create</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
};

export default CreateChama;
