/**
 * RBAC Service (Role-Based Access Control)
 * Modular permission system with 9 roles and granular permissions.
 */

import type { Role, Permission, RoleAssignment } from '@/types';
import { auditService } from './audit.service';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  customer: [
    'view_dashboard', 'manage_own_wallet', 'send_money', 'request_money',
    'create_payment_link', 'manage_invoices', 'manage_subscriptions', 'view_transactions',
  ],
  merchant: [
    'view_dashboard', 'manage_own_wallet', 'send_money', 'request_money',
    'create_payment_link', 'manage_invoices', 'manage_subscriptions', 'manage_merchant',
    'view_transactions', 'view_analytics', 'manage_api_keys', 'manage_webhooks',
  ],
  support: [
    'view_dashboard', 'view_transactions', 'view_support_tickets', 'access_support_queue',
  ],
  finance: [
    'view_dashboard', 'view_transactions', 'view_all_transactions', 'approve_settlement',
    'view_analytics',
  ],
  compliance: [
    'view_dashboard', 'view_all_transactions', 'review_compliance', 'view_audit_log',
    'view_risk_dashboard', 'approve_kyc', 'approve_kyb', 'escalate_compliance',
    'suspend_account', 'view_admin_panel', 'manage_merchants',
  ],
  admin: [
    'view_dashboard', 'view_all_transactions', 'view_admin_panel', 'manage_users',
    'manage_merchants', 'review_compliance', 'view_audit_log', 'view_risk_dashboard',
    'approve_settlement', 'approve_kyc', 'approve_kyb', 'escalate_compliance',
    'suspend_account', 'view_all_wallets', 'freeze_wallet', 'manage_roles',
  ],
  super_admin: [
    'view_dashboard', 'view_all_transactions', 'view_admin_panel', 'manage_users',
    'manage_merchants', 'review_compliance', 'view_audit_log', 'view_risk_dashboard',
    'approve_settlement', 'approve_kyc', 'approve_kyb', 'escalate_compliance',
    'suspend_account', 'view_all_wallets', 'freeze_wallet', 'manage_roles',
    'manage_api_keys', 'manage_webhooks', 'access_support_queue', 'view_support_tickets',
  ],
  developer: [
    'view_dashboard', 'manage_own_wallet', 'manage_api_keys', 'manage_webhooks',
    'view_transactions', 'view_analytics',
  ],
  partner: [
    'view_dashboard', 'manage_own_wallet', 'view_transactions', 'view_analytics',
    'manage_api_keys', 'manage_webhooks',
  ],
};

const ROLE_LABELS: Record<Role, string> = {
  customer: 'Customer',
  merchant: 'Merchant',
  support: 'Support Agent',
  finance: 'Finance Team',
  compliance: 'Compliance Officer',
  admin: 'Administrator',
  super_admin: 'Super Admin',
  developer: 'Developer',
  partner: 'Partner',
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  customer: 'Standard user with personal wallet access',
  merchant: 'Business user with merchant tools and API access',
  support: 'Customer support agent with ticket queue access',
  finance: 'Finance team with settlement and reporting access',
  compliance: 'Compliance officer with KYC/KYB review powers',
  admin: 'Platform administrator with user and merchant management',
  super_admin: 'Full platform access with no restrictions',
  developer: 'API developer with key and webhook management',
  partner: 'Integration partner with limited API access',
};

let assignments: RoleAssignment[] = [
  { userId: 'usr_001', role: 'merchant', permissions: ROLE_PERMISSIONS.merchant, assignedAt: '2026-01-01T00:00:00Z', assignedBy: 'system' },
  { userId: 'usr_002', role: 'merchant', permissions: ROLE_PERMISSIONS.merchant, assignedAt: '2026-02-14T00:00:00Z', assignedBy: 'system' },
  { userId: 'usr_003', role: 'developer', permissions: ROLE_PERMISSIONS.developer, assignedAt: '2026-03-10T00:00:00Z', assignedBy: 'system' },
  { userId: 'usr_004', role: 'merchant', permissions: ROLE_PERMISSIONS.merchant, assignedAt: '2026-01-20T00:00:00Z', assignedBy: 'system' },
  { userId: 'usr_005', role: 'compliance', permissions: ROLE_PERMISSIONS.compliance, assignedAt: '2026-01-01T00:00:00Z', assignedBy: 'system' },
];

