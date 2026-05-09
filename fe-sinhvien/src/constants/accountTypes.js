// CONSTANTS: ACCOUNT TYPES — Metadata loại tài khoản (UI constants)

export const ACCOUNT_TYPE_ORDER = ['EMAIL', 'OFFICE', 'PORTAL'];

export const ACCOUNT_TYPE_META = {
  EMAIL: {
    type: 'EMAIL',
    label: 'Email',
    description: 'Reset mật khẩu email ',
    usernameKey: 'email',
  },
  OFFICE: {
    type: 'OFFICE',
    label: 'Microsoft Office',
    description: 'Reset tài khoản Microsoft Office 365',
    usernameKey: 'office',
  },
  PORTAL: {
    type: 'PORTAL',
    label: 'Cổng sinh viên',
    description: 'Reset tài khoản cổng sinh viên',
    usernameKey: 'portal',
  },
};

export const getAccountMeta = (accountType) => ACCOUNT_TYPE_META[accountType] || ACCOUNT_TYPE_META.EMAIL;
