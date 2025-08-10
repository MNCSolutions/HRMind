import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(l => l.split(',').map(v => v.trim()));
}

export async function POST(req: Request) {
  try {
    const { kind, csv } = await req.json();
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY mancante (server). Aggiungi la variabile su Vercel.' }, { status: 400 });
    }
    const supabase = createAdminClient();
    const rows = parseCSV(csv);
    let inserted = 0;

    if (kind === 'timesheet') {
      const payload = rows.map(r => ({
        employee_id: r[0], period_month: r[1], hours_month: Number(r[2]),
        overtime_hours: Number(r[3]||0), night_hours: Number(r[4]||0), absences_days: Number(r[5]||0),
        company_id: '11111111-1111-1111-1111-111111111111'
      }));
      const { error } = await supabase.from('timesheet_monthly').insert(payload, { returning: 'minimal' })
        .rpc ? {} : {};
      if (error) throw error;
      inserted = payload.length;
    } else if (kind === 'evaluations') {
      const payload = rows.map(r => ({
        employee_id: r[0], period_month: r[1], performance_score: Number(r[2]), okr_score: Number(r[3]||null),
        company_id: '11111111-1111-1111-1111-111111111111'
      }));
      const { error } = await supabase.from('evaluations').insert(payload, { returning: 'minimal' });
      if (error) throw error;
      inserted = payload.length;
    } else if (kind === 'surveys') {
      const payload = rows.map(r => ({
        employee_id: r[0], period_month: r[1], wellbeing_score: Number(r[2]),
        company_id: '11111111-1111-1111-1111-111111111111'
      }));
      const { error } = await supabase.from('survey_responses').insert(payload, { returning: 'minimal' });
      if (error) throw error;
      inserted = payload.length;
    } else {
      return NextResponse.json({ error: 'Tipo non valido' }, { status: 400 });
    }

    // Aggiorna la MV
    await supabase.rpc('refresh_mv_employee_latest');

    return NextResponse.json({ ok: true, inserted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Errore import' }, { status: 500 });
  }
}
