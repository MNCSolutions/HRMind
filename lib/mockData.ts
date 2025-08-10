export type Employee = {
  id: string; name: string; surname: string; department: string; role: string;
  tenureYears: number; performance: number; wellbeing: number;
  hoursMonth: number; overtime: number; nights: number; absencesDays: number;
  turnoverRisk: number; managerId?: string;
};

export const employees: Employee[] = [
  { id: "E001", name: "Luca", surname: "Rossi", department: "Produzione", role: "Operatore", tenureYears: 4, performance: 82, wellbeing: 7.2, hoursMonth: 168, overtime: 12, nights: 8, absencesDays: 1, turnoverRisk: 0.28, managerId: "M001" },
  { id: "E002", name: "Giulia", surname: "Bianchi", department: "Produzione", role: "Operatrice", tenureYears: 2, performance: 76, wellbeing: 6.3, hoursMonth: 174, overtime: 18, nights: 10, absencesDays: 2, turnoverRisk: 0.41, managerId: "M001" },
  { id: "E003", name: "Marco", surname: "Verdi", department: "Logistica", role: "Magazziniere", tenureYears: 5, performance: 88, wellbeing: 8.1, hoursMonth: 160, overtime: 6, nights: 0, absencesDays: 0, turnoverRisk: 0.15, managerId: "M002" },
  { id: "E004", name: "Sara", surname: "Neri", department: "IT", role: "Analista", tenureYears: 3, performance: 90, wellbeing: 8.6, hoursMonth: 162, overtime: 4, nights: 0, absencesDays: 0, turnoverRisk: 0.12, managerId: "M003" },
  { id: "E005", name: "Paolo", surname: "Gialli", department: "Produzione", role: "Operatore", tenureYears: 1, performance: 65, wellbeing: 5.4, hoursMonth: 182, overtime: 26, nights: 12, absencesDays: 3, turnoverRisk: 0.62, managerId: "M001" }
];

export const departments = ['Produzione','Logistica','IT'] as const;

export function departmentAggregates() {
  const agg = new Map<string, { count:number, avgRisk:number, avgWellbeing:number, overtime:number, absences:number }>();
  for (const dep of departments) agg.set(dep, { count:0, avgRisk:0, avgWellbeing:0, overtime:0, absences:0 });
  for (const e of employees) {
    const a = agg.get(e.department)!;
    a.count += 1;
    a.avgRisk += e.turnoverRisk;
    a.avgWellbeing += e.wellbeing;
    a.overtime += e.overtime;
    a.absences += e.absencesDays;
  }
  for (const dep of departments) {
    const a = agg.get(dep)!;
    if (a.count>0) {
      a.avgRisk = +(a.avgRisk / a.count).toFixed(2);
      a.avgWellbeing = +(a.avgWellbeing / a.count).toFixed(2);
    }
  }
  return agg;
}

export function staffingForecast() {
  const months = ['+1', '+2', '+3'];
  return departments.map(dep => ({
    department: dep,
    values: months.map((m, i) => ({
      month: m,
      required: Math.max(
        0,
        Math.round((Math.random() * 2 - 1) + (dep === 'Produzione' ? 10 : dep === 'Logistica' ? 5 : 3) + i)
      )
    }))
  }));
}


export function prescriptionsForDepartment(dep: string): string[] {
  const agg = departmentAggregates().get(dep)!;
  const actions: string[] = [];
  if (agg.avgRisk >= 0.35) actions.push("Colloqui 1:1 mirati (retention)");
  if (agg.overtime / Math.max(1, agg.count) > 15) actions.push("Ridurre straordinari, attivare rotazioni");
  if (agg.absences / Math.max(1, agg.count) >= 2) actions.push("Analisi cause assenteismo, piano rientro");
  if (actions.length === 0) actions.push("Mantenere assetto e monitorare");
  return actions;
}

export function stressIndex(e: Employee): number {
  const load = e.hoursMonth + e.overtime + e.nights*1.5;
  const base = Math.min(100, Math.max(0, 30 + load/3 - e.wellbeing*2));
  return Math.round(base);
}
