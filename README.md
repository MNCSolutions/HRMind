# HRMind – Cloud (Next.js + Supabase)

## Setup locale
```
npm i
npm run dev
```

## Env richieste (Vercel → Settings → Environment Variables)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server)  ← per /api/import

## Rotte principali
- /dashboard
- /employees/E001
- /admin/import  ← carica CSV e inserisce su Supabase

## CSV
timesheet: employee_id,period_month(YYYY-MM-01),hours_month,overtime_hours,night_hours,absences_days
evaluations: employee_id,period_month(YYYY-MM-01),performance_score,okr_score
surveys: employee_id,period_month(YYYY-MM-01),wellbeing_score
