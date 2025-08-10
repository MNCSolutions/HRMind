import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('public.v_companies').select('*').eq('id', params.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('hr.companies')
      .update({
        name: body.name,
        address: body.address ?? null,
        vat_number: body.vat_number ?? null
      })
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Errore' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('hr.companies').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
