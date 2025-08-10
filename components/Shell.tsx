'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function Shell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState<boolean>(true);
  const [role, setRole] = useState<'HR'|'Manager'|'Employee'>('HR');
  const [employeeId, setEmployeeId] = useState('E001');

  useEffect(() => {
    setMounted(true);
    const d = (localStorage.getItem('theme') ?? 'dark') === 'dark';
    setDark(d);
    document.documentElement.classList.toggle('dark', d);
    const r = (localStorage.getItem('hrmind.role') as any) || 'HR';
    const eid = localStorage.getItem('hrmind.employeeId') || 'E001';
    setRole(r);
    setEmployeeId(eid);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('hrmind.role', role);
    localStorage.setItem('hrmind.employeeId', employeeId);
  }, [dark, mounted, role, employeeId]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold text-brand dark:text-brand-accent">HRMind</Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/employees/E001" className="hover:underline">Scheda dipendente</Link>
              <Link href="/admin/import" className="hover:underline">Import CSV</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <select className="bg-transparent border rounded-md px-2 py-1 text-sm" value={role} onChange={e=>setRole(e.target.value as any)}>
              <option value="HR">HR</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Dipendente</option>
            </select>
            {role === 'Employee' && (
              <input className="bg-transparent border rounded-md px-2 py-1 text-sm w-24" value={employeeId} onChange={e=>setEmployeeId(e.target.value)} placeholder="ID dip." />
            )}
            <button className={clsx("rounded-md px-3 py-1 text-sm border", dark ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-slate-900 border-slate-200")} onClick={()=>setDark(!dark)}>
              {dark ? "Dark" : "Light"}
            </button>
          </div>
        </div>
      </header>
      <main className="container py-6">{children}</main>
      <footer className="container py-10 text-center text-sm text-slate-500">HRMind · Prevedi, previeni, migliora</footer>
    </div>
  );
}
