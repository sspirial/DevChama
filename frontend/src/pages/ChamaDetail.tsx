import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import http from '../api/http';
import type { Chama, Membership, Contribution, Task } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import ContributionForm from '../components/ContributionForm.tsx';
import TaskForm from '../components/TaskForm.tsx';

const ChamaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [chama, setChama] = useState<Chama | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const auth = useContext(AuthContext);

  // Fetch all chama-related data (details, contributions, tasks, members)
  const fetchAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [chRes, contribRes, tasksRes] = await Promise.all([
        http.get(`chamas/${id}/`),
        http.get('contributions/'),
        http.get('tasks/'),
      ]);
      setChama(chRes.data as Chama);
      const allContrib = contribRes.data as Contribution[];
      setContributions(allContrib.filter((c) => Number(c.chama) === Number(id)));
      const allTasks = tasksRes.data as Task[];
      setTasks(allTasks.filter((t) => Number(t.chama) === Number(id)));
      // members is a separate endpoint that may be protected
      try {
        const mRes = await http.get(`chamas/${id}/members/`);
        setMembers(mRes.data as Membership[]);
        setMemberError(null);
      } catch {
        // likely not a member - display a reason
        setMemberError('You are not a member of this chama. Join to see members.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleJoin = async () => {
    if (!id) return;
    try {
      await http.post(`chamas/${id}/members/`, {});
      // refresh members
      const res = await http.get(`chamas/${id}/members/`);
      setMembers(res.data as Membership[]);
      setMemberError(null);
      setMessage('Joined chama successfully');
    } catch (err) {
      console.error(err);
      setMemberError('Failed to join chama.');
    }
  };

  const isCurrentUserAdmin = () => {
    const userId = auth?.user?.id;
    if (!userId) return false;
    return members.some((member) => member.user.id === userId && member.member_role === 'Admin');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>{chama?.title}</h2>
      <p>{chama?.description}</p>

      <section>
        <h3>Members</h3>
        {memberError ? (
          <div>
            <p>{memberError}</p>
            {auth?.user && <button onClick={handleJoin}>Join Chama</button>}
          </div>
        ) : (
          <ul>
            {members.map((m) => (
              <li key={m.user.id}>{m.user.username} — {m.member_role}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Contributions</h3>
        <ContributionForm chamaId={Number(id)} onCreated={(c: Contribution) => setContributions((prev) => [c, ...prev])} />
        {contributions.length === 0 ? <p>No contributions yet</p> : (
          <ul>
            {contributions.map((c) => (
              <li key={c.id}>{c.type} — {c.amount ?? '-'} by {c.user.username}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Tasks</h3>
        {isCurrentUserAdmin() && (
          <TaskForm
            chamaId={Number(id)}
            onCreated={(t: Task) => setTasks((prev) => [t, ...prev])}
            members={members}
          />
        )}
        {tasks.length === 0 ? <p>No tasks yet</p> : (
          <ul>
            {tasks.map((t) => (
              <li key={t.id}>{t.title} — {t.status} {t.assigned_to ? `— assigned to ${t.assigned_to.username}` : ''}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <button onClick={() => fetchAll()}>Refresh</button>
          {message && <span className="alert alert-success">{message}</span>}
        </div>
      </section>
    </div>
  );
};

export default ChamaDetail;
