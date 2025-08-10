'use client';

import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import type { Company } from '@/lib/types';

type Emp = {
  id: string; first_name: string; last_name: string; email?: string;
  role_title?: string; department_name?: string; contract_hours?: number;
};

export default function CompanyDetail({ params }: { params: { id: string } }) {
  const companyId = params.id;
  const [company, setCompany] = useState<Company | null>(null);
  const [emps, setEmps] = useState<Emp[]>([]);
  const [form, setForm] = useState<any>({ first_name:'', last_name:'', email:'', role_title:'', contract_hours:40 });

  const load = async () => {
    const [cRes, eRes] = await Promise.all([
      fetch(`/api/companies/${companyId}`),
      fetch(`/api/employees?company_id=${companyId}`)
    ]);
    const c = await cRes.json();
    const e = await eRes.json();
    setCompany(c);
    setEmps(Array.isArray(e) ? e : []);
  };

  useEffect(() => { load(); }, [companyId]);

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/companies/${companyId}`, {
      method: 'PATCH', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(company)
    });
    await load();
  };

  const addEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ ...form, company_id: companyId })
    });
    setForm({ first_name:'', last_name:'', email:'', role_title:'', contract_hours:40 });
    await load();
  };

  return (
    <Shell>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-4 md:col-span-2">
          <div className="card-title mb-2">Dettaglio azienda</div>
          {company ? (
            <form onSubmit={saveCompany} className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">Nome
                <input className="w-full border rounded-md px-3 py-2"
                  value={company.name} onChange={e=>setCompany({...company!, name:e.target.value})} />
              </label>
              <label className="text-sm">Partita IVA
                <input className="w-full border rounded-md px-3 py-2"
                  value={company.vat_number || ''} onChange={e=>setCompany({...company!, vat_number:e.target.value})} />
              </label>
              <label className="text-sm md:col-span-2">Indirizzo
                <input className="w-full border rounded-md px-3 py-2"
                  value={company.address || ''} onChange={e=>setCompany({...company!, address:e.target.value})} />
              </label>
              <div className="md:col-span-2">
                <button className="border rounded-md px-3 py-2">Salva</button>
              </div>
            </form>
          ) : <div>Caricamento…</div>}
        </div>

        <div className="card p-4">
          <div className="card-title mb-2">Nuovo dipendente</div>
          <form onSubmit={addEmployee} className="space-y-3">
            <input className="w-full border rounded-md px-3 py-2" placeholder="Nome *"
              value={form.first_name} onChange={e=>setForm({...form, first_name:e.target.value})} required />
            <input className="w-full border rounded-md px-3 py-2" placeholder="Cognome *"
              value={form.last_name} onChange={e=>setForm({...form, last_name:e.target.value})} required />
            <input className="w-full border rounded-md px-3 py-2" placeholder="Email"
              value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            <input className="w-full border rounded-md px-3 py-2" placeholder="Ruolo"
              value={form.role_title} onChange={e=>setForm({...form, role_title:e.target.value})} />
            <input className="w-full border rounded-md px-3 py-2" placeholder="Ore contrattuali/settimana"
              type="number" step="0.5" value={form.contract_hours}
              onChange={e=>setForm({...form, contract_hours:Number(e.target.value)})} />
            <button className="border rounded-md px-3 py-2">Aggiungi</button>
          </form>
        </div>

        <div className="card p-4 md:col-span-3">
          <div className="card-title mb-2">Dipendenti</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">Nome</th>
                <th className="py-2">Email</th>
                <th className="py-2">Ruolo</th>
                <th className="py-2">Reparto</th>
              </tr>
            </thead>
            <tbody>
              {emps.map(x => (
                <tr key={x.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="py-2">{x.first_name} {x.last_name}</td>
                  <td className="py-2">{x.email || '—'}</td>
                  <td className="py-2">{x.role_title || '—'}</td>
                  <td className="py-2">{x.department_name || '—'}</td>
                </tr>
              ))}
              {emps.length === 0 && (
                <tr><td colSpan={4} className="py-3 text-slate-500">Nessun dipendente</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
