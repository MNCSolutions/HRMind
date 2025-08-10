import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('hr.employees').update({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email ?? null,
      role_title: body.role_title ?? null,
      contract_hours: body.contract_hours ?? null,
      department_id: body.department_id ?? null,
      manager_id: body.manager_id ?? null,
      tenure_years: body.tenure_years ?? 0
    }).eq('id', params.id).select('*').single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Errore' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('hr.employees').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
