import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import http from '../api/http';
import type { Chama, Contribution, Task } from '../types';

type ChamaAnnotated = Chama & { contribCount: number; taskCount: number };

const Dashboard: React.FC = () => {
  const auth = useContext(AuthContext);
  const [chamas, setChamas] = useState<ChamaAnnotated[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const [cRes, contribRes, tasksRes] = await Promise.all([
          http.get('me/chamas/'),
          http.get('contributions/'),
          http.get('tasks/'),
        ]);
        if (!mounted) return;
        const chamasData = cRes.data as Chama[];
        const contribs = contribRes.data as Contribution[];
        const taskList = tasksRes.data as Task[];
        const annotated: ChamaAnnotated[] = chamasData.map((ch) => {
          const contribCount = contribs.filter((c) => Number(c.chama) === ch.id).length;
          const taskCount = taskList.filter((t) => Number(t.chama) === ch.id).length;
          return { ...ch, contribCount, taskCount };
        });
        setChamas(annotated);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome{auth?.user ? `, ${auth.user.username}` : ''} — here is a quick summary of your chamas.</p>
      {loading ? <p>Loading...</p> : (
        <ul>
          {chamas.map((c) => (
            <li key={c.id}>{c.title} <span className="meta">— {c.contribCount} contributions • {c.taskCount} tasks</span></li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
