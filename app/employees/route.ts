import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const companyId = url.searchParams.get('company_id');
  const supabase = createAdminClient();
  let query = supabase.from('public.v_employees').select('*').order('created_at', { ascending: false });
  if (companyId) query = query.eq('company_id', companyId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json(); // vedi EmployeeUpsert
    if (!body?.company_id || !body?.first_name || !body?.last_name) {
      return NextResponse.json({ error: 'company_id, first_name, last_name sono obbligatori' }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('hr.employees').insert({
      id: body.id ?? crypto.randomUUID().slice(0,8).toUpperCase(), // ID leggibile
      company_id: body.company_id,
      department_id: body.department_id ?? null,
      manager_id: body.manager_id ?? null,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email ?? null,
      role_title: body.role_title ?? null,
      contract_hours: body.contract_hours ?? null,
      tenure_years: body.tenure_years ?? 0
    }).select('*').single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Errore' }, { status: 500 });
  }
}
