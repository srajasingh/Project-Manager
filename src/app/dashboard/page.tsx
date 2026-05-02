'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

type Task = {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  project: { name: string };
};

export default function Dashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        } else if (res.status === 401) {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [router]);

  if (loading) {
    return <div className="container" style={{ padding: '2rem' }}>Loading dashboard...</div>;
  }

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'DONE') return false;
    return new Date(t.dueDate) < new Date();
  });

  return (
    <>
      <Navbar />
      <main className="container main-content">
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Dashboard</h1>

        <div className="grid grid-cols-3" style={{ marginBottom: '3rem' }}>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-secondary)' }}>Total Tasks</h3>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: 'white' }}>{tasks.length}</div>
          </div>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-secondary)' }}>In Progress</h3>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary-color)' }}>{inProgressTasks.length}</div>
          </div>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-secondary)' }}>Overdue</h3>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--danger-color)' }}>{overdueTasks.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-2">
          <div className="glass-panel">
            <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>Recent Tasks</h2>
            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No tasks found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'white' }}>{task.title}</h4>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{task.project.name}</div>
                    </div>
                    <span className={`badge ${task.status === 'TODO' ? 'badge-todo' : task.status === 'IN_PROGRESS' ? 'badge-progress' : 'badge-done'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--danger-color)' }}>Overdue Tasks</h2>
            {overdueTasks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No overdue tasks! Great job.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {overdueTasks.map(task => (
                  <div key={task.id} style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
                    <h4 style={{ margin: 0, color: 'white' }}>{task.title}</h4>
                    <div style={{ fontSize: '0.875rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                      Due: {new Date(task.dueDate!).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
