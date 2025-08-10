'use client';

import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import type { Company, NewCompany } from '@/lib/types';

export default function CompaniesPage() {
  const [items, setItems] = useState<Company[]>([]);
  const [form, setForm] = useState<NewCompany>({ name: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  const load = async () => {
    const res = await fetch('/api/companies');
    const data = await res.json();
    setItems(data || []);
  };

  useEffect(() => { load(); }, []);

  const createCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setErr(data?.error || 'Errore'); return; }
    setForm({ name: '' });
    load();
  };

  return (
    <Shell>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-4">
          <div className="card-title mb-2">Aziende</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">Nome</th>
                <th className="py-2">P.IVA</th>
                <th className="py-2">Indirizzo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2">{c.vat_number || '—'}</td>
                  <td className="py-2">{c.address || '—'}</td>
                  <td className="py-2 text-right">
                    <a className="underline" href={`/companies/${c.id}`}>Apri</a>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="py-3 text-slate-500" colSpan={4}>Nessuna azienda</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card p-4">
          <div className="card-title mb-2">Nuova azienda</div>
          <form onSubmit={createCompany} className="space-y-3">
            <input className="w-full border rounded-md px-3 py-2" placeholder="Nome *"
              value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
            <input className="w-full border rounded-md px-3 py-2" placeholder="Partita IVA"
              value={form.vat_number || ''} onChange={e=>setForm({...form, vat_number:e.target.value})} />
            <input className="w-full border rounded-md px-3 py-2" placeholder="Indirizzo"
              value={form.address || ''} onChange={e=>setForm({...form, address:e.target.value})} />
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <button disabled={loading} className="border rounded-md px-3 py-2">{loading?'Salvataggio…':'Crea'}</button>
          </form>
        </div>
      </div>
    </Shell>
  );
}
