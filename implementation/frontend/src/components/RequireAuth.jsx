import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api';                // Axios instance with withCredentials

export default function RequireAuth() {
  const [status, setStatus] = useState('checking'); // checking | authed | guest

  useEffect(() => {
    api.get('/me')                      // tiny ping to backend
       .then(() => setStatus('authed')) // 200 → logged in
       .catch(() => setStatus('guest'));// 401/403 → not logged in
  }, []);

  if (status === 'checking') return <p>Loading…</p>;

  return status === 'authed'
    ? <Outlet/>                         // render protected children
    : <Navigate to="/login" replace/>;  // bounce to login
}
