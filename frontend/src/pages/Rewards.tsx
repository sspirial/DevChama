import React, { useEffect, useState } from 'react';
import http from '../api/http';
import type { Chama, Contribution, Reward } from '../types';

const RewardsPage: React.FC = () => {
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [selectedChama, setSelectedChama] = useState<number | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const [cRes, contribRes, rewardsRes] = await Promise.all([
          http.get('me/chamas/'),
          http.get('contributions/'),
          http.get('rewards/'),
        ]);
        if (!mounted) return;
        setChamas(cRes.data as Chama[]);
        setContributions(contribRes.data as Contribution[]);
        setRewards(rewardsRes.data as Reward[]);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  const totalsForSelected = () => {
    if (!selectedChama) return {} as Record<number, number>;
    const filtered = contributions.filter((c) => Number(c.chama) === Number(selectedChama));
    const totals: Record<number, number> = {};
    filtered.forEach((c) => {
      const uid = c.user.id;
      totals[uid] = (totals[uid] || 0) + (c.points_awarded || 0);
    });
    return totals;
  };

  const handleDistributeEqual = async () => {
    if (!selectedChama) return;
    setDistributing(true);
    setMessage(null);
    try {
      const totals = totalsForSelected();
      const userIds = Object.keys(totals).map((s) => Number(s));
      if (userIds.length === 0) {
        setMessage('No contributions to distribute rewards from.');
        return;
      }
      // Simple equal distribution of points
      const pointsEach = Math.floor(Object.values(totals).reduce((a, b) => a + b, 0) / userIds.length);
      const distribution = userIds.map((uid) => ({ user_id: uid, points: pointsEach, payout: null }));

      // Try POSTing to the distribute endpoint (may not exist on backend yet)
      await http.post('rewards/distribute/', { chama_id: selectedChama, distribution, reason: 'Auto distribute equal share' });
      setMessage('Distribution submitted.');
      // refresh rewards list
      const res = await http.get('rewards/');
      setRewards(res.data as Reward[]);
    } catch (err) {
      console.error(err);
      setMessage('Distribution failed (maybe the backend endpoint is not implemented).');
    } finally {
      setDistributing(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  const totals = totalsForSelected();

  return (
    <div>
      <h2>Rewards</h2>
      <p>View distributed rewards and prepare distributions for your chamas.</p>
      <div style={{ marginBottom: 12 }}>
        <label>
          Select chama: 
          <select value={selectedChama ?? ''} onChange={(e) => setSelectedChama(e.target.value ? Number(e.target.value) : null)}>
            <option value="">-- choose --</option>
            {chamas.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </label>
      </div>

      {selectedChama && (
        <div>
          <h3>Contribution points</h3>
          {Object.keys(totals).length === 0 ? <p>No contribution points recorded.</p> : (
            <ul>
              {Object.entries(totals).map(([uid, pts]) => (
                <li key={uid}>User {uid}: {pts} points</li>
              ))}
            </ul>
          )}

          <div style={{ marginTop: 12 }}>
            <button onClick={handleDistributeEqual} disabled={distributing}>Distribute equal points</button>
            {message && <div style={{ marginTop: 8 }}>{message}</div>}
          </div>

          <h3 style={{ marginTop: 20 }}>Past rewards for this chama</h3>
          <ul>
            {rewards.filter((r) => Number(r.chama) === Number(selectedChama)).map((r) => (
              <li key={r.id}>User {r.user.username}: {r.points} pts — payout {r.payout ?? '-'} on {r.date_distributed}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
