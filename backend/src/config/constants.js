const ROLE_PERMISSIONS = {
  owner: ['view_menu', 'create_order', 'edit_order', 'delete_order', 'payment', 'manage_materials', 'manage_users', 'view_reports', 'manage_config', 'view_audit_log'],
  admin: ['view_menu', 'create_order', 'edit_order', 'delete_order', 'payment', 'manage_materials', 'manage_users', 'view_reports', 'manage_config', 'view_audit_log'],
  manager: ['view_menu', 'create_order', 'edit_order', 'payment', 'manage_materials', 'view_reports'],
  supervisor: ['view_menu', 'create_order', 'edit_order', 'payment', 'view_reports'],
  staff: ['view_menu', 'create_order', 'edit_order'],
};

module.exports = {
  ROLES: ['owner', 'admin', 'manager', 'supervisor', 'staff'],
  STATUSES: {
    ORDER: ['new', 'in_progress', 'ready', 'completed', 'cancelled'],
    ITEM: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
    TABLE: ['available', 'occupied', 'waiting_payment', 'maintenance'],
  },
  ROLE_PERMISSIONS,
};
