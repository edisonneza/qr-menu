// Validation follows the [Standard Schema](https://standardschema.dev/).

import { User } from "../../models/User";

type ValidationResult = { issues: { message: string; path: (keyof User)[] }[] };

export function validateUser(user: Partial<User>, isCreate: boolean = false): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!user.name || user.name.trim() === '') {
    issues = [...issues, { message: 'Name is required', path: ['name'] }];
  } else if (user.name.length < 2) {
    issues = [...issues, { message: 'Name must be at least 2 characters', path: ['name'] }];
  }

  if (!user.email || user.email.trim() === '') {
    issues = [...issues, { message: 'Email is required', path: ['email'] }];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    issues = [...issues, { message: 'Email must be valid', path: ['email'] }];
  }

  // Password validation (only required on create)
  if (isCreate && (!user.password || user.password.trim() === '')) {
    issues = [...issues, { message: 'Password is required', path: ['password'] }];
  } else if (user.password && user.password.length < 6) {
    issues = [...issues, { message: 'Password must be at least 6 characters', path: ['password'] }];
  }

  if (!user.role) {
    issues = [...issues, { message: 'Role is required', path: ['role'] }];
  } else if (!['admin', 'manager', 'staff'].includes(user.role)) {
    issues = [
      ...issues,
      { message: 'Role must be admin, manager, or staff', path: ['role'] },
    ];
  }

  if (user.phone && user.phone.trim() !== '') {
    // Basic phone validation (allow +, digits, spaces, dashes)
    if (!/^[+\d\s-()]+$/.test(user.phone)) {
      issues = [...issues, { message: 'Phone number format is invalid', path: ['phone'] }];
    }
  }

  return { issues };
}
