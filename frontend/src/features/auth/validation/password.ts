export interface PasswordRule {
  label: string;
  regex?: RegExp;
  minLength?: number;
}

export const passwordRules: PasswordRule[] = [
  { label: "At least 6 characters", minLength: 6 },
];

// Utility to validate a password against all rules
export const validatePassword = (password: string) =>
  passwordRules.map((rule) => ({
    ...rule,
    valid:
      (rule.minLength ? password.length >= rule.minLength : true),
  }));
