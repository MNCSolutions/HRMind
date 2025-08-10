'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import { getEmployeeById } from '@/lib/repo';
import { Employee, stressIndex } from '@/lib/mockData';

const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });

export default function EmployeePage() {
  const params = useParams<{ id: string }>();
  const [e, setE] = useState<Employee | null>(null);

  useEffect(() => {
    getEmployeeById(params.id).then(setE);
  }, [params.id]);

  if (!e) return <Shell><div className="card p-6">Caricamento…</div></Shell>;

  const perf = Array.from({length: 6}).map((_,i) => ({ month: `M${i+1}`, value: Math.max(50, Math.min(100, e.performance + (Math.random()*10-5))) }));
  const hours = Array.from({length: 6}).map((_,i) => ({ month: `M${i+1}`, value: Math.max(120, e.hoursMonth + Math.round(Math.random()*16-8)) }));
  const stress = Array.from({length: 6}).map((_,i) => ({ month: `M${i+1}`, value: Math.max(10, Math.min(100, stressIndex(e) + Math.round(Math.random()*10-5))) }));

  return (
    <Shell>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 md:col-span-2">
          <div className="text-2xl font-bold">{e.name} {e.surname}</div>
          <div className="text-slate-500">{e.role} · {e.department} · Anzianità {e.tenureYears} anni</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="card p-4"><div className="card-title">Performance</div><div className="kpi">{e.performance}</div></div>
            <div className="card p-4"><div className="card-title">Ore/mese</div><div className="kpi">{e.hoursMonth}</div></div>
            <div className="card p-4"><div className="card-title">Straordinari</div><div className="kpi">{e.overtime}h</div></div>
            <div className="card p-4"><div className="card-title">Stress Index</div><div className="kpi">{stressIndex(e)}</div></div>
          </div>
        </div>

        <div className="card p-4">
          <div className="card-title mb-2">Rischio di turnover</div>
          <div className="kpi">{Math.round(e.turnoverRisk*100)}%</div>
          <p className="text-sm text-slate-500 mt-1">Probabilità nei prossimi 3-6 mesi (stima)</p>
        </div>

        <div className="card p-4 md:col-span-3">
          <div className="card-title mb-2">Andamento performance</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={perf}><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" name="Performance" /></LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 md:col-span-3">
          <div className="card-title mb-2">Ore lavorate</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hours}><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" name="Ore" /></LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 md:col-span-3">
          <div className="card-title mb-2">Stress Index</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stress}><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" name="Stress" /></LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Shell>
  );
}
