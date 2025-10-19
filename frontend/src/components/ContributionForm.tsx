import React, { useState } from 'react';
import http from '../api/http';
import type { Contribution } from '../types';

type Props = {
  chamaId: number;
  onCreated: (c: Contribution) => void;
};

const ContributionForm: React.FC<Props> = ({ chamaId, onCreated }) => {
  const [type, setType] = useState('code');
  const [amount, setAmount] = useState<string>('');
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(null);

    // Basic client-side validation
    if (type === 'money') {
      if (!amount) {
        setError('Amount is required for money contributions.');
        setLoading(false);
        return;
      }
      if (Number(amount) <= 0) {
        setError('Amount must be greater than zero.');
        setLoading(false);
        return;
      }
    }
    try {
      type ContributionPayload = {
        chama: number;
        type: string;
        amount?: number | null;
        metadata?: Record<string, unknown>;
      };
      const payload: ContributionPayload = { chama: chamaId, type };
      if (amount !== '') payload.amount = Number(amount);
      if (metadata) payload.metadata = { note: metadata };
      const res = await http.post('contributions/', payload);
      onCreated(res.data as Contribution);
      // reset form
      setType('code');
      setAmount('');
      setMetadata('');
      setSuccess('Contribution submitted');
    } catch (err) {
      console.error(err);
      setError('Failed to submit contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="code">Code</option>
        <option value="time">Time</option>
        <option value="money">Money</option>
        <option value="other">Other</option>
      </select>
      <input placeholder="amount (optional)" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <input placeholder="notes / metadata (optional)" value={metadata} onChange={(e) => setMetadata(e.target.value)} />
      <button type="submit" disabled={loading}>Contribute</button>
      {error && <span className="alert alert-error">{error}</span>}
      {success && <span className="alert alert-success">{success}</span>}
    </form>
  );
};

export default ContributionForm;
