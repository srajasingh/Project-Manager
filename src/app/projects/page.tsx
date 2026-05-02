'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

type Project = {
  id: string;
  name: string;
  description: string | null;
  owner: { name: string };
  _count: { tasks: number };
};

export default function Projects() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{role: string} | null>(null);
  
  // Create Project State
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (!token || !userData) {
        router.push('/login');
        return;
      }
      setUser(JSON.parse(userData));

      try {
        const res = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });
      
      if (res.ok) {
        const newProject = await res.json();
        // Optimistic add (with fake structure for relations)
        setProjects([{...newProject, owner: { name: 'You' }, _count: { tasks: 0 }}, ...projects]);
        setShowCreate(false);
        setName('');
        setDescription('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading projects...</div>;

  return (
    <>
      <Navbar />
      <main className="container main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Projects</h1>
          {user?.role === 'ADMIN' && (
            <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
              {showCreate ? 'Cancel' : '+ New Project'}
            </button>
          )}
        </div>

        {showCreate && (
          <div className="glass-panel" style={{ marginBottom: '2rem', background: 'rgba(99, 102, 241, 0.1)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'white' }}>Create New Project</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Project Name</label>
                <input type="text" required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: 0, flex: 2 }}>
                <label>Description</label>
                <input type="text" className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <button type="submit" disabled={creating} className="btn btn-primary" style={{ height: '42px' }}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-3">
          {projects.map(project => (
            <Link href={`/projects/${project.id}`} key={project.id} style={{ display: 'block' }}>
              <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>{project.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flex: 1, marginBottom: '1.5rem' }}>
                  {project.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Owner: <span style={{ color: 'white' }}>{project.owner.name}</span></span>
                  <span className="badge badge-progress">{project._count.tasks} Tasks</span>
                </div>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No projects found.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
