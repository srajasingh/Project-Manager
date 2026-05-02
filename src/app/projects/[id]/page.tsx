'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

type User = { id: string; name: string };
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  assignee: { id: string; name: string } | null;
};
type Project = {
  id: string;
  name: string;
  description: string | null;
  tasks: Task[];
};

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{id: string, role: string} | null>(null);

  // New task state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (!token || !userData) {
        router.push('/login');
        return;
      }
      const user = JSON.parse(userData);
      setCurrentUser(user);

      try {
        const [projRes, usersRes] = await Promise.all([
          fetch(`/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          user.role === 'ADMIN' ? fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ ok: false, json: async () => [] })
        ]);

        if (projRes.ok) {
          setProject(await projRes.json());
        }
        if (usersRes.ok) {
          setUsers(await usersRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTask(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, assigneeId, dueDate, projectId: id })
      });
      
      if (res.ok) {
        const newTask = await res.json();
        const assignee = users.find(u => u.id === assigneeId);
        setProject(prev => prev ? {
          ...prev,
          tasks: [{...newTask, assignee: assignee || null}, ...prev.tasks]
        } : null);
        
        setShowTaskForm(false);
        setTitle('');
        setDescription('');
        setAssigneeId('');
        setDueDate('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setProject(prev => prev ? {
          ...prev,
          tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
        } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading project...</div>;
  if (!project) return <div className="container" style={{ padding: '2rem' }}>Project not found.</div>;

  return (
    <>
      <Navbar />
      <main className="container main-content">
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white' }}>{project.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{project.description}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Project Tasks</h2>
          {currentUser?.role === 'ADMIN' && (
            <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn btn-primary">
              {showTaskForm ? 'Cancel' : '+ Add Task'}
            </button>
          )}
        </div>

        {showTaskForm && (
          <div className="glass-panel" style={{ marginBottom: '2rem' }}>
            <form onSubmit={handleCreateTask} className="grid grid-cols-2">
              <div className="input-group">
                <label>Task Title</label>
                <input type="text" required className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Due Date</label>
                <input type="date" className="input-field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <input type="text" className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Assignee</label>
                <select className="input-field" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={creatingTask} className="btn btn-primary">
                  {creatingTask ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid" style={{ gap: '1rem' }}>
          {project.tasks.map(task => (
            <div key={task.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'white', marginBottom: '0.25rem' }}>{task.title}</h4>
                {task.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>{task.description}</p>}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <span>Assignee: <span style={{ color: 'white' }}>{task.assignee?.name || 'Unassigned'}</span></span>
                  {task.dueDate && <span>Due: <span style={{ color: 'white' }}>{new Date(task.dueDate).toLocaleDateString()}</span></span>}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {currentUser?.role === 'ADMIN' || currentUser?.id === task.assignee?.id ? (
                  <select 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="input-field"
                    style={{ padding: '0.5rem', width: 'auto', minWidth: '140px' }}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                ) : (
                  <span className={`badge ${task.status === 'TODO' ? 'badge-todo' : task.status === 'IN_PROGRESS' ? 'badge-progress' : 'badge-done'}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          ))}
          {project.tasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No tasks found for this project.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
