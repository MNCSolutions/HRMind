export type Company = {
  id: string;
  name: string;
  address?: string | null;
  vat_number?: string | null;
  created_at: string;
};

export type NewCompany = {
  name: string;
  address?: string;
  vat_number?: string;
};

export type EmployeeUpsert = {
  id?: string;
  company_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  role_title?: string;
  contract_hours?: number;
  department_id?: string | null;
  manager_id?: string | null;
  tenure_years?: number;
};
