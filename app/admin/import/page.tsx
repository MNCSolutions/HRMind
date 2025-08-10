'use client';

import Shell from '@/components/Shell';
import { useState } from 'react';

type Kind = 'timesheet' | 'evaluations' | 'surveys';

export default function ImportPage() {
  const [kind, setKind] = useState<Kind>('timesheet');
  const [status, setStatus] = useState<string>('');

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setStatus('Caricamento in corso…');
    const res = await fetch('/api/import', { method: 'POST', body: JSON.stringify({ kind, csv: text }) });
    const data = await res.json();
    if (!res.ok) setStatus('Errore: ' + (data?.error || ''));
    else setStatus(`Import OK: ${data.inserted} righe`);
  };

  return (
    <Shell>
      <div className="max-w-2xl mx-auto card p-6">
        <h1 className="text-2xl font-bold mb-4">Import CSV</h1>
        <label className="block text-sm mb-2">Tipo dati</label>
        <select className="border rounded-md px-2 py-1 mb-4" value={kind} onChange={e=>setKind(e.target.value as Kind)}>
          <option value="timesheet">Timesheet mensile</option>
          <option value="evaluations">Valutazioni</option>
          <option value="surveys">Sondaggi (wellbeing)</option>
        </select>

        <input type="file" accept=".csv,text/csv" onChange={onUpload} className="block mb-4" />
        <pre className="text-xs text-slate-500 whitespace-pre-wrap">Formato atteso:
timesheet: employee_id,period_month(YYYY-MM-01),hours_month,overtime_hours,night_hours,absences_days
evaluations: employee_id,period_month(YYYY-MM-01),performance_score,okr_score
surveys: employee_id,period_month(YYYY-MM-01),wellbeing_score</pre>

        {status && <div className="mt-4 p-3 rounded-md bg-slate-100 dark:bg-slate-800">{status}</div>}
      </div>
    </Shell>
  );
}
