insert into hr.companies (id, name) values ('11111111-1111-1111-1111-111111111111','Demo S.p.A.') on conflict do nothing;

insert into hr.departments (company_id, name) values
('11111111-1111-1111-1111-111111111111','Produzione'),
('11111111-1111-1111-1111-111111111111','Logistica'),
('11111111-1111-1111-1111-111111111111','IT')
on conflict do nothing;

insert into hr.employees (id, company_id, department_id, manager_id, first_name, last_name, role_title, tenure_years)
select 'E001','11111111-1111-1111-1111-111111111111', d1.id, null, 'Luca','Rossi','Operatore',4 from hr.departments d1 where d1.name='Produzione'
union all
select 'E002','11111111-1111-1111-1111-111111111111', d1.id, 'E001', 'Giulia','Bianchi','Operatrice',2 from hr.departments d1 where d1.name='Produzione'
union all
select 'E003','11111111-1111-1111-1111-111111111111', d2.id, null, 'Marco','Verdi','Magazziniere',5 from hr.departments d2 where d2.name='Logistica'
union all
select 'E004','11111111-1111-1111-1111-111111111111', d3.id, null, 'Sara','Neri','Analista',3 from hr.departments d3 where d3.name='IT'
union all
select 'E005','11111111-1111-1111-1111-111111111111', d1.id, 'E001', 'Paolo','Gialli','Operatore',1 from hr.departments d1 where d1.name='Produzione'
on conflict do nothing;

insert into hr.timesheet_monthly (company_id, employee_id, period_month, hours_month, overtime_hours, night_hours, absences_days) values
('11111111-1111-1111-1111-111111111111','E001','2025-07-01',168,12,8,1),
('11111111-1111-1111-1111-111111111111','E002','2025-07-01',174,18,10,2),
('11111111-1111-1111-1111-111111111111','E003','2025-07-01',160,6,0,0),
('11111111-1111-1111-1111-111111111111','E004','2025-07-01',162,4,0,0),
('11111111-1111-1111-1111-111111111111','E005','2025-07-01',182,26,12,3);

insert into hr.evaluations (company_id, employee_id, period_month, performance_score, okr_score) values
('11111111-1111-1111-1111-111111111111','E001','2025-07-01',82,90),
('11111111-1111-1111-1111-111111111111','E002','2025-07-01',76,85),
('11111111-1111-1111-1111-111111111111','E003','2025-07-01',88,92),
('11111111-1111-1111-1111-111111111111','E004','2025-07-01',90,94),
('11111111-1111-1111-1111-111111111111','E005','2025-07-01',65,70);

insert into hr.survey_responses (company_id, employee_id, period_month, wellbeing_score) values
('11111111-1111-1111-1111-111111111111','E001','2025-07-01',7.2),
('11111111-1111-1111-1111-111111111111','E002','2025-07-01',6.3),
('11111111-1111-1111-1111-111111111111','E003','2025-07-01',8.1),
('11111111-1111-1111-1111-111111111111','E004','2025-07-01',8.6),
('11111111-1111-1111-1111-111111111111','E005','2025-07-01',5.4);

select public.refresh_mv_employee_latest();
