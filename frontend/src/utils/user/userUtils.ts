// Validation follows the [Standard Schema](https://standardschema.dev/).

import { User } from "../../models/User";

type ValidationResult = { issues: { message: string; path: (keyof User)[] }[] };

export function validateUser(user: Partial<User>): ValidationResult {
  let issues: ValidationResult['issues'] = [];

  if (!user.name) {
    issues = [...issues, { message: 'Name is required', path: ['name'] }];
  }

  if (!user.email) {
    issues = [...issues, { message: 'Email is required', path: ['email'] }];
  } 
//   else if (user.age < 18) {
//     issues = [...issues, { message: 'Age must be at least 18', path: ['age'] }];
//   }

  if (!user.created_at) {
    issues = [...issues, { message: 'Created date is required', path: ['created_at'] }];
  }

  if (!user.role) {
    issues = [...issues, { message: 'Role is required', path: ['role'] }];
  } 
  else if (!['Admin', 'Manager', 'Operator'].includes(user.role)) {
    issues = [
      ...issues,
      { message: 'Role must be "Admin", "Manager" or "Operator"', path: ['role'] },
    ];
  }

  return { issues };
}
