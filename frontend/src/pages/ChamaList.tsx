import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import http from '../api/http';
import type { Chama } from '../types';

const ChamaList: React.FC = () => {
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await http.get('me/chamas/');
        if (mounted) setChamas(res.data as Chama[]);
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
      <h2>Your Chamas</h2>
      <div style={{ marginBottom: 12 }}>
        <Link to="/chamas/new">Create new Chama</Link>
      </div>
      {loading ? <p>Loading...</p> : (
        <ul>
          {chamas.map((c) => (
            <li key={c.id}>
              <Link to={`/chamas/${c.id}`}>{c.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChamaList;
