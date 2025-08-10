import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('public.v_companies').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const payload = await req.json(); // { name, address?, vat_number? }
    if (!payload?.name) return NextResponse.json({ error: 'Nome obbligatorio' }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase.from('hr.companies').insert({
      name: payload.name,
      address: payload.address ?? null,
      vat_number: payload.vat_number ?? null
    }).select('*').single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Errore' }, { status: 500 });
  }
}