export const rbacService = {
  /** Get role assignment for a user. */
  getAssignment(userId: string): RoleAssignment | undefined {
    return assignments.find((a) => a.userId === userId);
  },

  /** Get role for a user (defaults to customer). */
  getRole(userId: string): Role {
    return assignments.find((a) => a.userId === userId)?.role ?? 'customer';
  },

  /** Get permissions for a user. */
  getPermissions(userId: string): Permission[] {
    return assignments.find((a) => a.userId === userId)?.permissions ?? ROLE_PERMISSIONS.customer;
  },

  /** Check if a user has a specific permission. */
  hasPermission(userId: string, permission: Permission): boolean {
    return this.getPermissions(userId).includes(permission);
  },

  /** Check if a user has any of the given permissions. */
  hasAnyPermission(userId: string, permissions: Permission[]): boolean {
    const userPerms = this.getPermissions(userId);
    return permissions.some((p) => userPerms.includes(p));
  },

  /** Assign a role to a user. */
  assignRole(userId: string, role: Role, assignedBy: string, actorName: string): RoleAssignment {
    const existing = assignments.find((a) => a.userId === userId);
    if (existing) {
      existing.role = role;
      existing.permissions = ROLE_PERMISSIONS[role];
      existing.assignedAt = new Date().toISOString();
      existing.assignedBy = assignedBy;
    }

    const assignment: RoleAssignment = existing ?? {
      userId,
      role,
      permissions: ROLE_PERMISSIONS[role],
      assignedAt: new Date().toISOString(),
      assignedBy,
    };

    if (!existing) assignments.push(assignment);

    auditService.log({
      type: 'role_change',
      actorId: assignedBy,
      actorName,
      actorRole: 'admin',
      action: `Role assigned: ${userId} → ${ROLE_LABELS[role]}`,
      resourceType: 'user',
      resourceId: userId,
    });

    return assignment;
  },

  /** Revoke a role (reverts to customer). */
  revokeRole(userId: string, assignedBy: string, actorName: string): void {
    const existing = assignments.find((a) => a.userId === userId);
    if (existing) {
      existing.role = 'customer';
      existing.permissions = ROLE_PERMISSIONS.customer;
      existing.assignedAt = new Date().toISOString();
      existing.assignedBy = assignedBy;
    }

    auditService.log({
      type: 'role_change',
      actorId: assignedBy,
      actorName,
      actorRole: 'admin',
      action: `Role revoked: ${userId} reverted to Customer`,
      resourceType: 'user',
      resourceId: userId,
    });
  },

  /** Get all role assignments. */
  getAllAssignments(): RoleAssignment[] {
    return [...assignments];
  },

  /** Get all available roles. */
  getRoles(): Role[] {
    return Object.keys(ROLE_PERMISSIONS) as Role[];
  },

  /** Get permissions for a role. */
  getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role];
  },

  /** Get role label. */
  getRoleLabel(role: Role): string {
    return ROLE_LABELS[role];
  },

  /** Get role description. */
  getRoleDescription(role: Role): string {
    return ROLE_DESCRIPTIONS[role];
  },

  /** Get all permission definitions. */
  getAllPermissions(): Permission[] {
    return [
      'view_dashboard', 'manage_own_wallet', 'send_money', 'request_money',
      'create_payment_link', 'manage_invoices', 'manage_subscriptions', 'manage_merchant',
      'view_transactions', 'view_all_transactions', 'approve_settlement', 'view_analytics',
      'view_admin_panel', 'manage_users', 'manage_merchants', 'review_compliance',
      'view_audit_log', 'view_risk_dashboard', 'manage_api_keys', 'manage_roles',
      'access_support_queue', 'view_support_tickets', 'manage_webhooks', 'view_all_wallets',
      'freeze_wallet', 'approve_kyc', 'approve_kyb', 'escalate_compliance', 'suspend_account',
    ];
  },

  /** Get permission label. */
  getPermissionLabel(permission: Permission): string {
    return permission.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  },

  /** Count assignments. */
  count(): number {
    return assignments.length;
  },
};
