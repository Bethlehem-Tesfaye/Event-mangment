import { validatePassword } from "../validation/password";


interface PasswordRequirementsProps {
  password: string;
  highlightError?: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  highlightError = false,
}) => {
  const rules = validatePassword(password);
  return (
    <ul className="mt-2 space-y-1 text-sm">
      {rules.map((rule, index) => (
         <li
          key={index}
          className={`flex items-center gap-2 ${
            highlightError && !rule.valid ? "text-red-600 font-semibold text-[20px]" : ""
          }`}
        >
          {!rule.valid && <span className="text-red-500 text-[12px] mt-[-10px]">{rule.label}</span>}
        </li>
      ))}
    </ul>
  );
};

