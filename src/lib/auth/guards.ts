import { getSession } from './session';
import { SessionUser, Role } from '@/types';
import { redirect } from 'next/navigation';

export interface TenantContext {
  user: SessionUser;
  schoolId: string;
}

/**
 * Server-side guard that guarantees a user is authenticated.
 * Redirects to login if unauthenticated.
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

/**
 * Server-side guard that guarantees a tenant user (School Admin or Teacher).
 * Guaranteed to return a non-null schoolId.
 * Redirects or throws if the user has no school association.
 */
export async function requireTenant(): Promise<TenantContext> {
  const session = await requireAuth();
  if (!session.schoolId) {
    if (session.role === 'SUPER_ADMIN') {
      redirect('/admin');
    }
    redirect('/login?error=no_school');
  }
  return {
    user: session,
    schoolId: session.schoolId,
  };
}

/**
 * Server-side guard for School Administrators only.
 */
export async function requireSchoolAdmin(): Promise<TenantContext> {
  const ctx = await requireTenant();
  if (ctx.user.role !== 'SCHOOL_ADMIN' && ctx.user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: School Administrator access required');
  }
  return ctx;
}

/**
 * Server-side guard for Platform Super Administrators only.
 */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== 'SUPER_ADMIN') {
    redirect('/login?error=forbidden');
  }
  return session;
}

/**
 * Validates that an accessed resource belongs to the current tenant.
 * If resource is null or resource.schoolId !== tenantSchoolId, throws a 404/Unauthorized error.
 */
export function assertTenantResource<T extends { schoolId?: string }>(
  resource: T | null | undefined,
  tenantSchoolId: string,
  resourceName = 'Resource'
): T {
  if (!resource || (resource.schoolId && resource.schoolId !== tenantSchoolId)) {
    throw new Error(`${resourceName} not found or access denied.`);
  }
  return resource;
}
