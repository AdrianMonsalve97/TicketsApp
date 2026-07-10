import { Roles } from '../enums/roles';
import { BackendRol } from '../interfaces/auth-api.model';

export type DashboardRole = 'PMO_LT' | 'DEV' | 'QA';

export function backendRolToRole(rol: string | null | undefined): Roles {
  const normalized = (rol ?? '').toString().trim().toLowerCase();
  const roles: Record<string, Roles> = {
    desarrollador: Roles.Desarrollador,
    developer: Roles.Desarrollador,
    qa: Roles.Qa,
    lidertecnico: Roles.Lider_Tecnico,
    'lider tecnico': Roles.Lider_Tecnico,
    planner: Roles.Product_Owner,
    productowner: Roles.Product_Owner,
    'product owner': Roles.Product_Owner,
  };

  return roles[normalized] ?? Roles.Desarrollador;
}

export function roleToBackendRol(rol: Roles): BackendRol {
  const roles: Record<Roles, BackendRol> = {
    [Roles.Desarrollador]: 'Desarrollador',
    [Roles.Qa]: 'QA',
    [Roles.Lider_Tecnico]: 'LiderTecnico',
    [Roles.Product_Owner]: 'Planner',
  };

  return roles[rol] ?? 'Desarrollador';
}

export function roleToDashboardRole(rol: Roles): DashboardRole {
  if (rol === Roles.Qa) return 'QA';
  if (rol === Roles.Desarrollador) return 'DEV';
  return 'PMO_LT';
}

export function isPlanner(rol: Roles | null | undefined): boolean {
  return rol === Roles.Product_Owner;
}

export function canViewAllTickets(rol: Roles | null | undefined): boolean {
  return isPlanner(rol);
}

export function canManageUsers(rol: Roles | null | undefined): boolean {
  return isPlanner(rol);
}

export function canManageApplications(rol: Roles | null | undefined): boolean {
  return rol === Roles.Product_Owner || rol === Roles.Lider_Tecnico;
}

export function canAssignUsersOnCreate(rol: Roles | null | undefined): boolean {
  return isPlanner(rol);
}

export function canReassignTickets(rol: Roles | null | undefined): boolean {
  return rol === Roles.Product_Owner || rol === Roles.Lider_Tecnico;
}

export function canEditTicketDefinition(rol: Roles | null | undefined): boolean {
  return rol === Roles.Product_Owner || rol === Roles.Lider_Tecnico;
}
