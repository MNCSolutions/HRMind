'use client';

import dynamic from 'next/dynamic';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import { getDepartmentAggregates } from '@/lib/repo';
import { staffingForecast, prescriptionsForDepartment } from '@/lib/mockData';

const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const ComposedChart = dynamic(() => import('recharts').then(m => m.ComposedChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false });

export default function DashboardPage() {
  const [agg, setAgg] = useState<{department:string, count:number, avgRisk:number, avgWellbeing:number, overtime:number, absences:number}[]>([]);
  const [forecast] = useState(staffingForecast());

  useEffect(() => {
    getDepartmentAggregates().then(setAgg);
  }, []);

  const heatmapData = agg.map(v => ({ department: v.department, risk: Math.round((v.avgRisk ?? 0) * 100), wellbeing: Math.round((v.avgWellbeing ?? 0) * 10) }));
  const forecastData = forecast.flatMap(f => f.values.map(v => ({ department: f.department, month: v.month, required: v.required })));

  return (
    <Shell>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 md:col-span-2">
          <div className="card-title mb-2">Rischio turnover per reparto</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={heatmapData}>
                <XAxis dataKey="department" /><YAxis /><Tooltip /><Legend />
                <Bar dataKey="risk" name="Rischio %" />
                <Line type="monotone" dataKey="wellbeing" name="Benessere (0-100)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="card-title mb-2">Indice benessere aziendale</div>
          <div className="kpi">{Math.round(heatmapData.reduce((a,b)=>a+(b.wellbeing||0),0)/Math.max(1,heatmapData.length))}</div>
          <p className="text-sm text-slate-500">Media (0-100) su tutti i reparti</p>
        </div>

        <div className="card p-4 md:col-span-2">
          <div className="card-title mb-2">Fabbisogno organico (3 mesi)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData}>
                <XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
                <Area type="monotone" dataKey="required" name="Risorse richieste" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <div className="card-title mb-2">Consigli automatici</div>
          <ul className="list-disc ml-5 space-y-1">
            {agg.map(d => (
              <li key={d.department}>
                <span className="font-semibold">{d.department}:</span> {prescriptionsForDepartment(d.department).join(' · ')}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Shell>
  );
}
