import { createClientBrowser } from '@/lib/supabaseClient';
import { departmentAggregates as mockAgg, employees as mockEmployees } from '@/lib/mockData';

export async function getDepartmentAggregates() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return Array.from(mockAgg().entries()).map(([k,v]) => ({ department: k, ...v }));
  }
  const supabase = createClientBrowser();
  const { data, error } = await supabase.rpc('hrmind_department_aggregates');
  if (error || !data) {
    console.warn('[Supabase] fallback to mock:', error?.message);
    return Array.from(mockAgg().entries()).map(([k,v]) => ({ department: k, ...v }));
  }
  return data as any[];
}

export async function getEmployeeById(id: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return mockEmployees.find(e => e.id === id) ?? mockEmployees[0];
  }
  const supabase = createClientBrowser();
  const { data, error } = await supabase.from('mv_employee_latest').select('*').eq('id', id).maybeSingle();
  if (error || !data) {
    console.warn('[Supabase] fallback to mock:', error?.message);
    return mockEmployees.find(e => e.id === id) ?? mockEmployees[0];
  }
  return {
    id: data.id,
    name: data.first_name,
    surname: data.last_name,
    department: data.department_name,
    role: data.role_title,
    tenureYears: data.tenure_years,
    performance: Number(data.performance_score),
    wellbeing: Number(data.wellbeing_score),
    hoursMonth: Number(data.hours_month),
    overtime: Number(data.overtime_hours),
    nights: Number(data.night_hours),
    absencesDays: Number(data.absences_days),
    turnoverRisk: Number(data.turnover_risk),
    managerId: data.manager_id
  };
}
