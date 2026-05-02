'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{name: string, role: string} | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href="/dashboard" className="nav-brand">
          Project Nexus
        </Link>
        <div className="nav-links">
          <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link href="/projects" className={`nav-item ${pathname?.startsWith('/projects') ? 'active' : ''}`}>
            Projects
          </Link>
          <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {user.name} <span className="badge" style={{ marginLeft: '0.5rem', background: 'rgba(255,255,255,0.1)' }}>{user.role}</span>
            </span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
